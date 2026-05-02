import { apiClient } from './client'

export async function getMediaAssets({ page = 0, size = 12, search = '' } = {}) {
  const response = await apiClient.get('/admin/media', {
    params: {
      page,
      size,
      search,
    },
  })
  return response.data
}

export async function getMediaAssetOptions() {
  const response = await apiClient.get('/admin/media/options')
  return response.data
}

export async function uploadImage(file) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await apiClient.post('/admin/media/images', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data
}

export async function deleteMediaAsset(id) {
  await apiClient.delete(`/admin/media/${id}`)
}
