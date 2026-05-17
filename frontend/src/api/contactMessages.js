import { apiClient } from './client'

export async function getAdminContactMessages({ page = 0, size = 10, search = '', status = '' } = {}) {
  const params = { page, size }

  if (search) {
    params.search = search
  }

  if (status) {
    params.status = status
  }

  const response = await apiClient.get('/admin/contact-messages', { params })
  return response.data
}

export async function getAdminContactMessage(id) {
  const response = await apiClient.get(`/admin/contact-messages/${id}`)
  return response.data
}

export async function updateContactMessageStatus(id, status) {
  const response = await apiClient.put(`/admin/contact-messages/${id}/status`, { status })
  return response.data
}

export async function deleteContactMessage(id) {
  await apiClient.delete(`/admin/contact-messages/${id}`)
}

export async function submitContactMessage(payload) {
  const response = await apiClient.post('/contact', payload)
  return response.data
}
