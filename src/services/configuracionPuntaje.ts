import api from './api'
import type {
  ConfiguracionPuntaje,
  ConfiguracionPuntajeUpdate
} from '../types'

export class ConfiguracionPuntajeService {
  async listar(): Promise<ConfiguracionPuntaje[]> {
    const response = await api.get<ConfiguracionPuntaje[]>(
      '/configuracion-puntaje/'
    )
    return response.data
  }

  async actualizar(
    clave: string,
    data: ConfiguracionPuntajeUpdate
  ): Promise<ConfiguracionPuntaje> {
    const response = await api.put<ConfiguracionPuntaje>(
      `/configuracion-puntaje/${clave}`,
      data
    )

    return response.data
  }
}

export const configuracionPuntajeService =
  new ConfiguracionPuntajeService()