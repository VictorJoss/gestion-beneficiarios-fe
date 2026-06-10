<template>
  <div class="dash-page">
    <section v-if="puedeAccion('reportes.ver')" class="result-panel" style="display: block;">
      <div class="result-head">
        <div class="result-head-info">
          <span class="label">Reportes del Sistema</span>
          <span class="count">Zonas sin entregas</span>
        </div>
        <button class="btn btn-primary" @click="exportarCSV" :disabled="!zonas.length || loading">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Exportar CSV
        </button>
      </div>

      <div class="inventory-result">
        <div v-if="loading" class="loading-state">
          <div class="skeleton-line w-100" style="height: 40px; margin-bottom: 10px;"></div>
          <div class="skeleton-line w-100" style="height: 40px; margin-bottom: 10px;"></div>
          <div class="skeleton-line w-100" style="height: 40px;"></div>
        </div>

        <div v-else-if="error" class="toast error">
          <div>
            <strong>Error cargando el reporte</strong>
            <div>{{ error }}</div>
          </div>
        </div>

        <table v-else-if="zonas.length" class="inv-table">
          <thead>
            <tr>
              <th>ID Zona</th>
              <th>Nombre de la Zona</th>
              <th>Nivel de Riesgo</th>
              <th>Familias sin Entregas</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="zona in zonas" :key="zona.id_zona">
              <td>{{ zona.id_zona }}</td>
              <td>{{ zona.nombre }}</td>
              <td>
                <span class="badge" :class="riskBadge(zona.nivel_riesgo)">
                  RIESGO: {{ zona.nivel_riesgo.toUpperCase() }}
                </span>
              </td>
              <td class="num">{{ zona.familias_por_zona }}</td>
            </tr>
          </tbody>
        </table>

        <div v-else class="empty-list" style="text-align: center; padding: 40px; color: var(--color-text-light);">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1rem; opacity: 0.5;">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <p>No hay zonas con familias sin entregas.</p>
          <span style="font-size: 0.85rem; opacity: 0.7;">Todas las zonas con familias registradas han recibido atención.</span>
        </div>
      </div>
    </section>
    <section v-else class="result-panel" style="display: block;">
      <div class="toast error">
        <div>
          <strong>Acceso denegado</strong>
          <div>No tienes permisos para ver este módulo.</div>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { reportesService } from '../../services/operaciones'
import { usePermissions } from '../../composables/usePermissions'

export default defineComponent({
  name: 'DashboardReportes',
  setup() {
    const { puedeAccion } = usePermissions()
    const zonas = ref<any[]>([])
    const loading = ref(false)
    const error = ref('')

    const loadData = async () => {
      loading.value = true
      error.value = ''
      try {
        zonas.value = await reportesService.zonasSinEntregas()
      } catch (err: any) {
        error.value = err?.response?.data?.detail || err?.message || 'Error desconocido al cargar zonas'
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      loadData()
    })

    const riskBadge = (riesgo: string) => {
      switch (riesgo?.toLowerCase()) {
        case 'bajo': return 'badge-success'
        case 'medio': return 'badge-warning'
        case 'alto': return 'badge-danger'
        case 'crítico': return 'badge-dark'
        default: return 'badge-default'
      }
    }

    const exportarCSV = () => {
      if (!zonas.value.length) return

      const escapeCsvValue = (value: unknown): string => {
        const text = String(value ?? '')
        return `"${text.replace(/"/g, '""')}"`
      }

      const header = ['ID Zona', 'Nombre', 'Nivel de Riesgo', 'Familias por Zona']
      const rows = zonas.value.map(z => [
        escapeCsvValue(z.id_zona),
        escapeCsvValue(z.nombre),
        escapeCsvValue(z.nivel_riesgo),
        escapeCsvValue(z.familias_por_zona)
      ])

      const csvContent = [header.join(','), ...rows.map(r => r.join(','))].join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `reporte_zonas_sin_entregas_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      try {
        link.click()
      } finally {
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }
    }

    return { puedeAccion, zonas, loading, error, riskBadge, exportarCSV }
  }
})
</script>

<style scoped>
.badge-dark {
  background: #101828;
  color: #fff;
}
.inv-table th {
  text-align: left;
}
.inv-table td.num {
  text-align: right;
  font-weight: 600;
}
</style>
