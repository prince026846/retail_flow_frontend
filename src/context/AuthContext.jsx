import React, { createContext, useContext, useState, useEffect } from "react"
import { loginUser } from "../services/api"

const AuthContext = createContext()

// Use sessionStorage for tab isolation (each tab has its own storage)
const TOKEN_KEY = "retailflow_token"

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = () => {
    // Use sessionStorage instead of localStorage for tab isolation
    const token = sessionStorage.getItem(TOKEN_KEY)

    if (token) {
      try {
        // Parse JWT token to get user data
        const payload = JSON.parse(atob(token.split(".")[1]))
        
        // Validate token structure
        if (!payload.sub || !payload.role) {
          throw new Error('Invalid token structure')
        }

        setUser({
          _id: payload.sub,
          email: payload.email,
          role: payload.role
        })
        setIsAuthenticated(true)
      } catch (error) {
        // Invalid token - clear it
        console.error('Token validation error:', error)
        sessionStorage.removeItem(TOKEN_KEY)
        setUser(null)
        setIsAuthenticated(false)
      }
    } else {
      setUser(null)
      setIsAuthenticated(false)
    }

    setIsLoading(false)
  }

  const login = async (email, password) => {
    try {
      const result = await loginUser(email, password)

      // loginUser returns data directly on success, throws error on failure
      // Token is already stored by loginUser function
      
      const payload = JSON.parse(atob(result.access_token.split(".")[1]))

      // Validate payload before setting state
      if (!payload.sub || !payload.role) {
        throw new Error('Invalid token received from server')
      }

      setUser({
        _id: payload.sub,
        email: payload.email,
        role: payload.role
      })

      setIsAuthenticated(true)

      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      
      // Check if it's a specific error type
      const errorMessage = error.message || "Login failed"
      
      // Check for account lockout or verification requirements
      if (errorMessage.includes("locked") || errorMessage.includes("suspended")) {
        return { success: false, error: errorMessage, isLocked: true }
      } else if (errorMessage.includes("verify") || errorMessage.includes("verification")) {
        return { success: false, error: errorMessage, requiresVerification: true }
      } else {
        return { success: false, error: errorMessage }
      }
    }
  }

  const logout = () => {
    // Clear from sessionStorage (this tab only)
    sessionStorage.removeItem(TOKEN_KEY)
    setUser(null)
    setIsAuthenticated(false)
  }

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }

  return context
}
