/**
 * ENTIDAD: CasoEmprendimiento
 * RESPONSABILIDAD ÚNICA: Representar un caso de emprendimiento educativo
 * RAZÓN PARA CAMBIAR: Solo si cambia la estructura del caso de negocio
 */
export interface OpcionNegocio {
  id: string
  nombre: string
  descripcion: string
  inversionInicial: number
  alquilerMensual: number
  ventasEstimadas: number
  costoUnitario: number
  precioVenta: number
}

export interface DecisionUsuario {
  opcionSeleccionada: string
  fecha: Date
  analisisRealizado: boolean
}

export class CasoEmprendimiento {
  constructor(
    public readonly id: string,
    public readonly titulo: string,
    public readonly descripcion: string,
    public readonly protagonista: string,
    public readonly capitalDisponible: number,
    public readonly opciones: OpcionNegocio[],
    public decision?: DecisionUsuario,
  ) {}

  // Registrar decisión del usuario
  registrarDecision(opcionId: string, analisisRealizado: boolean): void {
    this.decision = {
      opcionSeleccionada: opcionId,
      fecha: new Date(),
      analisisRealizado,
    }
  }

  // Obtener opción por ID
  obtenerOpcion(id: string): OpcionNegocio | undefined {
    return this.opciones.find((op) => op.id === id)
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      titulo: this.titulo,
      descripcion: this.descripcion,
      protagonista: this.protagonista,
      capitalDisponible: this.capitalDisponible,
      opciones: this.opciones,
      decision: this.decision,
    }
  }

  static fromJSON(data: Record<string, unknown>): CasoEmprendimiento {
    return new CasoEmprendimiento(
      data.id as string,
      data.titulo as string,
      data.descripcion as string,
      data.protagonista as string,
      data.capitalDisponible as number,
      data.opciones as OpcionNegocio[],
      data.decision as DecisionUsuario | undefined,
    )
  }
}
