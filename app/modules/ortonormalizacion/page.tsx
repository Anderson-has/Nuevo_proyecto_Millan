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
import { ArrowLeft, BookOpen, Calculator, Plus, Trash2, RotateCcw, ZoomIn, ZoomOut, Lightbulb, HelpCircle } from "lucide-react"
import { OrthonormalizationService } from "@/src/servicios/OrthonormalizationService"
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

const COLORS = ["#3B82F6", "#10B981", "#F59E0B"]
const RESULT_COLORS = ["#EF4444", "#EC4899", "#8B5CF6"]

export default function OrtonormalizacionPage() {
  const router = useRouter()
  const { progreso, actualizarProgreso } = useAuth()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [renderer, setRenderer] = useState<CanvasRenderer | null>(null)
  const [service] = useState(() => new OrthonormalizationService())

  const [vectores, setVectores] = useState<VectorInput[]>([
    { id: "1", x: "3", y: "1", z: "0", color: COLORS[0] },
    { id: "2", x: "2", y: "2", z: "0", color: COLORS[1] },
  ])
  const [resultado, setResultado] = useState<any>(null)
  const [modoGuiado, setModoGuiado] = useState(false)
  const [notaActual, setNotaActual] = useState("")
  
  // Controles de visualización 3D
  const [rotacionX, setRotacionX] = useState(0)
  const [rotacionY, setRotacionY] = useState(0)
  const [rotacionZ, setRotacionZ] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [autoRotacion, setAutoRotacion] = useState(false)

  useEffect(() => {
    const initializeCanvas = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current
        console.log("Inicializando canvas de ortonormalización...", canvas)
        
        // Asegurar que el canvas tenga el tamaño correcto
        canvas.width = 600
        canvas.height = 600
        
        try {
          const newRenderer = new CanvasRenderer(canvas)
          console.log("Renderer de ortonormalización creado:", newRenderer)
          newRenderer.renderizarEscena()
          console.log("Escena de ortonormalización renderizada")
          setRenderer(newRenderer)
        } catch (error) {
          console.error("Error al crear renderer de ortonormalización:", error)
        }
      }
    }

    // Intentar inicializar inmediatamente
    initializeCanvas()
    
    // También intentar después de un pequeño delay
    const timer = setTimeout(initializeCanvas, 500)
    
    return () => clearTimeout(timer)
  }, [])

  // Efecto para rotación automática
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (autoRotacion) {
      interval = setInterval(() => {
        setRotacionY(prev => (prev + 1) % 360)
      }, 50)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRotacion])

  // Efecto para actualizar visualización cuando cambien los controles
  useEffect(() => {
    if (resultado && renderer) {
      renderer.limpiar()
      renderer.renderizarEscena()

      // Re-dibujar vectores con nuevas transformaciones
      const vectoresValidos = vectores.map(crearVector).filter((v): v is Vector3D => v !== null)
      
      vectoresValidos.forEach((vec, i) => {
        const vectorTransformado = aplicarTransformaciones3D(vec)
        renderer.dibujarVector(vectorTransformado, vectores[i].color)
      })

      resultado.vectoresOrtonormales.forEach((vec: Vector3D, i: number) => {
        const vectorTransformado = aplicarTransformaciones3D(vec)
        renderer.dibujarVector(vectorTransformado, RESULT_COLORS[i])
      })
    }
  }, [rotacionX, rotacionY, rotacionZ, zoom, resultado, renderer])

  const mostrarNota = (nota: string) => {
    if (modoGuiado) {
      setNotaActual(nota)
      setTimeout(() => setNotaActual(""), 3000)
    }
  }

  const agregarVector = () => {
    if (vectores.length >= 3) {
      alert("Máximo 3 vectores permitidos")
      return
    }
    const nuevoId = (Math.max(...vectores.map((v) => Number.parseInt(v.id))) + 1).toString()
    setVectores([...vectores, { id: nuevoId, x: "", y: "", z: "", color: COLORS[vectores.length % COLORS.length] }])
    
    // Mostrar nota guiada
    mostrarNota(`➕ Vector ${nuevoId} agregado. Esto significa que has añadido un nuevo vector a tu conjunto para aplicar el proceso de Gram-Schmidt y obtener vectores ortonormales.`)
  }

  const eliminarVector = (id: string) => {
    if (vectores.length <= 2) {
      alert("Debe haber al menos 2 vectores")
      return
    }
    setVectores(vectores.filter((v) => v.id !== id))
    
    // Mostrar nota guiada
    mostrarNota(`🗑️ Vector ${id} eliminado. Esto significa que has removido un vector de tu conjunto, reduciendo el número de vectores para el proceso de Gram-Schmidt.`)
  }

  const actualizarVector = (id: string, campo: "x" | "y" | "z", valor: string) => {
    setVectores(vectores.map((v) => (v.id === id ? { ...v, [campo]: valor } : v)))
    
    // Mostrar nota guiada
    if (modoGuiado && valor) {
      const componente = campo.toUpperCase()
      mostrarNota(`📝 Componente ${componente} del Vector ${id}: ${valor}. Esto significa que has modificado la ${componente === 'X' ? 'horizontal' : componente === 'Y' ? 'vertical' : 'profundidad'} del vector para el proceso de Gram-Schmidt.`)
    }
  }

  const crearVector = (v: VectorInput): Vector3D | null => {
    const x = Number.parseFloat(v.x)
    const y = Number.parseFloat(v.y)
    const z = Number.parseFloat(v.z)
    if (isNaN(x) || isNaN(y) || isNaN(z)) {
      return null
    }
    return new Vector3D(x, y, z, `v${v.id}`)
  }

  // Función para aplicar transformaciones 3D
  const aplicarTransformaciones3D = (vector: Vector3D): Vector3D => {
    let x = vector.x * zoom
    let y = vector.y * zoom
    let z = vector.z * zoom

    // Aplicar rotaciones
    const radX = (rotacionX * Math.PI) / 180
    const radY = (rotacionY * Math.PI) / 180
    const radZ = (rotacionZ * Math.PI) / 180

    // Rotación X
    const y1 = y * Math.cos(radX) - z * Math.sin(radX)
    const z1 = y * Math.sin(radX) + z * Math.cos(radX)
    y = y1
    z = z1

    // Rotación Y
    const x1 = x * Math.cos(radY) + z * Math.sin(radY)
    const z2 = -x * Math.sin(radY) + z * Math.cos(radY)
    x = x1
    z = z2

    // Rotación Z
    const x2 = x * Math.cos(radZ) - y * Math.sin(radZ)
    const y2 = x * Math.sin(radZ) + y * Math.cos(radZ)
    x = x2
    y = y2

    return new Vector3D(x, y, z, vector.nombre)
  }

  const aplicarGramSchmidt = () => {
    const vectoresValidos = vectores.map(crearVector).filter((v): v is Vector3D => v !== null)

    if (vectoresValidos.length < 2) {
      alert("Por favor ingresa al menos 2 vectores válidos")
      return
    }

    try {
      console.log("Aplicando Gram-Schmidt a vectores:", vectoresValidos)
      const res = service.gramSchmidt(vectoresValidos)
      console.log("Resultado de Gram-Schmidt:", res)
      setResultado(res)

      // Visualize vectors
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
        console.log("Renderizando vectores en canvas...")
        renderer.limpiar()
        renderer.renderizarEscena()

        // Original vectors con transformaciones 3D
        vectoresValidos.forEach((vec, i) => {
          const vectorTransformado = aplicarTransformaciones3D(vec)
          console.log(`Dibujando vector original ${i}:`, vectorTransformado)
          renderer.dibujarVector(vectorTransformado, vectores[i].color)
        })

        // Orthonormal vectors con transformaciones 3D
        res.vectoresOrtonormales.forEach((vec, i) => {
          const vectorTransformado = aplicarTransformaciones3D(vec)
          console.log(`Dibujando vector ortonormal ${i}:`, vectorTransformado)
          renderer.dibujarVector(vectorTransformado, RESULT_COLORS[i])
        })
        
        console.log("Vectores renderizados exitosamente")
      }

      if (progreso && !progreso.leccionesCompletadas.includes("ortonormalizacion-1")) {
        const nuevoProgreso = Progreso.fromJSON({
          ...progreso,
          leccionesCompletadas: [...progreso.leccionesCompletadas, "ortonormalizacion-1"],
          puntajeTotal: progreso.puntajeTotal + 100,
        })
        actualizarProgreso(nuevoProgreso)
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error al aplicar Gram-Schmidt")
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100">
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
            <div className="inline-flex items-center justify-center p-3 bg-pink-100 rounded-full mb-4">
              <Calculator className="h-8 w-8 text-pink-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Ortonormalización (Gram-Schmidt)</h1>
            <p className="text-muted-foreground">Construcción de bases ortogonales y ortonormales</p>
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
                    <h3 className="font-semibold text-base mb-2">1. Vectores Ortogonales</h3>
                    <p className="text-muted-foreground mb-2">
                      Dos vectores son <strong>ortogonales</strong> si su producto escalar es cero:
                    </p>
                    <div className="bg-pink-50 p-3 rounded font-mono text-center">u · v = 0</div>
                    <p className="text-muted-foreground mt-2">
                      Geométricamente, esto significa que los vectores forman un ángulo de 90° (son perpendiculares).
                    </p>
                    <p className="text-muted-foreground mt-2">
                      <strong>Ejemplo:</strong> v₁=(1,0,0) y v₂=(0,1,0) son ortogonales porque v₁·v₂ = 1×0 + 0×1 + 0×0 =
                      0
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-base mb-2">2. Vectores Ortonormales</h3>
                    <p className="text-muted-foreground mb-2">
                      Un conjunto de vectores es <strong>ortonormal</strong> si:
                    </p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li>Son ortogonales entre sí (u · v = 0 para todo u ≠ v)</li>
                      <li>Cada vector tiene magnitud 1 (||u|| = 1)</li>
                    </ul>
                    <p className="text-muted-foreground mt-2">
                      <strong>Ejemplo:</strong> Los vectores canónicos e₁=(1,0,0), e₂=(0,1,0), e₃=(0,0,1) forman una
                      base ortonormal de R³
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-base mb-2">3. Proceso de Gram-Schmidt</h3>
                    <p className="text-muted-foreground mb-2">
                      El proceso de Gram-Schmidt transforma un conjunto de vectores linealmente independientes en un
                      conjunto ortogonal (y luego ortonormal).
                    </p>
                    <div className="bg-pink-50 p-3 rounded space-y-2">
                      <p className="font-medium">Algoritmo:</p>
                      <div className="font-mono text-xs space-y-1">
                        <p>1. u₁ = v₁</p>
                        <p>2. u₂ = v₂ - proyᵤ₁(v₂)</p>
                        <p>3. u₃ = v₃ - proyᵤ₁(v₃) - proyᵤ₂(v₃)</p>
                        <p>...</p>
                        <p>Luego normalizar: eᵢ = uᵢ / ||uᵢ||</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-base mb-2">4. Proyección Ortogonal</h3>
                    <p className="text-muted-foreground mb-2">La proyección de un vector v sobre un vector u es:</p>
                    <div className="bg-pink-50 p-3 rounded font-mono text-center">proyᵤ(v) = [(v·u)/(u·u)] × u</div>
                    <p className="text-muted-foreground mt-2">
                      Esta proyección representa la componente de v en la dirección de u.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-base mb-2">5. Ejemplo Completo</h3>
                    <div className="bg-blue-50 p-4 rounded space-y-3">
                      <p className="font-medium">Dado: v₁=(3,1,0), v₂=(2,2,0)</p>

                      <div className="space-y-2 text-xs">
                        <div>
                          <p className="font-medium">Paso 1: u₁ = v₁</p>
                          <p className="text-muted-foreground">u₁ = (3,1,0)</p>
                        </div>

                        <div>
                          <p className="font-medium">Paso 2: Calcular u₂</p>
                          <p className="text-muted-foreground">v₂·u₁ = 2×3 + 2×1 + 0×0 = 8</p>
                          <p className="text-muted-foreground">u₁·u₁ = 3² + 1² + 0² = 10</p>
                          <p className="text-muted-foreground">proyᵤ₁(v₂) = (8/10)×(3,1,0) = (2.4, 0.8, 0)</p>
                          <p className="text-muted-foreground">
                            u₂ = v₂ - proyᵤ₁(v₂) = (2,2,0) - (2.4,0.8,0) = (-0.4, 1.2, 0)
                          </p>
                        </div>

                        <div>
                          <p className="font-medium">Paso 3: Normalizar</p>
                          <p className="text-muted-foreground">||u₁|| = √10 ≈ 3.162</p>
                          <p className="text-muted-foreground">e₁ = (3,1,0)/3.162 ≈ (0.949, 0.316, 0)</p>
                          <p className="text-muted-foreground">||u₂|| = √(0.16+1.44) ≈ 1.265</p>
                          <p className="text-muted-foreground">e₂ = (-0.4,1.2,0)/1.265 ≈ (-0.316, 0.949, 0)</p>
                        </div>

                        <div>
                          <p className="font-medium">Verificación:</p>
                          <p className="text-muted-foreground">e₁·e₂ = 0.949×(-0.316) + 0.316×0.949 ≈ 0 ✓</p>
                          <p className="text-muted-foreground">||e₁|| = 1 ✓, ||e₂|| = 1 ✓</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-base mb-2">6. Aplicaciones</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li>Construcción de bases ortogonales para espacios vectoriales</li>
                      <li>Resolución de sistemas de ecuaciones por mínimos cuadrados</li>
                      <li>Descomposición QR de matrices</li>
                      <li>Análisis de componentes principales (PCA)</li>
                      <li>Procesamiento de señales y compresión de datos</li>
                    </ul>
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
                      <CardDescription>Vectores originales y vectores ortonormales resultantes</CardDescription>
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
                      
                      {/* Controles de visualización 3D */}
                      <div className="mt-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Controles de rotación */}
                          <div className="space-y-3">
                            <h4 className="font-medium text-sm flex items-center gap-2">
                              <RotateCcw className="h-4 w-4" />
                              Rotación
                            </h4>
                            <div className="space-y-2">
                              <div>
                                <Label className="text-xs">Eje X: {rotacionX}°</Label>
                                <input
                                  type="range"
                                  min="0"
                                  max="360"
                                  value={rotacionX}
                                  onChange={(e) => setRotacionX(Number(e.target.value))}
                                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Eje Y: {rotacionY}°</Label>
                                <input
                                  type="range"
                                  min="0"
                                  max="360"
                                  value={rotacionY}
                                  onChange={(e) => setRotacionY(Number(e.target.value))}
                                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Eje Z: {rotacionZ}°</Label>
                                <input
                                  type="range"
                                  min="0"
                                  max="360"
                                  value={rotacionZ}
                                  onChange={(e) => setRotacionZ(Number(e.target.value))}
                                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Controles de zoom */}
                          <div className="space-y-3">
                            <h4 className="font-medium text-sm flex items-center gap-2">
                              <ZoomIn className="h-4 w-4" />
                              Zoom
                            </h4>
                            <div className="space-y-2">
                              <div>
                                <Label className="text-xs">Zoom: {zoom.toFixed(1)}x</Label>
                                <input
                                  type="range"
                                  min="0.1"
                                  max="3"
                                  step="0.1"
                                  value={zoom}
                                  onChange={(e) => setZoom(Number(e.target.value))}
                                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setZoom(1)}
                                  className="text-xs"
                                >
                                  Reset Zoom
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setRotacionX(0)
                                    setRotacionY(0)
                                    setRotacionZ(0)
                                  }}
                                  className="text-xs"
                                >
                                  Reset Rotación
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Rotación automática */}
                        <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                          <div>
                            <Label className="text-sm font-medium">Rotación Automática</Label>
                            <p className="text-xs text-gray-600">Gira automáticamente alrededor del eje Y</p>
                          </div>
                          <Button
                            size="sm"
                            variant={autoRotacion ? "default" : "outline"}
                            onClick={() => setAutoRotacion(!autoRotacion)}
                          >
                            {autoRotacion ? "Detener" : "Iniciar"}
                          </Button>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium mb-2">Vectores Originales:</p>
                          <div className="space-y-1">
                            {vectores.map((v, i) => (
                              <div key={v.id} className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded" style={{ backgroundColor: v.color }} />
                                <span>v{i + 1}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="font-medium mb-2">Vectores Ortonormales:</p>
                          <div className="space-y-1">
                            {vectores.map((v, i) => (
                              <div key={v.id} className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded" style={{ backgroundColor: RESULT_COLORS[i] }} />
                                <span>e{i + 1}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {resultado && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Resultados</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="font-medium mb-2">Vectores Ortonormales:</p>
                          <div className="space-y-2">
                            {resultado.vectoresOrtonormales.map((v: Vector3D, i: number) => (
                              <div key={i} className="p-3 bg-pink-50 rounded-lg">
                                <p className="font-mono text-sm">
                                  e{i + 1} = ({v.x.toFixed(4)}, {v.y.toFixed(4)}, {v.z.toFixed(4)})
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="p-4 bg-blue-50 rounded-lg max-h-80 overflow-y-auto">
                          <p className="font-medium text-blue-900 mb-2">Pasos del proceso:</p>
                          <div className="space-y-1 text-xs text-blue-800">
                            {resultado.pasos.map((paso: string, i: number) => (
                              <p key={i} className="font-mono whitespace-pre-wrap">
                                {paso}
                              </p>
                            ))}
                          </div>
                        </div>

                        <div className="p-4 bg-green-50 rounded-lg">
                          <p className="font-medium text-green-900 mb-1">Explicación:</p>
                          <p className="text-sm text-green-800">{resultado.explicacion}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Vectores de Entrada</CardTitle>
                      <CardDescription>Deben ser linealmente independientes</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {vectores.map((vector, index) => (
                          <div key={vector.id} className="p-3 border rounded-lg space-y-2">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded" style={{ backgroundColor: vector.color }} />
                                <span className="font-medium text-sm">v{index + 1}</span>
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

                      {vectores.length < 3 && (
                        <Button onClick={agregarVector} variant="outline" className="w-full bg-transparent" size="sm">
                          <Plus className="mr-2 h-4 w-4" />
                          Agregar Vector
                        </Button>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Proceso</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button onClick={aplicarGramSchmidt} className="w-full">
                        Aplicar Gram-Schmidt
                      </Button>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          onClick={() => {
                            if (canvasRef.current) {
                              console.log("Canvas encontrado:", canvasRef.current)
                              const canvas = canvasRef.current
                              const ctx = canvas.getContext('2d')
                              
                              if (ctx) {
                                console.log("Contexto 2D obtenido")
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
                                ctx.fillText('Canvas funcionando', 250, 280)
                                ctx.fillText('X', 580, 290)
                                ctx.fillText('Y', 310, 20)
                                
                                console.log("Dibujo básico completado")
                                
                                // Ahora intentar con el renderer
                                try {
                                  const newRenderer = new CanvasRenderer(canvas)
                                  newRenderer.renderizarEscena()
                                  setRenderer(newRenderer)
                                  console.log("Plano renderizado con renderer")
                                } catch (error) {
                                  console.error("Error al renderizar:", error)
                                }
                              } else {
                                console.log("No se pudo obtener contexto 2D")
                              }
                            } else {
                              console.log("Canvas no encontrado")
                            }
                          }} 
                          variant="outline"
                          size="sm"
                        >
                          Debug Canvas
                        </Button>
                        <Button 
                          onClick={() => {
                            if (renderer) {
                              renderer.limpiar()
                              renderer.renderizarEscena()
                              console.log("Canvas limpiado y escena renderizada")
                            } else {
                              console.log("Renderer no disponible")
                            }
                          }} 
                          variant="outline"
                          size="sm"
                        >
                          Limpiar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Controles 3D</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Cómo usar los controles:</h4>
                        <ul className="text-blue-800 text-xs space-y-1">
                          <li>• <strong>Rotación:</strong> Gira los vectores en 3D para verlos desde diferentes ángulos</li>
                          <li>• <strong>Zoom:</strong> Amplía o reduce la visualización de los vectores</li>
                          <li>• <strong>Rotación Automática:</strong> Gira automáticamente para una vista dinámica</li>
                          <li>• <strong>Reset:</strong> Vuelve a la vista original</li>
                        </ul>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <h4 className="font-medium text-green-900 mb-2">Consejos:</h4>
                        <ul className="text-green-800 text-xs space-y-1">
                          <li>• Usa la rotación para entender mejor la geometría 3D</li>
                          <li>• El zoom ayuda a ver detalles de vectores pequeños</li>
                          <li>• La rotación automática es útil para presentaciones</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Ejemplos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button
                        onClick={() => {
                          setVectores([
                            { id: "1", x: "3", y: "1", z: "0", color: COLORS[0] },
                            { id: "2", x: "2", y: "2", z: "0", color: COLORS[1] },
                          ])
                          // Renderizar vectores inmediatamente
                          setTimeout(() => {
                            if (renderer) {
                              renderer.limpiar()
                              renderer.renderizarEscena()
                              const vectoresValidos = [
                                new Vector3D(3, 1, 0, "v1"),
                                new Vector3D(2, 2, 0, "v2")
                              ]
                              vectoresValidos.forEach((vec, i) => {
                                const vectorTransformado = aplicarTransformaciones3D(vec)
                                renderer.dibujarVector(vectorTransformado, COLORS[i])
                              })
                              console.log("Ejemplo 2D renderizado")
                            }
                          }, 100)
                        }}
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                      >
                        Ejemplo 2D
                      </Button>
                      <Button
                        onClick={() => {
                          setVectores([
                            { id: "1", x: "1", y: "1", z: "0", color: COLORS[0] },
                            { id: "2", x: "1", y: "0", z: "1", color: COLORS[1] },
                            { id: "3", x: "0", y: "1", z: "1", color: COLORS[2] },
                          ])
                          // Renderizar vectores inmediatamente
                          setTimeout(() => {
                            if (renderer) {
                              renderer.limpiar()
                              renderer.renderizarEscena()
                              const vectoresValidos = [
                                new Vector3D(1, 1, 0, "v1"),
                                new Vector3D(1, 0, 1, "v2"),
                                new Vector3D(0, 1, 1, "v3")
                              ]
                              vectoresValidos.forEach((vec, i) => {
                                const vectorTransformado = aplicarTransformaciones3D(vec)
                                renderer.dibujarVector(vectorTransformado, COLORS[i])
                              })
                              console.log("Ejemplo 3D renderizado")
                            }
                          }, 100)
                        }}
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                      >
                        Ejemplo 3D
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
