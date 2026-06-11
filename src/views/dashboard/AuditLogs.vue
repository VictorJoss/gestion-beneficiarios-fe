<template>
  <div class="dash-page">
    <div class="cards-grid">
      <article class="form-card">
        <div class="form-card-head">
          <div class="form-card-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          </div>
          <div class="form-card-title">
            <h3>Auditoría de eventos</h3>
            <span>Filtrar y consultar el registro de actividades del sistema</span>
          </div>
        </div>
        <form @submit.prevent="loadLogs">
          <div class="form-grid">
            <div class="form-field">
              <label>Método HTTP</label>
              <select v-model="filters.method" class="select">
                <option value="">Todos</option>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div class="form-field">
              <label>Código de estado</label>
              <select v-model.number="filters.status_code" class="select">
                <option :value="null">Todos</option>
                <option :value="200">200 OK</option>
                <option :value="201">201 Creado</option>
                <option :value="400">400 Bad Request</option>
                <option :value="401">401 No autorizado</option>
                <option :value="403">403 Prohibido</option>
                <option :value="404">404 No encontrado</option>
                <option :value="500">500 Error interno</option>
              </select>
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="isLoading">
              {{ isLoading ? 'Buscando...' : 'Buscar' }}
            </button>
            <button type="button" class="btn btn-secondary" @click="resetFilters">Limpiar</button>
          </div>
        </form>
      </article>
    </div>

    <section class="result-panel">
      <div class="result-head">
        <div class="result-head-info">
          <span class="label">Registros de auditoría</span>
          <span v-if="items.length > 0" class="count">
            Mostrando <strong>{{ items.length }}</strong> registro{{ items.length === 1 ? '' : 's' }}
          </span>
        </div>
        <button class="btn btn-ghost" @click="loadLogs">Recargar</button>
      </div>

      <div v-if="isLoading" class="item-list">
        <div v-for="n in 5" :key="n" class="skeleton-item">
          <div class="skeleton-body">
            <div class="skeleton-line w-60"></div>
            <div class="skeleton-line w-40"></div>
          </div>
        </div>
      </div>

      <div v-else-if="errorMessage" class="toast error">{{ errorMessage }}</div>

      <div v-else-if="items.length === 0" class="empty-list">
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        <p>No se encontraron registros de auditoría</p>
      </div>

      <div v-else class="audit-table-wrapper">
        <table class="audit-table">
          <thead>
            <tr>
              <th>Fecha / Hora</th>
              <th>Usuario</th>
              <th>Method</th>
              <th>Endpoint</th>
              <th>Acción</th>
              <th>Status</th>
              <th>IP</th>
              <th>Payload</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.id_audit_log">
              <td class="td-nowrap">{{ formatDate(item.created_at) }}</td>
              <td>{{ item.username || '—' }}</td>
              <td><code class="td-method" :class="methodClass(item.method)">{{ item.method }}</code></td>
              <td class="td-max">{{ item.endpoint }}</td>
              <td>
                <span class="badge badge-sm" :class="actionBadge(item.action)">
                  {{ item.action }}
                </span>
              </td>
              <td>
                <span class="badge badge-sm" :class="statusBadge(item.status_code)">
                  {{ item.status_code }}
                </span>
              </td>
              <td class="td-mono">{{ item.ip_address || '—' }}</td>
              <td class="td-max">
                <template v-if="item.payload">
                  <button class="btn-payload" @click="togglePayload(item.id_audit_log)">
                    {{ expandedPayload === item.id_audit_log ? 'Ocultar' : 'Ver' }}
                  </button>
                  <pre v-if="expandedPayload === item.id_audit_log" class="payload-json">{{ formatPayload(item.payload) }}</pre>
                </template>
                <span v-else class="muted">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="items.length > 0" class="pagination-bar">
        <button class="btn btn-secondary btn-sm" :disabled="offset === 0 || isLoading" @click="prevPage">
          ← Anterior
        </button>
        <span class="page-info">Página {{ currentPage }}</span>
        <button class="btn btn-secondary btn-sm" :disabled="items.length < limit || isLoading" @click="nextPage">
          Siguiente →
        </button>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, onMounted } from 'vue'
import { auditLogService } from '../../services/auditLogs'
import { usePermissions } from '../../composables/usePermissions'
import type { AuditLog, AuditLogFilters } from '../../types'

