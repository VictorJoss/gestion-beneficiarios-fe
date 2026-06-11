<template>
  <div class="dash-page">
    <div class="tabs">
      <button
        v-for="t in tabs"
        :key="t.key"
        class="tab-btn"
        :class="{ active: activeTab === t.key }"
        @click="activeTab = t.key"
      >
        {{ t.label }}
      </button>
    </div>

    <div v-if="activeTab === 'crear'" class="cards-grid">
      <article v-if="puedeAccion('focos.crear')" class="form-card">
        <div class="form-card-head">
          <div class="form-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <div class="form-card-title">
            <h3>Registrar foco sanitario</h3>
            <span>Reporta un nuevo foco de riesgo sanitario</span>
          </div>
        </div>
        <form @submit.prevent="handleCreate">
          <div class="form-grid">
            <div class="form-field" :class="{ error: fieldErrors.id_zona }">
              <label>Zona</label>
              <select v-model="form.id_zona" class="select">
                <option :value="null">Sin zona</option>
                <option v-for="z in zonas" :key="z.id_zona" :value="z.id_zona">{{ z.nombre }}</option>
              </select>
              <span v-if="fieldErrors.id_zona" class="error-text">{{ fieldErrors.id_zona }}</span>
            </div>
            <div class="form-field">
              <label>Refugio</label>
              <select v-model="form.id_refugio" class="select">
                <option :value="null">Sin refugio</option>
                <option v-for="r in refugios" :key="r.id" :value="r.id">{{ r.nombre }}</option>
              </select>
            </div>
            <div class="form-field" :class="{ error: fieldErrors.tipo_vector }">
              <label class="req">Tipo de vector</label>
              <select v-model="form.tipo_vector" class="select">
                <option value="">Selecciona una opci&oacute;n</option>
                <option v-for="tv in TIPOS_VECTOR" :key="tv" :value="tv">{{ vectorLabel(tv) }}</option>
              </select>
              <span v-if="fieldErrors.tipo_vector" class="error-text">{{ fieldErrors.tipo_vector }}</span>
            </div>
            <div class="form-field" :class="{ error: fieldErrors.nivel_riesgo }">
              <label class="req">Nivel de riesgo</label>
              <select v-model="form.nivel_riesgo" class="select">
                <option value="">Selecciona una opci&oacute;n</option>
                <option value="BAJO">Bajo</option>
                <option value="MEDIO">Medio</option>
                <option value="ALTO">Alto</option>
                <option value="CRITICO">Cr&iacute;tico</option>
              </select>
              <span v-if="fieldErrors.nivel_riesgo" class="error-text">{{ fieldErrors.nivel_riesgo }}</span>
            </div>
            <div class="form-field">
              <label>Latitud</label>
              <input v-model="form.latitud" class="input" type="number" step="any" placeholder="Ej: 4.7110" />
            </div>
            <div class="form-field">
              <label>Longitud</label>
              <input v-model="form.longitud" class="input" type="number" step="any" placeholder="Ej: -74.0721" />
            </div>
            <div class="form-field full-width">
              <label>Acciones tomadas</label>
              <textarea v-model="form.acciones_tomadas" class="textarea" rows="3" placeholder="Describe las acciones realizadas..."></textarea>
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="creating">
              <span v-if="creating" class="spinner"></span>
              {{ creating ? 'Registrando...' : 'Registrar foco' }}
            </button>
            <button type="button" class="btn btn-secondary" @click="resetForm" :disabled="creating">Limpiar</button>
          </div>
        </form>
      </article>
    </div>

    <section v-if="activeTab === 'lista'" class="result-panel">
      <div class="result-head">
        <div class="result-head-info">
          <span class="label">Focos sanitarios</span>
          <span v-if="focos.length" class="count"><strong>{{ focos.length }}</strong> {{ focos.length === 1 ? 'foco' : 'focos' }}</span>
        </div>
        <div class="filter-row">
          <select v-model="filtroEstado" class="select" @change="loadFocos">
            <option value="">Todos los estados</option>
            <option value="ACTIVO">Activo</option>
            <option value="EN_ATENCION">En atenci&oacute;n</option>
            <option value="RESUELTO">Resuelto</option>
          </select>
          <select v-model="filtroRiesgo" class="select" @change="loadFocos">
            <option value="">Todos los niveles</option>
            <option value="BAJO">Bajo</option>
            <option value="MEDIO">Medio</option>
            <option value="ALTO">Alto</option>
            <option value="CRITICO">Cr&iacute;tico</option>
          </select>
          <select v-model="filtroZona" class="select" @change="loadFocos">
            <option :value="null">Todas las zonas</option>
            <option v-for="z in zonas" :key="z.id_zona" :value="z.id_zona">{{ z.nombre }}</option>
          </select>
        </div>
        <button class="btn btn-ghost" @click="closeResult">Cerrar</button>
      </div>

      <div v-if="isListLoading" class="item-list">
        <div v-for="n in 4" :key="n" class="skeleton-item"><div class="skeleton-avatar"></div><div class="skeleton-body"><div class="skeleton-line w-60"></div><div class="skeleton-line w-40"></div></div></div>
      </div>

      <div v-else-if="focos.length" class="item-list">
        <div v-for="foco in focos" :key="foco.id_foco" class="item-card">
          <div class="item-avatar" :class="avatarVariant(foco.estado)">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <div class="item-content">
            <h4>{{ vectorLabel(foco.tipo_vector) }}</h4>
            <p>{{ foco.acciones_tomadas || 'Sin acciones registradas' }}</p>
            <div class="item-meta">
              <span class="badge" :class="riesgoBadge(foco.nivel_riesgo)">{{ foco.nivel_riesgo }}</span>
              <span class="badge" :class="estadoBadge(foco.estado)">{{ estadoLabel(foco.estado) }}</span>
              <span v-if="foco.id_zona" class="badge badge-default">Zona {{ zonaNombre(foco.id_zona) }}</span>
            </div>
          </div>
          <div class="item-actions">
            <span class="badge badge-default">ID {{ foco.id_foco }}</span>
            <button
              v-if="puedeAccion('focos.actualizar')"
              class="btn btn-sm"
              @click="abrirEdicion(foco)"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
          </div>
        </div>
      </div>

      <div v-else class="empty-list">
        <div class="icon">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </div>
        <h4>Sin focos sanitarios</h4>
        <p>No se encontraron focos con los filtros seleccionados.</p>
      </div>

      <div v-if="errorMessage" class="toast error">
        <span class="toast-icon">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
        </span>
        <div><strong>No se pudo completar la operaci&oacute;n.</strong><div>{{ errorMessage }}</div></div>
      </div>
    </section>

    <div v-if="activeTab === 'mapa'" class="result-panel">
      <div class="result-head">
        <div class="result-head-info">
          <span class="label">Mapa de focos sanitarios</span>
        </div>
        <label class="checkbox-label">
          <input type="checkbox" v-model="incluirResueltos" @change="cargarMapa" />
          Incluir resueltos
        </label>
      </div>
      <div ref="mapContainer" class="map-container"></div>
    </div>

    <Teleport to="body">
      <Transition name="dialog-fade">
        <div v-if="editando" class="dialog-overlay" @click.self="cancelarEdicion">
          <div class="dialog-content">
            <div class="dialog-header">
              <h3 class="dialog-title">Actualizar foco #{{ focoEditando?.id_foco }}</h3>
              <button class="btn-close" @click="cancelarEdicion">&times;</button>
            </div>
            <div class="dialog-body">
              <div class="form-grid">
                <div class="form-field">
                  <label>Estado</label>
                  <select v-model="editForm.estado" class="select">
                    <option value="ACTIVO">Activo</option>
                    <option value="EN_ATENCION">En atenci&oacute;n</option>
                    <option value="RESUELTO">Resuelto</option>
                  </select>
                </div>
                <div class="form-field full-width">
                  <label>Acciones tomadas</label>
                  <textarea v-model="editForm.acciones_tomadas" class="textarea" rows="3"></textarea>
                </div>
              </div>
            </div>
            <div class="dialog-footer">
              <button class="btn btn-secondary" @click="cancelarEdicion" :disabled="updating">Cancelar</button>
              <button class="btn btn-primary" @click="guardarEdicion" :disabled="updating">
                <span v-if="updating" class="spinner"></span>
                {{ updating ? 'Guardando...' : 'Guardar cambios' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, watch, nextTick, onMounted, onUnmounted, type Ref } from 'vue'
import { focoSanitarioService } from '../../services/operaciones'
import { zonaService, refugioService } from '../../services/ubicaciones'
import { usePermissions } from '../../composables/usePermissions'
import type { FocoSanitario, FocoSanitarioCreate, Zona, Refugio, TipoVector, EstadoFoco } from '../../types'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const TIPOS_VECTOR: TipoVector[] = ['AGUA_CONTAMINADA', 'INSECTOS', 'ROEDORES', 'RESIDUOS', 'OTRO']

const VECTOR_LABELS: Record<TipoVector, string> = {
  AGUA_CONTAMINADA: 'Agua contaminada',
  INSECTOS: 'Insectos',
  ROEDORES: 'Roedores',
  RESIDUOS: 'Residuos',
  OTRO: 'Otro'
}

const ESTADO_CONFIG: Record<EstadoFoco, { label: string; badge: string; avatar: string }> = {
  ACTIVO: { label: 'Activo', badge: 'badge-danger', avatar: 'variant-pink' },
  EN_ATENCION: { label: 'En atención', badge: 'badge-warning', avatar: 'variant-yellow' },
  RESUELTO: { label: 'Resuelto', badge: 'badge-success', avatar: 'variant-green' }
}

const RIESGO_CONFIG: Record<string, string> = {
  BAJO: 'badge-success',
  MEDIO: 'badge-warning',
  ALTO: 'badge-danger',
  CRITICO: 'badge-danger'
}

export default defineComponent({
  name: 'DashboardFocosSanitarios',
  setup() {
    const { puedeAccion } = usePermissions()

    const tabs = [
      { key: 'crear', label: 'Registrar' },
      { key: 'lista', label: 'Lista' },
      { key: 'mapa', label: 'Mapa' }
    ]
    const activeTab = ref('lista')

    const zonas: Ref<Zona[]> = ref([])
    const refugios: Ref<Refugio[]> = ref([])
    const focos: Ref<FocoSanitario[]> = ref([])
    const isListLoading = ref(false)
    const creating = ref(false)
    const errorMessage = ref('')

    const filtroEstado = ref('')
    const filtroRiesgo = ref('')
    const filtroZona = ref<number | null>(null)

    const form = reactive<FocoSanitarioCreate>({
      id_zona: null,
      id_refugio: null,
      tipo_vector: '' as TipoVector,
      nivel_riesgo: '',
      acciones_tomadas: '',
      latitud: undefined,
      longitud: undefined
    })
    const fieldErrors = reactive<Record<string, string>>({})

    const editando = ref(false)
    const focoEditando = ref<FocoSanitario | null>(null)
    const editForm = reactive<{ estado: EstadoFoco; acciones_tomadas: string }>({
      estado: 'ACTIVO',
      acciones_tomadas: ''
    })
    const updating = ref(false)

    const incluirResueltos = ref(false)
    const mapContainer: Ref<HTMLDivElement | null> = ref(null)
    let mapInstance: L.Map | null = null
    let geoLayer: L.GeoJSON | null = null

    onMounted(async () => {
      try {
        zonas.value = await zonaService.list()
        refugios.value = await refugioService.list()
      } catch { /* silent */ }
      if (puedeAccion('focos.listar')) {
        await loadFocos()
      }
    })

    onUnmounted(() => {
      if (mapInstance) {
        mapInstance.remove()
        mapInstance = null
      }
    })

    const loadFocos = async () => {
      isListLoading.value = true
      try {
        focos.value = await focoSanitarioService.listar(
          filtroEstado.value || undefined,
          filtroRiesgo.value || undefined,
          filtroZona.value ?? undefined
        )
      } catch (err: any) {
        errorMessage.value = extractError(err)
        focos.value = []
      } finally {
        isListLoading.value = false
      }
    }

    const validate = (): boolean => {
      Object.keys(fieldErrors).forEach(k => delete fieldErrors[k])
      if (form.id_zona === null && form.id_refugio === null) {
        fieldErrors.id_zona = 'Debes seleccionar una zona o un refugio'
      }
      if (!form.tipo_vector) fieldErrors.tipo_vector = 'Selecciona el tipo de vector'
      if (!form.nivel_riesgo) fieldErrors.nivel_riesgo = 'Selecciona el nivel de riesgo'
      return Object.keys(fieldErrors).length === 0
    }

    const resetForm = () => {
      form.id_zona = null
      form.id_refugio = null
      form.tipo_vector = '' as TipoVector
      form.nivel_riesgo = ''
      form.acciones_tomadas = ''
      form.latitud = undefined
      form.longitud = undefined
      Object.keys(fieldErrors).forEach(k => delete fieldErrors[k])
    }

    const handleCreate = async () => {
      if (!validate()) return
      creating.value = true
      errorMessage.value = ''
      try {
        await focoSanitarioService.crear({
          ...form,
          latitud: form.latitud ?? undefined,
          longitud: form.longitud ?? undefined,
          id_zona: form.id_zona ?? undefined,
          id_refugio: form.id_refugio ?? undefined
        })
        resetForm()
        activeTab.value = 'lista'
        await loadFocos()
      } catch (err: any) {
        errorMessage.value = extractError(err)
      } finally {
        creating.value = false
      }
    }

    const abrirEdicion = (foco: FocoSanitario) => {
      focoEditando.value = foco
      editForm.estado = foco.estado
      editForm.acciones_tomadas = foco.acciones_tomadas || ''
      editando.value = true
    }

    const cancelarEdicion = () => {
      editando.value = false
      focoEditando.value = null
    }

    const guardarEdicion = async () => {
      if (!focoEditando.value) return
      updating.value = true
      errorMessage.value = ''
      try {
        await focoSanitarioService.actualizar(focoEditando.value.id_foco, {
          estado: editForm.estado,
          acciones_tomadas: editForm.acciones_tomadas || undefined
        })
        editando.value = false
        focoEditando.value = null
        await loadFocos()
      } catch (err: any) {
        errorMessage.value = extractError(err)
      } finally {
        updating.value = false
      }
    }

    const cargarMapa = async () => {
      if (!mapContainer.value) return
      if (!mapInstance) {
        mapInstance = L.map(mapContainer.value).setView([4.7110, -74.0721], 6)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapInstance)
      }
      try {
        if (geoLayer) {
          mapInstance.removeLayer(geoLayer)
          geoLayer = null
        }
        const geoData = await focoSanitarioService.obtenerGeoJSON(incluirResueltos.value)
        geoLayer = L.geoJSON(geoData, {
          pointToLayer: (_feature, latlng) => {
            return L.circleMarker(latlng, {
              radius: 8,
              fillColor: getColor(_feature?.properties?.estado),
              color: '#fff',
              weight: 2,
              opacity: 1,
              fillOpacity: 0.8
            })
          },
          onEachFeature: (feature, layer) => {
            const p = feature?.properties || {}
            layer.bindPopup(`
              <strong>${VECTOR_LABELS[p.tipo_vector as TipoVector] || p.tipo_vector || 'Desconocido'}</strong><br/>
              Nivel: ${p.nivel_riesgo || '—'}<br/>
              Estado: ${ESTADO_CONFIG[p.estado as EstadoFoco]?.label || p.estado || '—'}<br/>
              ${p.acciones_tomadas ? 'Acciones: ' + p.acciones_tomadas : ''}
            `)
          }
        }).addTo(mapInstance)
        mapInstance.fitBounds(geoLayer.getBounds(), { padding: [30, 30] })
      } catch { /* silent */ }
    }

    watch(activeTab, (tab) => {
      if (tab === 'mapa') {
        nextTick(() => cargarMapa())
      }
    })

    watch(incluirResueltos, () => {
      if (activeTab.value === 'mapa') {
        cargarMapa()
      }
    })

    const closeResult = () => {
      errorMessage.value = ''
    }

    const extractError = (err: any): string => {
      const detail = err?.response?.data?.detail
      if (typeof detail === 'string') return detail
      if (Array.isArray(detail)) return detail.map((d: any) => d.msg).join(', ')
      return err?.message || 'Error desconocido'
    }

    const vectorLabel = (tv: TipoVector): string => VECTOR_LABELS[tv] || tv

    const estadoLabel = (estado: EstadoFoco): string => ESTADO_CONFIG[estado]?.label || estado

    const estadoBadge = (estado: EstadoFoco): string => ESTADO_CONFIG[estado]?.badge || 'badge-default'

    const avatarVariant = (estado: EstadoFoco): string => ESTADO_CONFIG[estado]?.avatar || 'variant-blue'

    const riesgoBadge = (nivel: string): string => RIESGO_CONFIG[nivel] || 'badge-default'

    const zonaNombre = (id: number): string => {
      const z = zonas.value.find(z => z.id_zona === id)
      return z?.nombre || String(id)
    }

    const getColor = (estado?: string): string => {
      switch (estado) {
        case 'ACTIVO': return '#f04438'
        case 'EN_ATENCION': return '#f79009'
        case 'RESUELTO': return '#12b76a'
        default: return '#98a2b3'
      }
    }

    return {
      TIPOS_VECTOR,
      tabs, activeTab,
      zonas, refugios, focos, isListLoading, creating, errorMessage,
      filtroEstado, filtroRiesgo, filtroZona,
      form, fieldErrors,
      editando, focoEditando, editForm, updating,
      incluirResueltos, mapContainer,
      handleCreate, resetForm, loadFocos,
      abrirEdicion, cancelarEdicion, guardarEdicion,
      cargarMapa, closeResult,
      vectorLabel, estadoLabel, estadoBadge, avatarVariant, riesgoBadge, zonaNombre,
      puedeAccion
    }
  }
})
</script>

