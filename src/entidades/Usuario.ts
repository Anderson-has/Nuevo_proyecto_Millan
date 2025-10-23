/**
 * ENTIDAD: Usuario
 * RESPONSABILIDAD ÚNICA: Representar los datos de un usuario del sistema
 * RAZÓN PARA CAMBIAR: Solo si cambia la estructura de datos del usuario
 */
export class Usuario {
  constructor(
    public readonly id: string,
    public readonly nombre: string,
    public readonly apellidos: string,
    public readonly email: string,
    public readonly semestre: number,
    public readonly fechaRegistro: Date,
  ) {}

  // Método de utilidad para obtener nombre completo
  getNombreCompleto(): string {
    return `${this.nombre} ${this.apellidos}`
  }

  // Método para serializar a JSON
  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      nombre: this.nombre,
      apellidos: this.apellidos,
      email: this.email,
      semestre: this.semestre,
      fechaRegistro: this.fechaRegistro.toISOString(),
    }
  }

  // Método estático para crear desde JSON
  static fromJSON(data: Record<string, unknown>): Usuario {
    return new Usuario(
      data.id as string,
      data.nombre as string,
      data.apellidos as string,
      data.email as string,
      data.semestre as number,
      new Date(data.fechaRegistro as string),
    )
  }
}
