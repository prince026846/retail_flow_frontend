const API_PORTS = [8000, 8001, 8002, 8003, 8004, 8005]
const DEFAULT_API_PROTOCOL = "http:"
const DEFAULT_API_HOST = "127.0.0.1"

const stripTrailingSlash = (value) => value.replace(/\/+$/, "")
const isLocalHost = (hostname) => hostname === "127.0.0.1" || hostname === "localhost"

const normalizePath = (urlPath) => {
  if (!urlPath) return "/"
  return urlPath.startsWith("/") ? urlPath : `/${urlPath}`
}

const getDefaultLocalBaseUrls = () => {
  return API_PORTS.map((port) => `${DEFAULT_API_PROTOCOL}//${DEFAULT_API_HOST}:${port}`)
}

const getCandidateBaseUrls = () => {
  const envUrlRaw = import.meta.env.VITE_API_URL?.trim()
  if (!envUrlRaw) {
    return getDefaultLocalBaseUrls()
  }

  try {
    const parsed = new URL(envUrlRaw)
    const basePath = parsed.pathname === "/" ? "" : parsed.pathname.replace(/\/+$/, "")

    if (isLocalHost(parsed.hostname)) {
      const preferredPort = Number(parsed.port)
      const orderedPorts = [...new Set([preferredPort, ...API_PORTS].filter((port) => Number.isInteger(port) && port > 0))]
      return orderedPorts.map((port) => `${parsed.protocol || DEFAULT_API_PROTOCOL}//${parsed.hostname}:${port}${basePath}`)
    }

    return [stripTrailingSlash(envUrlRaw)]
  } catch (error) {
    console.warn("Invalid VITE_API_URL. Falling back to localhost ports 8000-8005.", error)
    return getDefaultLocalBaseUrls()
  }
}

const shouldRetryAcrossLocalPorts = (url) => {
  if (!url.startsWith("http")) {
    return true
  }

  try {
    const parsed = new URL(url)
    return isLocalHost(parsed.hostname)
  } catch {
    return false
  }
}

const toRequestPath = (url) => {
  if (!url.startsWith("http")) {
    return normalizePath(url)
  }

  try {
    const parsed = new URL(url)
    return `${normalizePath(parsed.pathname)}${parsed.search}${parsed.hash}`
  } catch {
    return normalizePath(url)
  }
}

// Smart API client that tries different base URLs
class SmartAPIClient {
  constructor() {
    this.baseUrls = getCandidateBaseUrls()
    this.currentBaseIndex = 0
    this.workingBaseUrl = null
    this.failedBaseUrls = new Set()
  }

  getBaseUrl() {
    if (this.workingBaseUrl) {
      return this.workingBaseUrl
    }

    return this.baseUrls[this.currentBaseIndex] || this.baseUrls[0]
  }

  markBaseAsWorking(baseUrl) {
    this.workingBaseUrl = stripTrailingSlash(baseUrl)
    const matchedIndex = this.baseUrls.indexOf(this.workingBaseUrl)
    if (matchedIndex >= 0) {
      this.currentBaseIndex = matchedIndex
    }
  }

  async tryNextBase() {
    const currentBase = this.baseUrls[this.currentBaseIndex]
    if (currentBase) {
      this.failedBaseUrls.add(currentBase)
    }

    for (let i = 0; i < this.baseUrls.length; i++) {
      if (!this.failedBaseUrls.has(this.baseUrls[i])) {
        this.currentBaseIndex = i
        return this.baseUrls[i]
      }
    }

    // All candidates failed, reset and start from first URL again.
    this.failedBaseUrls.clear()
    this.currentBaseIndex = 0
    this.workingBaseUrl = null
    return this.baseUrls[0]
  }

  async makeRequest(url, options = {}) {
    const shouldRetry = shouldRetryAcrossLocalPorts(url)
    const requestPath = shouldRetry ? toRequestPath(url) : url
    const maxRetries = shouldRetry ? this.baseUrls.length : 1
    let lastError = null

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const baseUrl = shouldRetry ? this.getBaseUrl() : null
      const fullUrl = shouldRetry ? `${baseUrl}${requestPath}` : requestPath

      try {
        console.log(`🔄 Attempt ${attempt + 1}: Trying ${fullUrl}`)
        const response = await fetch(fullUrl, options)

        if (shouldRetry && (response.ok || response.status === 401)) {
          this.markBaseAsWorking(baseUrl)
          console.log(`✅ Working backend found: ${this.workingBaseUrl}`)
          return response
        }

        // 404 often means wrong service/port in local multi-port setup.
        if (shouldRetry && response.status === 404) {
          throw new Error(`Backend ${baseUrl} returned 404`)
        }

        return response
      } catch (error) {
        lastError = error

        if (!shouldRetry || attempt >= maxRetries - 1) {
          break
        }

        console.log(`❌ Backend ${baseUrl} failed:`, error.message)
        await this.tryNextBase()
      }
    }

