import { apiClient } from './client'

export async function getAdminBlogPosts(page = 0, size = 10) {
  const response = await apiClient.get('/admin/blog-posts', {
    params: { page, size },
  })

  return response.data
}

export async function createBlogPost(payload) {
  const response = await apiClient.post('/admin/blog-posts', payload)
  return response.data
}

export async function updateBlogPost(id, payload) {
  const response = await apiClient.put(`/admin/blog-posts/${id}`, payload)
  return response.data
}

export async function deleteBlogPost(id) {
  await apiClient.delete(`/admin/blog-posts/${id}`)
}
