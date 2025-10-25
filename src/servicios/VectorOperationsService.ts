/**
 * SERVICIO: VectorOperationsService
 * RESPONSABILIDAD ÚNICA: Realizar operaciones matemáticas con vectores
 * RAZÓN PARA CAMBIAR: Solo si cambian las reglas de cálculo vectorial
 */
import { Vector3D } from "../entidades/Vector3D"

export interface ResultadoOperacion {
  resultado: Vector3D | number
  pasos: string[]
  explicacion: string
}

export class VectorOperationsService {
  // RF-003: Suma de vectores
  sumar(v1: Vector3D, v2: Vector3D): ResultadoOperacion {
    const resultado = new Vector3D(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z, `${v1.nombre || "A"} + ${v2.nombre || "B"}`)

    const pasos = [
      `Vector A: ${v1.toString()}`,
      `Vector B: ${v2.toString()}`,
      `Suma componente X: ${v1.x} + ${v2.x} = ${resultado.x}`,
      `Suma componente Y: ${v1.y} + ${v2.y} = ${resultado.y}`,
      `Suma componente Z: ${v1.z} + ${v2.z} = ${resultado.z}`,
      `Resultado: ${resultado.toString()}`,
    ]

    return {
      resultado,
      pasos,
      explicacion: "La suma de vectores se realiza sumando cada componente correspondiente.",
    }
  }

  // RF-003: Resta de vectores
  restar(v1: Vector3D, v2: Vector3D): ResultadoOperacion {
    const resultado = new Vector3D(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z, `${v1.nombre || "A"} - ${v2.nombre || "B"}`)

    const pasos = [
      `Vector A: ${v1.toString()}`,
      `Vector B: ${v2.toString()}`,
      `Resta componente X: ${v1.x} - ${v2.x} = ${resultado.x}`,
      `Resta componente Y: ${v1.y} - ${v2.y} = ${resultado.y}`,
      `Resta componente Z: ${v1.z} - ${v2.z} = ${resultado.z}`,
      `Resultado: ${resultado.toString()}`,
    ]

    return {
      resultado,
      pasos,
      explicacion: "La resta de vectores se realiza restando cada componente correspondiente.",
    }
  }

  // RF-008: Multiplicación por escalar
  multiplicarPorEscalar(v: Vector3D, escalar: number): ResultadoOperacion {
    const resultado = new Vector3D(
      v.x * escalar,
      v.y * escalar,
      v.z * escalar,
      `${escalar} × ${v.nombre || "A"}`,
    )

    const pasos = [
      `Vector: ${v.toString()}`,
      `Escalar: ${escalar}`,
      `Componente X: ${v.x} × ${escalar} = ${resultado.x}`,
      `Componente Y: ${v.y} × ${escalar} = ${resultado.y}`,
      `Componente Z: ${v.z} × ${escalar} = ${resultado.z}`,
      `Resultado: ${resultado.toString()}`,
    ]

    return {
      resultado,
      pasos,
      explicacion: "La multiplicación por escalar se realiza multiplicando cada componente por el escalar.",
    }
  }

  // RF-008: Producto escalar (dot product)
  productoEscalar(v1: Vector3D, v2: Vector3D): ResultadoOperacion {
    const resultado = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z

    const pasos = [
      `Vector A: ${v1.toString()}`,
      `Vector B: ${v2.toString()}`,
      `Producto X: ${v1.x} × ${v2.x} = ${v1.x * v2.x}`,
      `Producto Y: ${v1.y} × ${v2.y} = ${v1.y * v2.y}`,
      `Producto Z: ${v1.z} × ${v2.z} = ${v1.z * v2.z}`,
      `Suma total: ${v1.x * v2.x} + ${v1.y * v2.y} + ${v1.z * v2.z} = ${resultado}`,
    ]

    return {
      resultado,
      pasos,
      explicacion: "El producto escalar es la suma de los productos de las componentes correspondientes.",
    }
  }

  // RF-008: Producto cruz (cross product)
  productoCruz(v1: Vector3D, v2: Vector3D): ResultadoOperacion {
    const resultado = new Vector3D(
      v1.y * v2.z - v1.z * v2.y,
      v1.z * v2.x - v1.x * v2.z,
      v1.x * v2.y - v1.y * v2.x,
      `${v1.nombre || "A"} × ${v2.nombre || "B"}`,
    )

    const pasos = [
      `Vector A: ${v1.toString()}`,
      `Vector B: ${v2.toString()}`,
      `Componente X: (${v1.y} × ${v2.z}) - (${v1.z} × ${v2.y}) = ${resultado.x}`,
      `Componente Y: (${v1.z} × ${v2.x}) - (${v1.x} × ${v2.z}) = ${resultado.y}`,
      `Componente Z: (${v1.x} × ${v2.y}) - (${v1.y} × ${v2.x}) = ${resultado.z}`,
      `Resultado: ${resultado.toString()}`,
    ]

    return {
      resultado,
      pasos,
      explicacion: "El producto cruz genera un vector perpendicular a ambos vectores originales.",
    }
  }

