import { apiClient } from './client'

export async function getProjects({ page = 0, size = 6 } = {}) {
  const response = await apiClient.get('/projects', {
    params: { page, size },
  })

  return response.data
}

export async function getProjectBySlug(slug) {
  const response = await apiClient.get(`/projects/slug/${slug}`)
  return response.data
}

export async function getAdminProjects({
  page = 0,
  size = 10,
  search = '',
  status,
  featured,
} = {}) {
  const response = await apiClient.get('/admin/projects', {
    params: {
      page,
      size,
      search: search || undefined,
      status: status && status !== 'ALL' ? status : undefined,
      featured: featured === 'FEATURED' ? true : undefined,
    },
  })

  return response.data
}

export async function getAdminProjectById(id) {
  const response = await apiClient.get(`/admin/projects/${id}`)
  return response.data
}

export async function createProject(payload) {
  const response = await apiClient.post('/admin/projects', payload)
  return response.data
}

export async function updateProject(id, payload) {
  const response = await apiClient.put(`/admin/projects/${id}`, payload)
  return response.data
}

export async function deleteProject(id) {
  await apiClient.delete(`/admin/projects/${id}`)
}
