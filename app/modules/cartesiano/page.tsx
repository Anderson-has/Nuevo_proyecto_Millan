"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, BookOpen } from "lucide-react"
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
    if (canvasRef.current) {
      const newRenderer = new CanvasRenderer(canvasRef.current)
      newRenderer.dibujarPlanoCartesiano()
      setRenderer(newRenderer)
    }
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
            <p className="text-muted-foreground">Grafica puntos y explora coordenadas</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Plano Cartesiano</CardTitle>
                  <CardDescription>Los puntos se graficarán en el plano</CardDescription>
                </CardHeader>
                <CardContent>
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={600}
                    className="border rounded-lg w-full max-w-[600px] mx-auto"
                  />
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
                  <Button onClick={limpiar} variant="outline" className="w-full bg-transparent">
                    Limpiar Plano
                  </Button>
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
        </main>
      </div>
    </ProtectedRoute>
  )
}