  // Calcular magnitud de un vector
  calcularMagnitud(v: Vector3D): ResultadoOperacion {
    const magnitud = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z)

    const pasos = [
      `Vector: ${v.toString()}`,
      `Fórmula: ||v|| = √(x² + y² + z²)`,
      `Cálculo: √(${v.x}² + ${v.y}² + ${v.z}²)`,
      `Cálculo: √(${v.x * v.x} + ${v.y * v.y} + ${v.z * v.z})`,
      `Resultado: ${magnitud.toFixed(4)}`,
    ]

    return {
      resultado: magnitud,
      pasos,
      explicacion: "La magnitud es la longitud del vector, calculada con el teorema de Pitágoras.",
    }
  }

  // RF-008: Calcular ángulo entre vectores
  calcularAngulo(v1: Vector3D, v2: Vector3D): ResultadoOperacion {
    const dotProduct = this.productoEscalar(v1, v2).resultado as number
    const mag1 = this.calcularMagnitud(v1).resultado as number
    const mag2 = this.calcularMagnitud(v2).resultado as number

    const cosAngulo = dotProduct / (mag1 * mag2)
    const anguloRadianes = Math.acos(cosAngulo)
    const anguloGrados = (anguloRadianes * 180) / Math.PI

    const pasos = [
      `Vector A: ${v1.toString()}`,
      `Vector B: ${v2.toString()}`,
      `Producto escalar: ${dotProduct.toFixed(4)}`,
      `Magnitud A: ${mag1.toFixed(4)}`,
      `Magnitud B: ${mag2.toFixed(4)}`,
      `cos(θ) = ${cosAngulo.toFixed(4)}`,
      `θ = ${anguloGrados.toFixed(2)}°`,
    ]

    return {
      resultado: anguloGrados,
      pasos,
      explicacion: "El ángulo entre vectores se calcula usando el producto escalar y las magnitudes.",
    }
  }

  // RF-008: Proyección de un vector sobre otro
  proyectar(v1: Vector3D, v2: Vector3D): ResultadoOperacion {
    const dotProduct = this.productoEscalar(v1, v2).resultado as number
    const mag2Squared = v2.x * v2.x + v2.y * v2.y + v2.z * v2.z

    const escalar = dotProduct / mag2Squared
    const proyeccion = new Vector3D(
      escalar * v2.x,
      escalar * v2.y,
      escalar * v2.z,
      `proy_${v2.nombre || "B"}(${v1.nombre || "A"})`,
    )

    const pasos = [
      `Vector A: ${v1.toString()}`,
      `Vector B: ${v2.toString()}`,
      `Producto escalar A·B: ${dotProduct.toFixed(4)}`,
      `Magnitud² de B: ${mag2Squared.toFixed(4)}`,
      `Escalar: ${escalar.toFixed(4)}`,
      `Proyección: ${proyeccion.toString()}`,
    ]

    return {
      resultado: proyeccion,
      pasos,
      explicacion: "La proyección de A sobre B es la componente de A en la dirección de B.",
    }
  }

  // RF-006: Verificar dependencia lineal
  verificarDependenciaLineal(vectores: Vector3D[]): {
    dependiente: boolean
    explicacion: string
    vectoresRedundantes: number[]
  } {
    if (vectores.length === 0) {
      return {
        dependiente: false,
        explicacion: "No hay vectores para analizar",
        vectoresRedundantes: [],
      }
    }

    // Implementación simplificada para 2D/3D
    if (vectores.length > 3) {
      return {
        dependiente: true,
        explicacion: "Más de 3 vectores en R³ siempre son linealmente dependientes",
        vectoresRedundantes: [3],
      }
    }

    // Para 2 vectores: verificar si son paralelos
    if (vectores.length === 2) {
      const v1 = vectores[0]
      const v2 = vectores[1]
      const cruz = this.productoCruz(v1, v2).resultado as Vector3D
      const magnitudCruz = this.calcularMagnitud(cruz).resultado as number

      if (magnitudCruz < 0.0001) {
        return {
          dependiente: true,
          explicacion: "Los vectores son paralelos (linealmente dependientes)",
          vectoresRedundantes: [1],
        }
      }
    }

    return {
      dependiente: false,
      explicacion: "Los vectores son linealmente independientes",
      vectoresRedundantes: [],
    }
  }

  // RF-008: Verificar ortogonalidad
  sonOrtogonales(v1: Vector3D, v2: Vector3D): boolean {
    const dotProduct = this.productoEscalar(v1, v2).resultado as number
    return Math.abs(dotProduct) < 0.0001
  }

  // RF-003: Suma de múltiples vectores
  sumarMultiples(vectores: Vector3D[]): ResultadoOperacion {
    if (vectores.length === 0) {
      throw new Error("Debe proporcionar al menos un vector")
    }

    if (vectores.length === 1) {
      return {
        resultado: vectores[0],
        pasos: [`Vector único: ${vectores[0].toString()}`],
        explicacion: "Un solo vector no requiere suma.",
      }
    }

    let x = 0
    let y = 0
    let z = 0
    const pasos: string[] = ["Sumando múltiples vectores:"]

    vectores.forEach((v, i) => {
      pasos.push(`Vector ${i + 1}: ${v.toString()}`)
      x += v.x
      y += v.y
      z += v.z
    })

    pasos.push(`Suma X: ${vectores.map((v) => v.x).join(" + ")} = ${x}`)
    pasos.push(`Suma Y: ${vectores.map((v) => v.y).join(" + ")} = ${y}`)
    pasos.push(`Suma Z: ${vectores.map((v) => v.z).join(" + ")} = ${z}`)

    const resultado = new Vector3D(x, y, z, "Suma Total")
    pasos.push(`Resultado: ${resultado.toString()}`)

    return {
      resultado,
      pasos,
      explicacion: `La suma de ${vectores.length} vectores se realiza sumando todas las componentes correspondientes.`,
    }
  }

  // Verificar si un conjunto forma base
  verificarBase(vectores: Vector3D[]): {
    esBase: boolean
    dimension: number
    explicacion: string
    baseAlternativa?: Vector3D[]
    sugerencias: string[]
  } {
    if (vectores.length === 0) {
      return {
        esBase: false,
        dimension: 0,
        explicacion: "No hay vectores para analizar",
        sugerencias: ["Agregue al menos un vector para formar una base"]
      }
    }

    // Verificar dependencia lineal
    const dependencia = this.verificarDependenciaLineal(vectores)
    
    // Determinar dimensión del espacio
    let dimension = 0
    if (vectores.length === 1 && !dependencia.dependiente) {
      dimension = 1 // Línea
    } else if (vectores.length === 2 && !dependencia.dependiente) {
      dimension = 2 // Plano
    } else if (vectores.length === 3 && !dependencia.dependiente) {
      dimension = 3 // Espacio 3D
    } else if (vectores.length > 3) {
      dimension = 3 // Máximo 3D
    }

    // Generar base alternativa
    const baseAlternativa = this.generarBaseAlternativa(dimension)
    
    // Generar sugerencias
    const sugerencias = this.generarSugerencias(vectores, dependencia, dimension)

    return {
      esBase: !dependencia.dependiente && vectores.length === dimension,
      dimension,
      explicacion: this.generarExplicacionBase(vectores, dependencia, dimension),
      baseAlternativa,
      sugerencias
    }
  }

  // Generar base alternativa
  private generarBaseAlternativa(dimension: number): Vector3D[] {
    const bases = {
      1: [new Vector3D(1, 0, 0, "e₁")],
      2: [
        new Vector3D(1, 0, 0, "e₁"),
        new Vector3D(0, 1, 0, "e₂")
      ],
      3: [
        new Vector3D(1, 0, 0, "e₁"),
        new Vector3D(0, 1, 0, "e₂"),
        new Vector3D(0, 0, 1, "e₃")
      ]
    }
    
    return bases[dimension as keyof typeof bases] || []
  }

  // Generar sugerencias
  private generarSugerencias(vectores: Vector3D[], dependencia: any, dimension: number): string[] {
    const sugerencias: string[] = []
    
    if (dependencia.dependiente) {
      sugerencias.push("• Elimine vectores redundantes para obtener independencia lineal")
      sugerencias.push("• Use la base canónica como alternativa")
    }
    
    if (vectores.length < dimension) {
      sugerencias.push(`• Agregue ${dimension - vectores.length} vector(es) más para completar la base`)
    }
    
    if (vectores.length > dimension) {
      sugerencias.push(`• Elimine ${vectores.length - dimension} vector(es) para obtener una base`)
    }
    
    if (dimension === 1) {
      sugerencias.push("• Para R¹: use un vector no nulo")
    } else if (dimension === 2) {
      sugerencias.push("• Para R²: use dos vectores no paralelos")
    } else if (dimension === 3) {
      sugerencias.push("• Para R³: use tres vectores no coplanares")
    }
    
    return sugerencias
  }

  // Generar explicación de la base
  private generarExplicacionBase(vectores: Vector3D[], dependencia: any, dimension: number): string {
    if (dependencia.dependiente) {
      return `Los vectores son linealmente dependientes. No forman una base. Dimensión del espacio: ${dimension}`
    }
    
    if (vectores.length === dimension) {
      return `Los vectores son linealmente independientes y forman una base de R${dimension}`
    }
    
    if (vectores.length < dimension) {
      return `Los vectores son independientes pero insuficientes. Necesita ${dimension - vectores.length} vector(es) más para formar una base de R${dimension}`
    }
    
    return `Los vectores son independientes pero exceden la dimensión. Forman una base de R${dimension}`
  }
}
