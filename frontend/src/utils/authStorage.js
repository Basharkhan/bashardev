const ACCESS_TOKEN_KEY = 'bashardev.admin.accessToken'

export function getStoredAccessToken() {
  return window.localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setStoredAccessToken(token) {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

export function clearStoredAccessToken() {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY)
}
