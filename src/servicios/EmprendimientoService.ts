/**
 * SERVICIO: EmprendimientoService
 * RESPONSABILIDAD ÚNICA: Calcular métricas financieras del caso de emprendimiento
 * RAZÓN PARA CAMBIAR: Solo si cambian las reglas de cálculo financiero
 */
import type { OpcionNegocio } from "../entidades/CasoEmprendimiento"

export interface AnalisisFinanciero {
  puntoEquilibrio: number
  utilidadMensual: number
  margenUtilidad: number
  retornoInversion: number // meses
  viabilidad: "alta" | "media" | "baja"
  recomendaciones: string[]
}

export class EmprendimientoService {
  // Calcular punto de equilibrio
  calcularPuntoEquilibrio(opcion: OpcionNegocio): number {
    const costosFijos = opcion.alquilerMensual
    const margenContribucion = opcion.precioVenta - opcion.costoUnitario

    if (margenContribucion <= 0) {
      return Number.POSITIVE_INFINITY
    }

    return Math.ceil(costosFijos / margenContribucion)
  }

  // Calcular utilidad mensual
  calcularUtilidadMensual(opcion: OpcionNegocio): number {
    const ingresosTotales = opcion.ventasEstimadas * opcion.precioVenta
    const costosTotales = opcion.ventasEstimadas * opcion.costoUnitario + opcion.alquilerMensual

    return ingresosTotales - costosTotales
  }

  // Calcular margen de utilidad
  calcularMargenUtilidad(opcion: OpcionNegocio): number {
    const utilidad = this.calcularUtilidadMensual(opcion)
    const ingresosTotales = opcion.ventasEstimadas * opcion.precioVenta

    if (ingresosTotales === 0) return 0

    return (utilidad / ingresosTotales) * 100
  }

  // Calcular retorno de inversión (en meses)
  calcularRetornoInversion(opcion: OpcionNegocio): number {
    const utilidadMensual = this.calcularUtilidadMensual(opcion)

    if (utilidadMensual <= 0) {
      return Number.POSITIVE_INFINITY
    }

    return opcion.inversionInicial / utilidadMensual
  }

  // Realizar análisis completo
  analizarOpcion(opcion: OpcionNegocio): AnalisisFinanciero {
    const puntoEquilibrio = this.calcularPuntoEquilibrio(opcion)
    const utilidadMensual = this.calcularUtilidadMensual(opcion)
    const margenUtilidad = this.calcularMargenUtilidad(opcion)
    const retornoInversion = this.calcularRetornoInversion(opcion)

    // Determinar viabilidad
    let viabilidad: "alta" | "media" | "baja" = "baja"
    if (utilidadMensual > 0 && margenUtilidad > 20 && retornoInversion < 12) {
      viabilidad = "alta"
    } else if (utilidadMensual > 0 && retornoInversion < 24) {
      viabilidad = "media"
    }

    // Generar recomendaciones
    const recomendaciones: string[] = []

    if (puntoEquilibrio > opcion.ventasEstimadas) {
      recomendaciones.push(`Necesitas vender al menos ${puntoEquilibrio} unidades para cubrir costos`)
    }

    if (margenUtilidad < 15) {
      recomendaciones.push("El margen de utilidad es bajo, considera reducir costos o aumentar precios")
    }

    if (retornoInversion > 24) {
      recomendaciones.push("El retorno de inversión es muy largo, evalúa otras opciones")
    }

    if (utilidadMensual < 0) {
      recomendaciones.push("Esta opción genera pérdidas, no es viable sin cambios significativos")
    }

    return {
      puntoEquilibrio,
      utilidadMensual,
      margenUtilidad,
      retornoInversion,
      viabilidad,
      recomendaciones,
    }
  }

  // Comparar dos opciones
  compararOpciones(
    opcion1: OpcionNegocio,
    opcion2: OpcionNegocio,
  ): {
    mejorOpcion: string
    razon: string
    diferencias: string[]
  } {
    const analisis1 = this.analizarOpcion(opcion1)
    const analisis2 = this.analizarOpcion(opcion2)

    const diferencias: string[] = []

    diferencias.push(
      `Utilidad mensual: ${opcion1.nombre} $${analisis1.utilidadMensual.toFixed(0)} vs ${opcion2.nombre} $${analisis2.utilidadMensual.toFixed(0)}`,
    )

    diferencias.push(
      `Retorno de inversión: ${opcion1.nombre} ${analisis1.retornoInversion.toFixed(1)} meses vs ${opcion2.nombre} ${analisis2.retornoInversion.toFixed(1)} meses`,
    )

    diferencias.push(
      `Margen de utilidad: ${opcion1.nombre} ${analisis1.margenUtilidad.toFixed(1)}% vs ${opcion2.nombre} ${analisis2.margenUtilidad.toFixed(1)}%`,
    )

    // Determinar mejor opción
    let mejorOpcion = opcion1.nombre
    let razon = ""

    if (analisis1.utilidadMensual > analisis2.utilidadMensual) {
      razon = `${opcion1.nombre} genera mayor utilidad mensual`
    } else if (analisis2.utilidadMensual > analisis1.utilidadMensual) {
      mejorOpcion = opcion2.nombre
      razon = `${opcion2.nombre} genera mayor utilidad mensual`
    } else if (analisis1.retornoInversion < analisis2.retornoInversion) {
      razon = `${opcion1.nombre} recupera la inversión más rápido`
    } else {
      mejorOpcion = opcion2.nombre
      razon = `${opcion2.nombre} recupera la inversión más rápido`
    }

    return {
      mejorOpcion,
      razon,
      diferencias,
    }
  }
}
