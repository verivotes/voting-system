import axios from 'axios'

const API = axios.create({ 
  baseURL: 'https://efficient-mindfulness-production-5fd7.up.railway.app/api',
  timeout: 60000
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const registerUser = (data: { email: string; password: string; fullName: string }) =>
  API.post('/auth/register', data)

export const verifyOtp = (data: { email: string; token: string }) =>
  API.post('/auth/verify-otp', data)

export const loginUser = (data: { email: string; password: string }) =>
  API.post('/auth/login', data)

export default API