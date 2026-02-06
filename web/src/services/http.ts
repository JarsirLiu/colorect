import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

import { ApiError } from '@/types/api'

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

http.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError<{ message?: string; code?: string; details?: Record<string, unknown> }>) => {
    const message = error.response?.data?.message || error.message || '请求失败'
    const code = error.response?.data?.code
    const statusCode = error.response?.status
    const details = error.response?.data?.details

    return Promise.reject(new ApiError(message, code ?? undefined, statusCode ?? undefined, details))
  }
)
