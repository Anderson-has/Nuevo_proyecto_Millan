/**
 * ENTIDAD: SegmentoRecta
 * RESPONSABILIDAD ÚNICA: Representar un segmento de recta en el espacio
 * RAZÓN PARA CAMBIAR: Solo si cambia la definición matemática de un segmento
 */
import { Vector3D } from "./Vector3D"

export class SegmentoRecta {
  constructor(
    public puntoInicial: Vector3D,
    public puntoFinal: Vector3D,
    public nombre?: string,
  ) {}

  toString(): string {
    return `${this.nombre || "Segmento"}: ${this.puntoInicial.toString()} → ${this.puntoFinal.toString()}`
  }

  toJSON() {
    return {
      puntoInicial: {
        x: this.puntoInicial.x,
        y: this.puntoInicial.y,
        z: this.puntoInicial.z,
      },
      puntoFinal: {
        x: this.puntoFinal.x,
        y: this.puntoFinal.y,
        z: this.puntoFinal.z,
      },
      nombre: this.nombre,
    }
  }

  static fromJSON(data: any): SegmentoRecta {
    const puntoInicial = new Vector3D(data.puntoInicial.x, data.puntoInicial.y, data.puntoInicial.z)
    const puntoFinal = new Vector3D(data.puntoFinal.x, data.puntoFinal.y, data.puntoFinal.z)
    return new SegmentoRecta(puntoInicial, puntoFinal, data.nombre)
  }
}
