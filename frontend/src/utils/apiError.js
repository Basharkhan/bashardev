export function getApiErrorDetails(error) {
  const data = error?.response?.data

  return {
    message: data?.message || error?.message || 'Something went wrong.',
    fieldErrors: data?.fieldErrors || {},
    status: error?.response?.status ?? null,
  }
}
