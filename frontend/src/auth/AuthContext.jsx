import { createContext, useContext, useEffect, useState } from 'react'
import { getCurrentUser, login as loginRequest } from '../api/auth'
import { clearStoredAccessToken, getStoredAccessToken, setStoredAccessToken } from '../utils/authStorage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthReady, setIsAuthReady] = useState(false)

  useEffect(() => {
    const token = getStoredAccessToken()

    if (!token) {
      setIsAuthReady(true)
      return
    }

    getCurrentUser()
      .then((currentUser) => {
        setUser(currentUser)
      })
      .catch(() => {
        clearStoredAccessToken()
        setUser(null)
      })
      .finally(() => {
        setIsAuthReady(true)
      })
  }, [])

  async function login(credentials) {
    const response = await loginRequest(credentials)
    setStoredAccessToken(response.accessToken)
    const currentUser = await getCurrentUser()
    setUser(currentUser)
    return currentUser
  }

  function logout() {
    clearStoredAccessToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isAuthReady,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
