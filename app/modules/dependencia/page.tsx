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
import { ArrowLeft, BookOpen, Calculator, Plus, Trash2, RotateCcw, Lightbulb, HelpCircle } from "lucide-react"
import { VectorOperationsService } from "@/src/servicios/VectorOperationsService"
import { Vector3D } from "@/src/entidades/Vector3D"
import { CanvasRenderer } from "@/src/presentacion/CanvasRenderer"
import { Progreso } from "@/src/entidades/Progreso"

interface VectorInput {
  id: string
  x: string
  y: string
  z: string
  color: string
}

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"]

export default function DependenciaPage() {
  const router = useRouter()
  const { progreso, actualizarProgreso } = useAuth()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [renderer, setRenderer] = useState<CanvasRenderer | null>(null)
  const [service] = useState(() => new VectorOperationsService())

  const [vectores, setVectores] = useState<VectorInput[]>([
    { id: "1", x: "1", y: "0", z: "0", color: COLORS[0] },
    { id: "2", x: "0", y: "1", z: "0", color: COLORS[1] },
  ])
  const [resultado, setResultado] = useState<any>(null)
  const [resultadoBase, setResultadoBase] = useState<any>(null)
  const [modoGuiado, setModoGuiado] = useState(false)
  const [notaActual, setNotaActual] = useState("")

  useEffect(() => {
    const initializeCanvas = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current
        console.log("Inicializando canvas dependencia...", canvas)
        
        // Asegurar que el canvas tenga el tamaño correcto
        canvas.width = 600
        canvas.height = 600
        
        try {
          const newRenderer = new CanvasRenderer(canvas)
          console.log("Renderer dependencia creado:", newRenderer)
          newRenderer.renderizarEscena()
          console.log("Escena dependencia renderizada")
          setRenderer(newRenderer)
        } catch (error) {
          console.error("Error al crear renderer dependencia:", error)
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

  const agregarVector = () => {
    if (vectores.length >= 5) {
      alert("Máximo 5 vectores permitidos")
      return
    }
    const nuevoId = (Math.max(...vectores.map((v) => Number.parseInt(v.id))) + 1).toString()
    setVectores([...vectores, { id: nuevoId, x: "", y: "", z: "", color: COLORS[vectores.length % COLORS.length] }])
    
    // Mostrar nota guiada
    mostrarNota(`➕ Vector ${nuevoId} agregado. Esto significa que has añadido un nuevo vector a tu conjunto para analizar su dependencia lineal.`)
  }

  const eliminarVector = (id: string) => {
    if (vectores.length <= 2) {
      alert("Debe haber al menos 2 vectores")
      return
    }
    setVectores(vectores.filter((v) => v.id !== id))
    
    // Mostrar nota guiada
    mostrarNota(`🗑️ Vector ${id} eliminado. Esto significa que has removido un vector de tu conjunto, reduciendo el número de vectores para el análisis de dependencia.`)
  }

  const actualizarVector = (id: string, campo: "x" | "y" | "z", valor: string) => {
    setVectores(vectores.map((v) => (v.id === id ? { ...v, [campo]: valor } : v)))
    
    // Mostrar nota guiada
    if (modoGuiado && valor) {
      const componente = campo.toUpperCase()
      mostrarNota(`📝 Componente ${componente} del Vector ${id}: ${valor}. Esto significa que has modificado la ${componente === 'X' ? 'horizontal' : componente === 'Y' ? 'vertical' : 'profundidad'} del vector para el análisis de dependencia.`)
    }
  }

  const crearVector = (v: VectorInput): Vector3D | null => {
    const x = Number.parseFloat(v.x)
    const y = Number.parseFloat(v.y)
    const z = Number.parseFloat(v.z)
    if (isNaN(x) || isNaN(y) || isNaN(z)) {
      return null
    }
    return new Vector3D(x, y, z, `V${v.id}`)
  }

  const limpiarTodo = () => {
    // Reiniciar vectores a estado inicial
    setVectores([
      { id: "1", x: "1", y: "0", z: "0", color: COLORS[0] },
      { id: "2", x: "0", y: "1", z: "0", color: COLORS[1] },
    ])
    
    // Limpiar resultados
    setResultado(null)
    setResultadoBase(null)
    
    // Limpiar canvas
    if (renderer) {
      renderer.limpiar()
      renderer.renderizarEscena()
      console.log("Canvas limpiado y reiniciado")
    }
    
    console.log("Todo limpiado - vectores reiniciados a estado inicial")
  }

  const verificarBase = () => {
    const vectoresValidos = vectores.map(crearVector).filter((v): v is Vector3D => v !== null)

    if (vectoresValidos.length < 1) {
      alert("Por favor ingresa al menos 1 vector válido")
      return
    }

    const res = service.verificarBase(vectoresValidos)
    setResultadoBase(res)

    // Visualize vectors
    if (renderer) {
      console.log("Renderizando vectores para análisis de base...")
      renderer.limpiar()
      renderer.renderizarEscena()

      vectoresValidos.forEach((vec, i) => {
        console.log(`Dibujando vector ${i + 1}:`, vec.toString())
        renderer.dibujarVector(vec, vectores[i].color)
      })
      console.log("Vectores renderizados exitosamente")
    } else {
      console.log("Renderer no disponible, intentando reinicializar...")
      // Intentar reinicializar el renderer
      if (canvasRef.current) {
        const canvas = canvasRef.current
        canvas.width = 600
        canvas.height = 600
        
        try {
          const newRenderer = new CanvasRenderer(canvas)
          newRenderer.renderizarEscena()
          setRenderer(newRenderer)
          
          // Dibujar vectores con el nuevo renderer
          vectoresValidos.forEach((vec, i) => {
            newRenderer.dibujarVector(vec, vectores[i].color)
          })
          console.log("Renderer reinicializado y vectores dibujados")
        } catch (error) {
          console.error("Error al reinicializar renderer:", error)
        }
      }
    }

    if (progreso && !progreso.leccionesCompletadas.includes("dependencia-2")) {
      const nuevoProgreso = Progreso.fromJSON({
        ...progreso,
        leccionesCompletadas: [...progreso.leccionesCompletadas, "dependencia-2"],
        puntajeTotal: progreso.puntajeTotal + 100,
      })
      actualizarProgreso(nuevoProgreso)
    }
  }

  const verificarDependencia = () => {
    const vectoresValidos = vectores.map(crearVector).filter((v): v is Vector3D => v !== null)

    if (vectoresValidos.length < 2) {
      alert("Por favor ingresa al menos 2 vectores válidos")
      return
    }

    const res = service.verificarDependenciaLineal(vectoresValidos)
    setResultado(res)

    // Visualize vectors
    if (renderer) {
      console.log("Renderizando vectores en canvas dependencia...")
      renderer.limpiar()
      renderer.renderizarEscena()

      vectoresValidos.forEach((vec, i) => {
        console.log(`Dibujando vector ${i + 1}:`, vec.toString())
        renderer.dibujarVector(vec, vectores[i].color)
      })
      console.log("Vectores renderizados exitosamente")
    } else {
      console.log("Renderer no disponible, intentando reinicializar...")
      // Intentar reinicializar el renderer
      if (canvasRef.current) {
        const canvas = canvasRef.current
        canvas.width = 600
        canvas.height = 600
        
        try {
          const newRenderer = new CanvasRenderer(canvas)
          newRenderer.renderizarEscena()
          setRenderer(newRenderer)
          
          // Dibujar vectores con el nuevo renderer
          vectoresValidos.forEach((vec, i) => {
            newRenderer.dibujarVector(vec, vectores[i].color)
          })
          console.log("Renderer reinicializado y vectores dibujados")
        } catch (error) {
          console.error("Error al reinicializar renderer:", error)
        }
      }
    }

    if (progreso && !progreso.leccionesCompletadas.includes("dependencia-1")) {
      const nuevoProgreso = Progreso.fromJSON({
        ...progreso,
        leccionesCompletadas: [...progreso.leccionesCompletadas, "dependencia-1"],
        puntajeTotal: progreso.puntajeTotal + 100,
      })
      actualizarProgreso(nuevoProgreso)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100">
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
            <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-full mb-4">
              <Calculator className="h-8 w-8 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Dependencia Lineal de Vectores</h1>
            <p className="text-muted-foreground">Independencia y dependencia lineal en espacios vectoriales</p>
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
                    <h3 className="font-semibold text-base mb-2">1. Combinación Lineal</h3>
                    <p className="text-muted-foreground mb-2">
                      Una combinación lineal de vectores v₁, v₂, ..., vₙ es una expresión de la forma:
                    </p>
                    <div className="bg-indigo-50 p-3 rounded font-mono text-center">c₁v₁ + c₂v₂ + ... + cₙvₙ</div>
                    <p className="text-muted-foreground mt-2">donde c₁, c₂, ..., cₙ son escalares (números reales).</p>
                    <p className="text-muted-foreground mt-2">
                      <strong>Ejemplo:</strong> Si v₁=(1,0,0) y v₂=(0,1,0), entonces 2v₁ + 3v₂ = (2,3,0)
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-base mb-2">2. Dependencia Lineal</h3>
                    <p className="text-muted-foreground mb-2">
                      Un conjunto de vectores es <strong>linealmente dependiente</strong> si al menos uno de ellos puede
                      expresarse como combinación lineal de los demás.
                    </p>
                    <p className="text-muted-foreground">
                      Equivalentemente, existen escalares c₁, c₂, ..., cₙ (no todos cero) tales que:
                    </p>
                    <div className="bg-indigo-50 p-3 rounded font-mono text-center">c₁v₁ + c₂v₂ + ... + cₙvₙ = 0</div>
                    <p className="text-muted-foreground mt-2">
                      <strong>Ejemplo:</strong> Los vectores v₁=(1,2,3), v₂=(2,4,6) son dependientes porque v₂ = 2v₁
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-base mb-2">3. Independencia Lineal</h3>
                    <p className="text-muted-foreground mb-2">
                      Un conjunto de vectores es <strong>linealmente independiente</strong> si ninguno puede expresarse
                      como combinación lineal de los demás.
                    </p>
                    <p className="text-muted-foreground">
                      Equivalentemente, la única solución a c₁v₁ + c₂v₂ + ... + cₙvₙ = 0 es c₁=c₂=...=cₙ=0
                    </p>
                    <p className="text-muted-foreground mt-2">
                      <strong>Ejemplo:</strong> Los vectores v₁=(1,0,0), v₂=(0,1,0), v₃=(0,0,1) son independientes
                      (vectores canónicos)
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-base mb-2">4. Criterios de Dependencia</h3>
                    <div className="space-y-2 text-muted-foreground">
                      <p>
                        <strong>Para 2 vectores en R³:</strong> Son dependientes si y solo si son paralelos (uno es
                        múltiplo del otro)
                      </p>
                      <p>
                        <strong>Para 3 vectores en R³:</strong> Son dependientes si y solo si son coplanares (están en
                        el mismo plano)
                      </p>
                      <p>
                        <strong>Regla general:</strong> Más de n vectores en Rⁿ siempre son linealmente dependientes
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-base mb-2">5. Métodos de Verificación</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium">Método del Determinante (3 vectores en R³):</p>
                        <p className="text-muted-foreground text-xs">
                          Formar una matriz con los vectores como columnas. Si det(A) = 0, son dependientes.
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Método del Producto Cruz (2 vectores en R³):</p>
                        <p className="text-muted-foreground text-xs">
                          Si v₁ × v₂ = 0, entonces son paralelos y dependientes.
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Método de Gauss-Jordan:</p>
                        <p className="text-muted-foreground text-xs">
                          Formar una matriz y reducirla. Si hay filas de ceros, son dependientes.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-base mb-2">6. Ejemplos Prácticos</h3>
                    <div className="space-y-3 bg-blue-50 p-3 rounded">
                      <div>
                        <p className="font-medium text-sm">Ejemplo 1: Vectores Dependientes</p>
                        <p className="text-xs text-muted-foreground">
                          v₁=(1,2,3), v₂=(2,4,6), v₃=(3,6,9)
                          <br />
                          Son dependientes porque v₂=2v₁ y v₃=3v₁
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Ejemplo 2: Vectores Independientes</p>
                        <p className="text-xs text-muted-foreground">
                          v₁=(1,0,0), v₂=(0,1,0), v₃=(0,0,1)
                          <br />
                          Son independientes (base canónica de R³)
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Ejemplo 3: Vectores Coplanares</p>
                        <p className="text-xs text-muted-foreground">
                          v₁=(1,0,0), v₂=(0,1,0), v₃=(1,1,0)
                          <br />
                          Son dependientes porque v₃=v₁+v₂ (están en el plano XY)
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="practica" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Visualización de Vectores</CardTitle>
                      <CardDescription>Los vectores se mostrarán en el plano (proyección 2D)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <canvas
                        ref={canvasRef}
                        width={600}
                        height={600}
                        className="border-2 border-gray-300 rounded-lg bg-white shadow-lg"
                        style={{ width: '600px', height: '600px' }}
                      />
                      <div className="mt-2 text-center text-sm text-gray-600">
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
                      
                      <div className="mt-4 flex flex-wrap gap-3 justify-center text-sm">
                        {vectores.map((v, i) => (
                          <div key={v.id} className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: v.color }} />
                            <span>Vector {i + 1}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {resultado && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Resultado del Análisis de Dependencia</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className={`p-4 rounded-lg ${resultado.dependiente ? "bg-red-50" : "bg-green-50"}`}>
                          <p className="font-semibold text-lg mb-2">
                            {resultado.dependiente
                              ? "Vectores Linealmente DEPENDIENTES"
                              : "Vectores Linealmente INDEPENDIENTES"}
                          </p>
                          <p className="text-sm text-muted-foreground">{resultado.explicacion}</p>
                          {resultado.vectoresRedundantes.length > 0 && (
                            <p className="text-sm mt-2">
                              <strong>Vectores redundantes:</strong> {resultado.vectoresRedundantes.join(", ")}
                            </p>
                          )}
                        </div>

                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                          <p className="font-medium text-blue-900 mb-2">Interpretación:</p>
                          <div className="text-sm text-blue-800 space-y-1">
                            {resultado.dependiente ? (
                              <>
                                <p>• Al menos un vector puede expresarse como combinación lineal de los demás</p>
                                <p>• Los vectores NO forman una base del espacio</p>
                                <p>• Existe redundancia en el conjunto</p>
                              </>
                            ) : (
                              <>
                                <p>• Ningún vector puede expresarse como combinación lineal de los demás</p>
                                <p>• Los vectores pueden formar una base del espacio</p>
                                <p>• No hay redundancia en el conjunto</p>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {resultadoBase && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Análisis de Base</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className={`p-4 rounded-lg ${resultadoBase.esBase ? "bg-green-50" : "bg-yellow-50"}`}>
                          <p className="font-semibold text-lg mb-2">
                            {resultadoBase.esBase ? "✅ FORMA BASE" : "❌ NO FORMA BASE"}
                          </p>
                          <p className="text-sm text-muted-foreground mb-2">{resultadoBase.explicacion}</p>
                          <p className="text-sm font-medium">
                            <strong>Dimensión del espacio:</strong> R{resultadoBase.dimension}
                          </p>
                        </div>

                        {resultadoBase.baseAlternativa && resultadoBase.baseAlternativa.length > 0 && (
                          <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                            <p className="font-medium text-purple-900 mb-2">Base Alternativa Sugerida:</p>
                            <div className="space-y-1">
                              {resultadoBase.baseAlternativa.map((vector: Vector3D, index: number) => (
                                <p key={index} className="text-sm text-purple-800">
                                  <strong>{vector.nombre}:</strong> {vector.toString()}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}

                        {resultadoBase.sugerencias && resultadoBase.sugerencias.length > 0 && (
                          <div className="mt-4 p-4 bg-orange-50 rounded-lg">
                            <p className="font-medium text-orange-900 mb-2">Sugerencias:</p>
                            <div className="text-sm text-orange-800 space-y-1">
                              {resultadoBase.sugerencias.map((sugerencia: string, index: number) => (
                                <p key={index}>{sugerencia}</p>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
                          <p className="font-medium text-indigo-900 mb-2">Conceptos Clave:</p>
                          <div className="text-sm text-indigo-800 space-y-1">
                            <p>• <strong>Base:</strong> Conjunto de vectores linealmente independientes que generan todo el espacio</p>
                            <p>• <strong>Dimensión:</strong> Número de vectores en cualquier base del espacio</p>
                            <p>• <strong>R¹:</strong> Línea (1 vector), <strong>R²:</strong> Plano (2 vectores), <strong>R³:</strong> Espacio (3 vectores)</p>
                            <p>• <strong>Base canónica:</strong> {(1,0,0), (0,1,0), (0,0,1)} para R³</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Vectores</CardTitle>
                      <CardDescription>Ingresa los componentes de cada vector</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {vectores.map((vector, index) => (
                          <div key={vector.id} className="p-3 border rounded-lg space-y-2 relative">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded" style={{ backgroundColor: vector.color }} />
                                <span className="font-medium text-sm">Vector {index + 1}</span>
                              </div>
                              {vectores.length > 2 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => eliminarVector(vector.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="space-y-1">
                                <Label className="text-xs">X</Label>
                                <Input
                                  type="number"
                                  value={vector.x}
                                  onChange={(e) => actualizarVector(vector.id, "x", e.target.value)}
                                  step="0.1"
                                  className="h-8 text-sm"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Y</Label>
                                <Input
                                  type="number"
                                  value={vector.y}
                                  onChange={(e) => actualizarVector(vector.id, "y", e.target.value)}
                                  step="0.1"
                                  className="h-8 text-sm"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Z</Label>
                                <Input
                                  type="number"
                                  value={vector.z}
                                  onChange={(e) => actualizarVector(vector.id, "z", e.target.value)}
                                  step="0.1"
                                  className="h-8 text-sm"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <Button onClick={agregarVector} variant="outline" className="w-full bg-transparent" size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Agregar Vector
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Análisis</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <Button onClick={verificarDependencia} className="w-full">
                          Verificar Dependencia Lineal
                        </Button>
                        <Button onClick={verificarBase} variant="secondary" className="w-full">
                          Verificar si Forma Base
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          onClick={limpiarTodo}
                          variant="outline"
                          className="w-full"
                        >
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Limpiar Todo
                        </Button>
                        <Button 
                          onClick={() => {
                            if (canvasRef.current) {
                              console.log("Canvas dependencia encontrado:", canvasRef.current)
                              const canvas = canvasRef.current
                              const ctx = canvas.getContext('2d')
                              
                              if (ctx) {
                                console.log("Contexto 2D obtenido para dependencia")
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
                                ctx.fillText('Canvas dependencia funcionando', 200, 280)
                                ctx.fillText('X', 580, 290)
                                ctx.fillText('Y', 310, 20)
                                
                                console.log("Dibujo básico dependencia completado")
                                
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
                                console.log("No se pudo obtener contexto 2D para dependencia")
                              }
                            } else {
                              console.log("Canvas dependencia no encontrado")
                            }
                          }} 
                          variant="outline"
                          size="sm"
                        >
                          Debug Canvas
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Ejemplos Rápidos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs">
                      <Button
                        onClick={() => {
                          const nuevosVectores = [
                            { id: "1", x: "1", y: "0", z: "0", color: COLORS[0] },
                            { id: "2", x: "0", y: "1", z: "0", color: COLORS[1] },
                            { id: "3", x: "0", y: "0", z: "1", color: COLORS[2] },
                          ]
                          setVectores(nuevosVectores)
                          
                          // Renderizar vectores inmediatamente
                          if (renderer) {
                            renderer.limpiar()
                            renderer.renderizarEscena()
                            nuevosVectores.forEach((v, i) => {
                              const vector = new Vector3D(parseFloat(v.x), parseFloat(v.y), parseFloat(v.z), `V${v.id}`)
                              renderer.dibujarVector(vector, v.color)
                            })
                          }
                        }}
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                      >
                        Base Canónica (Independientes)
                      </Button>
                      <Button
                        onClick={() => {
                          const nuevosVectores = [
                            { id: "1", x: "1", y: "2", z: "3", color: COLORS[0] },
                            { id: "2", x: "2", y: "4", z: "6", color: COLORS[1] },
                          ]
                          setVectores(nuevosVectores)
                          
                          // Renderizar vectores inmediatamente
                          if (renderer) {
                            renderer.limpiar()
                            renderer.renderizarEscena()
                            nuevosVectores.forEach((v, i) => {
                              const vector = new Vector3D(parseFloat(v.x), parseFloat(v.y), parseFloat(v.z), `V${v.id}`)
                              renderer.dibujarVector(vector, v.color)
                            })
                          }
                        }}
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                      >
                        Paralelos (Dependientes)
                      </Button>
                      <Button
                        onClick={() => {
                          const nuevosVectores = [
                            { id: "1", x: "1", y: "0", z: "0", color: COLORS[0] },
                            { id: "2", x: "0", y: "1", z: "0", color: COLORS[1] },
                            { id: "3", x: "1", y: "1", z: "0", color: COLORS[2] },
                          ]
                          setVectores(nuevosVectores)
                          
                          // Renderizar vectores inmediatamente
                          if (renderer) {
                            renderer.limpiar()
                            renderer.renderizarEscena()
                            nuevosVectores.forEach((v, i) => {
                              const vector = new Vector3D(parseFloat(v.x), parseFloat(v.y), parseFloat(v.z), `V${v.id}`)
                              renderer.dibujarVector(vector, v.color)
                            })
                          }
                        }}
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                      >
                        Coplanares (Dependientes)
                      </Button>
                      <Button
                        onClick={() => {
                          const nuevosVectores = [
                            { id: "1", x: "1", y: "0", z: "0", color: COLORS[0] },
                            { id: "2", x: "0", y: "1", z: "0", color: COLORS[1] },
                            { id: "3", x: "0", y: "0", z: "1", color: COLORS[2] },
                          ]
                          setVectores(nuevosVectores)
                          
                          // Renderizar vectores inmediatamente
                          if (renderer) {
                            renderer.limpiar()
                            renderer.renderizarEscena()
                            nuevosVectores.forEach((v, i) => {
                              const vector = new Vector3D(parseFloat(v.x), parseFloat(v.y), parseFloat(v.z), `V${v.id}`)
                              renderer.dibujarVector(vector, v.color)
                            })
                          }
                        }}
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                      >
                        Base Canónica R³
                      </Button>
                      <Button
                        onClick={() => {
                          const nuevosVectores = [
                            { id: "1", x: "1", y: "0", z: "0", color: COLORS[0] },
                            { id: "2", x: "0", y: "1", z: "0", color: COLORS[1] },
                          ]
                          setVectores(nuevosVectores)
                          
                          // Renderizar vectores inmediatamente
                          if (renderer) {
                            renderer.limpiar()
                            renderer.renderizarEscena()
                            nuevosVectores.forEach((v, i) => {
                              const vector = new Vector3D(parseFloat(v.x), parseFloat(v.y), parseFloat(v.z), `V${v.id}`)
                              renderer.dibujarVector(vector, v.color)
                            })
                          }
                        }}
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                      >
                        Base Canónica R²
                      </Button>
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
