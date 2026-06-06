<template>
  <div class="dash-page">
    <div class="cards-grid">
      <article v-if="puedeAccion('usuarios.crear')" class="form-card">
        <div class="form-card-head">
          <div class="form-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8v6" /><path d="M22 11h-6" /></svg>
          </div>
          <div class="form-card-title">
            <h3>Crear usuario</h3>
            <span>Registra un nuevo usuario con su rol y credenciales</span>
          </div>
        </div>

        <form @submit.prevent="createUser">
          <div class="form-grid">
            <div class="form-field full" :class="{ error: fieldErrors.nombre_completo }">
              <label class="req">Nombre completo</label>
              <input v-model="form.nombre_completo" class="input" placeholder="Ej. María Fernández" />
              <span v-if="fieldErrors.nombre_completo" class="error-text">{{ fieldErrors.nombre_completo }}</span>
            </div>
            <div class="form-field" :class="{ error: fieldErrors.correo }">
              <label class="req">Correo electrónico</label>
              <input v-model="form.correo" class="input" type="email" placeholder="usuario@correo.com" />
              <span v-if="fieldErrors.correo" class="error-text">{{ fieldErrors.correo }}</span>
            </div>
            <div class="form-field" :class="{ error: fieldErrors.password }">
              <label class="req">Contraseña</label>
              <input v-model="form.password" class="input" type="password" placeholder="Mínimo 8 caracteres" />
              <span v-if="fieldErrors.password" class="error-text">{{ fieldErrors.password }}</span>
            </div>
            <div class="form-field full" :class="{ error: fieldErrors.rol }">
              <label class="req">Rol del usuario</label>
              <select v-model="form.rol" class="select">
                <option value="ADMIN">ADMIN — Administrador</option>
                <option value="CENSADOR">CENSADOR — Censador</option>
                <option value="OPERADOR_ENTREGAS">OPERADOR_ENTREGAS — Operador de entregas</option>
                <option value="COORDINADOR_LOGISTICA">COORDINADOR_LOGISTICA — Coordinador logístico</option>
                <option value="FUNCIONARIO_CONTROL">FUNCIONARIO_CONTROL — Funcionario de control</option>
                <option value="REGISTRADOR_DONACIONES">REGISTRADOR_DONACIONES — Registrador de donaciones</option>
              </select>
              <span v-if="fieldErrors.rol" class="error-text">{{ fieldErrors.rol }}</span>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="isLoading">
              <span v-if="isLoading" class="spinner"></span>
              <span v-else class="btn-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8v6" /><path d="M22 11h-6" /></svg>
              </span>
              {{ isLoading ? 'Creando...' : 'Crear usuario' }}
            </button>
            <button type="button" class="btn btn-secondary" @click="resetForm">Limpiar</button>
          </div>
        </form>
      </article>

      <article v-if="puedeAccion('usuarios.listar')" class="form-card">
        <div class="form-card-head">
          <div class="form-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
          </div>
          <div class="form-card-title">
            <h3>Obtener usuarios</h3>
            <span>Lista todos los usuarios registrados</span>
          </div>
        </div>

        <div class="form-actions">
          <button class="btn btn-primary" @click="loadUsers" :disabled="isLoading">
            <span v-if="isLoading && mode === 'list'" class="spinner"></span>
            <span v-else class="btn-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 21l-4.35-4.35" /><circle cx="11" cy="11" r="7" /></svg>
            </span>
            {{ isLoading && mode === 'list' ? 'Cargando...' : 'Listar usuarios' }}
          </button>
          <button v-if="usuarios.length" class="btn btn-secondary" @click="closeResult" :disabled="isLoading">
            Limpiar listado
          </button>
        </div>
      </article>
    </div>

    <!-- Panel de resultado: lista de usuarios -->
    <section v-if="showPanel" class="result-panel">
      <div class="result-head">
        <div class="result-head-info">
          <span class="label">Listado de usuarios</span>
          <span v-if="resultKind === 'success' && Array.isArray(usuarios)" class="count">
            <strong>{{ usuarios.length }}</strong> {{ usuarios.length === 1 ? 'registro' : 'registros' }}
          </span>
        </div>
        <button class="btn btn-ghost" @click="closeResult">Cerrar</button>
      </div>

      <div v-if="resultKind === 'success'">
        <ul v-if="Array.isArray(usuarios) && usuarios.length" class="item-list">
          <li v-for="user in usuarios" :key="user.id_usuario" class="item-card">
            <div class="item-avatar" :class="avatarVariant(user.rol)">
              {{ getInitials(user.nombre_completo) }}
            </div>
            <div class="item-content">
              <h4>{{ user.nombre_completo }}</h4>
              <p>{{ user.correo }}</p>
              <div class="item-meta">
                <span class="badge" :class="roleBadgeClass(user.rol)">{{ user.rol }}</span>
                <span class="status">
                  <span class="dot" :class="user.activo ? 'on' : 'off'"></span>
                  {{ user.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </div>
            </div>
            <div class="item-actions">
              <span class="badge badge-default">ID {{ user.id_usuario }}</span>
            </div>
          </li>
        </ul>

        <div v-else-if="Array.isArray(usuarios) && usuarios.length === 0" class="empty-list">
          <div class="icon">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          </div>
          <h4>Sin usuarios registrados</h4>
          <p>Aún no se han creado usuarios en la plataforma.</p>
        </div>

        <div v-else class="detail-card">
          <div class="detail-row">
            <span class="k">Detalle</span>
            <span class="v">Usuario creado correctamente.</span>
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
import { defineComponent, reactive, ref } from 'vue'
import { userService } from '../../services/users'
import { usePermissions } from '../../composables/usePermissions'
import type { Usuario, UserRole } from '../../types'

export default defineComponent({
  name: 'DashboardUsuarios',
  setup() {
    const { puedeAccion } = usePermissions()

    const form = reactive({
      nombre_completo: '',
      correo: '',
      password: '',
      rol: 'REGISTRADOR_DONACIONES' as UserRole
    })
    const fieldErrors = reactive<Record<string, string>>({})

    const isLoading = ref(false)
    const mode = ref<'create' | 'list' | null>(null)
    const showPanel = ref(false)
    const resultKind = ref<'success' | 'error'>('success')
    const usuarios = ref<Usuario[]>([])
    const errorMessage = ref('')

    const validate = (): boolean => {
      Object.keys(fieldErrors).forEach(k => delete fieldErrors[k])
      if (!form.nombre_completo.trim()) fieldErrors.nombre_completo = 'Ingresa el nombre completo'
      if (!form.correo.trim()) {
        fieldErrors.correo = 'Ingresa un correo'
      } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.correo)) {
        fieldErrors.correo = 'El formato del correo no es válido'
      }
      if (!form.password) {
        fieldErrors.password = 'Ingresa una contraseña'
      } else if (form.password.length < 8) {
        fieldErrors.password = 'Debe tener mínimo 8 caracteres'
      }
      if (!form.rol) fieldErrors.rol = 'Selecciona un rol'
      return Object.keys(fieldErrors).length === 0
    }

    const closeResult = () => {
      showPanel.value = false
      usuarios.value = []
      errorMessage.value = ''
    }

    const resetForm = () => {
      form.nombre_completo = ''
      form.correo = ''
      form.password = ''
      form.rol = 'REGISTRADOR_DONACIONES'
      Object.keys(fieldErrors).forEach(k => delete fieldErrors[k])
    }

    const extractError = (err: any): string => {
      const detail = err?.response?.data?.detail
      if (typeof detail === 'string') return detail
      if (Array.isArray(detail)) return detail.map((d: any) => d.msg).join(', ')
      return err?.message || 'Error desconocido'
    }

    const createUser = async () => {
      if (!validate()) return
      isLoading.value = true
      mode.value = 'create'
      try {
        const response: Usuario = await userService.create({
          nombre_completo: form.nombre_completo.trim(),
          correo: form.correo.trim(),
          password: form.password,
          rol: form.rol
        })
        resultKind.value = 'success'
        usuarios.value = [response]
        showPanel.value = true
        resetForm()
      } catch (err: any) {
        resultKind.value = 'error'
        errorMessage.value = extractError(err)
        showPanel.value = true
      } finally {
        isLoading.value = false
        mode.value = null
      }
    }

    const loadUsers = async () => {
      isLoading.value = true
      mode.value = 'list'
      try {
        const response: Usuario[] = await userService.list()
        resultKind.value = 'success'
        usuarios.value = Array.isArray(response) ? response : []
        showPanel.value = true
      } catch (err: any) {
        resultKind.value = 'error'
        errorMessage.value = extractError(err)
        usuarios.value = []
        showPanel.value = true
      } finally {
        isLoading.value = false
        mode.value = null
      }
    }

    const getInitials = (name: string) => {
      const parts = (name || '').trim().split(/\s+/)
      return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || 'U'
    }

    const avatarVariant = (rol: UserRole) => {
      const map: Record<UserRole, string> = {
        ADMIN: 'variant-rose',
        CENSADOR: 'variant-green',
        OPERADOR_ENTREGAS: 'variant-cyan',
        COORDINADOR_LOGISTICA: 'variant-amber',
        FUNCIONARIO_CONTROL: 'variant-violet',
        REGISTRADOR_DONACIONES: 'variant-pink'
      }
      return map[rol] || ''
    }

    const roleBadgeClass = (rol: UserRole) => {
      const map: Record<UserRole, string> = {
        ADMIN: 'badge-danger',
        CENSADOR: 'badge-success',
        OPERADOR_ENTREGAS: 'badge-info',
        COORDINADOR_LOGISTICA: 'badge-warning',
        FUNCIONARIO_CONTROL: 'badge-violet',
        REGISTRADOR_DONACIONES: 'badge-pink'
      }
      return map[rol] || 'badge-default'
    }

    return {
      form, fieldErrors, isLoading, mode, showPanel, resultKind,
      usuarios, errorMessage,
      createUser, loadUsers, resetForm, closeResult,
      getInitials, avatarVariant, roleBadgeClass, puedeAccion
    }
  }
})
</script>