export default defineComponent({
  name: 'DashboardAuditLogs',
  setup() {
    const { puedeAccion } = usePermissions()

    const filters = reactive<AuditLogFilters>({
      method: '',
      status_code: null as unknown as number
    })

    const items = ref<AuditLog[]>([])
    const isLoading = ref(false)
    const errorMessage = ref('')
    const offset = ref(0)
    const limit = ref(50)
    const currentPage = ref(1)
    const expandedPayload = ref<number | null>(null)

    const extractError = (err: any): string => {
      const detail = err?.response?.data?.detail
      if (typeof detail === 'string') return detail
      if (Array.isArray(detail)) return detail.map((d: any) => d.msg).join(', ')
      return err?.message || 'Error desconocido'
    }

    const formatDate = (iso: string): string => {
      if (!iso) return '—'
      const d = new Date(iso)
      const pad = (n: number) => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
    }

    const methodClass = (method: string): string => {
      const map: Record<string, string> = { GET: 'method-get', POST: 'method-post', PUT: 'method-put', PATCH: 'method-patch', DELETE: 'method-delete' }
      return map[method] || ''
    }

    const actionBadge = (action: string): string => {
      if (action === 'CREATE') return 'badge-success'
      if (action === 'UPDATE') return 'badge-info'
      if (action === 'DELETE') return 'badge-danger'
      if (action === 'READ') return 'badge-default'
      return 'badge-violet'
    }

    const statusBadge = (code: number): string => {
      if (code >= 200 && code < 300) return 'badge-success'
      if (code >= 300 && code < 400) return 'badge-info'
      if (code >= 400 && code < 500) return 'badge-warning'
      if (code >= 500) return 'badge-danger'
      return 'badge-default'
    }

    const formatPayload = (payload: Record<string, any>): string => {
      try {
        return JSON.stringify(payload, null, 2)
      } catch {
        return String(payload)
      }
    }

    const togglePayload = (id: number) => {
      expandedPayload.value = expandedPayload.value === id ? null : id
    }

    const buildFilters = (): AuditLogFilters => {
      const f: AuditLogFilters = { limit: limit.value, offset: offset.value }
      if (filters.method) f.method = filters.method
      if (filters.status_code) f.status_code = filters.status_code
      return f
    }

    const loadLogs = async () => {
      isLoading.value = true
      errorMessage.value = ''
      expandedPayload.value = null
      try {
        const result = await auditLogService.list(buildFilters())
        items.value = result.items
      } catch (e: any) {
        errorMessage.value = extractError(e)
        items.value = []
      } finally {
        isLoading.value = false
      }
    }

    const resetFilters = () => {
      filters.method = ''
      filters.status_code = null as unknown as number
      offset.value = 0
      currentPage.value = 1
      loadLogs()
    }

    const nextPage = () => {
      offset.value += limit.value
      currentPage.value += 1
      loadLogs()
    }

    const prevPage = () => {
      offset.value = Math.max(0, offset.value - limit.value)
      currentPage.value = Math.max(1, currentPage.value - 1)
      loadLogs()
    }

    onMounted(() => {
      loadLogs()
    })

    return {
      filters, items, isLoading, errorMessage,
      offset, limit, currentPage, expandedPayload,
      formatDate, methodClass, actionBadge, statusBadge,
      formatPayload, togglePayload, loadLogs, resetFilters,
      nextPage, prevPage, puedeAccion
    }
  }
})
</script>

<style scoped>
.audit-table-wrapper {
  overflow-x: auto;
  margin: 0 -4px;
}

.audit-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 13px;
  color: #344054;
}

.audit-table thead th {
  position: sticky;
  top: 0;
  background: #f9fafb;
  padding: 10px 12px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #667085;
  text-align: left;
  border-bottom: 1px solid #eaecf0;
  white-space: nowrap;
}

.audit-table tbody tr {
  transition: background 0.12s ease;
}

.audit-table tbody tr:hover {
  background: #f5f8ff;
}

.audit-table tbody td {
  padding: 10px 12px;
  border-bottom: 1px solid #f0f1f3;
  vertical-align: middle;
  line-height: 1.4;
}

.audit-table tbody tr:last-child td {
  border-bottom: none;
}

.td-nowrap {
  white-space: nowrap;
}

.td-mono {
  font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
  font-size: 12px;
  color: #667085;
}

.td-max {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.td-method {
  font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 6px;
}

.method-get { background: #e6f7ed; color: #067647; }
.method-post { background: #e6f0ff; color: #175cd3; }
.method-put { background: #fef4e6; color: #b54708; }
.method-patch { background: #f0e6ff; color: #6941c6; }
.method-delete { background: #fef3f2; color: #b42318; }

.muted {
  color: #98a2b3;
}

.btn-payload {
  background: none;
  border: 1px solid #eaecf0;
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 600;
  color: #2b7cff;
  cursor: pointer;
  transition: all 0.12s ease;
  font-family: inherit;
}

.btn-payload:hover {
  background: #f5f8ff;
  border-color: #b2c8ff;
}

.payload-json {
  position: absolute;
  left: 0;
  right: 0;
  z-index: 10;
  margin-top: 6px;
  padding: 10px 12px;
  background: #1e293b;
  color: #e2e8f0;
  border-radius: 10px;
  font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
  font-size: 11px;
  line-height: 1.5;
  overflow-x: auto;
  max-height: 300px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-all;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
}

.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 14px 16px 4px;
}

.page-info {
  font-size: 13px;
  font-weight: 600;
  color: #667085;
}

.btn-sm {
  padding: 6px 14px;
  font-size: 12.5px;
}

@media (max-width: 760px) {
  .audit-table {
    font-size: 12px;
  }
  .audit-table thead th,
  .audit-table tbody td {
    padding: 8px 8px;
  }
  .td-max {
    max-width: 100px;
  }
}
</style>
