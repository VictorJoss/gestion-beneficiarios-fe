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
            <button type="button" class="btn btn-secondary" @click="loadZonas" :disabled="isLoading">
              <span v-if="isLoading && mode === 'list-zona'" class="spinner dark"></span>
              <span v-else class="btn-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 21l-4.35-4.35" /><circle cx="11" cy="11" r="7" /></svg>
              </span>
              {{ isLoading && mode === 'list-zona' ? 'Cargando...' : 'Listar zonas' }}
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
            <div class="form-field"><label>ID de zona</label><input v-model.number="shelter.zona_id" class="input" type="number" placeholder="1" /></div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="isLoading">
              <span v-if="isLoading && mode === 'shelter'" class="spinner"></span>
              <span v-else class="btn-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </span>
              {{ isLoading && mode === 'shelter' ? 'Creando...' : 'Crear refugio' }}
            </button>
            <button type="button" class="btn btn-secondary" @click="loadRefugios" :disabled="isLoading">
              <span v-if="isLoading && mode === 'list-refugio'" class="spinner dark"></span>
              <span v-else class="btn-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 21l-4.35-4.35" /><circle cx="11" cy="11" r="7" /></svg>
              </span>
              {{ isLoading && mode === 'list-refugio' ? 'Cargando...' : 'Listar refugios' }}
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
            <div class="form-field"><label>ID de zona</label><input v-model.number="warehouse.zona_id" class="input" type="number" placeholder="1" /></div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="isLoading">
              <span v-if="isLoading && mode === 'warehouse'" class="spinner"></span>
              <span v-else class="btn-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
              </span>
              {{ isLoading && mode === 'warehouse' ? 'Creando...' : 'Crear bodega' }}
            </button>
            <button type="button" class="btn btn-secondary" @click="loadBodegas" :disabled="isLoading">
              <span v-if="isLoading && mode === 'list-bodega'" class="spinner dark"></span>
              <span v-else class="btn-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 21l-4.35-4.35" /><circle cx="11" cy="11" r="7" /></svg>
              </span>
              {{ isLoading && mode === 'list-bodega' ? 'Cargando...' : 'Listar bodegas' }}
            </button>
          </div>
        </form>
      </article>
    </div>

    <section v-if="showPanel" class="result-panel">
      <div class="result-head">
        <div class="result-head-info">
          <span class="label">{{ panelTitle }}</span>
          <span v-if="resultKind === 'success' && Array.isArray(items)" class="count">
            <strong>{{ items.length }}</strong> {{ items.length === 1 ? 'registro' : 'registros' }}
          </span>
        </div>
        <button class="btn btn-ghost" @click="closeResult">Cerrar</button>
      </div>

      <div v-if="resultKind === 'success'">
        <ul v-if="Array.isArray(items) && items.length" class="item-list">
          <li v-for="(item, idx) in items" :key="getId(item) || idx" class="item-card">
            <div class="item-avatar" :class="getAvatarVariant(item)">
              <span v-html="getIcon(item)"></span>
            </div>
            <div class="item-content">
              <h4>{{ getName(item) }}</h4>
              <p v-html="getSubtitle(item)"></p>
              <div class="item-meta">
                <span v-for="(b, i) in getBadges(item)" :key="i" class="badge" :class="b.cls">{{ b.label }}</span>
              </div>
            </div>
            <div class="item-actions">
              <span class="badge badge-default">ID {{ getId(item) }}</span>
            </div>
          </li>
        </ul>

        <div v-else-if="Array.isArray(items) && items.length === 0" class="empty-list">
          <div class="icon">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          </div>
          <h4>Sin registros</h4>
          <p>Aún no hay elementos de este tipo registrados.</p>
        </div>

        <div v-else class="detail-card">
          <div class="detail-row">
            <span class="k">Detalle</span>
            <span class="v">Operación completada correctamente.</span>
          </div>
        </div>
      </div>

      <div v-else class="toast error">
        <span class="toast-icon">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
        </span>
        <div>
          <strong>No se pudo completar la operación.</strong>
          <div>{{ errorMessage }}</div>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, computed } from 'vue'
import { bodegaService, refugioService, zonaService } from '../../services/ubicaciones'
import { usePermissions } from '../../composables/usePermissions'

type ItemKind = 'zona' | 'refugio' | 'bodega' | 'generic'

const ZONA_ICON = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>'
const REFUGIO_ICON = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 