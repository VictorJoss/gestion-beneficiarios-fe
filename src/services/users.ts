import api from './api'
import type { Usuario, UserRole, PaginatedResponse } from '../types'

export class UserService {
  async list(page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<Usuario>> {
    const response = await api.get<any>('/users/', { params: { page, page_size: pageSize } })
    const data = response.data
    if (Array.isArray(data)) {
      const start = (page - 1) * pageSize
      const items = data.slice(start, start + pageSize)
      return { items, total: data.length, page, page_size: pageSize, total_pages: Math.ceil(data.length / pageSize) }
    }
    return data as PaginatedResponse<Usuario>
  }

  async get(id: number): Promise<Usuario> {
    const response = await api.get<Usuario>(`/users/${id}`)
    return response.data
  }

  async create(data: {
    nombre_completo: string
    correo: string
    rol: UserRole
    password: string
  }): Promise<Usuario> {
    const response = await api.post<Usuario>('/users/', data)
    return response.data
  }

  async update(
    id: number,
    data: Partial<{ nombre_completo: string; rol: UserRole; activo: boolean }>
  ): Promise<Usuario> {
    const response = await api.put<Usuario>(`/users/${id}`, data)
    return response.data
  }

  async deactivate(id: number): Promise<void> {
    await api.delete(`/users/${id}`)
  }

  async activate(id: number): Promise<Usuario> {
    const response = await api.post<Usuario>(`/users/${id}/activate`)
    return response.data
  }
}

export const userService = new UserService()
