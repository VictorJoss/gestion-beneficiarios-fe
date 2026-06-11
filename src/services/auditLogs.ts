import api from './api'
import type { AuditLog, AuditLogFilters } from '@/types'

export class AuditLogService {
  async list(filters: AuditLogFilters = {}): Promise<{ items: AuditLog[]; total: number }> {
    const limit = filters.limit ?? 50
    const offset = filters.offset ?? 0
    const params: Record<string, any> = { limit, offset }
    if (filters.method) params.method = filters.method
    if (filters.status_code !== undefined && filters.status_code !== null) {
      params.status_code = filters.status_code
    }

    const r = await api.get<AuditLog[]>('/audit-logs/', { params })
    const items = r.data
    const total = items.length < limit ? offset + items.length : offset + limit + 1

    return { items, total }
  }
}

export const auditLogService = new AuditLogService()
