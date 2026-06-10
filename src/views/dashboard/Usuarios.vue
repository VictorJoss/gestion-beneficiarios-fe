<template>
  <div class="dash-page">
    <div class="cards-grid">
      <article v-if="puedeAccion('usuarios.crear')" class="form-card">
        <div class="form-card-head">
          <div class="form-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8v6" /><path d="M22 11h-6" /></svg>
          </div>
          <div class="form-card-title">
            <h3>{{ isEditing ? 'Editar usuario' : 'Crear usuario' }}</h3>
            <span>{{ isEditing ? 'Edita los datos y configuración del usuario' : 'Registra un nuevo usuario con su rol y credenciales' }}</span>
          </div>
        </div>

        <form @submit.prevent="submitForm">
          <div class="form-grid">
            <div class="form-field full" :class="{ error: fieldErrors.nombre_completo }">
              <label class="req">Nombre completo</label>
              <input v-model="form.nombre_completo" class="input" placeholder="Ej. María Fernández" />
              <span v-if="fieldErrors.nombre_completo" class="error-text">{{ fieldErrors.nombre_completo }}</span>
            </div>
            <div class="form-field" :class="{ error: fieldErrors.correo }">
              <label :class="{ req: !isEditing }">Correo electrónico</label>
              <input v-model="form.correo" class="input" type="email" placeholder="usuario@correo.com" :disabled="isEditing" />
              <span v-if="fieldErrors.correo" class="error-text">{{ fieldErrors.correo }}</span>
              <span v-if="isEditing" class="helper text-xs">El correo no se puede modificar</span>
            </div>
            <div class="form-field" :class="{ error: fieldErrors.password }">
              <label :class="{ req: !isEditing }">Contraseña <span v-if="isEditing" class="font-normal opacity-50">(opcional)</span></label>
              <input v-model="form.password" class="input" type="password" :placeholder="isEditing ? 'Deja en blanco para no cambiar' : 'Mínimo 8 caracteres'" />
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
              <span v-if="isLoading && (mode === 'create' || mode === 'edit')" class="spinner"></span>
              <span v-else class="btn-icon">
                <svg v-if="!isEditing" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8v6" /><path d="M22 11h-6" /></svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
              </span>
              {{ isLoading ? (isEditing ? 'Guardando...' : 'Creando...') : (isEditing ? 'Guardar cambios' : 'Crear usuario') }}
            </button>
            <button type="button" class="btn btn-secondary" @click="resetForm">{{ isEditing ? 'Cancelar edición' : 'Limpiar' }}</button>
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
          <span v-if="resultKind === 'success' && !isLoading && Array.isArray(usuarios)" class="count">
            <strong>{{ totalItems }}</strong> {{ totalItems === 1 ? 'registro' : 'registros' }}
          </span>
        </div>
        <button class="btn btn-ghost" @click="closeResult">Cerrar</button>
      </div>

      <LoadingState
        v-if="isLoading && mode === 'list'"
        variant="skeleton"
        :count="4"
        label="Cargando usuarios..."
      />

      <template v-else>
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
                <div class="item-dates">
                  <span v-if="user.fecha_creacion" class="date-line">Creado: {{ formatDateTime(user.fecha_creacion) }}</span>
                  <span v-if="user.fecha_actualizacion" class="date-line">Actualizado: {{ formatDateTime(user.fecha_actualizacion) }}</span>
                </div>
              </div>
              <div class="item-actions">
                <span class="badge badge-default">ID {{ user.id_usuario }}</span>
                <div v-if="puedeAccion('usuarios.actualizar')" class="actions-group">
                  <button class="btn btn-ghost btn-icon" @click="editUser(user)" title="Editar usuario">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button v-if="user.activo" class="btn btn-ghost btn-icon text-danger" @click="promptToggleStatus(user)" title="Desactivar usuario">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg>
                  </button>
                  <button v-else class="btn btn-ghost btn-icon text-success" @click="promptToggleStatus(user)" title="Activar usuario">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                  </button>
                </div>
              </div>
            </li>
          </ul>

          <EmptyState
            v-if="Array.isArray(usuarios) && usuarios.length === 0"
            title="Sin usuarios registrados"
            message="Aún no se han creado usuarios en la plataforma."
          />

          <div v-if="resultKind === 'success' && !Array.isArray(usuarios)" class="detail-card">
            <div class="detail-row">
              <span class="k">Detalle</span>
              <span class="v">Usuario creado correctamente.</span>
            </div>
          </div>

          <Pagination
            v-if="Array.isArray(usuarios) && usuarios.length > 0"
            v-model:currentPage="currentPage"
            v-model:pageSize="pageSize"
            :total="totalItems"
            :loading="isLoading"
            item-label="registro"
            @change="onPageChange"
          />
        </div>

        <ErrorState
          v-else
          title="No se pudo completar la operación."
          :message="errorMessage"
          retry-label="Reintentar"
          @retry="loadUsers"
        />
      </template>

      <ConfirmDialog
        v-model:show="showStateConfirm"
        :title="userToToggle?.activo ? 'Desactivar Usuario' : 'Activar Usuario'"
        :message="userToToggle?.activo
          ? `¿Estás seguro de que deseas desactivar el usuario '${userToToggle?.nombre_completo}'?`
          : `¿Estás seguro de que deseas activar el usuario '${userToToggle?.nombre_completo}'?`"
        :type="userToToggle?.activo ? 'danger' : 'primary'"
        :confirmText="userToToggle?.activo ? 'Sí, desactivar' : 'Sí, activar'"
        :loading="isTogglingState"
        @confirm="toggleUserStatus"
      />
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, onMounted } from 'vue'
import { userService } from '../../services/users'
import { usePermissions } from '../../composables/usePermissions'
import type { Usuario, UserRole, PaginatedResponse } from '../../types'
import ConfirmDialog from '../../components/ConfirmDialog.vue'
import LoadingState from '../../components/LoadingState.vue'
import EmptyState from '../../components/EmptyState.vue'
import ErrorState from '../../components/ErrorState.vue'
import Pagination from '../../components/Pagination.vue'