    throw lastError || new Error("All API ports failed")
  }
}

// Global smart API client instance
const smartAPI = new SmartAPIClient()

// Export helper for other components to get current API URL
export const getCurrentApiUrl = () => smartAPI.getBaseUrl()

// Export the smart API client for advanced usage
export { smartAPI }

const getToken = () => {
  return sessionStorage.getItem("retailflow_token")
}

const getRefreshToken = () => {
  return sessionStorage.getItem("retailflow_refresh_token")
}

const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    return payload.exp < Date.now() / 1000
  } catch {
    return true
  }
}

let isRefreshing = false
let refreshSubscribers = []

const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback)
}

const onTokenRefreshed = (newToken) => {
  refreshSubscribers.forEach(callback => callback(newToken))
  refreshSubscribers = []
}

const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    throw new Error("No refresh token available")
  }

  const response = await smartAPI.makeRequest("/auth/refresh", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ refresh_token: refreshToken })
  })

  if (!response.ok) {
    throw new Error("Token refresh failed")
  }

  const data = await response.json()
  sessionStorage.setItem("retailflow_token", data.access_token)
  return data.access_token
}

export const makeAuthenticatedRequest = async (url, options = {}) => {
  let token = getToken()
  
  // Don't try refresh if no token (login/register pages)
  if (!token) {
    throw new Error("No authentication token available")
  }
  
  if (isTokenExpired(token)) {
    if (!isRefreshing) {
      isRefreshing = true
      try {
        const newToken = await refreshAccessToken()
        token = newToken
        onTokenRefreshed(newToken)
      } catch {
        refreshSubscribers.forEach(callback => callback(null))
        refreshSubscribers = []
        // Don't automatically clear tokens - let auth context handle it
        throw new Error("Authentication failed")
      } finally {
        isRefreshing = false
      }
    } else {
      // Wait for token refresh to complete
      token = await new Promise((resolve, reject) => {
        addRefreshSubscriber((newToken) => {
          if (newToken) {
            resolve(newToken)
          } else {
            reject(new Error("Token refresh failed"))
          }
        })
      })
    }
  }

  const headers = {
    ...options.headers,
    "Authorization": `Bearer ${token}`
  }

  // Use smart API client for automatic port switching
  const response = await smartAPI.makeRequest(url, { ...options, headers })
  
  // Handle HTTP errors (except 404 which is handled by smart client)
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Authentication failed")
    } else {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
    }
  }
  
  return response
}

export const loginUser = async (email, password) => {
  // Use smart API client for login too
  const res = await smartAPI.makeRequest("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      username: email,
      password: password
    })
  })

  const data = await res.json()

  console.log("LOGIN RESPONSE:", data)

  if (res.ok && data.access_token) {
    sessionStorage.setItem("retailflow_token", data.access_token)
    if (data.refresh_token) {
      sessionStorage.setItem("retailflow_refresh_token", data.refresh_token)
    }
    return data
  } else {
    throw new Error(data.message || "Login failed")
  }
}

export const registerUser = async (userData) => {
  try {
    const res = await smartAPI.makeRequest("/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(userData)
    })

    const data = await res.json()

    if (res.ok) {
      return { success: true, data }
    } else {
      return { success: false, error: data.detail || 'Registration failed' }
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const changePassword = async (currentPassword, newPassword) => {
  try {
    const res = await makeAuthenticatedRequest(`/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword
      })
    })

    const data = await res.json()

    if (res.ok) {
      return { success: true, data }
    } else {
      return { success: false, error: data.detail || 'Password change failed' }
    }
  } catch (error) {
    console.error("Password change error:", error)
    return { success: false, error: 'Network error occurred' }
  }
}

export async function getProducts() {
  try {
    const response = await makeAuthenticatedRequest("/products/?limit=1000")
    
    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }

    return response.json();
  } catch (error) {
    if (error.message === "Authentication failed") {
      throw new Error("Authentication required");
    }
    throw error
  }
}

export const createProduct = async (product) => {
  try {
    const res = await makeAuthenticatedRequest("/products/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(product)
    })

    return res.json()
  } catch (error) {
    if (error.message === "Authentication failed") {
      throw new Error("Authentication required");
    }
    throw error
  }
}

export const updateProduct = async (id, product) => {
  try {
    const res = await makeAuthenticatedRequest(`/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(product)
    })

    return res.json()
  } catch (error) {
    if (error.message === "Authentication failed") {
      throw new Error("Authentication required");
    }
    throw error
  }
}

export const deleteProduct = async (id) => {
  try {
    const res = await makeAuthenticatedRequest(`/products/${id}`, {
      method: "DELETE"
    })

    return res.json()
  } catch (error) {
    if (error.message === "Authentication failed") {
      throw new Error("Authentication required");
    }
    throw error
  }
}

export const createOrder = async (order) => {
  try {
    const res = await makeAuthenticatedRequest("/orders/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(order)
    })

    return res.json()
  } catch (error) {
    if (error.message === "Authentication failed") {
      throw new Error("Authentication required");
    }
    throw error
  }
}

