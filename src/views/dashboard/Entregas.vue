<template>
  <div class="dash-page">
    <div class="cards-grid">
      <article v-if="puedeAccion('entregas.registrar')" class="form-card">
        <div class="form-card-head">
          <div class="form-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
          </div>
          <div class="form-card-title">
            <h3>Registrar entrega</h3>
            <span>Registra una entrega individual con recursos, ubicación y firma del receptor</span>
          </div>
        </div>

        <form @submit.prevent="submitEntrega">
          <div class="form-grid">
            <div class="form-field" :class="{ error: fieldErrors.id_familia }">
              <label class="req">Familia beneficiaria</label>
              <select v-model.number="form.id_familia" class="select" :disabled="isLoadingPickers">
                <option :value="null">Selecciona una familia</option>
                <option v-for="f in familias" :key="f.id_familia" :value="f.id_familia">
                  {{ f.codigo_familia || ('Familia #' + f.id_familia) }}
                </option>
              </select>
              <span v-if="fieldErrors.id_familia" class="error-text">{{ fieldErrors.id_familia }}</span>
            </div>

            <div class="form-field">
              <label>Bodega de origen (opcional)</label>
              <select v-model.number="form.id_bodega" class="select" :disabled="isLoadingPickers">
                <option :value="null">Automática (según disponibilidad)</option>
                <option v-for="b in bodegas" :key="b.id_bodega" :value="b.id_bodega">{{ b.nombre }}</option>
              </select>
              <span class="helper">Si no eliges bodega, el sistema asigna una con stock suficiente.</span>
            </div>

            <div class="form-field">
              <label>Fecha efectiva</label>
              <input v-model="form.fecha_efectiva" class="input" type="date" />
            </div>

            <div class="form-field full">
              <label>Ubicación del punto de entrega</label>
              <div class="coords-row">
                <input
                  v-model="form.coordenadas"
                  class="input"
                  placeholder="lat,long (ej. 7.8939,-72.5078)"
                  readonly
                />
                <button
                  type="button"
                  class="btn btn-secondary"
                  :disabled="isLocating"
                  @click="obtenerUbicacion"
                >
                  <span v-if="isLocating" class="spinner"></span>
                  <span v-else>{{ form.coordenadas ? 'Actualizar' : 'Obtener ubicación' }}</span>
                </button>
              </div>
              <span v-if="geoError" class="error-text">{{ geoError }}</span>
              <span v-else class="helper">Usa el GPS del dispositivo para registrar dónde se realizó la entrega.</span>
            </div>

            <div class="form-field full">
              <label class="req">Recursos entregados</label>
              <div class="detalles-list">
                <div
                  v-for="(linea, index) in form.detalles"
                  :key="index"
                  class="detalle-row"
                  :class="{ error: fieldErrors[`detalle_${index}`] }"
                >
                  <select v-model.number="linea.id_recurso" class="select" :disabled="isLoadingPickers">
                    <option :value="null">Selecciona recurso</option>
                    <option v-for="r in recursosActivos" :key="r.id_recurso" :value="r.id_recurso">
                      {{ r.nombre }} ({{ r.unidad_medida }})
                    </option>
                  </select>
                  <input
                    v-model.number="linea.cantidad"
                    class="input detalle-cantidad"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Cant."
                  />
                  <button
                    type="button"
                    class="btn btn-ghost btn-icon"
                    title="Quitar línea"
                    :disabled="form.detalles.length === 1"
                    @click="removeDetalle(index)"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              </div>
              <span v-if="fieldErrors.detalles" class="error-text">{{ fieldErrors.detalles }}</span>
              <button type="button" class="btn btn-secondary btn-add-line" @click="addDetalle">
                + Agregar recurso
              </button>
            </div>

            <div class="form-field full" :class="{ error: fieldErrors.firma_digital }">
              <SignaturePad
                v-model="form.firma_digital"
                label="Firma del receptor"
                helper="La firma se guarda como evidencia de recepción."
              />
              <span v-if="fieldErrors.firma_digital" class="error-text">{{ fieldErrors.firma_digital }}</span>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
              <span v-if="isSubmitting" class="spinner"></span>
              <span v-else class="btn-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
              {{ isSubmitting ? 'Registrando...' : 'Confirmar entrega' }}
            </button>
            <button type="button" class="btn btn-secondary" :disabled="isSubmitting" @click="resetForm">
              Limpiar
            </button>
          </div>
        </form>
      </article>

      <article v-else class="form-card">
        <div class="form-card-title">
          <h3>Sin permisos</h3>
          <span>Tu rol no puede registrar entregas en el sistema.</span>
        </div>
      </article>
    </div>

    <section v-if="showPanel" class="result-panel">
      <div class="result-head">
        <div class="result-head-info">
          <span class="label">Resultado del registro</span>
        </div>
        <button class="btn btn-ghost" @click="closeResult">Cerrar</button>
      </div>

      <LoadingState v-if="isSubmitting" variant="skeleton" :count="2" label="Registrando entrega..." />

      <template v-else>
        <div v-if="resultKind === 'success' && entregaCreada" class="detail-card">
          <div class="detail-row">
            <span class="k">Código</span>
            <span class="v"><span class="badge badge-success">{{ entregaCreada.codigo || '—' }}</span></span>
          </div>
          <div class="detail-row">
            <span class="k">Estado</span>
            <span class="v"><span class="badge" :class="estadoBadge(entregaCreada.estado)">{{ entregaCreada.estado }}</span></span>
          </div>
          <div class="detail-row">
            <span class="k">Familia</span>
            <span class="v">#{{ entregaCreada.id_familia }}</span>
          </div>
          <div class="detail-row">
            <span class="k">Bodega</span>
            <span class="v">{{ entregaCreada.id_bodega ? '#' + entregaCreada.id_bodega : 'Asignada automáticamente' }}</span>
          </div>
          <div class="detail-row">
            <span class="k">Fecha efectiva</span>
            <span class="v">{{ entregaCreada.fecha_efectiva || '—' }}</span>
          </div>
          <div v-if="entregaCreada.coordenadas" class="detail-row">
            <span class="k">Coordenadas</span>
            <span class="v">{{ entregaCreada.coordenadas }}</span>
          </div>
          <div class="detail-row">
            <span class="k">Recursos</span>
            <span class="v">
              <ul class="detalle-result-list">
                <li v-for="d in entregaCreada.detalles" :key="d.id_detalle">
                  {{ d.nombre_recurso || ('Recurso #' + d.id_recurso) }} — {{ d.cantidad }}
                </li>
              </ul>
            </span>
          </div>
        </div>

        <ErrorState
          v-else
          title="No se pudo registrar la entrega"
          :message="errorMessage"
          retry-label="Reintentar"
          @retry="submitEntrega"
        />
      </template>
    </section>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref } from 'vue'
