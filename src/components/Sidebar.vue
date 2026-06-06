<template>
  <aside class="sidebar" :class="{ open: mobileOpen }">
    <div class="sidebar-inner">
      <div class="brand">
        <div class="brand-mark">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2 4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6l-8-4Z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        </div>
        <div class="brand-text">
          <strong>Beneficiarios</strong>
          <span>Plataforma de gestión</span>
        </div>
      </div>

      <div class="user-card" v-if="usuario">
        <div class="avatar">{{ initials }}</div>
        <div class="user-info">
          <strong>{{ usuario.nombre_completo }}</strong>
          <span>{{ rolLabel }}</span>
        </div>
      </div>

      <nav class="nav" v-if="modulos.length">
        <span class="nav-label">Navegación</span>
        <router-link
          v-for="item in modulos"
          :key="item.key"
          :to="item.to"
          class="nav-item"
          active-class="active"
          :exact-active-class="item.to === '/dashboard' ? 'active' : ''"
        >
          <span class="nav-icon" v-html="item.icon" />
          <span class="nav-text">{{ item.label }}</span>
        </router-link>
      </nav>

      <div class="empty-nav" v-else>
        <p>No tienes módulos asignados a tu rol.</p>
      </div>

      <div class="sidebar-footer">
        <button class="logout" @click="onLogout">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  </aside>

  <div
    v-if="mobileOpen"
    class="sidebar-overlay"
    @click="$emit('close')"
  />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '../services/auth'
import { usePermissions } from '../composables/usePermissions'

export default defineComponent({
  name: 'Sidebar',
  props: {
    mobileOpen: { type: Boolean, default: false }
  },
  emits: ['close'],
  setup(_, { emit }) {
    const router = useRouter()
    const usuario = authService.getUser()
    const { modulos, rolLabel } = usePermissions()

    const initials = computed(() => {
      const name = usuario?.nombre_completo || ''
      const parts = name.trim().split(/\s+/)
      const first = parts[0]?.[0] || ''
      const second = parts[1]?.[0] || ''
      return (first + second).toUpperCase() || 'U'
    })

    const onLogout = () => {
      authService.logout()
      emit('close')
      router.push({ path: '/' })
    }

    return { usuario, initials, modulos, rolLabel, onLogout }
  }
})
</script>

<style scoped>
.sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  width: 268px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-right: 1px solid rgba(234, 236, 240, 0.9);
  box-shadow: 0 18px 50px rgba(16, 24, 40, 0.06);
  z-index: 40;
  display: flex;
  flex-direction: column;
}

.sidebar-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 22px 18px 18px;
  gap: 18px;
  overflow-y: auto;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 6px 14px;
  border-bottom: 1px solid #eaecf0;
}

.brand-mark {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #2b7cff, #5d8cff);
  color: #fff;
  box-shadow: 0 10px 22px rgba(43, 124, 255, 0.28);
  flex-shrink: 0;
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
  min-width: 0;
}

.brand-text strong {
  font-size: 15px;
  color: #101828;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.brand-text span {
  font-size: 11px;
  color: #667085;
  margin-top: 2px;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: linear-gradient(135deg, rgba(43, 124, 255, 0.08), rgba(93, 140, 255, 0.04));
  border: 1px solid rgba(43, 124, 255, 0.15);
  border-radius: 14px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #2b7cff, #5d8cff);
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.02em;
  flex-shrink: 0;
  box-shadow: 0 6px 16px rgba(43, 124, 255, 0.3);
}

.user-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
  line-height: 1.25;
}

.user-info strong {
  font-size: 13px;
  color: #101828;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-info span {
  font-size: 11px;
  color: #2b5fd9;
  font-weight: 600;
  margin-top: 2px;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  margin-top: 4px;
}

.nav-label {
  font-size: 11px;
  font-weight: 700;
  color: #98a2b3;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 6px 12px 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 12px;
  border-radius: 12px;
  color: #475467;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  position: relative;
  transition: background 0.18s ease, color 0.18s ease, transform 0.18s ease;
}

.nav-item:hover {
  background: #f5f7fa;
  color: #101828;
}

.nav-item.active {
  background: linear-gradient(135deg, rgba(43, 124, 255, 0.12), rgba(93, 140, 255, 0.06));
  color: #1d4ed8;
  box-shadow: inset 0 0 0 1px rgba(43, 124, 255, 0.18);
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: -18px;
  top: 8px;
  bottom: 8px;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: linear-gradient(180deg, #2b7cff, #5d8cff);
}

.nav-icon {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  color: inherit;
  flex-shrink: 0;
}

.nav-icon :deep(svg) {
  width: 18px;
  height: 18px;
}

.nav-text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-nav {
  flex: 1;
  display: grid;
  place-items: center;
  padding: 20px;
  text-align: center;
}

.empty-nav p {
  margin: 0;
  font-size: 13px;
  color: #98a2b3;
  line-height: 1.5;
}

.sidebar-footer {
  margin-top: auto;
  padding-top: 14px;
  border-top: 1px solid #eaecf0;
}

.logout {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 11px 12px;
  background: #fff;
  border: 1px solid #eaecf0;
  border-radius: 12px;
  color: #344054;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s ease;
}

.logout:hover {
  background: #fef3f2;
  border-color: #fecdca;
  color: #b42318;
}

.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(16, 24, 40, 0.45);
  backdrop-filter: blur(2px);
  z-index: 35;
  display: none;
}

@media (max-width: 980px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  .sidebar.open {
    transform: translateX(0);
  }
  .sidebar-overlay {
    display: block;
  }
}
</style>
