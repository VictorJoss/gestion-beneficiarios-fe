<template>
  <div class="dash-page">
    <div class="cards-grid">
      <article v-if="puedeAccion('planes.generar')" class="form-card">
        <div class="form-card-head">
          <div class="form-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          </div>
          <div class="form-card-title">
            <h3>Generar plan de distribuci&oacute;n</h3>
            <span>Crea un nuevo plan basado en la prioridad de las familias</span>
          </div>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-primary" :disabled="generatingPlan" @click="showGenerateDialog = true">
            <span v-if="generatingPlan" class="spinner"></span>
            <span v-else class="btn-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            </span>
            {{ generatingPlan ? 'Generando...' : 'Generar nuevo plan' }}
          </button>
        </div>
      </article>
    </div>

    <section class="result-panel">
      <div class="result-head">
        <div class="result-head-info">
          <span class="label">Planes de distribuci&oacute;n</span>
          <span v-if="!isListLoading && planes.length" class="count">
            <strong>{{ planes.length }}</strong> {{ planes.length === 1 ? 'plan' : 'planes' }}
          </span>
        </div>
        <button class="btn btn-ghost" @click="closeResult">Cerrar</button>
      </div>

      <div v-if="isListLoading" class="item-list">
        <div v-for="n in 4" :key="n" class="skeleton-item"><div class="skeleton-avatar"></div><div class="skeleton-body"><div class="skeleton-line w-60"></div><div class="skeleton-line w-40"></div></div></div>
      </div>

      <div v-else-if="planes.length" class="item-list">
        <div v-for="plan in planes" :key="plan.id_plan" class="item-card">
          <div class="item-avatar" :class="avatarVariant(plan.estado)">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          </div>
          <div class="item-content">
            <h4>Plan #{{ plan.id_plan }} &mdash; Familia #{{ plan.id_familia }}</h4>
            <p>Generado el {{ formatDate(plan.fecha_generacion) }}</p>
            <div class="item-meta">
              <span class="badge" :class="estadoBadge(plan.estado)">{{ estadoLabel(plan.estado) }}</span>
              <span class="badge badge-default">Prioridad {{ plan.prioridad_orden }}</span>
            </div>
          </div>
          <div class="item-actions">
            <span class="badge badge-default">ID {{ plan.id_plan }}</span>
          </div>
        </div>
      </div>

      <div v-else class="empty-list">
        <div class="icon">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        </div>
        <h4>Sin planes de distribuci&oacute;n</h4>
        <p>A&uacute;n no se han generado planes. Usa el bot&oacute;n &laquo;Generar nuevo plan&raquo; para crear uno.</p>
      </div>

      <div v-if="successMessage" class="toast success">
        <span class="toast-icon">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
        </span>
        <div><strong>Operaci&oacute;n exitosa.</strong><div>{{ successMessage }}</div></div>
      </div>

      <div v-if="errorMessage" class="toast error">
        <span class="toast-icon">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
        </span>
        <div><strong>No se pudo completar la operaci&oacute;n.</strong><div>{{ errorMessage }}</div></div>
      </div>
    </section>

    <ConfirmDialog
      :show="showGenerateDialog"
      title="Generar plan de distribuci&oacute;n"
      message="Se generar&aacute; un nuevo plan de distribuci&oacute;n basado en la prioridad de las familias registradas. &iquest;Deseas continuar?"
      confirm-text="Generar plan"
      type="primary"
      :loading="generatingPlan"
      @update:show="showGenerateDialog = false"
      @confirm="handleGenerate"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { planDistribucionService } from '../../services/operaciones'
import { usePermissions } from '../../composables/usePermissions'
import ConfirmDialog from '../../components/ConfirmDialog.vue'
import type { PlanDistribucion, EstadoPlan } from '../../types'

const ESTADO_CONFIG: Record<EstadoPlan, { label: string; badge: string; avatar: string }> = {
  PROGRAMADO: { label: 'Programado', badge: 'badge-info', avatar: 'variant-blue' },
  EN_PROCESO: { label: 'En proceso', badge: 'badge-warning', avatar: 'variant-yellow' },
  COMPLETADO: { label: 'Completado', badge: 'badge-success', avatar: 'variant-green' },
  ANULADO: { label: 'Anulado', badge: 'badge-danger', avatar: 'variant-pink' }
}

export default defineComponent({
  name: 'DashboardPlanesDistribucion',
  components: { ConfirmDialog },
  setup() {
    const { puedeAccion } = usePermissions()
    const planes = ref<PlanDistribucion[]>([])
    const isListLoading = ref(false)
    const generatingPlan = ref(false)
    const showGenerateDialog = ref(false)
    const successMessage = ref('')
    const errorMessage = ref('')

    onMounted(async () => {
      await loadPlanes()
    })

    const loadPlanes = async () => {
      isListLoading.value = true
      errorMessage.value = ''
      try {
        const response = await planDistribucionService.listar()
        planes.value = Array.isArray(response) ? response : []
      } catch {
        // silent on initial load
      } finally {
        isListLoading.value = false
      }
    }

    const handleGenerate = async () => {
      generatingPlan.value = true
      errorMessage.value = ''
      successMessage.value = ''
      try {
        const result = await planDistribucionService.generar()
        showGenerateDialog.value = false
        successMessage.value = result.mensaje
        await loadPlanes()
      } catch (err: any) {
        errorMessage.value = extractError(err)
      } finally {
        generatingPlan.value = false
      }
    }

    const closeResult = () => {
      errorMessage.value = ''
      successMessage.value = ''
    }

    const extractError = (err: any): string => {
      const detail = err?.response?.data?.detail
      if (typeof detail === 'string') return detail
      if (Array.isArray(detail)) return detail.map((d: any) => d.msg).join(', ')
      return err?.message || 'Error desconocido'
    }

    const formatDate = (iso?: string) => {
      if (!iso) return '—'
      try {
        const d = new Date(iso)
        return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })
      } catch {
        return iso
      }
    }

    const estadoLabel = (estado: EstadoPlan): string => {
      return ESTADO_CONFIG[estado]?.label || estado
    }

    const estadoBadge = (estado: EstadoPlan): string => {
      return ESTADO_CONFIG[estado]?.badge || 'badge-default'
    }

    const avatarVariant = (estado: EstadoPlan): string => {
      return ESTADO_CONFIG[estado]?.avatar || 'variant-blue'
    }

    return {
      planes, isListLoading, generatingPlan, showGenerateDialog, successMessage, errorMessage,
      loadPlanes, handleGenerate, closeResult,
      formatDate, estadoLabel, estadoBadge, avatarVariant,
      puedeAccion
    }
  }
})
</script>
