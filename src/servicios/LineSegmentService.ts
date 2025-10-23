/**
 * SERVICIO: LineSegmentService
 * RESPONSABILIDAD ÚNICA: Realizar operaciones con segmentos de recta
 * RAZÓN PARA CAMBIAR: Solo si cambian las reglas de geometría analítica
 */
import type { SegmentoRecta } from "../entidades/SegmentoRecta"
import { Vector3D } from "../entidades/Vector3D"

export interface ResultadoSegmento {
  resultado: number | Vector3D | string
  pasos: string[]
  explicacion: string
}

export class LineSegmentService {
  // Calcular longitud del segmento
  calcularLongitud(segmento: SegmentoRecta): ResultadoSegmento {
    const dx = segmento.puntoFinal.x - segmento.puntoInicial.x
    const dy = segmento.puntoFinal.y - segmento.puntoInicial.y
    const dz = segmento.puntoFinal.z - segmento.puntoInicial.z

    const longitud = Math.sqrt(dx * dx + dy * dy + dz * dz)

    const pasos = [
      `Punto inicial: ${segmento.puntoInicial.toString()}`,
      `Punto final: ${segmento.puntoFinal.toString()}`,
      `Diferencias: Δx=${dx}, Δy=${dy}, Δz=${dz}`,
      `Fórmula: d = √(Δx² + Δy² + Δz²)`,
      `Cálculo: d = √(${dx}² + ${dy}² + ${dz}²)`,
      `Cálculo: d = √(${dx * dx} + ${dy * dy} + ${dz * dz})`,
      `Resultado: d = ${longitud.toFixed(4)}`,
    ]

    return {
      resultado: longitud,
      pasos,
      explicacion: "La longitud del segmento se calcula usando la fórmula de distancia euclidiana en 3D.",
    }
  }

  // Calcular punto medio
  calcularPuntoMedio(segmento: SegmentoRecta): ResultadoSegmento {
    const mx = (segmento.puntoInicial.x + segmento.puntoFinal.x) / 2
    const my = (segmento.puntoInicial.y + segmento.puntoFinal.y) / 2
    const mz = (segmento.puntoInicial.z + segmento.puntoFinal.z) / 2

    const puntoMedio = new Vector3D(mx, my, mz, "Punto Medio")

    const pasos = [
      `Punto inicial: ${segmento.puntoInicial.toString()}`,
      `Punto final: ${segmento.puntoFinal.toString()}`,
      `Fórmula: M = ((x₁+x₂)/2, (y₁+y₂)/2, (z₁+z₂)/2)`,
      `Mx = (${segmento.puntoInicial.x} + ${segmento.puntoFinal.x}) / 2 = ${mx}`,
      `My = (${segmento.puntoInicial.y} + ${segmento.puntoFinal.y}) / 2 = ${my}`,
      `Mz = (${segmento.puntoInicial.z} + ${segmento.puntoFinal.z}) / 2 = ${mz}`,
      `Punto medio: ${puntoMedio.toString()}`,
    ]

    return {
      resultado: puntoMedio,
      pasos,
      explicacion: "El punto medio es el promedio de las coordenadas de los extremos del segmento.",
    }
  }

  // Calcular vector director
  calcularVectorDirector(segmento: SegmentoRecta): ResultadoSegmento {
    const dx = segmento.puntoFinal.x - segmento.puntoInicial.x
    const dy = segmento.puntoFinal.y - segmento.puntoInicial.y
    const dz = segmento.puntoFinal.z - segmento.puntoInicial.z

    const vectorDirector = new Vector3D(dx, dy, dz, "Vector Director")

    const pasos = [
      `Punto inicial: ${segmento.puntoInicial.toString()}`,
      `Punto final: ${segmento.puntoFinal.toString()}`,
      `Fórmula: v = P₂ - P₁`,
      `vx = ${segmento.puntoFinal.x} - ${segmento.puntoInicial.x} = ${dx}`,
      `vy = ${segmento.puntoFinal.y} - ${segmento.puntoInicial.y} = ${dy}`,
      `vz = ${segmento.puntoFinal.z} - ${segmento.puntoInicial.z} = ${dz}`,
      `Vector director: ${vectorDirector.toString()}`,
    ]

    return {
      resultado: vectorDirector,
      pasos,
      explicacion: "El vector director indica la dirección y sentido del segmento.",
    }
  }