import { entregaService } from '../../services/operaciones'
import { familiaService } from '../../services/familia'
import { bodegaService, recursoService } from '../../services/ubicaciones'
import { usePermissions } from '../../composables/usePermissions'
import SignaturePad from '../../components/SignaturePad.vue'
import LoadingState from '../../components/LoadingState.vue'
import ErrorState from '../../components/ErrorState.vue'
import type { Bodega, Entrega, EntregaCreate, EstadoEntrega, Familia, Recurso } from '../../types'

interface DetalleFormLine {
  id_recurso: number | null
  cantidad: number | null
}

export default defineComponent({
  name: 'DashboardEntregas',
  components: { SignaturePad, LoadingState, ErrorState },
  setup() {
    const { puedeAccion } = usePermissions()

    const familias = ref<Familia[]>([])
    const bodegas = ref<Bodega[]>([])
    const recursos = ref<Recurso[]>([])
    const isLoadingPickers = ref(false)
    const isSubmitting = ref(false)
    const isLocating = ref(false)
    const geoError = ref('')
    const showPanel = ref(false)
    const resultKind = ref<'success' | 'error'>('success')
    const errorMessage = ref('')
    const entregaCreada = ref<Entrega | null>(null)
    const fieldErrors = reactive<Record<string, string>>({})

    const today = (): string => new Date().toISOString().split('T')[0]

    const emptyDetalle = (): DetalleFormLine => ({ id_recurso: null, cantidad: null })

    const form = reactive({
      id_familia: null as number | null,
      id_bodega: null as number | null,
      fecha_efectiva: today(),
      coordenadas: '',
      firma_digital: '',
      detalles: [emptyDetalle()] as DetalleFormLine[]
    })

    const recursosActivos = computed(() => recursos.value.filter(r => r.activo))

    const extractError = (err: unknown): string => {
      const e = err as { response?: { data?: { detail?: string | Array<{ msg: string }> } }; message?: string }
      const detail = e?.response?.data?.detail
      if (typeof detail === 'string') return detail
      if (Array.isArray(detail)) return detail.map(d => d.msg).join(', ')
      return e?.message || 'Error desconocido'
    }

    const loadPickers = async (): Promise<void> => {
      if (!puedeAccion('entregas.registrar')) return
      isLoadingPickers.value = true
      try {
        const [famRes, bodRes, recRes] = await Promise.all([
          familiaService.list(1, 100),
          bodegaService.list(),
          recursoService.list()
        ])
        familias.value = famRes.items
        bodegas.value = Array.isArray(bodRes) ? bodRes : []
        recursos.value = Array.isArray(recRes) ? recRes : []
      } catch {
        // Los pickers quedan vacíos; el usuario verá selects sin opciones
      } finally {
        isLoadingPickers.value = false
      }
    }

    const validate = (): boolean => {
      Object.keys(fieldErrors).forEach(k => delete fieldErrors[k])

      if (!form.id_familia) fieldErrors.id_familia = 'Selecciona la familia beneficiaria'

      const validDetalles = form.detalles.filter(
        d => d.id_recurso && d.cantidad && d.cantidad > 0
      )
      if (!validDetalles.length) {
        fieldErrors.detalles = 'Agrega al menos un recurso con cantidad mayor a cero'
      }

      const recursoIds = new Set<number>()
      form.detalles.forEach((linea, index) => {
        if (!linea.id_recurso && !linea.cantidad) return
        if (!linea.id_recurso || !linea.cantidad || linea.cantidad <= 0) {
          fieldErrors[`detalle_${index}`] = 'Completa recurso y cantidad'
        } else if (recursoIds.has(linea.id_recurso)) {
          fieldErrors[`detalle_${index}`] = 'Recurso duplicado'
          fieldErrors.detalles = 'No repitas el mismo recurso en la entrega'
        } else {
          recursoIds.add(linea.id_recurso)
        }
      })

      return Object.keys(fieldErrors).length === 0
    }

    const addDetalle = (): void => {
      form.detalles.push(emptyDetalle())
    }

    const removeDetalle = (index: number): void => {
      if (form.detalles.length <= 1) return
      form.detalles.splice(index, 1)
    }

    const obtenerUbicacion = (): void => {
      geoError.value = ''
      if (!navigator.geolocation) {
        geoError.value = 'Tu navegador no soporta geolocalización'
        return
      }
      isLocating.value = true
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          form.coordenadas = `${pos.coords.latitude.toFixed(6)},${pos.coords.longitude.toFixed(6)}`
          isLocating.value = false
        },
        (err) => {
          geoError.value = err.message || 'No se pudo obtener la ubicación'
          isLocating.value = false
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      )
    }

    const buildPayload = (): EntregaCreate => {
      const payload: EntregaCreate = {
        id_familia: form.id_familia as number,
        detalles: form.detalles
          .filter(d => d.id_recurso && d.cantidad && d.cantidad > 0)
          .map(d => ({ id_recurso: d.id_recurso as number, cantidad: d.cantidad as number }))
      }
      if (form.id_bodega) payload.id_bodega = form.id_bodega
      if (form.fecha_efectiva) payload.fecha_efectiva = form.fecha_efectiva
      if (form.coordenadas.trim()) payload.coordenadas = form.coordenadas.trim()
      if (form.firma_digital) payload.firma_digital = form.firma_digital
      return payload
    }

    const resetForm = (): void => {
      form.id_familia = null
      form.id_bodega = null
      form.fecha_efectiva = today()
      form.coordenadas = ''
      form.firma_digital = ''
      form.detalles = [emptyDetalle()]
      geoError.value = ''
      Object.keys(fieldErrors).forEach(k => delete fieldErrors[k])
    }

    const closeResult = (): void => {
      showPanel.value = false
      entregaCreada.value = null
      errorMessage.value = ''
    }

    const submitEntrega = async (): Promise<void> => {
      if (!validate()) return
      isSubmitting.value = true
      showPanel.value = true
      resultKind.value = 'success'
      entregaCreada.value = null
      errorMessage.value = ''
      try {
        entregaCreada.value = await entregaService.registrar(buildPayload())
        resultKind.value = 'success'
        resetForm()
      } catch (err: unknown) {
        resultKind.value = 'error'
        errorMessage.value = extractError(err)
      } finally {
        isSubmitting.value = false
      }
    }

    const estadoBadge = (estado: EstadoEntrega): string => {
      const map: Record<EstadoEntrega, string> = {
        PENDIENTE: 'badge-warning',
        ENTREGADA: 'badge-success',
        ANULADA: 'badge-danger'
      }
      return map[estado] || 'badge-default'
    }

    onMounted(() => {
      loadPickers()
    })

    return {
      puedeAccion,
      familias,
      bodegas,
      recursosActivos,
      form,
      fieldErrors,
      isLoadingPickers,
      isSubmitting,
      isLocating,
      geoError,
      showPanel,
      resultKind,
      errorMessage,
      entregaCreada,
      addDetalle,
      removeDetalle,
      obtenerUbicacion,
      resetForm,
      closeResult,
      submitEntrega,
      estadoBadge
    }
  }
})
</script>

<style scoped>
.coords-row {
  display: flex;
  gap: var(--spacing-sm, 0.5rem);
  flex-wrap: wrap;
}

.coords-row .input {
  flex: 1;
  min-width: 180px;
}

.detalles-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm, 0.5rem);
}

.detalle-row {
  display: grid;
  grid-template-columns: 1fr 110px auto;
  gap: var(--spacing-sm, 0.5rem);
  align-items: center;
}

.detalle-row.error .select,
.detalle-row.error .input {
  border-color: var(--color-danger, #f04438);
}

.detalle-cantidad {
  min-width: 0;
}

.btn-add-line {
  margin-top: var(--spacing-sm, 0.5rem);
}

.detalle-result-list {
  margin: 0;
  padding-left: 1.1rem;
}

@media (max-width: 640px) {
  .detalle-row {
    grid-template-columns: 1fr;
  }

  .coords-row {
    flex-direction: column;
  }
}
</style>
