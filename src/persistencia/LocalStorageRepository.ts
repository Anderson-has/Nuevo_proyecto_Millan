/**
 * PERSISTENCIA: LocalStorageRepository
 * RESPONSABILIDAD ÚNICA: Gestionar el almacenamiento en localStorage
 * RAZÓN PARA CAMBIAR: Solo si cambia la estrategia de persistencia
 */
export class LocalStorageRepository {
  // Guardar datos
  guardar<T>(clave: string, datos: T): void {
    try {
      const json = JSON.stringify(datos)
      localStorage.setItem(clave, json)
    } catch (error) {
      console.error("Error al guardar en localStorage:", error)
      throw new Error("No se pudo guardar la información")
    }
  }

  // Obtener datos
  obtener<T>(clave: string): T | null {
    try {
      const json = localStorage.getItem(clave)
      if (!json) return null
      return JSON.parse(json) as T
    } catch (error) {
      console.error("Error al leer de localStorage:", error)
      return null
    }
  }

  // Eliminar datos
  eliminar(clave: string): void {
    try {
      localStorage.removeItem(clave)
    } catch (error) {
      console.error("Error al eliminar de localStorage:", error)
    }
  }

  // Verificar si existe una clave
  existe(clave: string): boolean {
    return localStorage.getItem(clave) !== null
  }

  // Limpiar todo el almacenamiento
  limpiarTodo(): void {
    try {
      localStorage.clear()
    } catch (error) {
      console.error("Error al limpiar localStorage:", error)
    }
  }

  // Obtener todas las claves
  obtenerClaves(): string[] {
    const claves: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const clave = localStorage.key(i)
      if (clave) claves.push(clave)
    }
    return claves
  }
}
