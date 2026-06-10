<template>
  <div class="dash-page">
    <div class="welcome">
      <div class="welcome-content">
        <h2>Hola, {{ firstName }} 👋</h2>
        <p>Bienvenido al panel de gestión de beneficiarios. Selecciona una opción del menú lateral para comenzar a administrar la plataforma.</p>
        <div class="welcome-meta">
          <span>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            {{ usuario?.nombre_completo }}
          </span>
          <span>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
            {{ usuario?.correo }}
          </span>
          <span>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6l-8-4Z" /></svg>
            Rol: {{ rolLabel }}
          </span>
        </div>
      </div>
    </div>

    <section class="shortcuts" v-if="shortcuts.length">
      <router-link v-for="sc in shortcuts" :key="sc.to + sc.label" :to="sc.to" class="shortcut">
        <span class="stat-icon mini" :class="sc.variant">
          <span v-html="sc.icon" />
        </span>
        {{ sc.label }}
        <span class="arrow">→</span>
      </router-link>
    </section>
    <section class="kpis-section" v-if="indicadores && !loading">
      <h3>Resumen General</h3>
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-title">Familias Registradas</div>
          <div class="kpi-value">{{ indicadores.total_familias }}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-title">Familias Atendidas</div>
          <div class="kpi-value">{{ indicadores.familias_atendidas }}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-title">Familias Pendientes</div>
          <div class="kpi-value">{{ indicadores.familias_pendientes }}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-title">Focos Sanitarios Activos</div>
          <div class="kpi-value">{{ indicadores.focos_sanitarios_activos }}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-title">Planes Programados</div>
          <div class="kpi-value">{{ indicadores.planes_programados }}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-title">Planes Entregados</div>
          <div class="kpi-value">{{ indicadores.planes_entregados }}</div>
        </div>
      </div>
      
      <h3 v-if="indicadores.recursos_disponibles.length" style="margin-top: 1.5rem;">Recursos en Inventario</h3>
      <div class="kpi-grid" v-if="indicadores.recursos_disponibles.length">
        <div class="kpi-card resource-card" v-for="rec in indicadores.recursos_disponibles" :key="rec.nombre">
          <div class="kpi-title">{{ rec.nombre }}</div>
          <div class="kpi-value small">{{ rec.cantidad }}</div>
        </div>
      </div>
    </section>

    <div v-else-if="loading" class="loading-state">
      <div class="skeleton-line w-100" style="height: 100px;"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue'
import { authService } from '../../services/auth'
import { usePermissions } from '../../composables/usePermissions'
import { indicadoresService } from '../../services/operaciones'
import type { IndicadoresPanelResponse } from '../../types'

interface Shortcut {
  to: string
  label: string
  icon: string
  variant?: string
}

export default defineComponent({
  name: 'DashboardInicio',
  setup() {
    const usuario = authService.getUser()
    const token = authService.getToken()
    const { puedeAccion, rolLabel } = usePermissions()

    const indicadores = ref<IndicadoresPanelResponse | null>(null)
    const loading = ref(false)

    onMounted(async () => {
      loading.value = true
      try {
        indicadores.value = await indicadoresService.obtenerPanel()
      } catch (e) {
        console.error("Error cargando indicadores", e)
      } finally {
        loading.value = false
      }
    })

    const firstName = computed(() => {
      const name = usuario?.nombre_completo || 'usuario'
      return name.split(/\s+/)[0]
    })

    const allShortcuts: Shortcut[] = [
      { to: '/dashboard/usuarios', label: 'Crear usuario', variant: '', icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6"/><path d="M22 11h-6"/></svg>' },
      { to: '/dashboard/familias', label: 'Registrar familia', variant: 'variant-green', icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>' },
      { to: '/dashboard/personas', label: 'Registrar persona', variant: 'variant-violet', icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' },
      { to: '/dashboard/ubicaciones', label: 'Crear ubicación', variant: 'variant-amber', icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>' },
      { to: '/dashboard/recursos', label: 'Consultar inventario', variant: 'variant-cyan', icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>' },
      { to: '/dashboard/donantes', label: 'Registrar donante', variant: 'variant-pink', icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>' }
    ]

    const shortcuts = computed(() => {
      return allShortcuts.filter(sc => {
        if (sc.to.endsWith('/usuarios')) return puedeAccion('usuarios.crear')
        if (sc.to.endsWith('/familias')) return puedeAccion('familias.crear')
        if (sc.to.endsWith('/personas')) return puedeAccion('personas.crear')
        if (sc.to.endsWith('/ubicaciones')) return puedeAccion('ubicaciones.crear')
        if (sc.to.endsWith('/recursos')) return puedeAccion('recursos.crear') || puedeAccion('recursos.inventario')
        if (sc.to.endsWith('/donantes')) return puedeAccion('donantes.crear')
        return false
      })
    })

    return { usuario, token, firstName, rolLabel, shortcuts, indicadores, loading }
  }
})
</script>

<style scoped>
.stat-icon.mini {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: grid;
  place-items: center;
}

.kpis-section {
  margin-top: 2rem;
}

.kpis-section h3 {
  margin-bottom: 1rem;
  font-size: 1.1rem;
  color: var(--color-text-light);
  font-weight: 600;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.kpi-card {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.kpi-title {
  font-size: 0.85rem;
  color: var(--color-text-light);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.kpi-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-primary);
}

.kpi-value.small {
  font-size: 1.5rem;
}

.resource-card {
  border-left: 4px solid var(--color-primary);
}
</style>