<style scoped>
.tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 20px;
  background: #f2f4f7;
  border-radius: 12px;
  padding: 4px;
}

.tab-btn {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: #475467;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.18s ease;
}

.tab-btn.active {
  background: #fff;
  color: #1d4ed8;
  box-shadow: 0 2px 6px rgba(16, 24, 40, 0.08);
}

.tab-btn:hover:not(.active) {
  color: #1d4ed8;
}

.filter-row {
  display: flex;
  gap: 8px;
}

.filter-row .select {
  min-width: 140px;
}

.map-container {
  height: 500px;
  border-radius: 12px;
  overflow: hidden;
  margin-top: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #475467;
  cursor: pointer;
}

.btn-sm {
  padding: 6px 8px;
  border: 1px solid #eaecf0;
  border-radius: 8px;
  background: #fff;
  color: #475467;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: all 0.18s ease;
}

.btn-sm:hover {
  background: #f5f7fa;
  border-color: #d0d5dd;
}

.form-field.full-width {
  grid-column: 1 / -1;
}

.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(16, 24, 40, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.dialog-content {
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 60px rgba(16, 24, 40, 0.2);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 0;
}

.dialog-title {
  font-size: 16px;
  font-weight: 700;
  color: #101828;
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #667085;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
}

.dialog-body {
  padding: 20px 24px;
}

.dialog-footer {
  padding: 16px 24px;
  border-top: 1px solid #eaecf0;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.2s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}
</style>
