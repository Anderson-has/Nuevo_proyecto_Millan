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
import { ArrowLeft, BookOpen, Info, MapPin, Navigation } from "lucide-react"
import { CanvasRenderer } from "@/src/presentacion/CanvasRenderer"
import { Progreso } from "@/src/entidades/Progreso"

export default function CartesianoPage() {
  const router = useRouter()
  const { progreso, actualizarProgreso } = useAuth()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [renderer, setRenderer] = useState<CanvasRenderer | null>(null)
  const [x, setX] = useState("")
  const [y, setY] = useState("")
  const [puntos, setPuntos] = useState<Array<{ x: number; y: number }>>([])

  useEffect(() => {
    const initializeCanvas = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current
        console.log("Inicializando canvas cartesiano...", canvas)
        
        // Asegurar que el canvas tenga el tamaño correcto
        canvas.width = 600
        canvas.height = 600
        
        try {
          const newRenderer = new CanvasRenderer(canvas)
          console.log("Renderer cartesiano creado:", newRenderer)
          newRenderer.dibujarPlanoCartesiano()
          console.log("Plano cartesiano renderizado")
          setRenderer(newRenderer)
        } catch (error) {
          console.error("Error al crear renderer cartesiano:", error)
        }
      }
    }

    // Intentar inicializar inmediatamente
    initializeCanvas()
    
    // También intentar después de un pequeño delay
    const timer = setTimeout(initializeCanvas, 500)
    
    return () => clearTimeout(timer)
  }, [])

  const agregarPunto = () => {
    const xNum = Number.parseFloat(x)
    const yNum = Number.parseFloat(y)

    if (isNaN(xNum) || isNaN(yNum)) {
      alert("Por favor ingresa coordenadas válidas")
      return
    }

    if (renderer) {
      renderer.dibujarPunto(xNum, yNum, "blue")
      const nuevosPuntos = [...puntos, { x: xNum, y: yNum }]
      setPuntos(nuevosPuntos)
      setX("")
      setY("")

      // Mark as completed after first point
      if (progreso && !progreso.leccionesCompletadas.includes("cartesiano-1")) {
        const nuevoProgreso = Progreso.fromJSON({
          ...progreso,
          leccionesCompletadas: [...progreso.leccionesCompletadas, "cartesiano-1"],
          puntajeTotal: progreso.puntajeTotal + 100,
        })
        actualizarProgreso(nuevoProgreso)
      }
    }
  }

  const limpiar = () => {
    if (renderer) {
      renderer.limpiar()
      renderer.dibujarPlanoCartesiano()
      setPuntos([])
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100">
        <header className="border-b bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Dashboard
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Plano Cartesiano Interactivo</h1>
            <p className="text-muted-foreground">Aprende teoría y practica con coordenadas</p>
          </div>

          <Tabs defaultValue="teoria" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="teoria" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Teoría
              </TabsTrigger>
              <TabsTrigger value="practica" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Práctica
              </TabsTrigger>
            </TabsList>

            <TabsContent value="teoria" className="space-y-6">
              {/* Sección de teoría */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    Teoría del Plano Cartesiano
                  </CardTitle>
                  <CardDescription>Aprende los conceptos fundamentales del sistema de coordenadas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Definición del Plano Cartesiano */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-blue-700 flex items-center gap-2">
                      <Info className="h-5 w-5" />
                      1. ¿Qué es un Plano Cartesiano?
                    </h3>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-gray-700 mb-3">
                        El <strong>plano cartesiano</strong> es un sistema de coordenadas bidimensional que permite localizar cualquier punto mediante dos números llamados coordenadas.
                      </p>
                      <p className="text-gray-700 mb-3">
                        Fue inventado por el matemático y filósofo francés René Descartes en el siglo XVII, por eso también se conoce como <strong>sistema de coordenadas cartesianas</strong>.
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="font-medium text-green-900 mb-2">Características principales:</p>
                      <ul className="list-disc list-inside space-y-1 text-green-800">
                        <li>Consiste en dos rectas perpendiculares que se cruzan en un punto llamado origen</li>
                        <li>Permite representar gráficamente relaciones matemáticas</li>
                        <li>Es la base para la geometría analítica</li>
                        <li>Se extiende infinitamente en todas las direcciones</li>
                      </ul>
                    </div>
                  </div>

                  {/* Componentes del Plano Cartesiano */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-blue-700 flex items-center gap-2">
                      <Info className="h-5 w-5" />
                      2. Componentes del Plano Cartesiano
                    </h3>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-gray-700 mb-3">
                        El plano cartesiano está formado por varios elementos fundamentales:
                      </p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-purple-800 mb-2">Eje X (Abscisas)</h4>
                        <ul className="list-disc list-inside space-y-1 text-purple-700">
                          <li>Recta horizontal que pasa por el origen</li>
                          <li>Se extiende hacia la derecha (positivo) e izquierda (negativo)</li>
                          <li>Representa la primera coordenada (x)</li>
                          <li>También se llama eje de las abscisas</li>
                        </ul>
                      </div>
                      
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-orange-800 mb-2">Eje Y (Ordenadas)</h4>
                        <ul className="list-disc list-inside space-y-1 text-orange-700">
                          <li>Recta vertical que pasa por el origen</li>
                          <li>Se extiende hacia arriba (positivo) y abajo (negativo)</li>
                          <li>Representa la segunda coordenada (y)</li>
                          <li>También se llama eje de las ordenadas</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-cyan-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-cyan-800 mb-2">Origen de Coordenadas</h4>
                      <p className="text-cyan-700 mb-2">
                        El punto donde se cruzan los ejes X e Y. Sus coordenadas son (0, 0) y sirve como punto de referencia para localizar todos los demás puntos del plano.
                      </p>
                    </div>

                    <div className="bg-pink-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-pink-800 mb-2">Cuadrantes</h4>
                      <p className="text-pink-700 mb-2">
                        Los ejes dividen el plano en cuatro regiones llamadas cuadrantes:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-pink-700">
                        <li><strong>Cuadrante I:</strong> x &gt; 0, y &gt; 0 (arriba a la derecha)</li>
                        <li><strong>Cuadrante II:</strong> x &lt; 0, y &gt; 0 (arriba a la izquierda)</li>
                        <li><strong>Cuadrante III:</strong> x &lt; 0, y &lt; 0 (abajo a la izquierda)</li>
                        <li><strong>Cuadrante IV:</strong> x &gt; 0, y &lt; 0 (abajo a la derecha)</li>
                      </ul>
                    </div>
                  </div>

                  {/* Aplicaciones en la vida real */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-blue-700 flex items-center gap-2">
                      <Navigation className="h-5 w-5" />
                      3. Aplicaciones en la Vida Real
                    </h3>
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Navegación y GPS</h4>
                      <p className="text-green-700 mb-2">
                        Los sistemas de navegación por satélite (GPS) utilizan coordenadas cartesianas para determinar la posición exacta de un objeto en la Tierra.
                      </p>
                      <p className="text-green-700">
                        <strong>Ejemplo:</strong> Un GPS puede indicar que te encuentras en las coordenadas (40.7128, -74.0060), que corresponden a la ciudad de Nueva York.
                      </p>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2">Arquitectura y Construcción</h4>
                      <p className="text-yellow-700 mb-2">
                        Los arquitectos e ingenieros usan planos cartesianos para diseñar edificios, calcular distancias y posicionar elementos estructurales.
                      </p>
                      <p className="text-yellow-700">
                        <strong>Ejemplo:</strong> Para colocar una ventana en la posición (5, 3) significa 5 metros hacia la derecha y 3 metros hacia arriba desde una esquina del edificio.
                      </p>
                    </div>

                    <div className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-red-800 mb-2">Videojuegos y Gráficos</h4>
                      <p className="text-red-700 mb-2">
                        En programación de videojuegos, el plano cartesiano se usa para posicionar personajes, objetos y efectos visuales en la pantalla.
                      </p>
                      <p className="text-red-700">
                        <strong>Ejemplo:</strong> Un personaje en la posición (100, 200) aparece 100 píxeles desde el borde izquierdo y 200 píxeles desde el borde superior de la pantalla.
                      </p>
                    </div>

                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-indigo-800 mb-2">Análisis de Datos</h4>
                      <p className="text-indigo-700 mb-2">
                        Los científicos y analistas usan gráficos cartesianos para visualizar relaciones entre variables y detectar patrones en los datos.
                      </p>
                      <p className="text-indigo-700">
                        <strong>Ejemplo:</strong> Un gráfico que muestra la relación entre temperatura (eje X) y ventas de helados (eje Y) para predecir la demanda.
                      </p>
                    </div>

                    <div className="bg-teal-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-teal-800 mb-2">Robótica y Automatización</h4>
                      <p className="text-teal-700 mb-2">
                        Los robots industriales usan coordenadas cartesianas para moverse con precisión en espacios tridimensionales.
                      </p>
                      <p className="text-teal-700">
                        <strong>Ejemplo:</strong> Un brazo robótico puede programarse para mover una pieza desde la posición (0, 0) hasta (50, 30) en una línea de ensamblaje.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="practica" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Plano Cartesiano</CardTitle>
                  <CardDescription>Los puntos se graficarán en el plano</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center">
                    <canvas
                      ref={canvasRef}
                      width={600}
                      height={600}
                      className="border-2 border-gray-300 rounded-lg bg-white shadow-lg"
                      style={{ width: '600px', height: '600px' }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-2 text-center">
                    Estado del canvas: {renderer ? "✅ Listo" : "⏳ Inicializando..."}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Agregar Punto</CardTitle>
                  <CardDescription>Ingresa las coordenadas (x, y)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="x">Coordenada X</Label>
                    <Input
                      id="x"
                      type="number"
                      placeholder="Ej: 5"
                      value={x}
                      onChange={(e) => setX(e.target.value)}
                      step="0.1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="y">Coordenada Y</Label>
                    <Input
                      id="y"
                      type="number"
                      placeholder="Ej: 3"
                      value={y}
                      onChange={(e) => setY(e.target.value)}
                      step="0.1"
                    />
                  </div>
                  <Button onClick={agregarPunto} className="w-full">
                    Graficar Punto
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button onClick={limpiar} variant="outline">
                      Limpiar Plano
                    </Button>
                    <Button 
                      onClick={() => {
                        if (canvasRef.current) {
                          console.log("Canvas cartesiano encontrado:", canvasRef.current)
                          const canvas = canvasRef.current
                          const ctx = canvas.getContext('2d')
                          
                          if (ctx) {
                            console.log("Contexto 2D obtenido para cartesiano")
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
                            ctx.fillText('Canvas cartesiano funcionando', 200, 280)
                            ctx.fillText('X', 580, 290)
                            ctx.fillText('Y', 310, 20)
                            
                            console.log("Dibujo básico cartesiano completado")
                            
                            // Ahora intentar con el renderer
                            try {
                              const newRenderer = new CanvasRenderer(canvas)
                              newRenderer.dibujarPlanoCartesiano()
                              setRenderer(newRenderer)
                              console.log("Plano cartesiano renderizado con renderer")
                            } catch (error) {
                              console.error("Error al renderizar plano cartesiano:", error)
                            }
                          } else {
                            console.log("No se pudo obtener contexto 2D para cartesiano")
                          }
                        } else {
                          console.log("Canvas cartesiano no encontrado")
                        }
                      }} 
                      variant="outline"
                    >
                      Debug Canvas
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {puntos.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Puntos Graficados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {puntos.map((punto, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="font-medium">Punto {index + 1}</span>
                          <span className="text-muted-foreground">
                            ({punto.x}, {punto.y})
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ProtectedRoute>
  )
}