export default defineComponent({
  name: 'DashboardUsuarios',
  components: { ConfirmDialog, LoadingState, EmptyState, ErrorState, Pagination },
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
    const mode = ref<'create' | 'list' | 'edit' | null>(null)
    const showPanel = ref(false)
    const resultKind = ref<'success' | 'error'>('success')
    const usuarios = ref<Usuario[]>([])
    const errorMessage = ref('')
    
    // Edición de usuario
    const isEditing = ref(false)
    const editingUserId = ref<number | null>(null)

    // Activación/Desactivación de usuario
    const showStateConfirm = ref(false)
    const isTogglingState = ref(false)
    const userToToggle = ref<Usuario | null>(null)

    // Paginación
    const currentPage = ref(1)
    const pageSize = ref(6)
    const totalItems = ref(0)

    const loadUsers = async (page: number = currentPage.value, size: number = pageSize.value) => {
      isLoading.value = true
      mode.value = 'list'
      showPanel.value = true
      try {
        const response: PaginatedResponse<Usuario> = await userService.list(page, size)
        resultKind.value = 'success'
        usuarios.value = response.items
        totalItems.value = response.total
        currentPage.value = response.page
        pageSize.value = response.page_size
      } catch (err: any) {
        resultKind.value = 'error'
        errorMessage.value = extractError(err)
        usuarios.value = []
      } finally {
        isLoading.value = false
        mode.value = null
      }
    }

    const onPageChange = (payload: { page: number; pageSize: number }) => {
      loadUsers(payload.page, payload.pageSize)
    }

    onMounted(async () => {
      if (puedeAccion('usuarios.listar')) {
        await loadUsers()
      }
    })

    const validate = (): boolean => {
      Object.keys(fieldErrors).forEach(k => delete fieldErrors[k])
      if (!form.nombre_completo.trim()) fieldErrors.nombre_completo = 'Ingresa el nombre completo'
      
      // Solo validamos correo en creación (en edición está deshabilitado)
      if (!isEditing.value) {
        if (!form.correo.trim()) {
          fieldErrors.correo = 'Ingresa un correo'
        } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.correo)) {
          fieldErrors.correo = 'El formato del correo no es válido'
        }
      }
      
      if (!isEditing.value && !form.password) {
        fieldErrors.password = 'Ingresa una contraseña'
      } else if (form.password && form.password.length < 8) {
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
      
      isEditing.value = false
      editingUserId.value = null
    }

    const extractError = (err: any): string => {
      const detail = err?.response?.data?.detail
      if (typeof detail === 'string') return detail
      if (Array.isArray(detail)) return detail.map((d: any) => d.msg).join(', ')
      return err?.message || 'Error desconocido'
    }

    const submitForm = async () => {
      if (isEditing.value) {
        await updateUser()
      } else {
        await createUser()
      }
    }

    const createUser = async () => {
      if (!validate()) return
      isLoading.value = true
      mode.value = 'create'
      try {
        await userService.create({
          nombre_completo: form.nombre_completo.trim(),
          correo: form.correo.trim(),
          password: form.password,
          rol: form.rol
        })
        resultKind.value = 'success'
        resetForm()
        await loadUsers(1, pageSize.value)
      } catch (err: any) {
        resultKind.value = 'error'
        errorMessage.value = extractError(err)
        showPanel.value = true
      } finally {
        isLoading.value = false
        mode.value = null
      }
    }

    const editUser = (user: Usuario) => {
      isEditing.value = true
      editingUserId.value = user.id_usuario
      form.nombre_completo = user.nombre_completo
      form.correo = user.correo
      form.rol = user.rol
      form.password = ''
      Object.keys(fieldErrors).forEach(k => delete fieldErrors[k])
      
      // Scroll smoothly to form
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const updateUser = async () => {
      if (!validate() || !editingUserId.value) return
      isLoading.value = true
      mode.value = 'edit'
      try {
        const updateData: any = {
          nombre_completo: form.nombre_completo.trim(),
          rol: form.rol
        }
        // Only valid to send password if it was actually changed
        if (form.password) {
          updateData.password = form.password
        }
        
        await userService.update(editingUserId.value, updateData)
        
        // Refresh the list to show updated data
        resetForm()
        await loadUsers()
      } catch (err: any) {
        showPanel.value = true
        resultKind.value = 'error'
        errorMessage.value = extractError(err)
      } finally {
        isLoading.value = false
        mode.value = null
      }
    }

    const promptToggleStatus = (user: Usuario) => {
      userToToggle.value = user
      showStateConfirm.value = true
    }

    const toggleUserStatus = async () => {
      if (!userToToggle.value) return
      
      isTogglingState.value = true
      try {
        if (userToToggle.value.activo) {
          await userService.deactivate(userToToggle.value.id_usuario)
        } else {
          await userService.activate(userToToggle.value.id_usuario)
        }
        
        // Cierra dialogo de confirmación antes de la actualización
        showStateConfirm.value = false
        
        // Refresca la lista
        await loadUsers()
      } catch (err: any) {
        showStateConfirm.value = false
        showPanel.value = true
        resultKind.value = 'error'
        errorMessage.value = extractError(err)
      } finally {
        isTogglingState.value = false
        userToToggle.value = null
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

    const formatDateTime = (iso?: string) => {
      if (!iso) return '—'
      try {
        const d = new Date(iso)
        return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      } catch {
        return iso
      }
    }

    return {
      form, fieldErrors, isLoading, mode, showPanel, resultKind,
      usuarios, errorMessage, isEditing,
      showStateConfirm, isTogglingState, userToToggle,
      currentPage, pageSize, totalItems,
      submitForm, createUser, loadUsers, onPageChange, resetForm, closeResult,
      editUser, promptToggleStatus, toggleUserStatus,
      getInitials, avatarVariant, roleBadgeClass, formatDateTime, puedeAccion
    }
  }
})
</script>

<style scoped>
.item-dates {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-xs);
  flex-wrap: wrap;
}
.date-line {
  font-size: 0.7rem;
  color: var(--color-text-secondary, #94a3b8);
}
</style>
