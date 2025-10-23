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
import { ArrowLeft, BookOpen, Calculator, Plus, Trash2 } from "lucide-react"
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

  useEffect(() => {
    if (canvasRef.current) {
      const newRenderer = new CanvasRenderer(canvasRef.current)
      newRenderer.renderizarEscena()
      setRenderer(newRenderer)
    }
  }, [])

  const agregarVector = () => {
    if (vectores.length >= 3) {
      alert("Máximo 3 vectores permitidos")
      return
    }
    const nuevoId = (Math.max(...vectores.map((v) => Number.parseInt(v.id))) + 1).toString()
    setVectores([...vectores, { id: nuevoId, x: "", y: "", z: "", color: COLORS[vectores.length % COLORS.length] }])
  }

  const eliminarVector = (id: string) => {
    if (vectores.length <= 2) {
      alert("Debe haber al menos 2 vectores")
      return
    }
    setVectores(vectores.filter((v) => v.id !== id))
  }

  const actualizarVector = (id: string, campo: "x" | "y" | "z", valor: string) => {
    setVectores(vectores.map((v) => (v.id === id ? { ...v, [campo]: valor } : v)))
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

  const aplicarGramSchmidt = () => {
    const vectoresValidos = vectores.map(crearVector).filter((v): v is Vector3D => v !== null)

    if (vectoresValidos.length < 2) {
      alert("Por favor ingresa al menos 2 vectores válidos")
      return
    }

    try {
      const res = service.gramSchmidt(vectoresValidos)
      setResultado(res)

      // Visualize vectors
      if (renderer) {
        renderer.limpiar()
        renderer.renderizarEscena()

        // Original vectors
        vectoresValidos.forEach((vec, i) => {
          renderer.dibujarVector(vec, vectores[i].color)
        })

        // Orthonormal vectors
        res.vectoresOrtonormales.forEach((vec, i) => {
          renderer.dibujarVector(vec, RESULT_COLORS[i])
        })
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
                        className="border rounded-lg w-full max-w-[600px] mx-auto bg-white"
                      />
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
                    <CardContent>
                      <Button onClick={aplicarGramSchmidt} className="w-full">
                        Aplicar Gram-Schmidt
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Ejemplos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button
                        onClick={() =>
                          setVectores([
                            { id: "1", x: "3", y: "1", z: "0", color: COLORS[0] },
                            { id: "2", x: "2", y: "2", z: "0", color: COLORS[1] },
                          ])
                        }
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                      >
                        Ejemplo 2D
                      </Button>
                      <Button
                        onClick={() =>
                          setVectores([
                            { id: "1", x: "1", y: "1", z: "0", color: COLORS[0] },
                            { id: "2", x: "1", y: "0", z: "1", color: COLORS[1] },
                            { id: "3", x: "0", y: "1", z: "1", color: COLORS[2] },
                          ])
                        }
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
