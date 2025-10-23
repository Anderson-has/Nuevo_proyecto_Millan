/**
 * ENTIDAD: Matriz
 * RESPONSABILIDAD ÚNICA: Representar una matriz matemática
 * RAZÓN PARA CAMBIAR: Solo si cambia la representación de una matriz
 */
export class Matriz {
  constructor(
    public readonly filas: number,
    public readonly columnas: number,
    public datos: number[][],
    public nombre?: string,
  ) {
    // Validar dimensiones
    if (datos.length !== filas) {
      throw new Error("El número de filas no coincide con los datos")
    }
    if (datos.some((fila) => fila.length !== columnas)) {
      throw new Error("El número de columnas no coincide con los datos")
    }
  }

  // Obtener elemento en posición [i][j]
  obtenerElemento(i: number, j: number): number {
    if (i < 0 || i >= this.filas || j < 0 || j >= this.columnas) {
      throw new Error("Índice fuera de rango")
    }
    return this.datos[i][j]
  }

  // Establecer elemento en posición [i][j]
  establecerElemento(i: number, j: number, valor: number): void {
    if (i < 0 || i >= this.filas || j < 0 || j >= this.columnas) {
      throw new Error("Índice fuera de rango")
    }
    this.datos[i][j] = valor
  }

  // Crear copia de la matriz
  clonar(): Matriz {
    const nuevosDatos = this.datos.map((fila) => [...fila])
    return new Matriz(this.filas, this.columnas, nuevosDatos, this.nombre)
  }

  toJSON(): Record<string, unknown> {
    return {
      filas: this.filas,
      columnas: this.columnas,
      datos: this.datos,
      nombre: this.nombre,
    }
  }

  static fromJSON(data: Record<string, unknown>): Matriz {
    return new Matriz(
      data.filas as number,
      data.columnas as number,
      data.datos as number[][],
      data.nombre as string | undefined,
    )
  }
}
