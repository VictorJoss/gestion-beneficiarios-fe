import { computed } from 'vue'
import { authService } from '../services/auth'
import { puede, modulosParaRol, accionesParaModulo, ROL_LABELS, ACCION_LABELS } from '../config/permissions'
import type { Accion, Modulo } from '../config/permissions'

export function usePermissions() {
  const usuario = authService.getUser()
  const rol = computed(() => usuario?.rol || null)
  const rolLabel = computed(() => (rol.value ? ROL_LABELS[rol.value as keyof typeof ROL_LABELS] || rol.value : 'Sin rol'))

  const modulos = computed(() => modulosParaRol(rol.value))
  const sinPermisos = computed(() => modulos.value.length === 0)

  function puedeAccion(accion: Accion) {
    return puede(rol.value, accion)
  }

  function accionesModulo(modulo: Modulo) {
    return accionesParaModulo(rol.value, modulo)
  }

  function labelAccion(accion: Accion) {
    return ACCION_LABELS[accion] || accion
  }

  return { rol, rolLabel, modulos, sinPermisos, puedeAccion, accionesModulo, labelAccion }
}
