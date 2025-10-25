"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, BookOpen, Calculator, Lightbulb, HelpCircle } from "lucide-react"
import { LineSegmentService } from "@/src/servicios/LineSegmentService"
import { SegmentoRecta } from "@/src/entidades/SegmentoRecta"
import { Vector3D } from "@/src/entidades/Vector3D"
import { CanvasRenderer } from "@/src/presentacion/CanvasRenderer"
import { Progreso } from "@/src/entidades/Progreso"

export default function SegmentosPage() {
  const router = useRouter()
  const { progreso, actualizarProgreso } = useAuth()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [renderer, setRenderer] = useState<CanvasRenderer | null>(null)
  const [service] = useState(() => new LineSegmentService())

  const [p1, setP1] = useState({ x: "0", y: "0", z: "0" })
  const [p2, setP2] = useState({ x: "4", y: "3", z: "0" })
  const [resultado, setResultado] = useState<any>(null)
  const [pasos, setPasos] = useState<string[]>([])
  const [operacion, setOperacion] = useState<string>("")
  const [modoGuiado, setModoGuiado] = useState(false)
  const [notaActual, setNotaActual] = useState("")

  useEffect(() => {
    const initializeCanvas = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current
        console.log("Inicializando canvas de segmentos...", canvas)
        
        // Asegurar que el canvas tenga el tamaño correcto
        canvas.width = 600
        canvas.height = 600
        
        try {
          const newRenderer = new CanvasRenderer(canvas)
          console.log("Renderer de segmentos creado:", newRenderer)
          newRenderer.renderizarEscena()
          console.log("Escena de segmentos renderizada")
          setRenderer(newRenderer)
        } catch (error) {
          console.error("Error al crear renderer de segmentos:", error)
        }
      }
    }

    // Intentar inicializar inmediatamente
    initializeCanvas()
    
    // También intentar después de un pequeño delay
    const timer = setTimeout(initializeCanvas, 500)
    
    return () => clearTimeout(timer)
  }, [])

  const mostrarNota = (nota: string) => {
    if (modoGuiado) {
      setNotaActual(nota)
      setTimeout(() => setNotaActual(""), 3000)
    }
  }

  const crearSegmento = (): SegmentoRecta | null => {
    const x1 = Number.parseFloat(p1.x)
    const y1 = Number.parseFloat(p1.y)
    const z1 = Number.parseFloat(p1.z)
    const x2 = Number.parseFloat(p2.x)
    const y2 = Number.parseFloat(p2.y)
    const z2 = Number.parseFloat(p2.z)

    if (isNaN(x1) || isNaN(y1) || isNaN(z1) || isNaN(x2) || isNaN(y2) || isNaN(z2)) {
      return null
    }

    return new SegmentoRecta(new Vector3D(x1, y1, z1, "A"), new Vector3D(x2, y2, z2, "B"))
  }

  const limpiarTodo = () => {
    // Limpiar resultados
    setResultado(null)
    setPasos([])
    setOperacion("")
    
    // Limpiar canvas
    if (renderer) {
      renderer.limpiar()
      renderer.renderizarEscena()
      console.log("Canvas limpiado y reiniciado")
    }
    
    console.log("Todo limpiado - segmento reiniciado")
  }

  const debugCanvas = () => {
    if (canvasRef.current) {
      console.log("Canvas de segmentos encontrado:", canvasRef.current)
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      
      if (ctx) {
        console.log("Contexto 2D obtenido para segmentos")
        // Dibujar algo básico para verificar que el canvas funciona
        ctx.fillStyle = '#f0f0f0'
        ctx.fillRect(0, 0, 600, 600)
        
        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(0, 300)
        ctx.lineTo(600, 300)
        ctx.moveTo(300, 0)
        ctx.lineTo(300, 600)
        ctx.stroke()
        
        ctx.fillStyle = '#000000'
        ctx.font = '16px Arial'
        ctx.fillText('Canvas segmentos funcionando', 200, 280)
        ctx.fillText('X', 580, 290)
        ctx.fillText('Y', 310, 20)
        
        console.log("Dibujo básico segmentos completado")
        
        // Ahora intentar con el renderer
        try {
          const newRenderer = new CanvasRenderer(canvas)
          newRenderer.renderizarEscena()
          setRenderer(newRenderer)
          console.log("Plano cartesiano renderizado con renderer")
        } catch (error) {
          console.error("Error al renderizar plano cartesiano:", error)
        }
      } else {
        console.log("No se pudo obtener contexto 2D para segmentos")
      }
    } else {
      console.log("Canvas de segmentos no encontrado")
    }
  }

  const realizarOperacion = (op: string) => {
    const segmento = crearSegmento()
    if (!segmento) {
      alert("Por favor ingresa puntos válidos")
      return
    }

    // Mostrar nota guiada según la operación
    const notasOperacion: {[key: string]: string} = {
      "longitud": "📏 Calculando longitud del segmento. Esto significa la distancia entre los puntos A y B del segmento.",
      "puntoMedio": "🎯 Calculando punto medio del segmento. Esto significa el punto que está exactamente a la mitad entre A y B.",
      "vectorDirector": "➡️ Calculando vector director del segmento. Esto significa el vector que indica la dirección del segmento de A hacia B.",
      "ecuacion": "📐 Obteniendo ecuación paramétrica del segmento. Esto significa la ecuación que describe todos los puntos del segmento.",
      "ecuacionContinua": "📐 Obteniendo ecuación continua del segmento. Esto significa la forma continua de la ecuación del segmento.",
      "informacionCompleta": "📊 Obteniendo información completa del segmento. Esto significa todos los datos del segmento: longitud, vector director y ecuaciones."
    }
    
    if (notasOperacion[op]) {
      mostrarNota(notasOperacion[op])
    }

    let res
    switch (op) {
      case "longitud":
        res = service.calcularLongitud(segmento)
        break
      case "puntoMedio":
        res = service.calcularPuntoMedio(segmento)
        break
      case "vectorDirector":
        res = service.calcularVectorDirector(segmento)
        break
      case "ecuacion":
        res = service.obtenerEcuacionParametrica(segmento)
        break
      case "ecuacionContinua":
        res = service.obtenerEcuacionContinua(segmento)
        break
      case "informacionCompleta":
        res = service.obtenerInformacionCompleta(segmento)
        break
      default:
        return
    }

    setResultado(res.resultado)
    setPasos(res.pasos)
    setOperacion(op)

    // Visualize
    if (!renderer) {
      console.log("Renderer no disponible, reinicializando...")
      if (canvasRef.current) {
        const canvas = canvasRef.current
        canvas.width = 600
        canvas.height = 600
        
        try {
          const newRenderer = new CanvasRenderer(canvas)
          newRenderer.renderizarEscena()
          setRenderer(newRenderer)
          console.log("Renderer reinicializado exitosamente")
        } catch (error) {
          console.error("Error al reinicializar renderer:", error)
          return
        }
      } else {
        console.error("Canvas no encontrado")
        return
      }
    }

    if (renderer) {
      console.log("Renderizando segmento en canvas...")
      renderer.limpiar()
      renderer.renderizarEscena()
      
      // Dibujar puntos A y B
      console.log("Dibujando punto A:", segmento.puntoInicial.toString())
      renderer.dibujarVector(segmento.puntoInicial, "#3B82F6")
      console.log("Dibujando punto B:", segmento.puntoFinal.toString())
      renderer.dibujarVector(segmento.puntoFinal, "#10B981")
      
      // Dibujar el segmento como línea
      console.log("Dibujando segmento")
      renderer.dibujarSegmento(segmento.puntoInicial, segmento.puntoFinal, "#8B5CF6", 2)

      // Dibujar vector director si es el caso
      if (op === "vectorDirector" || op === "informacionCompleta") {
        const vectorDirector = service.calcularVectorDirector(segmento).resultado as Vector3D
        const origen = segmento.puntoInicial
        const final = new Vector3D(
          origen.x + vectorDirector.x,
          origen.y + vectorDirector.y,
          origen.z + vectorDirector.z,
          "Vector Director"
        )
        console.log("Dibujando vector director:", vectorDirector.toString())
        renderer.dibujarVector(final, "#EF4444", origen)
      }

      // Dibujar punto medio si es el caso
      if (op === "puntoMedio" && res.resultado instanceof Vector3D) {
        console.log("Dibujando punto medio:", res.resultado.toString())
        renderer.dibujarVector(res.resultado, "#F59E0B")
      }
      
      console.log("Segmento renderizado exitosamente")
    }

    if (progreso && !progreso.leccionesCompletadas.includes("segmentos-1")) {
      const nuevoProgreso = Progreso.fromJSON({
        ...progreso,
        leccionesCompletadas: [...progreso.leccionesCompletadas, "segmentos-1"],
        puntajeTotal: progreso.puntajeTotal + 100,
      })
      actualizarProgreso(nuevoProgreso)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100">
        <header className="border-b bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Dashboard
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center p-3 bg-cyan-100 rounded-full mb-4">
              <Calculator className="h-8 w-8 text-cyan-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Segmentos de Recta</h1>
            <p className="text-muted-foreground">Geometría analítica y ecuaciones paramétricas</p>
          </div>

          <Tabs defaultValue="practica" className="space-y-6">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="teoria">
                <BookOpen className="mr-2 h-4 w-4" />
                Teoría
              </TabsTrigger>
              <TabsTrigger value="practica">
                <Calculator className="mr-2 h-4 w-4" />
                Práctica
              </TabsTrigger>
            </TabsList>

            <TabsContent value="teoria" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Conceptos Fundamentales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div>
                    <h3 className="font-semibold text-base mb-2">1. Definición de Segmento</h3>
                    <p className="text-muted-foreground">
                      Un segmento de recta es la porción de una recta comprendida entre dos puntos, llamados extremos.
                      Se denota como AB, donde A y B son los puntos extremos.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-base mb-2">2. Longitud del Segmento</h3>
                    <p className="text-muted-foreground mb-2">
                      La longitud o distancia entre dos puntos P₁(x₁,y₁,z₁) y P₂(x₂,y₂,z₂) se calcula con:
                    </p>
                    <div className="bg-blue-50 p-3 rounded font-mono text-center">
                      d = √[(x₂-x₁)² + (y₂-y₁)² + (z₂-z₁)²]
                    </div>
                    <p className="text-muted-foreground mt-2">
                      <strong>Ejemplo:</strong> Para A(1,2,3) y B(4,6,3):
                      <br />d = √[(4-1)² + (6-2)² + (3-3)²] = √[9 + 16 + 0] = √25 = 5
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-base mb-2">3. Punto Medio</h3>
                    <p className="text-muted-foreground mb-2">
                      El punto medio M de un segmento AB es el punto que divide al segmento en dos partes iguales:
                    </p>
                    <div className="bg-blue-50 p-3 rounded font-mono text-center">
                      M = ((x₁+x₂)/2, (y₁+y₂)/2, (z₁+z₂)/2)
                    </div>
                    <p className="text-muted-foreground mt-2">
                      <strong>Ejemplo:</strong> Para A(2,4,6) y B(8,10,2):
                      <br />M = ((2+8)/2, (4+10)/2, (6+2)/2) = (5, 7, 4)
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-base mb-2">4. Vector Director</h3>
                    <p className="text-muted-foreground mb-2">
                      El vector director v de un segmento AB indica su dirección y sentido:
                    </p>
                    <div className="bg-blue-50 p-3 rounded font-mono text-center">
                      v = B - A = (x₂-x₁, y₂-y₁, z₂-z₁)
                    </div>
                    <p className="text-muted-foreground mt-2">
                      <strong>Ejemplo:</strong> Para A(1,2,3) y B(4,5,6):
                      <br />v = (4-1, 5-2, 6-3) = (3, 3, 3)
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-base mb-2">5. Ecuación Paramétrica</h3>
                    <p className="text-muted-foreground mb-2">
                      La ecuación paramétrica describe todos los puntos del segmento usando un parámetro t ∈ [0,1]:
                    </p>
                    <div className="bg-blue-50 p-3 rounded font-mono text-center">
                      P(t) = P₀ + tv
                      <br />
                      donde t=0 da el punto inicial y t=1 da el punto final
                    </div>
                    <p className="text-muted-foreground mt-2">
                      <strong>Ejemplo:</strong> Para A(0,0,0) y B(6,3,0):
                      <br />v = (6,3,0)
                      <br />
                      P(t) = (0,0,0) + t(6,3,0) = (6t, 3t, 0)
                      <br />
                      P(0.5) = (3, 1.5, 0) es el punto medio
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="practica" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Visualización</CardTitle>
                      <CardDescription>Los puntos y vectores se muestran en el plano</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <canvas
                        ref={canvasRef}
                        width={600}
                        height={600}
                        className="border-4 border-gray-400 rounded-lg w-full max-w-[600px] mx-auto bg-white shadow-lg"
                        style={{ width: '600px', height: '600px' }}
                      />
                      <div className="text-xs text-gray-500 mt-2 text-center">
                        Estado del canvas: {renderer ? "✅ Listo" : "⏳ Inicializando..."}
                      </div>
                      
                      {/* Modo Guiado */}
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">Modo Guiado</span>
                        </div>
                        <Button
                          onClick={() => setModoGuiado(!modoGuiado)}
                          variant={modoGuiado ? "default" : "outline"}
                          size="sm"
                        >
                          {modoGuiado ? "Desactivar" : "Activar"}
                        </Button>
                      </div>
                      
                      {notaActual && (
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <HelpCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-yellow-800">{notaActual}</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-4 flex flex-wrap gap-4 justify-center text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-blue-500 rounded" />
                          <span>Punto A</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-green-500 rounded" />
                          <span>Punto B</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-purple-500 rounded" />
                          <span>Segmento</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-red-500 rounded" />
                          <span>Vector Director</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-yellow-500 rounded" />
                          <span>Punto Medio</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {resultado !== null && pasos.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>
                          {operacion === "informacionCompleta" ? "Información Completa del Segmento" : "Resultado y Pasos"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {operacion === "informacionCompleta" && typeof resultado === "object" && resultado !== null ? (
                          <div className="space-y-4">
                            <div className="p-4 bg-cyan-50 rounded-lg">
                              <p className="font-semibold text-cyan-900 mb-2">📊 Resumen del Segmento</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p><strong>Punto A:</strong> ({resultado.puntoInicial.x.toFixed(2)}, {resultado.puntoInicial.y.toFixed(2)}, {resultado.puntoInicial.z.toFixed(2)})</p>
                                  <p><strong>Punto B:</strong> ({resultado.puntoFinal.x.toFixed(2)}, {resultado.puntoFinal.y.toFixed(2)}, {resultado.puntoFinal.z.toFixed(2)})</p>
                                </div>
                                <div>
                                  <p><strong>Longitud:</strong> {resultado.longitud.toFixed(4)}</p>
                                  <p><strong>Vector Director:</strong> ({resultado.vectorDirector.x.toFixed(2)}, {resultado.vectorDirector.y.toFixed(2)}, {resultado.vectorDirector.z.toFixed(2)})</p>
                                </div>
                              </div>
                            </div>

                            <div className="p-4 bg-purple-50 rounded-lg">
                              <p className="font-semibold text-purple-900 mb-2">📐 Ecuación Paramétrica</p>
                              <p className="font-mono text-sm bg-white p-2 rounded border">
                                {resultado.ecuacionParametrica}
                              </p>
                              <p className="text-xs text-purple-700 mt-1">Donde t ∈ [0, 1]</p>
                            </div>

                            <div className="p-4 bg-orange-50 rounded-lg">
                              <p className="font-semibold text-orange-900 mb-2">📐 Ecuación Continua</p>
                              <p className="font-mono text-sm bg-white p-2 rounded border">
                                {resultado.ecuacionContinua}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 bg-cyan-50 rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1">Resultado:</p>
                            {typeof resultado === "number" ? (
                              <p className="text-2xl font-bold">{resultado.toFixed(4)}</p>
                            ) : resultado instanceof Vector3D ? (
                              <p className="font-mono text-lg">
                                ({resultado.x.toFixed(2)}, {resultado.y.toFixed(2)}, {resultado.z.toFixed(2)})
                              </p>
                            ) : (
                              <p className="font-mono text-sm">{resultado}</p>
                            )}
                          </div>
                        )}

                        <div className="p-4 bg-blue-50 rounded-lg max-h-60 overflow-y-auto">
                          <p className="font-medium text-blue-900 mb-2">Pasos del cálculo:</p>
                          <div className="space-y-1 text-sm text-blue-800">
                            {pasos.map((paso, i) => (
                              <p key={i} className="font-mono text-xs">
                                {paso}
                              </p>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Puntos del Segmento</CardTitle>
                      <CardDescription>Define los extremos A y B</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium mb-2 block">Punto A</Label>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-1">
                              <Label className="text-xs">X</Label>
                              <Input
                                type="number"
                                value={p1.x}
                                onChange={(e) => {
                                  setP1({ ...p1, x: e.target.value })
                                  if (modoGuiado && e.target.value) {
                                    mostrarNota(`📝 Coordenada X del Punto A: ${e.target.value}. Esto significa la posición horizontal del punto inicial del segmento.`)
                                  }
                                }}
                                step="0.1"
                                className="h-8"
                              />
                              {modoGuiado && (
                                <p className="text-xs text-gray-500">💡 Posición horizontal</p>
                              )}
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Y</Label>
                              <Input
                                type="number"
                                value={p1.y}
                                onChange={(e) => {
                                  setP1({ ...p1, y: e.target.value })
                                  if (modoGuiado && e.target.value) {
                                    mostrarNota(`📝 Coordenada Y del Punto A: ${e.target.value}. Esto significa la posición vertical del punto inicial del segmento.`)
                                  }
                                }}
                                step="0.1"
                                className="h-8"
                              />
                              {modoGuiado && (
                                <p className="text-xs text-gray-500">💡 Posición vertical</p>
                              )}
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Z</Label>
                              <Input
                                type="number"
                                value={p1.z}
                                onChange={(e) => {
                                  setP1({ ...p1, z: e.target.value })
                                  if (modoGuiado && e.target.value) {
                                    mostrarNota(`📝 Coordenada Z del Punto A: ${e.target.value}. Esto significa la posición de profundidad del punto inicial del segmento.`)
                                  }
                                }}
                                step="0.1"
                                className="h-8"
                              />
                              {modoGuiado && (
                                <p className="text-xs text-gray-500">💡 Posición de profundidad</p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-medium mb-2 block">Punto B</Label>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-1">
                              <Label className="text-xs">X</Label>
                              <Input
                                type="number"
                                value={p2.x}
                                onChange={(e) => {
                                  setP2({ ...p2, x: e.target.value })
                                  if (modoGuiado && e.target.value) {
                                    mostrarNota(`📝 Coordenada X del Punto B: ${e.target.value}. Esto significa la posición horizontal del punto final del segmento.`)
                                  }
                                }}
                                step="0.1"
                                className="h-8"
                              />
                              {modoGuiado && (
                                <p className="text-xs text-gray-500">💡 Posición horizontal</p>
                              )}
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Y</Label>
                              <Input
                                type="number"
                                value={p2.y}
                                onChange={(e) => {
                                  setP2({ ...p2, y: e.target.value })
                                  if (modoGuiado && e.target.value) {
                                    mostrarNota(`📝 Coordenada Y del Punto B: ${e.target.value}. Esto significa la posición vertical del punto final del segmento.`)
                                  }
                                }}
                                step="0.1"
                                className="h-8"
                              />
                              {modoGuiado && (
                                <p className="text-xs text-gray-500">💡 Posición vertical</p>
                              )}
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Z</Label>
                              <Input
                                type="number"
                                value={p2.z}
                                onChange={(e) => {
                                  setP2({ ...p2, z: e.target.value })
                                  if (modoGuiado && e.target.value) {
                                    mostrarNota(`📝 Coordenada Z del Punto B: ${e.target.value}. Esto significa la posición de profundidad del punto final del segmento.`)
                                  }
                                }}
                                step="0.1"
                                className="h-8"
                              />
                              {modoGuiado && (
                                <p className="text-xs text-gray-500">💡 Posición de profundidad</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Operaciones</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button onClick={() => realizarOperacion("informacionCompleta")} className="w-full" size="sm">
                        📊 Información Completa
                      </Button>
                      <Button onClick={() => realizarOperacion("longitud")} variant="outline" className="w-full" size="sm">
                        📏 Calcular Longitud
                      </Button>
                      <Button
                        onClick={() => realizarOperacion("puntoMedio")}
                        variant="outline"
                        className="w-full"
                        size="sm"
                      >
                        🎯 Punto Medio
                      </Button>
                      <Button
                        onClick={() => realizarOperacion("vectorDirector")}
                        variant="outline"
                        className="w-full"
                        size="sm"
                      >
                        ➡️ Vector Director
                      </Button>
                      <Button
                        onClick={() => realizarOperacion("ecuacion")}
                        variant="outline"
                        className="w-full"
                        size="sm"
                      >
                        📐 Ecuación Paramétrica
                      </Button>
                      <Button
                        onClick={() => realizarOperacion("ecuacionContinua")}
                        variant="outline"
                        className="w-full"
                        size="sm"
                      >
                        📐 Ecuación Continua
                      </Button>
                      
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        <Button 
                          onClick={limpiarTodo}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          🧹 Limpiar
                        </Button>
                        <Button 
                          onClick={debugCanvas}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          🔧 Debug Canvas
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ProtectedRoute>
  )
}
