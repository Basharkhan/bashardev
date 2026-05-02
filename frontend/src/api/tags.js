import { apiClient } from './client'

export async function getAdminTags({ page = 0, size = 10, search = '' } = {}) {
  const response = await apiClient.get('/admin/tags', {
    params: {
      page,
      size,
      search,
    },
  })
  return response.data
}

export async function getAdminTagOptions() {
  const response = await apiClient.get('/admin/tags/options')
  return response.data
}

export async function createTag(payload) {
  const response = await apiClient.post('/admin/tags', payload)
  return response.data
}

export async function updateTag(id, payload) {
  const response = await apiClient.put(`/admin/tags/${id}`, payload)
  return response.data
}

export async function deleteTag(id) {
  await apiClient.delete(`/admin/tags/${id}`)
}