export const getOrders = async (page = 1, limit = 100, days = null) => {
  try {
    const query = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (days) query.append('days', String(days))
    const res = await makeAuthenticatedRequest(`/orders/?${query.toString()}`)
    return res.json()
  } catch (error) {
    if (error.message === "Authentication failed") {
      throw new Error("Authentication required");
    }
    throw error
  }
}

export const getAnalytics = async () => {
  try {
    const res = await makeAuthenticatedRequest("/analytics/top-products")
    return res.json()
  } catch (error) {
    if (error.message === "Authentication failed") {
      throw new Error("Authentication required");
    }
    throw error
  }
}

export const getThisMonthAnalytics = async () => {
  try {
    const res = await makeAuthenticatedRequest("/analytics/this-month")
    return res.json()
  } catch (error) {
    if (error.message === "Authentication failed") {
      throw new Error("Authentication required");
    }
    throw error
  }
}

export const getWorstProducts = async () => {
  try {
    const res = await makeAuthenticatedRequest("/analytics/worst-products")
    return res.json()
  } catch (error) {
    if (error.message === "Authentication failed") {
      throw new Error("Authentication required");
    }
    throw error
  }
}

export const getLowStockProducts = async () => {
  try {
    const res = await makeAuthenticatedRequest("/analytics/low-stock-products")
    return res.json()
  } catch (error) {
    if (error.message === "Authentication failed") {
      throw new Error("Authentication required");
    }
    throw error
  }
}

export const getMonthlyRevenue = async () => {
  try {
    const res = await makeAuthenticatedRequest("/analytics/monthly-revenue")
    return res.json()
  } catch (error) {
    if (error.message === "Authentication failed") {
      throw new Error("Authentication required");
    }
    throw error
  }
}

export const getCategorySales = async () => {
  try {
    const res = await makeAuthenticatedRequest("/analytics/category-sales")
    return res.json()
  } catch (error) {
    if (error.message === "Authentication failed") {
      throw new Error("Authentication required");
    }
    throw error
  }
}

export const verifyEmail = async (token) => {
  try {
    const res = await smartAPI.makeRequest("/auth/verify-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ token })
    })

    const data = await res.json()

    if (res.ok) {
      return { success: true, data }
    } else {
      return { success: false, error: data.detail || 'Email verification failed' }
    }
  } catch (error) {
    console.error("Email verification error:", error)
    return { success: false, error: 'Network error occurred' }
  }
}

export const resendVerificationEmail = async (email) => {
  try {
    const res = await smartAPI.makeRequest("/auth/resend-verification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    })

    const data = await res.json()

    if (res.ok) {
      return { success: true, data }
    } else {
      return { success: false, error: data.detail || 'Failed to resend verification email' }
    }
  } catch (error) {
    console.error("Resend verification error:", error)
    return { success: false, error: 'Network error occurred' }
  }
}

export const requestPasswordReset = async (email) => {
  try {
    const res = await smartAPI.makeRequest("/auth/request-password-reset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    })

    const data = await res.json()

    if (res.ok) {
      return { success: true, data }
    } else {
      return { success: false, error: data.detail || 'Failed to send password reset email' }
    }
  } catch (error) {
    console.error("Password reset request error:", error)
    return { success: false, error: 'Network error occurred' }
  }
}

export const resetPassword = async (token, newPassword) => {
  try {
    const res = await smartAPI.makeRequest("/auth/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ token, new_password: newPassword })
    })

    const data = await res.json()

    if (res.ok) {
      return { success: true, data }
    } else {
      return { success: false, error: data.detail || 'Failed to reset password' }
    }
  } catch (error) {
    console.error("Password reset error:", error)
    return { success: false, error: 'Network error occurred' }
  }
} 

// Customer API functions
export const getCustomers = async (page = 1, limit = 10) => {
  try {
    const res = await makeAuthenticatedRequest(`/customers/?page=${page}&limit=${limit}`)
    return res.json()
  } catch (error) {
    if (error.message === "Authentication failed") {
      throw new Error("Authentication required");
    }
    throw error
  }
}

export const createCustomer = async (customer) => {
  try {
    const res = await makeAuthenticatedRequest(`/customers/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(customer)
    })

    return res.json()
  } catch (error) {
    if (error.message === "Authentication failed") {
      throw new Error("Authentication required");
    }
    throw error
  }
}

export const getCustomerById = async (id) => {
  try {
    const res = await makeAuthenticatedRequest(`/customers/${id}`)
    return res.json()
  } catch (error) {
    if (error.message === "Authentication failed") {
      throw new Error("Authentication required");
    }
    throw error
  }
}

export const updateCustomer = async (id, customer) => {
  try {
    const res = await makeAuthenticatedRequest(`/customers/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(customer)
    })

    return res.json()
  } catch (error) {
    if (error.message === "Authentication failed") {
      throw new Error("Authentication required");
    }
    throw error
  }
}

