<template>
  <div class="dash-page">
    <div class="cards-grid">
      <article v-if="puedeAccion('familias.crear')" class="form-card">
        <div class="form-card-head">
          <div class="form-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div class="form-card-title">
            <h3>Crear familia</h3>
            <span>Registra una nueva familia en el sistema</span>
          </div>
        </div>
        <form @submit.prevent="createFamily">
          <div class="form-grid single">
            <div class="form-field">
              <label>Zona (opcional)</label>
              <select v-model="form.id_zona" class="select">
                <option :value="null">Sin zona asignada</option>
                <option v-for="z in zonas" :key="z.id_zona" :value="z.id_zona">{{ z.nombre }}</option>
              </select>
              <span class="helper">Zona geogr&aacute;fica a la que pertenece la familia.</span>
            </div>
            <div class="form-field">
              <label class="check">
                <input v-model="form.acepta_privacidad" type="checkbox" />
                <span>Acepta política de privacidad <span class="req">*</span></span>
              </label>
              <span v-if="fieldErrors.acepta_privacidad" class="error-text">{{ fieldErrors.acepta_privacidad }}</span>
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="isLoading">
              <span v-if="isLoading && mode === 'create'" class="spinner"></span>
              <span v-else class="btn-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              </span>
              {{ isLoading && mode === 'create' ? 'Creando...' : 'Crear familia' }}
            </button>
            <button type="button" class="btn btn-secondary" @click="resetForm" :disabled="isLoading">Limpiar</button>
          </div>
        </form>
      </article>

    </div>

    <section v-if="showPanel || isListLoading" class="result-panel">
      <div v-if="isListLoading" class="item-list">
        <div v-for="n in 4" :key="n" class="skeleton-item">
          <div class="skeleton-avatar"></div>
          <div class="skeleton-body">
            <div class="skeleton-line w-60"></div>
            <div class="skeleton-line w-40"></div>
            <div class="skeleton-line w-80"></div>
          </div>
        </div>
      </div>

      <template v-else>
        <div class="result-head">
          <div class="result-head-info">
            <span class="label">Listado de familias</span>
            <span v-if="resultKind === 'success' && Array.isArray(familias)" class="count">
              <strong>{{ totalItems }}</strong> {{ totalItems === 1 ? 'familia' : 'familias' }}
            </span>
          </div>
          <button class="btn btn-ghost" @click="closeResult">Cerrar</button>
        </div>

        <div v-if="resultKind === 'success'">
          <ul v-if="Array.isArray(familias) && familias.length" class="item-list">
            <li v-for="familia in familias" :key="familia.id_familia" class="item-card">
              <div class="item-avatar variant-green">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </div>
              <div class="item-content">
                <h4>{{ familia.codigo_familia || 'Familia #' + familia.id_familia }}</h4>
                <p>Registrada el {{ formatDate(familia.fecha_registro) }}</p>
                <div class="item-meta">
                  <span class="badge" :class="familia.acepta_privacidad ? 'badge-success' : 'badge-warning'">
                    {{ familia.acepta_privacidad ? 'Privacidad OK' : 'Sin privacidad' }}
                  </span>
                  <span v-if="familia.puntaje_prioridad !== undefined" class="badge badge-info">
                    Prioridad: {{ familia.puntaje_prioridad }}
                  </span>
                  <span v-if="familia.id_zona" class="badge badge-default">Zona #{{ familia.id_zona }}</span>
                </div>
              </div>
              <div class="item-actions">
                <span class="badge badge-default">ID {{ familia.id_familia }}</span>
              </div>
            </li>
          </ul>

          <div v-if="Array.isArray(familias) && familias.length === 0" class="empty-list">
            <div class="icon">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <h4>Sin familias registradas</h4>
            <p>Aún no se han creado familias en la plataforma.</p>
          </div>

          <div v-if="resultKind === 'success' && !Array.isArray(familias)" class="detail-card">
            <div class="detail-row">
              <span class="k">Detalle</span>
              <span class="v">Familia creada correctamente.</span>
            </div>
          </div>

          <Pagination
            v-if="Array.isArray(familias) && familias.length > 0"
            v-model:currentPage="currentPage"
            v-model:pageSize="pageSize"
            :total="totalItems"
            :loading="isListLoading"
            item-label="familia"
            @change="onPageChange"
          />
        </div>

        <div v-else class="toast error">
          <span class="toast-icon">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          </span>
          <div>
            <strong>No se pudo completar la operaci&oacute;n.</strong>
            <div>{{ errorMessage }}</div>
          </div>
        </div>
      </template>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, onMounted } from 'vue'
