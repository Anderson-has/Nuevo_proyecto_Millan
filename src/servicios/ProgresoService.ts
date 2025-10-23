/**
 * SERVICIO: ProgresoService
 * RESPONSABILIDAD ÚNICA: Gestionar la lógica de progreso del estudiante
 * RAZÓN PARA CAMBIAR: Solo si cambian las reglas de progreso
 */
import type { Progreso, LeccionCompletada } from "../entidades/Progreso"

export class ProgresoService {
  // RF-013: Calcular nivel basado en progreso
  calcularNivel(progreso: Progreso): number {
    const leccionesCompletadas = progreso.leccionesCompletadas.length

    if (leccionesCompletadas < 5) return 1
    if (leccionesCompletadas < 10) return 2
    if (leccionesCompletadas < 20) return 3
    if (leccionesCompletadas < 35) return 4
    return 5
  }

  // Verificar si puede avanzar al siguiente nivel
  puedeAvanzarNivel(progreso: Progreso): boolean {
    const nivelCalculado = this.calcularNivel(progreso)
    return nivelCalculado > progreso.nivelActual
  }

  // Calcular puntuación promedio
  calcularPuntuacionPromedio(lecciones: LeccionCompletada[]): number {
    if (lecciones.length === 0) return 0

    const suma = lecciones.reduce((acc, l) => acc + l.puntuacion, 0)
    return suma / lecciones.length
  }

  // RF-013: Generar estadísticas de progreso
  generarEstadisticas(progreso: Progreso): {
    leccionesCompletadas: number
    tiempoTotal: number
    puntuacionPromedio: number
    nivel: number
    proximoNivel: number
    leccionesFaltantes: number
  } {
    const nivel = this.calcularNivel(progreso)
    const leccionesParaSiguienteNivel = this.leccionesParaNivel(nivel + 1)
    const leccionesFaltantes = leccionesParaSiguienteNivel - progreso.leccionesCompletadas.length

    return {
      leccionesCompletadas: progreso.leccionesCompletadas.length,
      tiempoTotal: progreso.tiempoEstudioMinutos,
      puntuacionPromedio: progreso.puntuacionPromedio,
      nivel,
      proximoNivel: nivel + 1,
      leccionesFaltantes: Math.max(0, leccionesFaltantes),
    }
  }

  // Lecciones necesarias para alcanzar un nivel
  private leccionesParaNivel(nivel: number): number {
    switch (nivel) {
      case 1:
        return 0
      case 2:
        return 5
      case 3:
        return 10
      case 4:
        return 20
      case 5:
        return 35
      default:
        return 50
    }
  }

  // Validar si una lección puede ser marcada como completada
  validarCompletacion(leccionId: string, progreso: Progreso): { valido: boolean; mensaje?: string } {
    const yaCompletada = progreso.leccionesCompletadas.some((l) => l.id === leccionId)

    if (yaCompletada) {
      return {
        valido: false,
        mensaje: "Esta lección ya fue completada",
      }
    }

    return { valido: true }
  }
}
