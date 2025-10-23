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
import { ArrowLeft, BookOpen, Calculator } from "lucide-react"
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

  useEffect(() => {
    if (canvasRef.current) {
      const newRenderer = new CanvasRenderer(canvasRef.current)
      newRenderer.renderizarEscena()
      setRenderer(newRenderer)
    }
  }, [])

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

  const realizarOperacion = (op: string) => {
    const segmento = crearSegmento()
    if (!segmento) {
      alert("Por favor ingresa puntos válidos")
      return
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
      default:
        return
    }

    setResultado(res.resultado)
    setPasos(res.pasos)
    setOperacion(op)

    // Visualize
    if (renderer) {
      renderer.limpiar()
      renderer.renderizarEscena()
      renderer.dibujarVector(segmento.puntoInicial, "#3B82F6")
      renderer.dibujarVector(segmento.puntoFinal, "#10B981")

      if (res.resultado instanceof Vector3D) {
        renderer.dibujarVector(res.resultado, "#EF4444")
      }
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
                        className="border rounded-lg w-full max-w-[600px] mx-auto bg-white"
                      />
                      <div className="mt-4 flex gap-4 justify-center text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-blue-500 rounded" />
                          <span>Punto A</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-green-500 rounded" />
                          <span>Punto B</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-red-500 rounded" />
                          <span>Resultado</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {resultado !== null && pasos.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Resultado y Pasos</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
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
                                onChange={(e) => setP1({ ...p1, x: e.target.value })}
                                step="0.1"
                                className="h-8"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Y</Label>
                              <Input
                                type="number"
                                value={p1.y}
                                onChange={(e) => setP1({ ...p1, y: e.target.value })}
                                step="0.1"
                                className="h-8"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Z</Label>
                              <Input
                                type="number"
                                value={p1.z}
                                onChange={(e) => setP1({ ...p1, z: e.target.value })}
                                step="0.1"
                                className="h-8"
                              />
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
                                onChange={(e) => setP2({ ...p2, x: e.target.value })}
                                step="0.1"
                                className="h-8"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Y</Label>
                              <Input
                                type="number"
                                value={p2.y}
                                onChange={(e) => setP2({ ...p2, y: e.target.value })}
                                step="0.1"
                                className="h-8"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Z</Label>
                              <Input
                                type="number"
                                value={p2.z}
                                onChange={(e) => setP2({ ...p2, z: e.target.value })}
                                step="0.1"
                                className="h-8"
                              />
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
                      <Button onClick={() => realizarOperacion("longitud")} className="w-full" size="sm">
                        Calcular Longitud
                      </Button>
                      <Button
                        onClick={() => realizarOperacion("puntoMedio")}
                        variant="outline"
                        className="w-full"
                        size="sm"
                      >
                        Punto Medio
                      </Button>
                      <Button
                        onClick={() => realizarOperacion("vectorDirector")}
                        variant="outline"
                        className="w-full"
                        size="sm"
                      >
                        Vector Director
                      </Button>
                      <Button
                        onClick={() => realizarOperacion("ecuacion")}
                        variant="outline"
                        className="w-full"
                        size="sm"
                      >
                        Ecuación Paramétrica
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