import { familiaService } from '../../services/familia'
import { zonaService } from '../../services/ubicaciones'
import { usePermissions } from '../../composables/usePermissions'
import Pagination from '../../components/Pagination.vue'
import type { Familia, Zona, PaginatedResponse } from '../../types'

export default defineComponent({
  name: 'DashboardFamilias',
  components: { Pagination },
  setup() {
    const { puedeAccion } = usePermissions()
    const form = reactive({ acepta_privacidad: true, id_zona: null as number | null })
    const fieldErrors = reactive<Record<string, string>>({})
    const isLoading = ref(false)
    const mode = ref<'create' | 'list' | null>(null)
    const showPanel = ref(false)
    const resultKind = ref<'success' | 'error'>('success')
    const familias = ref<Familia[]>([])
    const zonas = ref<Zona[]>([])
    const isListLoading = ref(false)
    const errorMessage = ref('')

    const currentPage = ref(1)
    const pageSize = ref(6)
    const totalItems = ref(0)

    const loadFamilies = async (page: number = currentPage.value, size: number = pageSize.value) => {
      isListLoading.value = true
      mode.value = 'list'
      showPanel.value = true
      try {
        const response: PaginatedResponse<Familia> = await familiaService.list(page, size)
        resultKind.value = 'success'
        familias.value = response.items
        totalItems.value = response.total
        currentPage.value = response.page
        pageSize.value = response.page_size
      } catch (err: any) {
        resultKind.value = 'error'
        errorMessage.value = extractError(err)
        familias.value = []
      } finally {
        isListLoading.value = false
        mode.value = null
      }
    }

    const onPageChange = (payload: { page: number; pageSize: number }) => {
      loadFamilies(payload.page, payload.pageSize)
    }

    onMounted(async () => {
      try {
        zonas.value = await zonaService.list()
      } catch {
        // silent
      }
      if (puedeAccion('familias.listar')) {
        await loadFamilies()
      }
    })

    const validate = (): boolean => {
      Object.keys(fieldErrors).forEach(k => delete fieldErrors[k])
      if (!form.acepta_privacidad) fieldErrors.acepta_privacidad = 'Debe aceptar la política de privacidad'
      return Object.keys(fieldErrors).length === 0
    }

    const closeResult = () => {
      showPanel.value = false
      familias.value = []
      errorMessage.value = ''
    }

    const resetForm = () => {
      form.acepta_privacidad = true
      form.id_zona = null
      Object.keys(fieldErrors).forEach(k => delete fieldErrors[k])
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

    const createFamily = async () => {
      if (!validate()) return
      isLoading.value = true
      mode.value = 'create'
      try {
        await familiaService.create({
          acepta_privacidad: form.acepta_privacidad,
          id_zona: form.id_zona ?? undefined
        })
        resultKind.value = 'success'
        resetForm()
        await loadFamilies(1, pageSize.value)
      } catch (err: any) {
        resultKind.value = 'error'
        errorMessage.value = extractError(err)
        showPanel.value = true
      } finally {
        isLoading.value = false
        mode.value = null
      }
    }

    return {
      form, fieldErrors, isLoading, mode, showPanel, resultKind,
      familias, zonas, isListLoading, errorMessage,
      currentPage, pageSize, totalItems,
      createFamily, loadFamilies, onPageChange, resetForm, closeResult,
      formatDate, puedeAccion
    }
  }
})
</script>
