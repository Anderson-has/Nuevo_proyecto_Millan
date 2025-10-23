/**
 * ENTIDAD: Leccion
 * RESPONSABILIDAD ÚNICA: Representar una lección educativa
 * RAZÓN PARA CAMBIAR: Solo si cambia la estructura de una lección
 */
export interface ContenidoLeccion {
  concepto: string
  formula?: string
  explicacion: string
  ejemplo: string
}

export class Leccion {
  constructor(
    public readonly id: string,
    public readonly titulo: string,
    public readonly modulo: string,
    public readonly orden: number,
    public readonly contenido: ContenidoLeccion,
    public readonly duracionEstimada: number, // en minutos
  ) {}

  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      titulo: this.titulo,
      modulo: this.modulo,
      orden: this.orden,
      contenido: this.contenido,
      duracionEstimada: this.duracionEstimada,
    }
  }

  static fromJSON(data: Record<string, unknown>): Leccion {
    return new Leccion(
      data.id as string,
      data.titulo as string,
      data.modulo as string,
      data.orden as number,
      data.contenido as ContenidoLeccion,
      data.duracionEstimada as number,
    )
  }
}
