/**
 * SERVICIO: MatrixOperationsService
 * RESPONSABILIDAD ÚNICA: Realizar operaciones con matrices
 * RAZÓN PARA CAMBIAR: Solo si cambian las reglas de álgebra matricial
 */
import { Matriz } from "../entidades/Matriz"

export interface ResultadoMatriz {
  resultado: Matriz
  pasos: string[]
  explicacion: string
}

export class MatrixOperationsService {
  // Suma de matrices
  sumar(m1: Matriz, m2: Matriz): ResultadoMatriz {
    if (m1.filas !== m2.filas || m1.columnas !== m2.columnas) {
      throw new Error("Las matrices deben tener las mismas dimensiones")
    }

    const nuevosDatos: number[][] = []
    const pasos: string[] = ["Sumando matrices elemento por elemento:"]

    for (let i = 0; i < m1.filas; i++) {
      nuevosDatos[i] = []
      for (let j = 0; j < m1.columnas; j++) {
        nuevosDatos[i][j] = m1.datos[i][j] + m2.datos[i][j]
        pasos.push(`[${i}][${j}]: ${m1.datos[i][j]} + ${m2.datos[i][j]} = ${nuevosDatos[i][j]}`)
      }
    }

    return {
      resultado: new Matriz(m1.filas, m1.columnas, nuevosDatos),
      pasos,
      explicacion: "La suma de matrices se realiza sumando elementos correspondientes.",
    }
  }

  // Resta de matrices
  restar(m1: Matriz, m2: Matriz): ResultadoMatriz {
    if (m1.filas !== m2.filas || m1.columnas !== m2.columnas) {
      throw new Error("Las matrices deben tener las mismas dimensiones")
    }

    const nuevosDatos: number[][] = []
    const pasos: string[] = ["Restando matrices elemento por elemento:"]

    for (let i = 0; i < m1.filas; i++) {
      nuevosDatos[i] = []
      for (let j = 0; j < m1.columnas; j++) {
        nuevosDatos[i][j] = m1.datos[i][j] - m2.datos[i][j]
        pasos.push(`[${i}][${j}]: ${m1.datos[i][j]} - ${m2.datos[i][j]} = ${nuevosDatos[i][j]}`)
      }
    }

    return {
      resultado: new Matriz(m1.filas, m1.columnas, nuevosDatos),
      pasos,
      explicacion: "La resta de matrices se realiza restando elementos correspondientes.",
    }
  }

  // Multiplicación de matrices
  multiplicar(m1: Matriz, m2: Matriz): ResultadoMatriz {
    if (m1.columnas !== m2.filas) {
      throw new Error("El número de columnas de la primera matriz debe ser igual al número de filas de la segunda")
    }

    const nuevosDatos: number[][] = []
    const pasos: string[] = ["Multiplicando matrices:"]

    for (let i = 0; i < m1.filas; i++) {
      nuevosDatos[i] = []
      for (let j = 0; j < m2.columnas; j++) {
        let suma = 0
        const terminos: string[] = []

        for (let k = 0; k < m1.columnas; k++) {
          suma += m1.datos[i][k] * m2.datos[k][j]
          terminos.push(`${m1.datos[i][k]}×${m2.datos[k][j]}`)
        }

        nuevosDatos[i][j] = suma
        pasos.push(`[${i}][${j}]: ${terminos.join(" + ")} = ${suma}`)
      }
    }

    return {
      resultado: new Matriz(m1.filas, m2.columnas, nuevosDatos),
      pasos,
      explicacion: "La multiplicación de matrices combina filas de la primera con columnas de la segunda.",
    }
  }

  // RF-007: Método de Gauss-Jordan para resolver sistemas
  gaussJordan(matriz: Matriz): ResultadoMatriz {
    const m = matriz.clonar()
    const pasos: string[] = ["Aplicando eliminación de Gauss-Jordan:"]

    // Fase de eliminación hacia adelante
    for (let i = 0; i < m.filas; i++) {
      // Encontrar pivote
      let maxFila = i
      for (let k = i + 1; k < m.filas; k++) {
        if (Math.abs(m.datos[k][i]) > Math.abs(m.datos[maxFila][i])) {
          maxFila = k
        }
      }

      // Intercambiar filas si es necesario
      if (maxFila !== i) {
        ;[m.datos[i], m.datos[maxFila]] = [m.datos[maxFila], m.datos[i]]
        pasos.push(`Intercambiar fila ${i} con fila ${maxFila}`)
      }

      // Hacer el pivote igual a 1
      const pivote = m.datos[i][i]
      if (Math.abs(pivote) > 0.0001) {
        for (let j = 0; j < m.columnas; j++) {
          m.datos[i][j] /= pivote
        }
        pasos.push(`Dividir fila ${i} por ${pivote.toFixed(4)}`)

        // Eliminar columna en otras filas
        for (let k = 0; k < m.filas; k++) {
          if (k !== i) {
            const factor = m.datos[k][i]
            for (let j = 0; j < m.columnas; j++) {
              m.datos[k][j] -= factor * m.datos[i][j]
            }
            if (Math.abs(factor) > 0.0001) {
              pasos.push(`Fila ${k} = Fila ${k} - ${factor.toFixed(4)} × Fila ${i}`)
            }
          }
        }
      }
    }

    return {
      resultado: m,
      pasos,
      explicacion: "El método de Gauss-Jordan transforma la matriz a su forma escalonada reducida.",
    }
  }

  // Calcular determinante (para matrices cuadradas)
  calcularDeterminante(matriz: Matriz): number {
    if (matriz.filas !== matriz.columnas) {
      throw new Error("La matriz debe ser cuadrada")
    }

    if (matriz.filas === 1) {
      return matriz.datos[0][0]
    }

    if (matriz.filas === 2) {
      return matriz.datos[0][0] * matriz.datos[1][1] - matriz.datos[0][1] * matriz.datos[1][0]
    }

    // Para matrices 3x3 o mayores, usar expansión por cofactores
    let det = 0
    for (let j = 0; j < matriz.columnas; j++) {
      det += Math.pow(-1, j) * matriz.datos[0][j] * this.calcularMenor(matriz, 0, j)
    }

    return det
  }

  // Calcular menor de una matriz
  private calcularMenor(matriz: Matriz, fila: number, columna: number): number {
    const nuevosDatos: number[][] = []

    for (let i = 0; i < matriz.filas; i++) {
      if (i === fila) continue
      const nuevaFila: number[] = []
      for (let j = 0; j < matriz.columnas; j++) {
        if (j === columna) continue
        nuevaFila.push(matriz.datos[i][j])
      }
      nuevosDatos.push(nuevaFila)
    }

    const menor = new Matriz(matriz.filas - 1, matriz.columnas - 1, nuevosDatos)
    return this.calcularDeterminante(menor)
  }

  // Transponer matriz
  transponer(matriz: Matriz): Matriz {
    const nuevosDatos: number[][] = []

    for (let j = 0; j < matriz.columnas; j++) {
      nuevosDatos[j] = []
      for (let i = 0; i < matriz.filas; i++) {
        nuevosDatos[j][i] = matriz.datos[i][j]
      }
    }

    return new Matriz(matriz.columnas, matriz.filas, nuevosDatos)
  }
}
