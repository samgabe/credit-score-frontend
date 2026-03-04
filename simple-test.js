// Simple test to isolate the import issue
const api = {
  post: () => Promise.resolve({ data: { access_token: 'test', user: { fullname: 'Test' } } })
}

export default api
