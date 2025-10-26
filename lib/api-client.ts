/**
 * API Client para conectarse al backend Spring Boot
 */

const API_BASE_URL = 'http://localhost:8081/api'

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  semester?: number
  type: 'ESTUDIANTE' | 'DOCENTE'
}

export interface LoginRequest {
  usernameOrEmail: string
  password: string
}

export interface ApiResponse {
  success: boolean
  message?: string
  data?: any
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async register(data: RegisterRequest) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async login(data: LoginRequest) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getCurrentUser(token: string) {
    return this.request('/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
