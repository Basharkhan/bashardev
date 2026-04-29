import axios from 'axios'
import { getStoredAccessToken } from '../utils/authStorage'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

export const apiClient = axios.create({
  baseURL,
})

apiClient.interceptors.request.use((config) => {
  const token = getStoredAccessToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})
