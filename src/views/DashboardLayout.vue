<template>
  <div class="layout">
    <Sidebar :mobile-open="mobileOpen" @close="mobileOpen = false" />

    <div class="content">
      <AppHeader @toggle-menu="mobileOpen = true" />

      <main class="page">
        <section v-if="sinPermisos" class="empty-state">
          <div class="empty-icon">
            <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2 4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6l-8-4Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <h2>Hola, {{ firstName }}</h2>
          <p>Has iniciado sesión correctamente como <strong>{{ rolLabel }}</strong>.</p>
          <p class="muted">Por ahora no hay módulos disponibles para tu rol. Si crees que deberías tener acceso a alguno, contacta al administrador del sistema.</p>
          <button class="btn btn-primary" @click="onLogout">Cerrar sesión</button>
        </section>

        <router-view v-else v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '../components/Sidebar.vue'
import AppHeader from '../components/AppHeader.vue'
import { authService } from '../services/auth'
import { usePermissions } from '../composables/usePermissions'

export default defineComponent({
  name: 'DashboardLayout',
  components: { Sidebar, AppHeader },
  setup() {
    const router = useRouter()
    const usuario = authService.getUser()
    const mobileOpen = ref(false)
    const { sinPermisos, rolLabel } = usePermissions()

    const firstName = computed(() => {
      const name = usuario?.nombre_completo || 'usuario'
      return name.split(/\s+/)[0]
    })

    const onLogout = () => {
      authService.logout()
      router.push({ path: '/' })
    }

    return { mobileOpen, sinPermisos, rolLabel, firstName, onLogout }
  }
})
</script>

<style scoped>
.layout {
  min-height: 100vh;
  background: linear-gradient(180deg, #f6f8fc 0%, #eef3ff 100%);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
}

.content {
  margin-left: 268px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.page {
  flex: 1;
  padding: 28px 32px 40px;
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
}

.empty-state {
  max-width: 520px;
  margin: 60px auto;
  text-align: center;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 24px;
  box-shadow: 0 18px 50px rgba(16, 24, 40, 0.1);
  padding: 40px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.empty-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, rgba(43, 124, 255, 0.12), rgba(93, 140, 255, 0.06));
  color: #1d4ed8;
  box-shadow: inset 0 0 0 1px rgba(43, 124, 255, 0.15);
  margin-bottom: 4px;
}

.empty-state h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #101828;
  letter-spacing: -0.01em;
}

.empty-state p {
  margin: 0;
  color: #475467;
  font-size: 14px;
  line-height: 1.5;
}

.empty-state p.muted {
  color: #98a2b3;
  font-size: 13px;
}

.empty-state strong {
  color: #1d4ed8;
  font-weight: 600;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 18px;
  border-radius: 12px;
  border: 0;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
  text-decoration: none;
  margin-top: 8px;
}

.btn-primary {
  background: linear-gradient(135deg, #2b7cff, #5d8cff);
  color: #fff;
  box-shadow: 0 12px 24px rgba(43, 124, 255, 0.22);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 28px rgba(43, 124, 255, 0.28);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(4px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (max-width: 980px) {
  .content {
    margin-left: 0;
  }
  .page {
    padding: 20px 20px 32px;
  }
}
</style>
