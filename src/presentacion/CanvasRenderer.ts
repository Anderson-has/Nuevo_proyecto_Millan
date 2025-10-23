/**
 * PRESENTACIÓN: CanvasRenderer
 * RESPONSABILIDAD ÚNICA: Renderizar elementos en un canvas HTML5
 * RAZÓN PARA CAMBIAR: Solo si cambia cómo se dibuja en el canvas
 */
import { Vector3D } from "../entidades/Vector3D"

export interface ConfiguracionCanvas {
  ancho: number
  alto: number
  escala: number
  mostrarCuadricula: boolean
  mostrarEjes: boolean
  colorFondo: string
  colorCuadricula: string
  colorEjes: string
}

export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D
  private config: ConfiguracionCanvas

  constructor(canvas: HTMLCanvasElement, config: Partial<ConfiguracionCanvas> = {}) {
    const context = canvas.getContext("2d")
    if (!context) {
      throw new Error("No se pudo obtener el contexto 2D del canvas")
    }
    this.ctx = context

    this.config = {
      ancho: canvas.width,
      alto: canvas.height,
      escala: 20,
      mostrarCuadricula: true,
      mostrarEjes: true,
      colorFondo: "#ffffff",
      colorCuadricula: "#e0e0e0",
      colorEjes: "#000000",
      ...config,
    }
  }

  // RF-004: Limpiar el canvas
  limpiar(): void {
    this.ctx.fillStyle = this.config.colorFondo
    this.ctx.fillRect(0, 0, this.config.ancho, this.config.alto)
  }

  // RF-004: Dibujar cuadrícula
  dibujarCuadricula(): void {
    if (!this.config.mostrarCuadricula) return

    const { ancho, alto, escala } = this.config
    const centroX = ancho / 2
    const centroY = alto / 2

    this.ctx.strokeStyle = this.config.colorCuadricula
    this.ctx.lineWidth = 0.5

    // Líneas verticales
    for (let x = centroX % escala; x < ancho; x += escala) {
      this.ctx.beginPath()
      this.ctx.moveTo(x, 0)
      this.ctx.lineTo(x, alto)
      this.ctx.stroke()
    }

    // Líneas horizontales
    for (let y = centroY % escala; y < alto; y += escala) {
      this.ctx.beginPath()
      this.ctx.moveTo(0, y)
      this.ctx.lineTo(ancho, y)
      this.ctx.stroke()
    }
  }

  // RF-004: Dibujar ejes cartesianos
  dibujarEjes(): void {
    if (!this.config.mostrarEjes) return

    const { ancho, alto } = this.config
    const centroX = ancho / 2
    const centroY = alto / 2

    this.ctx.strokeStyle = this.config.colorEjes
    this.ctx.lineWidth = 2

    // Eje X
    this.ctx.beginPath()
    this.ctx.moveTo(0, centroY)
    this.ctx.lineTo(ancho, centroY)
    this.ctx.stroke()

    // Eje Y
    this.ctx.beginPath()
    this.ctx.moveTo(centroX, 0)
    this.ctx.lineTo(centroX, alto)
    this.ctx.stroke()

    // Flechas
    this.dibujarFlecha(ancho - 10, centroY, ancho, centroY)
    this.dibujarFlecha(centroX, 10, centroX, 0)

    // Etiquetas
    this.ctx.fillStyle = this.config.colorEjes
    this.ctx.font = "14px Arial"
    this.ctx.fillText("X", ancho - 20, centroY - 10)
    this.ctx.fillText("Y", centroX + 10, 20)
  }

  // RF-003, RF-016: Dibujar vector
  dibujarVector(vector: Vector3D, color = "#2196F3", origen: Vector3D = new Vector3D(0, 0, 0)): void {
    const { ancho, alto, escala } = this.config
    const centroX = ancho / 2
    const centroY = alto / 2

    // Convertir coordenadas matemáticas a coordenadas de canvas
    const x1 = centroX + origen.x * escala
    const y1 = centroY - origen.y * escala
    const x2 = centroX + (origen.x + vector.x) * escala
    const y2 = centroY - (origen.y + vector.y) * escala

    // Dibujar línea del vector
    this.ctx.strokeStyle = color
    this.ctx.lineWidth = 2
    this.ctx.beginPath()
    this.ctx.moveTo(x1, y1)
    this.ctx.lineTo(x2, y2)
    this.ctx.stroke()

    // Dibujar flecha
    this.dibujarFlecha(x1, y1, x2, y2, color)

    // Dibujar etiqueta
    if (vector.nombre) {
      this.ctx.fillStyle = color
      this.ctx.font = "bold 12px Arial"
      this.ctx.fillText(vector.nombre, x2 + 5, y2 - 5)
    }

    // Dibujar coordenadas
    this.ctx.fillStyle = color
    this.ctx.font = "10px Arial"
    this.ctx.fillText(vector.toString(), x2 + 5, y2 + 15)
  }

  // RF-004: Dibujar punto
  dibujarPunto(x: number, y: number, color = "#F44336", radio = 4, etiqueta?: string): void {
    const { ancho, alto, escala } = this.config
    const centroX = ancho / 2
    const centroY = alto / 2

    const canvasX = centroX + x * escala
    const canvasY = centroY - y * escala

    this.ctx.fillStyle = color
    this.ctx.beginPath()
    this.ctx.arc(canvasX, canvasY, radio, 0, 2 * Math.PI)
    this.ctx.fill()

    if (etiqueta) {
      this.ctx.fillStyle = color
      this.ctx.font = "bold 12px Arial"
      this.ctx.fillText(etiqueta, canvasX + 8, canvasY - 8)
    }
  }

  // RF-011: Dibujar segmento de recta
  dibujarSegmento(p1: Vector3D, p2: Vector3D, color = "#4CAF50", grosor = 2): void {
    const { ancho, alto, escala } = this.config
    const centroX = ancho / 2
    const centroY = alto / 2

    const x1 = centroX + p1.x * escala
    const y1 = centroY - p1.y * escala
    const x2 = centroX + p2.x * escala
    const y2 = centroY - p2.y * escala

    this.ctx.strokeStyle = color
    this.ctx.lineWidth = grosor
    this.ctx.beginPath()
    this.ctx.moveTo(x1, y1)
    this.ctx.lineTo(x2, y2)
    this.ctx.stroke()

    // Dibujar puntos extremos
    this.dibujarPunto(p1.x, p1.y, color, 3)
    this.dibujarPunto(p2.x, p2.y, color, 3)
  }

  // Dibujar flecha
  private dibujarFlecha(x1: number, y1: number, x2: number, y2: number, color = "#000000"): void {
    const headLength = 10
    const angle = Math.atan2(y2 - y1, x2 - x1)

    this.ctx.strokeStyle = color
    this.ctx.fillStyle = color
    this.ctx.lineWidth = 2

    this.ctx.beginPath()
    this.ctx.moveTo(x2, y2)
    this.ctx.lineTo(x2 - headLength * Math.cos(angle - Math.PI / 6), y2 - headLength * Math.sin(angle - Math.PI / 6))
    this.ctx.moveTo(x2, y2)
    this.ctx.lineTo(x2 - headLength * Math.cos(angle + Math.PI / 6), y2 - headLength * Math.sin(angle + Math.PI / 6))
    this.ctx.stroke()
  }

  // Convertir coordenadas de canvas a coordenadas matemáticas
  canvasACoordenadas(canvasX: number, canvasY: number): { x: number; y: number } {
    const { ancho, alto, escala } = this.config
    const centroX = ancho / 2
    const centroY = alto / 2

    return {
      x: (canvasX - centroX) / escala,
      y: (centroY - canvasY) / escala,
    }
  }

  // Actualizar configuración
  actualizarConfiguracion(config: Partial<ConfiguracionCanvas>): void {
    this.config = { ...this.config, ...config }
  }

  // Renderizar escena completa
  renderizarEscena(): void {
    this.limpiar()
    this.dibujarCuadricula()
    this.dibujarEjes()
  }

  // Dibujar plano cartesiano (alias para renderizarEscena)
  dibujarPlanoCartesiano(): void {
    this.renderizarEscena()
  }
}