export const deleteCustomer = async (id) => {
  try {
    const res = await makeAuthenticatedRequest(`/customers/${id}`, {
      method: "DELETE"
    })

    return res.json()
  } catch (error) {
    if (error.message === "Authentication failed") {
      throw new Error("Authentication required");
    }
    throw error
  }
}

export const searchCustomers = async (query, page = 1, limit = 10) => {
  try {
    const searchParams = new URLSearchParams({
      q: query,
      page: String(page),
      limit: String(limit)
    })
    const res = await makeAuthenticatedRequest(`/customers/search?${searchParams.toString()}`)
    return res.json()
  } catch (error) {
    if (error.message === "Authentication failed") {
      throw new Error("Authentication required");
    }
    throw error
  }
}

export const getCustomerOrders = async (id) => {
  try {
    const res = await makeAuthenticatedRequest(`/customers/${id}/orders`)
    return res.json()
  } catch (error) {
    if (error.message === "Authentication failed") {
      throw new Error("Authentication required");
    }
    throw error
  }
} 

// Supplier API functions
export const getSuppliers = async (page = 1, limit = 10) => {
  try {
    const res = await makeAuthenticatedRequest(`/supplier/?page=${page}&limit=${limit}`)
    const suppliers = await res.json()
    const totalCount = Number(res.headers.get("X-Total-Count")) || suppliers.length
    const totalPages = Number(res.headers.get("X-Total-Pages")) || 1
    const currentPage = Number(res.headers.get("X-Page")) || page
    const currentLimit = Number(res.headers.get("X-Limit")) || limit

    return {
      suppliers,
      pagination: {
        page: currentPage,
        limit: currentLimit,
        totalCount,
        totalPages
      }
    }
  } catch (error) {
    if (error.message === "Authentication failed") {
      throw new Error("Authentication required");
    }
    throw error
  }
}

export const createSupplier = async (supplier) => {
  try {
    const res = await makeAuthenticatedRequest(`/supplier/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(supplier)
    })
    return res.json()
  } catch (error) {
    if (error.message === "Authentication failed") {
      throw new Error("Authentication required");
    }
    throw error
  }
}

export const updateSupplier = async (id, supplier) => {
  try {
    const res = await makeAuthenticatedRequest(`/supplier/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(supplier)
    })
    return res.json()
  } catch (error) {
    if (error.message === "Authentication failed") {
      throw new Error("Authentication required");
    }
    throw error
  }
}

export const deleteSupplier = async (id) => {
  try {
    const res = await makeAuthenticatedRequest(`/supplier/${id}`, {
      method: "DELETE"
    })
    return res.json()
  } catch (error) {
    if (error.message === "Authentication failed") {
      throw new Error("Authentication required");
    }
    throw error
  }
}

export const getLowStockSuppliers = async () => {
  try {
    const res = await makeAuthenticatedRequest(`/supplier/low-stock`)
    return res.json()
  } catch (error) {
    if (error.message === "Authentication failed") {
      throw new Error("Authentication required");
    }
    throw error
  }
}

