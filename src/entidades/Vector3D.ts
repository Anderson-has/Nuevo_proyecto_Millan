/**
 * ENTIDAD: Vector3D
 * RESPONSABILIDAD ÚNICA: Representar un vector en el espacio 3D
 * RAZÓN PARA CAMBIAR: Solo si cambia la representación matemática de un vector
 */
export class Vector3D {
  constructor(
    public x: number,
    public y: number,
    public z = 0,
    public nombre?: string,
  ) {}

  magnitud(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
  }

  // Crear copia del vector
  clonar(): Vector3D {
    return new Vector3D(this.x, this.y, this.z, this.nombre)
  }

  // Convertir a array
  toArray(): [number, number, number] {
    return [this.x, this.y, this.z]
  }

  // Representación en string
  toString(): string {
    return `(${this.x}, ${this.y}, ${this.z})`
  }

  toJSON(): Record<string, unknown> {
    return {
      x: this.x,
      y: this.y,
      z: this.z,
      nombre: this.nombre,
    }
  }

  static fromJSON(data: Record<string, unknown>): Vector3D {
    return new Vector3D(data.x as number, data.y as number, data.z as number, data.nombre as string | undefined)
  }
}