  // Ecuación paramétrica
  obtenerEcuacionParametrica(segmento: SegmentoRecta): ResultadoSegmento {
    const v = this.calcularVectorDirector(segmento).resultado as Vector3D
    const p0 = segmento.puntoInicial

    const ecuacion = `P(t) = (${p0.x}, ${p0.y}, ${p0.z}) + t(${v.x}, ${v.y}, ${v.z}), donde 0 ≤ t ≤ 1`

    const pasos = [
      `Punto inicial P₀: ${p0.toString()}`,
      `Vector director v: ${v.toString()}`,
      `Fórmula general: P(t) = P₀ + tv`,
      `Forma paramétrica:`,
      `  x(t) = ${p0.x} + ${v.x}t`,
      `  y(t) = ${p0.y} + ${v.y}t`,
      `  z(t) = ${p0.z} + ${v.z}t`,
      `Donde t ∈ [0, 1]`,
      `  t=0 → Punto inicial`,
      `  t=1 → Punto final`,
      `  t=0.5 → Punto medio`,
    ]

    return {
      resultado: ecuacion,
      pasos,
      explicacion: "La ecuación paramétrica describe todos los puntos del segmento usando un parámetro t entre 0 y 1.",
    }
  }

  // Verificar si un punto está en el segmento
  puntoEnSegmento(segmento: SegmentoRecta, punto: Vector3D, tolerancia = 0.001): ResultadoSegmento {
    const v = this.calcularVectorDirector(segmento).resultado as Vector3D
    const w = new Vector3D(
      punto.x - segmento.puntoInicial.x,
      punto.y - segmento.puntoInicial.y,
      punto.z - segmento.puntoInicial.z,
    )

    // Calcular t
    const vMagSq = v.x * v.x + v.y * v.y + v.z * v.z
    const t = (w.x * v.x + w.y * v.y + w.z * v.z) / vMagSq

    const pasos = [
      `Segmento: ${segmento.toString()}`,
      `Punto a verificar: ${punto.toString()}`,
      `Vector director v: ${v.toString()}`,
      `Vector w = P - P₀: (${w.x}, ${w.y}, ${w.z})`,
      `Calculando parámetro t = (w·v) / ||v||²`,
      `t = ${t.toFixed(4)}`,
    ]

    if (t < 0 || t > 1) {
      pasos.push(`t está fuera del rango [0,1]`)
      pasos.push(`El punto NO está en el segmento`)
      return {
        resultado: "NO",
        pasos,
        explicacion: "El punto no pertenece al segmento porque el parámetro t está fuera del rango válido.",
      }
    }

    // Verificar si el punto calculado coincide con el punto dado
    const puntoCalculado = new Vector3D(
      segmento.puntoInicial.x + t * v.x,
      segmento.puntoInicial.y + t * v.y,
      segmento.puntoInicial.z + t * v.z,
    )

    const distancia = Math.sqrt(
      Math.pow(punto.x - puntoCalculado.x, 2) +
        Math.pow(punto.y - puntoCalculado.y, 2) +
        Math.pow(punto.z - puntoCalculado.z, 2),
    )

    pasos.push(`Punto calculado con t=${t.toFixed(4)}: ${puntoCalculado.toString()}`)
    pasos.push(`Distancia al punto dado: ${distancia.toFixed(6)}`)

    if (distancia < tolerancia) {
      pasos.push(`La distancia es menor que la tolerancia (${tolerancia})`)
      pasos.push(`El punto SÍ está en el segmento`)
      return {
        resultado: "SÍ",
        pasos,
        explicacion: "El punto pertenece al segmento porque está dentro del rango y la distancia es mínima.",
      }
    } else {
      pasos.push(`La distancia es mayor que la tolerancia`)
      pasos.push(`El punto NO está en el segmento`)
      return {
        resultado: "NO",
        pasos,
        explicacion: "El punto no pertenece al segmento porque la distancia es significativa.",
      }
    }
  }

  // Dividir segmento en n partes iguales
  dividirSegmento(segmento: SegmentoRecta, n: number): ResultadoSegmento {
    if (n < 2) {
      throw new Error("El número de divisiones debe ser al menos 2")
    }

    const puntos: Vector3D[] = []
    const pasos = [`Dividiendo el segmento en ${n} partes iguales:`]

    for (let i = 0; i <= n; i++) {
      const t = i / n
      const x = segmento.puntoInicial.x + t * (segmento.puntoFinal.x - segmento.puntoInicial.x)
      const y = segmento.puntoInicial.y + t * (segmento.puntoFinal.y - segmento.puntoInicial.y)
      const z = segmento.puntoInicial.z + t * (segmento.puntoFinal.z - segmento.puntoInicial.z)

      const punto = new Vector3D(x, y, z, `P${i}`)
      puntos.push(punto)
      pasos.push(`t=${t.toFixed(2)}: ${punto.toString()}`)
    }

    return {
      resultado: `${puntos.length} puntos generados`,
      pasos,
      explicacion: `El segmento se dividió en ${n} partes iguales generando ${n + 1} puntos.`,
    }
  }
}
