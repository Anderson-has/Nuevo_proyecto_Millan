/**
 * SERVICIO: OrthonormalizationService
 * RESPONSABILIDAD ÚNICA: Realizar ortonormalización de vectores (Gram-Schmidt)
 * RAZÓN PARA CAMBIAR: Solo si cambian las reglas del proceso de Gram-Schmidt
 */
import { Vector3D } from "../entidades/Vector3D"
import { VectorOperationsService } from "./VectorOperationsService"

export interface ResultadoOrtonormalizacion {
  vectoresOrtogonales: Vector3D[]
  vectoresOrtonormales: Vector3D[]
  pasos: string[]
  explicacion: string
}

export class OrthonormalizationService {
  private vectorService: VectorOperationsService

  constructor() {
    this.vectorService = new VectorOperationsService()
  }

  // Normalizar un vector (convertirlo en vector unitario)
  normalizar(v: Vector3D): Vector3D {
    const magnitud = this.vectorService.calcularMagnitud(v).resultado as number
    if (magnitud === 0) {
      throw new Error("No se puede normalizar el vector cero")
    }
    return new Vector3D(v.x / magnitud, v.y / magnitud, v.z / magnitud, `${v.nombre}_norm`)
  }

  // Proceso de Gram-Schmidt
  gramSchmidt(vectores: Vector3D[]): ResultadoOrtonormalizacion {
    if (vectores.length === 0) {
      throw new Error("Debe proporcionar al menos un vector")
    }

    const vectoresOrtogonales: Vector3D[] = []
    const vectoresOrtonormales: Vector3D[] = []
    const pasos: string[] = ["Aplicando el proceso de Gram-Schmidt:"]

    // Primer vector
    const u1 = vectores[0]
    vectoresOrtogonales.push(u1)
    pasos.push(`\nPaso 1: u₁ = v₁ = ${u1.toString()}`)

    const e1 = this.normalizar(u1)
    vectoresOrtonormales.push(e1)
    const mag1 = this.vectorService.calcularMagnitud(u1).resultado as number
    pasos.push(`e₁ = u₁/||u₁|| = ${u1.toString()} / ${mag1.toFixed(4)} = ${e1.toString()}`)

    // Vectores subsiguientes
    for (let i = 1; i < vectores.length; i++) {
      pasos.push(`\nPaso ${i + 1}: Procesando v${i + 1} = ${vectores[i].toString()}`)

      // Calcular proyecciones sobre todos los vectores ortogonales anteriores
      let ui = new Vector3D(vectores[i].x, vectores[i].y, vectores[i].z)

      for (let j = 0; j < i; j++) {
        const proyeccion = this.vectorService.proyectar(vectores[i], vectoresOrtogonales[j]).resultado as Vector3D
        pasos.push(`  Proyección sobre u${j + 1}: ${proyeccion.toString()}`)

        ui = new Vector3D(ui.x - proyeccion.x, ui.y - proyeccion.y, ui.z - proyeccion.z)
      }

      pasos.push(`  u${i + 1} = ${ui.toString()}`)
      vectoresOrtogonales.push(ui)

      // Normalizar
      const ei = this.normalizar(ui)
      vectoresOrtonormales.push(ei)
      const magi = this.vectorService.calcularMagnitud(ui).resultado as number
      pasos.push(`  e${i + 1} = u${i + 1}/||u${i + 1}|| = ${ei.toString()}`)
    }

    pasos.push("\nVerificación de ortogonalidad:")
    for (let i = 0; i < vectoresOrtonormales.length; i++) {
      for (let j = i + 1; j < vectoresOrtonormales.length; j++) {
        const dotProduct = this.vectorService.productoEscalar(vectoresOrtonormales[i], vectoresOrtonormales[j])
          .resultado as number
        pasos.push(`  e${i + 1} · e${j + 1} = ${dotProduct.toFixed(6)} ≈ 0`)
      }
    }

    return {
      vectoresOrtogonales,
      vectoresOrtonormales,
      pasos,
      explicacion: `Se aplicó el proceso de Gram-Schmidt a ${vectores.length} vectores, generando una base ortogonal y una base ortonormal.`,
    }
  }

  // Verificar si un conjunto de vectores es ortogonal
  esConjuntoOrtogonal(vectores: Vector3D[]): {
    esOrtogonal: boolean
    productosEscalares: number[][]
    explicacion: string
  } {
    const n = vectores.length
    const productosEscalares: number[][] = Array(n)
      .fill(null)
      .map(() => Array(n).fill(0))

    let esOrtogonal = true

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) {
          productosEscalares[i][j] = this.vectorService.calcularMagnitud(vectores[i]).resultado as number
        } else {
          const dotProduct = this.vectorService.productoEscalar(vectores[i], vectores[j]).resultado as number
          productosEscalares[i][j] = dotProduct

          if (Math.abs(dotProduct) > 0.0001) {
            esOrtogonal = false
          }
        }
      }
    }

    return {
      esOrtogonal,
      productosEscalares,
      explicacion: esOrtogonal
        ? "Todos los vectores son ortogonales entre sí (productos escalares ≈ 0)"
        : "Los vectores NO son ortogonales (algunos productos escalares ≠ 0)",
    }
  }

  // Verificar si un conjunto de vectores es ortonormal
  esConjuntoOrtonormal(vectores: Vector3D[]): {
    esOrtonormal: boolean
    magnitudes: number[]
    explicacion: string
  } {
    const ortogonalidad = this.esConjuntoOrtogonal(vectores)

    if (!ortogonalidad.esOrtogonal) {
      return {
        esOrtonormal: false,
        magnitudes: [],
        explicacion: "Los vectores no son ortonormales porque no son ortogonales",
      }
    }

    const magnitudes = vectores.map((v) => this.vectorService.calcularMagnitud(v).resultado as number)

    const todasUnitarias = magnitudes.every((mag) => Math.abs(mag - 1) < 0.0001)

    return {
      esOrtonormal: todasUnitarias,
      magnitudes,
      explicacion: todasUnitarias
        ? "Los vectores son ortonormales (ortogonales y unitarios)"
        : "Los vectores son ortogonales pero no todos son unitarios",
    }
  }
}
