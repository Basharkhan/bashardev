import { apiClient } from './client'

export async function getSiteSettings() {
  const response = await apiClient.get('/site-settings')
  return response.data
}

export async function updateSiteSettings(payload) {
  const response = await apiClient.put('/site-settings', payload)
  return response.data
}
