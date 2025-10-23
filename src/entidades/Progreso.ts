/**
 * ENTIDAD: Progreso
 * RESPONSABILIDAD ÚNICA: Representar el progreso de aprendizaje de un usuario
 * RAZÓN PARA CAMBIAR: Solo si cambia la estructura de datos del progreso
 */
export interface LeccionCompletada {
  id: string
  titulo: string
  fechaCompletada: Date
  puntuacion: number
}

export class Progreso {
  constructor(
    public readonly usuarioId: string,
    public leccionesCompletadas: LeccionCompletada[],
    public tiempoEstudioMinutos: number,
    public puntuacionPromedio: number,
    public nivelActual: number,
  ) {}

  // Calcular porcentaje de progreso
  calcularPorcentaje(totalLecciones: number): number {
    return (this.leccionesCompletadas.length / totalLecciones) * 100
  }

  // Agregar lección completada
  agregarLeccion(leccion: LeccionCompletada): void {
    this.leccionesCompletadas.push(leccion)
    this.recalcularPuntuacion()
  }

  // Recalcular puntuación promedio
  private recalcularPuntuacion(): void {
    if (this.leccionesCompletadas.length === 0) {
      this.puntuacionPromedio = 0
      return
    }
    const suma = this.leccionesCompletadas.reduce((acc, l) => acc + l.puntuacion, 0)
    this.puntuacionPromedio = suma / this.leccionesCompletadas.length
  }

  toJSON(): Record<string, unknown> {
    return {
      usuarioId: this.usuarioId,
      leccionesCompletadas: this.leccionesCompletadas,
      tiempoEstudioMinutos: this.tiempoEstudioMinutos,
      puntuacionPromedio: this.puntuacionPromedio,
      nivelActual: this.nivelActual,
    }
  }

  static fromJSON(data: Record<string, unknown>): Progreso {
    return new Progreso(
      data.usuarioId as string,
      data.leccionesCompletadas as LeccionCompletada[],
      data.tiempoEstudioMinutos as number,
      data.puntuacionPromedio as number,
      data.nivelActual as number,
    )
  }
}
