<template>
  <div class="dash-page">
    <div class="cards-grid">
      <!-- Crear Zona -->
      <article v-if="puedeAccion('ubicaciones.crear')" class="form-card">
        <div class="form-card-head">
          <div class="form-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          </div>
          <div class="form-card-title"><h3>Crear zona</h3><span>Define una nueva zona con su nivel de riesgo</span></div>
        </div>
        <form @submit.prevent="createZone">
          <div class="form-grid">
            <div class="form-field" :class="{ error: fieldErrors.zone.nombre }">
              <label class="req">Nombre</label>
              <input v-model="zone.nombre" class="input" placeholder="Ej. Zona Norte" />
              <span v-if="fieldErrors.zone.nombre" class="error-text">{{ fieldErrors.zone.nombre }}</span>
            </div>
            <div class="form-field">
              <label>Nivel de riesgo</label>
              <select v-model="zone.nivel_riesgo" class="select">
                <option value="bajo">Bajo</option>
                <option value="medio">Medio</option>
                <option value="alto">Alto</option>
                <option value="crítico">Crítico</option>
              </select>
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="isLoading">
              <span v-if="isLoading && mode === 'zone'" class="spinner"></span>
              <span v-else class="btn-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              </span>
              {{ isLoading && mode === 'zone' ? 'Creando...' : 'Crear zona' }}
            </button>
          </div>
        </form>
      </article>

      <!-- Crear Refugio -->
      <article v-if="puedeAccion('ubicaciones.crear')" class="form-card">
        <div class="form-card-head">
          <div class="form-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <div class="form-card-title"><h3>Crear refugio</h3><span>Registra un nuevo refugio con su ubicación</span></div>
        </div>
        <form @submit.prevent="createShelter">
          <div class="form-grid">
            <div class="form-field full" :class="{ error: fieldErrors.shelter.nombre }">
              <label class="req">Nombre</label>
              <input v-model="shelter.nombre" class="input" placeholder="Ej. Refugio Central" />
              <span v-if="fieldErrors.shelter.nombre" class="error-text">{{ fieldErrors.shelter.nombre }}</span>
            </div>
            <div class="form-field"><label>Latitud</label><input v-model.number="shelter.latitud" class="input" type="number" step="any" placeholder="4.7110" /></div>
            <div class="form-field"><label>Longitud</label><input v-model.number="shelter.longitud" class="input" type="number" step="any" placeholder="-74.0721" /></div>
            <div class="form-field"><label>Capacidad (personas)</label><input v-model.number="shelter.capacidad_maxima_personas" class="input" type="number" placeholder="200" /></div>
            <div class="form-field"><label>Zona</label><select v-model="shelter.zona_id" class="select"><option :value="null">Sin zona</option><option v-for="z in zonas" :key="z.id_zona" :value="z.id_zona">{{ z.nombre }}</option></select></div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="isLoading">
              <span v-if="isLoading && mode === 'shelter'" class="spinner"></span>
              <span v-else class="btn-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </span>
              {{ isLoading && mode === 'shelter' ? 'Creando...' : 'Crear refugio' }}
            </button>
          </div>
        </form>
      </article>

      <!-- Crear Bodega -->
      <article v-if="puedeAccion('ubicaciones.crear')" class="form-card">
        <div class="form-card-head">
          <div class="form-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
          </div>
          <div class="form-card-title"><h3>Crear bodega</h3><span>Registra una bodega con su capacidad en kg</span></div>
        </div>
        <form @submit.prevent="createWarehouse">
          <div class="form-grid">
            <div class="form-field full" :class="{ error: fieldErrors.warehouse.nombre }">
              <label class="req">Nombre</label>
              <input v-model="warehouse.nombre" class="input" placeholder="Ej. Bodega Principal" />
              <span v-if="fieldErrors.warehouse.nombre" class="error-text">{{ fieldErrors.warehouse.nombre }}</span>
            </div>
            <div class="form-field"><label>Latitud</label><input v-model.number="warehouse.latitud" class="input" type="number" step="any" placeholder="4.7110" /></div>
            <div class="form-field"><label>Longitud</label><input v-model.number="warehouse.longitud" class="input" type="number" step="any" placeholder="-74.0721" /></div>
            <div class="form-field"><label>Capacidad (kg)</label><input v-model.number="warehouse.capacidad_max_kg" class="input" type="number" placeholder="5000" /></div>
            <div class="form-field"><label>Zona</label><select v-model="warehouse.zona_id" class="select"><option :value="null">Sin zona</option><option v-for="z in zonas" :key="z.id_zona" :value="z.id_zona">{{ z.nombre }}</option></select></div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="isLoading">
              <span v-if="isLoading && mode === 'warehouse'" class="spinner"></span>
              <span v-else class="btn-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
              </span>
              {{ isLoading && mode === 'warehouse' ? 'Creando...' : 'Crear bodega' }}
            </button>
          </div>
        </form>
      </article>
    </div>

    <!-- Create result (compact) -->
    <section v-if="showPanel && !isZonasLoading && !isRefugiosLoading && !isBodegasLoading" class="result-panel">
      <div class="result-head">
        <div class="result-head-info">
          <span class="label">{{ panelTitle }}</span>
        </div>
        <button class="btn btn-ghost" @click="closeResult">Cerrar</button>
      </div>
      <div v-if="resultKind === 'success'">
        <ul v-if="createdItem" class="item-list">
          <li class="item-card">
            <div class="item-avatar" :class="getAvatarVariant(createdItem)">
              <span v-html="getIcon(createdItem)"></span>
            </div>
            <div class="item-content">
              <h4>{{ getName(createdItem) }}</h4>
              <p v-html="getSubtitle(createdItem)"></p>
              <div class="item-meta">
                <span v-for="(b, i) in getBadges(createdItem)" :key="i" class="badge" :class="b.cls">{{ b.label }}</span>
              </div>
            </div>
            <div class="item-actions">
              <span class="badge badge-default">ID {{ getId(createdItem) }}</span>
            </div>
          </li>
        </ul>
        <div v-else class="detail-card">
          <div class="detail-row"><span class="k">Detalle</span><span class="v">Operaci&oacute;n completada correctamente.</span></div>
        </div>
      </div>
      <ErrorState
        v-else
        title="No se pudo completar la operación."
        :message="errorMessage"
      />
    </section>

    <!-- Zonas list -->
    <section class="result-panel">
      <div class="result-head">
        <div class="result-head-info">
          <span class="label">Zonas</span>
          <span v-if="zonasList.length" class="count"><strong>{{ zonasList.length }}</strong> {{ zonasList.length === 1 ? 'zona' : 'zonas' }}</span>
        </div>
        <button class="btn btn-ghost" @click="loadZonas">↻ Recargar</button>
      </div>
      <LoadingState v-if="isZonasLoading" variant="skeleton" :count="3" label="Cargando zonas..." />
      <ul v-else-if="zonasList.length" class="item-list">
        <li v-for="item in zonasList" :key="item.id_zona" class="item-card">
          <div class="item-avatar variant-green"><span v-html="ZONA_ICON"></span></div>
          <div class="item-content">
            <h4>{{ item.nombre }}</h4>
            <p>Nivel de riesgo: <strong>{{ item.nivel_riesgo }}</strong></p>
            <div class="item-meta"><span class="badge" :class="riskClass(item.nivel_riesgo)">Riesgo: {{ item.nivel_riesgo }}</span></div>
          </div>
          <div class="item-actions"><span class="badge badge-default">ID {{ item.id_zona }}</span></div>
        </li>
      </ul>
      <EmptyState
        v-else
        title="Sin zonas"
        message="Aún no hay zonas registradas."
      />
    </section>

    <!-- Refugios list -->
    <section class="result-panel">
      <div class="result-head">
        <div class="result-head-info">
          <span class="label">Refugios</span>
          <span v-if="refugiosList.length" class="count"><strong>{{ refugiosList.length }}</strong> {{ refugiosList.length === 1 ? 'refugio' : 'refugios' }}</span>
        </div>
        <button class="btn btn-ghost" @click="loadRefugios">↻ Recargar</button>
      </div>
      <LoadingState v-if="isRefugiosLoading" variant="skeleton" :count="3" label="Cargando refugios..." />
      <ul v-else-if="refugiosList.length" class="item-list">
        <li v-for="item in refugiosList" :key="item.id" class="item-card">
          <div class="item-avatar variant-amber"><span v-html="REFUGIO_ICON"></span></div>
          <div class="item-content">
            <h4>{{ item.nombre }}</h4>
            <p>Capacidad: <strong>{{ item.capacidad_maxima_personas }}</strong> pers &middot; Ocupaci&oacute;n: <strong>{{ item.ocupacion_porcentaje ?? 0 }}%</strong></p>
            <div class="item-meta">
              <span class="badge" :class="occClass(item.ocupacion_porcentaje ?? 0)">Ocupaci&oacute;n: {{ item.ocupacion_porcentaje ?? 0 }}%</span>
              <span v-if="item.has_alerta" class="badge badge-danger">⚠ Alerta</span>
            </div>
          </div>
          <div class="item-actions"><span class="badge badge-default">ID {{ item.id }}</span></div>
        </li>
      </ul>
      <EmptyState
        v-else
        title="Sin refugios"
        message="Aún no hay refugios registrados."
      />
    </section>

    <!-- Bodegas list -->
    <section class="result-panel">
      <div class="result-head">
        <div class="result-head-info">
          <span class="label">Bodegas</span>
          <span v-if="bodegasList.length" class="count"><strong>{{ bodegasList.length }}</strong> {{ bodegasList.length === 1 ? 'bodega' : 'bodegas' }}</span>
        </div>
        <button class="btn btn-ghost" @click="loadBodegas">↻ Recargar</button>
      </div>
      <LoadingState v-if="isBodegasLoading" variant="skeleton" :count="3" label="Cargando bodegas..." />
      <ul v-else-if="bodegasList.length" class="item-list">
        <li v-for="item in bodegasList" :key="item.id_bodega" class="item-card">
          <div class="item-avatar variant-cyan"><span v-html="BODEGA_ICON"></span></div>
          <div class="item-content">
            <h4>{{ item.nombre }}</h4>
            <p>Capacidad: <strong>{{ item.capacidad_max_kg }}</strong> kg &middot; Ocupaci&oacute;n: <strong>{{ item.peso_porcentaje ?? 0 }}%</strong></p>
            <div class="item-meta">
              <span class="badge" :class="occClass(item.peso_porcentaje ?? 0)">Ocupaci&oacute;n: {{ item.peso_porcentaje ?? 0 }}%</span>
              <span v-if="item.has_alerta" class="badge badge-danger">⚠ Alerta</span>
            </div>
          </div>
        </li>
      </ul>
      <EmptyState
        v-else
        title="Sin bodegas"
        message="Aún no hay bodegas registradas."
      />
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, computed, onMounted } from 'vue'
import { bodegaService, refugioService, zonaService } from '../../services/ubicaciones'
import { usePermissions } from '../../composables/usePermissions'
import type { Zona } from '../../types'
import LoadingState from '../../components/LoadingState.vue'
import EmptyState from '../../components/EmptyState.vue'
import ErrorState from '../../components/ErrorState.vue'

