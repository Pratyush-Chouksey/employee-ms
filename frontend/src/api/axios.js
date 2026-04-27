import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  // import.meta.env.VITE_API_URL reads from .env files
  // Falls back to localhost if env var not set
  withCredentials: true,
})

export default api