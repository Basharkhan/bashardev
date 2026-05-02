import { useEffect, useState } from 'react'
import { getCurrentUser, login as loginRequest } from '../api/auth'
import { clearStoredAccessToken, getStoredAccessToken, setStoredAccessToken } from '../utils/authStorage'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }) {
  const [storedToken] = useState(() => getStoredAccessToken())
  const [user, setUser] = useState(null)
  const [isAuthReady, setIsAuthReady] = useState(() => !storedToken)

  useEffect(() => {
    if (!storedToken) {
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
  }, [storedToken])

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
