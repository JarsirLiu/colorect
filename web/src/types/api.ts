export interface ApiResponse<T> {
  data: T
  message?: string
  code: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

export interface UploadResponse {
  url: string
  filename: string
  size: number
  mimetype: string
}

export interface ApiErrorShape {
  message: string
  code?: string
  details?: Record<string, unknown>
}

export class ApiError extends Error {
  code?: string
  statusCode?: number
  details?: Record<string, unknown>

  constructor(
    message: string,
    code?: string,
    statusCode?: number,
    details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.statusCode = statusCode
    this.details = details
  }
}