type ItemKind = 'zona' | 'refugio' | 'bodega' | 'generic'

const ZONA_ICON = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>'
const REFUGIO_ICON = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>'
const BODEGA_ICON = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>'

export default defineComponent({
  name: 'DashboardUbicaciones',
  components: { LoadingState, EmptyState, ErrorState },
  setup() {
    const { puedeAccion } = usePermissions()

    const zone = reactive({ nombre: '', nivel_riesgo: 'bajo' })
    const shelter = reactive({ nombre: '', latitud: null as number | null, longitud: null as number | null, capacidad_maxima_personas: null as number | null, zona_id: null as number | null })
    const warehouse = reactive({ nombre: '', latitud: null as number | null, longitud: null as number | null, capacidad_max_kg: null as number | null, zona_id: null as number | null })
    const fieldErrors = reactive({ zone: {} as Record<string, string>, shelter: {} as Record<string, string>, warehouse: {} as Record<string, string> })

    const isLoading = ref(false)
    const mode = ref<string | null>(null)
    const showPanel = ref(false)
    const resultKind = ref<'success' | 'error'>('success')
    const createdItem = ref<any>(null)
    const errorMessage = ref('')

    const zonas = ref<Zona[]>([])
    const zonasList = ref<any[]>([])
    const refugiosList = ref<any[]>([])
    const bodegasList = ref<any[]>([])
    const isZonasLoading = ref(false)
    const isRefugiosLoading = ref(false)
    const isBodegasLoading = ref(false)

    onMounted(async () => {
      try {
        zonas.value = await zonaService.list()
      } catch {
        // silent
      }
      loadZonas()
      loadRefugios()
      loadBodegas()
    })

    const extractError = (err: any): string => {
      const detail = err?.response?.data?.detail
      if (typeof detail === 'string') return detail
      if (Array.isArray(detail)) return detail.map((d: any) => d.msg).join(', ')
      return err?.message || 'Error desconocido'
    }

    const panelTitle = computed(() => {
      if (!mode.value) return ''
      const map: Record<string, string> = {
        'zone': 'Zona creada',
        'shelter': 'Refugio creado',
        'warehouse': 'Bodega creada'
      }
      return map[mode.value] || ''
    })

    const closeResult = () => {
      showPanel.value = false
      createdItem.value = null
      errorMessage.value = ''
    }

    const createZone = async () => {
      const errs: Record<string, string> = {}
      if (!zone.nombre.trim()) errs.nombre = 'Ingresa el nombre de la zona'
      fieldErrors.zone = errs
      if (Object.keys(errs).length) return

      isLoading.value = true
      mode.value = 'zone'
      try {
        createdItem.value = await zonaService.create({ nombre: zone.nombre.trim(), nivel_riesgo: zone.nivel_riesgo as any })
        resultKind.value = 'success'
        showPanel.value = true
        zone.nombre = ''
        zone.nivel_riesgo = 'bajo'
        loadZonas()
      } catch (e: any) {
        resultKind.value = 'error'
        errorMessage.value = extractError(e)
        showPanel.value = true
      } finally {
        isLoading.value = false
        mode.value = null
      }
    }

    const createShelter = async () => {
      const errs: Record<string, string> = {}
      if (!shelter.nombre.trim()) errs.nombre = 'Ingresa el nombre del refugio'
      fieldErrors.shelter = errs
      if (Object.keys(errs).length) return

      isLoading.value = true
      mode.value = 'shelter'
      try {
        createdItem.value = await refugioService.create({
          nombre: shelter.nombre.trim(),
          latitud: shelter.latitud ?? 0,
          longitud: shelter.longitud ?? 0,
          capacidad_maxima_personas: shelter.capacidad_maxima_personas ?? 0,
          zona_id: shelter.zona_id ?? undefined
        })
        resultKind.value = 'success'
        showPanel.value = true
        shelter.nombre = ''
        shelter.latitud = null
        shelter.longitud = null
        shelter.capacidad_maxima_personas = null
        shelter.zona_id = null
        loadRefugios()
      } catch (e: any) {
        resultKind.value = 'error'
        errorMessage.value = extractError(e)
        showPanel.value = true
      } finally {
        isLoading.value = false
        mode.value = null
      }
    }

    const createWarehouse = async () => {
      const errs: Record<string, string> = {}
      if (!warehouse.nombre.trim()) errs.nombre = 'Ingresa el nombre de la bodega'
      fieldErrors.warehouse = errs
      if (Object.keys(errs).length) return

      isLoading.value = true
      mode.value = 'warehouse'
      try {
        createdItem.value = await bodegaService.create({
          nombre: warehouse.nombre.trim(),
          latitud: warehouse.latitud ?? 0,
          longitud: warehouse.longitud ?? 0,
          capacidad_max_kg: warehouse.capacidad_max_kg ?? 0,
          zona_id: warehouse.zona_id ?? 0
        })
        resultKind.value = 'success'
        showPanel.value = true
        warehouse.nombre = ''
        warehouse.latitud = null
        warehouse.longitud = null
        warehouse.capacidad_max_kg = null
        warehouse.zona_id = null
        loadBodegas()
      } catch (e: any) {
        resultKind.value = 'error'
        errorMessage.value = extractError(e)
        showPanel.value = true
      } finally {
        isLoading.value = false
        mode.value = null
      }
    }

    const loadZonas = async () => {
      isZonasLoading.value = true
      try {
        zonasList.value = await zonaService.list()
      } catch (e: any) {
        errorMessage.value = extractError(e)
      } finally {
        isZonasLoading.value = false
      }
    }

    const loadRefugios = async () => {
      isRefugiosLoading.value = true
      try {
        refugiosList.value = await refugioService.list()
      } catch (e: any) {
        errorMessage.value = extractError(e)
      } finally {
        isRefugiosLoading.value = false
      }
    }

    const loadBodegas = async () => {
      isBodegasLoading.value = true
      try {
        bodegasList.value = await bodegaService.list()
      } catch (e: any) {
        errorMessage.value = extractError(e)
      } finally {
        isBodegasLoading.value = false
      }
    }

    const kind = (item: any): ItemKind => {
      if (item.id_zona !== undefined) return 'zona'
      if (item.id_bodega !== undefined) return 'bodega'
      if (item.id !== undefined) return 'refugio'
      return 'generic'
    }

    const getName = (item: any): string => item.nombre || '—'

    const getId = (item: any): number => item.id_zona ?? item.id_bodega ?? item.id ?? 0

    const getIcon = (item: any): string => {
      switch (kind(item)) {
        case 'zona': return ZONA_ICON
        case 'refugio': return REFUGIO_ICON
        case 'bodega': return BODEGA_ICON
        default: return ''
      }
    }

    const getAvatarVariant = (item: any): string => {
      switch (kind(item)) {
        case 'zona': return 'variant-green'
        case 'refugio': return 'variant-amber'
        case 'bodega': return 'variant-cyan'
        default: return ''
      }
    }

    const getSubtitle = (item: any): string => {
      switch (kind(item)) {
        case 'zona':
          return `Nivel de riesgo: <strong>${item.nivel_riesgo}</strong>`
        case 'refugio':
          return `Capacidad: <strong>${item.capacidad_maxima_personas}</strong> pers &middot; Ocupaci&oacute;n: <strong>${item.ocupacion_porcentaje ?? 0}%</strong>`
        case 'bodega':
          return `Capacidad: <strong>${item.capacidad_max_kg}</strong> kg &middot; Ocupaci&oacute;n: <strong>${item.peso_porcentaje ?? 0}%</strong>`
        default:
          return ''
      }
    }

    const riskClass = (level: string): string => {
      const map: Record<string, string> = { bajo: 'badge-success', medio: 'badge-warning', alto: 'badge-danger', 'crítico': 'badge-dark' }
      return map[level] || 'badge-default'
    }

    const occClass = (pct: number): string => {
      if (pct >= 90) return 'badge-danger'
      if (pct >= 60) return 'badge-warning'
      return 'badge-success'
    }

    const getBadges = (item: any): { label: string; cls: string }[] => {
      switch (kind(item)) {
        case 'zona':
          return [{ label: `Riesgo: ${item.nivel_riesgo}`, cls: riskClass(item.nivel_riesgo) }]
        case 'refugio': {
          const rpct = item.ocupacion_porcentaje ?? 0
          const rbadges = [{ label: `Ocupaci&oacute;n: ${rpct}%`, cls: occClass(rpct) }]
          if (item.has_alerta) rbadges.push({ label: '⚠ Alerta', cls: 'badge-danger' })
          return rbadges
        }
        case 'bodega': {
          const wpct = item.peso_porcentaje ?? 0
          const wbadges = [{ label: `Ocupaci&oacute;n: ${wpct}%`, cls: occClass(wpct) }]
          if (item.has_alerta) wbadges.push({ label: '⚠ Alerta', cls: 'badge-danger' })
          return wbadges
        }
        default:
          return []
      }
    }

    return {
      puedeAccion,
      zone, shelter, warehouse, fieldErrors,
      isLoading, mode, showPanel, resultKind, errorMessage,
      zonasList, refugiosList, bodegasList,
      isZonasLoading, isRefugiosLoading, isBodegasLoading,
      zonas, createdItem, panelTitle,
      ZONA_ICON, REFUGIO_ICON, BODEGA_ICON,
      createZone, createShelter, createWarehouse,
      loadZonas, loadRefugios, loadBodegas,
      closeResult, riskClass, occClass,
      getName, getSubtitle, getBadges, getId, getIcon, getAvatarVariant
    }
  }
})
</script>