export const createPurchaseOrder = async (supplierId, orderData) => {
  try {
    const res = await makeAuthenticatedRequest(`/supplier/${supplierId}/purchase-orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(orderData)
    })
    return res.json()
  } catch (error) {
    if (error.message === "Authentication failed") {
      throw new Error("Authentication required");
    }
    throw error
  }
}

export const getPurchaseOrders = async (page = 1, limit = 10, filters = {}) => {
  try {
    const query = new URLSearchParams({
      page: String(page),
      limit: String(limit)
    })

    if (filters.status && filters.status !== "all") {
      query.set("status", filters.status)
    }

    if (filters.supplierId) {
      query.set("supplier_id", filters.supplierId)
    }

    const res = await makeAuthenticatedRequest(`/supplier/purchase-orders?${query.toString()}`)
    return res.json()
  } catch (error) {
    if (error.message === "Authentication failed") {
      throw new Error("Authentication required");
    }
    throw error
  }
}

export const updatePurchaseOrderStatus = async (purchaseOrderId, status) => {
  try {
    const res = await makeAuthenticatedRequest(`/supplier/purchase-orders/${purchaseOrderId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status })
    })
    return res.json()
  } catch (error) {
    if (error.message === "Authentication failed") {
      throw new Error("Authentication required");
    }
    throw error
  }
}

export const getSupplierPerformance = async (supplierId) => {
  try {
    const res = await makeAuthenticatedRequest(`/supplier/${supplierId}/performance`)
    return res.json()
  } catch (error) {
    if (error.message === "Authentication failed") {
      throw new Error("Authentication required");
    }
    throw error
  }
}

export const updateSupplierProductCatalog = async (supplierId, products) => {
  try {
    const res = await makeAuthenticatedRequest(`/supplier/${supplierId}/products`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(products)
    })
    return res.json()
  } catch (error) {
    if (error.message === "Authentication failed") {
      throw new Error("Authentication required");
    }
    throw error
  }
}

// Employee context & support (compatible names)
export const getAllEmployees = async () => {
  try {
    const res = await makeAuthenticatedRequest(`/employees/`)
    return res.json()
  } catch (error) {
    if (error.message === "Authentication failed") {
      throw new Error("Authentication required");
    }
    throw error
  }
}

export const getEmployees = getAllEmployees;

export const getEmployeePerformanceById = async (employeeId) => {
  try {
    const res = await makeAuthenticatedRequest(`/employees/${employeeId}/performance`)
    return res.json()
  } catch (error) {
    if (error.message === "Authentication failed") {
      throw new Error("Authentication required");
    }
    throw error
  }
}

export const getEmployeePerformance = getEmployeePerformanceById;

export const createEmployee = async (employee) => {
  try {
    const res = await makeAuthenticatedRequest("/employees/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(employee)
    })
    return res.json()
  } catch (error) {
    if (error.message === "Authentication failed") {
      throw new Error("Authentication required");
    }
    throw error
  }
}

export const deleteEmployee = async (id) => {
  try {
    const res = await makeAuthenticatedRequest(`/employees/${id}`, {
      method: "DELETE"
    })
    return res.json()
  } catch (error) {
    if (error.message === "Authentication failed") {
      throw new Error("Authentication required");
    }
    throw error
  }
}

// Shop Settings API functions
export const getShopSettings = async () => {
  try {
    const res = await makeAuthenticatedRequest('/shop-settings/')
    return res.json()
  } catch (error) {
    if (error.message === "Authentication failed") {
      throw new Error("Authentication required");
    }
    throw error
  }
}

export const updateShopSettings = async (settings) => {
  try {
    const res = await makeAuthenticatedRequest('/shop-settings/', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(settings)
    })
    return res.json()
  } catch (error) {
    if (error.message === "Authentication failed") {
      throw new Error("Authentication required");
    }
    throw error
  }
}

// Analytics & Insights
export const getNexusInsights = async () => {
  try {
    const res = await makeAuthenticatedRequest('/analytics/nexus-insights')
    return res.json()
  } catch (error) {
    if (error.message === "Authentication failed") {
      throw new Error("Authentication required");
    }
    throw error
  }
}

export const getProfitSummary = async () => {
  try {
    const res = await makeAuthenticatedRequest('/analytics/profit-summary')
    return res.json()
  } catch (error) {
    if (error.message === "Authentication failed") {
      throw new Error("Authentication required");
    }
    throw error
  }
}

export const getWorkforceAnalytics = async () => {
  try {
    const res = await makeAuthenticatedRequest(`/analytics/workforce`)
    return res.json()
  } catch (error) {
    if (error.message === "Authentication failed") {
      throw new Error("Authentication required");
    }
    throw error
  }
}

export const downloadBill = async (orderId) => {
  try {
    const response = await makeAuthenticatedRequest(`/orders/${orderId}/bill`)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bill-${orderId}.pdf`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (error) {
    console.error("Download bill error:", error)
    throw error
  }
}
