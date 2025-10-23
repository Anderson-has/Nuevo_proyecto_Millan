"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Calculator, Plus, Trash2 } from "lucide-react"
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

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"]

export default function VectoresPage() {
  const router = useRouter()
  const { progreso, actualizarProgreso } = useAuth()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [renderer, setRenderer] = useState<CanvasRenderer | null>(null)
  const [service] = useState(() => new VectorOperationsService())

  const [vectores, setVectores] = useState<VectorInput[]>([
    { id: "1", x: "", y: "", z: "", color: COLORS[0] },
    { id: "2", x: "", y: "", z: "", color: COLORS[1] },
  ])
  const [resultado, setResultado] = useState<Vector3D | null>(null)
  const [pasos, setPasos] = useState<string[]>([])

  useEffect(() => {
    if (canvasRef.current) {
      const newRenderer = new CanvasRenderer(canvasRef.current)
      newRenderer.renderizarEscena()
      setRenderer(newRenderer)
    }
  }, [])

  const agregarVector = () => {
    if (vectores.length >= 8) {
      alert("Máximo 8 vectores permitidos")
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
    return new Vector3D(x, y, z, `V${v.id}`)
  }

  const sumarVectores = () => {
    const vectoresValidos = vectores.map(crearVector).filter((v): v is Vector3D => v !== null)

    if (vectoresValidos.length < 2) {
      alert("Por favor ingresa al menos 2 vectores válidos")
      return
    }

    const resultadoOp = service.sumarMultiples(vectoresValidos)
    setResultado(resultadoOp.resultado as Vector3D)
    setPasos(resultadoOp.pasos)

    // Visualize vectors
    if (renderer) {
      renderer.limpiar()
      renderer.renderizarEscena()

      vectoresValidos.forEach((vec, i) => {
        renderer.dibujarVector(vec, vectores[i].color)
      })

      renderer.dibujarVector(resultadoOp.resultado as Vector3D, "#000000")
    }

    // Mark as completed
    if (progreso && !progreso.leccionesCompletadas.includes("vectores-1")) {
      const nuevoProgreso = Progreso.fromJSON({
        ...progreso,
        leccionesCompletadas: [...progreso.leccionesCompletadas, "vectores-1"],
        puntajeTotal: progreso.puntajeTotal + 100,
      })
      actualizarProgreso(nuevoProgreso)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
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
            <div className="inline-flex items-center justify-center p-3 bg-purple-100 rounded-full mb-4">
              <Calculator className="h-8 w-8 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Suma de Vectores Múltiples</h1>
            <p className="text-muted-foreground">Suma 2 o más vectores 3D simultáneamente</p>
          </div>

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
                    className="border rounded-lg w-full max-w-[600px] mx-auto bg-white"
                  />
                  <div className="mt-4 flex flex-wrap gap-3 justify-center text-sm">
                    {vectores.map((v, i) => (
                      <div key={v.id} className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: v.color }} />
                        <span>Vector {i + 1}</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-black rounded" />
                      <span>Resultado</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {resultado && pasos.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Resultado y Pasos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Vector resultante:</p>
                        <p className="font-mono text-lg">
                          ({resultado.x.toFixed(2)}, {resultado.y.toFixed(2)}, {resultado.z.toFixed(2)})
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">Magnitud:</p>
                        <p className="text-xl font-bold">{resultado.magnitud().toFixed(2)}</p>
                      </div>

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
                  <CardTitle>Operación</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button onClick={sumarVectores} className="w-full">
                    Sumar Todos los Vectores
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Teoría</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p className="font-medium">Suma de Vectores:</p>
                  <p className="text-muted-foreground">
                    Para sumar múltiples vectores, se suman todas las componentes X, todas las Y, y todas las Z por
                    separado.
                  </p>
                  <p className="text-muted-foreground mt-2">
                    <strong>Ejemplo:</strong> Si V1=(1,2,3) y V2=(4,5,6), entonces V1+V2=(1+4, 2+5, 3+6)=(5,7,9)
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
