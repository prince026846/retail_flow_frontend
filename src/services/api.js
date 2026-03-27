// Dynamic port configuration - will try ports in order
const API_PORTS = [8000, 8001, 8002, 8003, 8004, 8005]
const API_HOST = "127.0.0.1"

// Smart API client that tries different ports
class SmartAPIClient {
  constructor() {
    this.currentPortIndex = 0
    this.workingPort = null
    this.failedPorts = new Set()
  }

  getBaseUrl() {
    // If we have a working port, use it
    if (this.workingPort) {
      return `http://${API_HOST}:${this.workingPort}`
    }
    
    // Try environment variable first
    const envUrl = import.meta.env.VITE_API_URL
    if (envUrl) {
      return envUrl
    }
    
    // Default to first available port
    return `http://${API_HOST}:${API_PORTS[this.currentPortIndex]}`
  }

  async tryNextPort() {
    this.failedPorts.add(API_PORTS[this.currentPortIndex])
    
    // Find next available port
    for (let i = 0; i < API_PORTS.length; i++) {
      if (!this.failedPorts.has(API_PORTS[i])) {
        this.currentPortIndex = i
        return `http://${API_HOST}:${API_PORTS[i]}`
      }
    }
    
    // All ports failed, reset and try again
    this.failedPorts.clear()
    this.currentPortIndex = 0
    this.workingPort = null
    return `http://${API_HOST}:${API_PORTS[0]}`
  }

  async makeRequest(url, options = {}) {
    const maxRetries = API_PORTS.length
    let lastError = null

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const baseUrl = this.getBaseUrl()
        const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`
        
        console.log(`🔄 Attempt ${attempt + 1}: Trying ${fullUrl}`)
        
        const response = await fetch(fullUrl, options)
        
        // If we get a successful response, mark this port as working
        if (response.ok || response.status === 401) {
          // 401 is good - means endpoint exists, just needs auth
          this.workingPort = API_PORTS[this.currentPortIndex]
          console.log(`✅ Working port found: ${this.workingPort}`)
          return response
        }
        
        // If it's a 404, try next port
        if (response.status === 404) {
          throw new Error(`Port ${API_PORTS[this.currentPortIndex]} returned 404`)
        }
        
        // For other errors, don't retry (like 400, 500 etc)
        return response
        
      } catch (error) {
        console.log(`❌ Port ${API_PORTS[this.currentPortIndex]} failed:`, error.message)
        lastError = error
        
        // Try next port
        const nextUrl = await this.tryNextPort()
        if (nextUrl === url) {
          // We've tried all ports
          break
        }
      }
    }
    
    throw lastError || new Error("All API ports failed")
  }
}

// Global smart API client instance
const smartAPI = new SmartAPIClient()

// For backward compatibility
const API_BASE = smartAPI.getBaseUrl()

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
  } catch (error) {
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

  const response = await fetch(`${API_BASE}/auth/refresh`, {
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
      } catch (error) {
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
    const res = await makeAuthenticatedRequest(`${API_BASE}/auth/change-password`, {
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
    const response = await makeAuthenticatedRequest("/products/")
    
    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }

    return response.json();
  } catch (error) {
    if (error.message === "Authentication failed") {
      // Don't hard redirect - let auth context handle routing
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
      // Don't hard redirect - let auth context handle routing
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
      // Don't hard redirect - let auth context handle routing
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
      // Don't hard redirect - let auth context handle routing
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
      // Don't hard redirect - let auth context handle routing
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
      // Don't hard redirect - let auth context handle routing
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
      // Don't hard redirect - let auth context handle routing
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
      // Don't hard redirect - let auth context handle routing
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
      // Don't hard redirect - let auth context handle routing
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
      // Don't hard redirect - let auth context handle routing
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
      // Don't hard redirect - let auth context handle routing
      throw new Error("Authentication required");
    }
    throw error
  }
}

export const getOrders = async () => {
  try {
    const res = await makeAuthenticatedRequest("/orders/")
    return res.json()
  } catch (error) {
    if (error.message === "Authentication failed") {
      // Don't hard redirect - let auth context handle routing
      throw new Error("Authentication required");
    }
    throw error
  }
} 

export const verifyEmail = async (token) => {
  try {
    const res = await fetch(`${API_BASE}/auth/verify-email`, {
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
    const res = await fetch(`${API_BASE}/auth/resend-verification`, {
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
    const res = await fetch(`${API_BASE}/auth/request-password-reset`, {
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
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
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
    const res = await makeAuthenticatedRequest(`${API_BASE}/customers/?page=${page}&limit=${limit}`)
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
    const res = await makeAuthenticatedRequest(`${API_BASE}/customers/`, {
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
    const res = await makeAuthenticatedRequest(`${API_BASE}/customers/${id}`)
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
    const res = await makeAuthenticatedRequest(`${API_BASE}/customers/${id}`, {
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
    const res = await makeAuthenticatedRequest(`${API_BASE}/customers/${id}`, {
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

export const searchCustomers = async (query) => {
  try {
    const res = await makeAuthenticatedRequest(`${API_BASE}/customers/search?q=${encodeURIComponent(query)}`)
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
    const res = await makeAuthenticatedRequest(`${API_BASE}/customers/${id}/orders`)
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
    const res = await makeAuthenticatedRequest(`${API_BASE}/supplier/?page=${page}&limit=${limit}`)
    return res.json()
  } catch (error) {
    if (error.message === "Authentication failed") {
      throw new Error("Authentication required");
    }
    throw error
  }
}

export const createSupplier = async (supplier) => {
  try {
    const res = await makeAuthenticatedRequest(`${API_BASE}/supplier/`, {
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
    const res = await makeAuthenticatedRequest(`${API_BASE}/supplier/${id}`, {
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
    const res = await makeAuthenticatedRequest(`${API_BASE}/supplier/${id}`, {
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
    const res = await makeAuthenticatedRequest(`${API_BASE}/supplier/low-stock`)
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
    const res = await makeAuthenticatedRequest(`${API_BASE}/supplier/${supplierId}/purchase-orders`, {
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

export const getSupplierPerformance = async (supplierId) => {
  try {
    const res = await makeAuthenticatedRequest(`${API_BASE}/supplier/${supplierId}/performance`)
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
    const res = await makeAuthenticatedRequest(`${API_BASE}/supplier/${supplierId}/products`, {
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

// Employee API functions
export const getAllEmployees = async () => {
  try {
    const res = await makeAuthenticatedRequest(`${API_BASE}/employees/`)
    return res.json()
  } catch (error) {
    if (error.message === "Authentication failed") {
      throw new Error("Authentication required");
    }
    throw error
  }
}

export const getEmployeePerformanceById = async (employeeId) => {
  try {
    const res = await makeAuthenticatedRequest(`${API_BASE}/employees/${employeeId}/performance`)
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
    const res = await makeAuthenticatedRequest(`${API_BASE}/analytics/workforce`)
    return res.json()
  } catch (error) {
    if (error.message === "Authentication failed") {
      throw new Error("Authentication required");
    }
    throw error
  }
} 


