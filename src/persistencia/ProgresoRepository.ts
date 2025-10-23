/**
 * PERSISTENCIA: ProgresoRepository
 * RESPONSABILIDAD ÚNICA: Gestionar la persistencia del progreso
 * RAZÓN PARA CAMBIAR: Solo si cambia cómo se almacena el progreso
 */
import { Progreso } from "../entidades/Progreso"
import { LocalStorageRepository } from "./LocalStorageRepository"

export class ProgresoRepository {
  private storage: LocalStorageRepository
  private readonly CLAVE_PROGRESO = "empanadas_progreso_"

  constructor() {
    this.storage = new LocalStorageRepository()
  }

  // Guardar progreso de un usuario
  guardarProgreso(progreso: Progreso): void {
    const clave = this.obtenerClave(progreso.usuarioId)
    this.storage.guardar(clave, progreso.toJSON())
  }

  // Obtener progreso de un usuario
  obtenerProgreso(usuarioId: string): Progreso | null {
    const clave = this.obtenerClave(usuarioId)
    const datos = this.storage.obtener<ReturnType<Progreso["toJSON"]>>(clave)

    if (!datos) return null

    return Progreso.fromJSON(datos)
  }

  // Crear progreso inicial para un usuario
  crearProgresoInicial(usuarioId: string): Progreso {
    const progreso = new Progreso(usuarioId, [], 0, 0, 1)
    this.guardarProgreso(progreso)
    return progreso
  }

  // Verificar si existe progreso para un usuario
  existeProgreso(usuarioId: string): boolean {
    const clave = this.obtenerClave(usuarioId)
    return this.storage.existe(clave)
  }

  // Eliminar progreso de un usuario
  eliminarProgreso(usuarioId: string): void {
    const clave = this.obtenerClave(usuarioId)
    this.storage.eliminar(clave)
  }

  // Obtener clave de almacenamiento
  private obtenerClave(usuarioId: string): string {
    return `${this.CLAVE_PROGRESO}${usuarioId}`
  }
}
