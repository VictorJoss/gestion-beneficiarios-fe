<template>
  <header class="app-header">
    <button class="menu-btn" @click="$emit('toggle-menu')" aria-label="Abrir menú">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    </button>

    <div class="title-block">
      <span class="eyebrow">{{ eyebrow }}</span>
      <h1>{{ title }}</h1>
      <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>
    </div>

    <div class="actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useRoute } from 'vue-router'

export default defineComponent({
  name: 'AppHeader',
  emits: ['toggle-menu'],
  setup() {
    const route = useRoute()

    const sections: Record<string, { title: string; subtitle: string; eyebrow: string }> = {
      '/dashboard': {
        title: 'Bienvenido',
        subtitle: 'Resumen general de la plataforma de gestión.',
        eyebrow: 'Panel principal'
      },
      '/dashboard/usuarios': {
        title: 'Usuarios',
        subtitle: 'Crea y consulta los usuarios del sistema.',
        eyebrow: 'Gestión'
      },
      '/dashboard/familias': {
        title: 'Familias',
        subtitle: 'Administra las familias registradas.',
        eyebrow: 'Gestión'
      },
      '/dashboard/personas': {
        title: 'Personas',
        subtitle: 'Registra personas asociadas a una familia.',
        eyebrow: 'Gestión'
      },
      '/dashboard/ubicaciones': {
        title: 'Ubicaciones',
        subtitle: 'Gestiona zonas, refugios y bodegas.',
        eyebrow: 'Gestión'
      },
      '/dashboard/recursos': {
        title: 'Recursos',
        subtitle: 'Crea recursos y consulta inventario.',
        eyebrow: 'Gestión'
      },
      '/dashboard/donantes': {
        title: 'Donantes',
        subtitle: 'Registra nuevos donantes en la plataforma.',
        eyebrow: 'Gestión'
      }
    }

    const title = computed(() => sections[route.path]?.title || 'Panel')
    const subtitle = computed(() => sections[route.path]?.subtitle || '')
    const eyebrow = computed(() => sections[route.path]?.eyebrow || 'Panel')

    return { title, subtitle, eyebrow }
  }
})
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 20px 32px;
  background: rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid #eaecf0;
  min-height: 92px;
}

.menu-btn {
  display: none;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid #eaecf0;
  background: #fff;
  color: #344054;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  transition: all 0.18s ease;
  flex-shrink: 0;
}

.menu-btn:hover {
  background: #f5f7fa;
  color: #1d4ed8;
}

.title-block {
  flex: 1;
  min-width: 0;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  background: #eaf2ff;
  color: #2b5fd9;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.title-block h1 {
  margin: 8px 0 4px;
  font-size: 24px;
  line-height: 1.1;
  color: #101828;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.subtitle {
  margin: 0;
  color: #667085;
  font-size: 13.5px;
}

.actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

@media (max-width: 980px) {
  .app-header {
    padding: 16px 20px;
    min-height: 76px;
  }
  .menu-btn {
    display: flex;
  }
  .title-block h1 {
    font-size: 19px;
  }
  .subtitle {
    display: none;
  }
}
</style>
