"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, TrendingUp } from "lucide-react"
import { EmprendimientoService } from "@/src/servicios/EmprendimientoService"
import { CasoEmprendimiento } from "@/src/entidades/CasoEmprendimiento"
import { Progreso } from "@/src/entidades/Progreso"

export default function EmprendimientoPage() {
  const router = useRouter()
  const { progreso, actualizarProgreso } = useAuth()
  const [service] = useState(() => new EmprendimientoService())

  const [caso] = useState(() => {
    const opciones = [
      {
        id: "opcion-1",
        nombre: "Local Pequeño",
        descripcion: "Local pequeño en zona comercial",
        inversionInicial: 50000,
        alquilerMensual: 10000,
        ventasEstimadas: 1000,
        costoUnitario: 15,
        precioVenta: 35,
      },
      {
        id: "opcion-2",
        nombre: "Local Grande",
        descripcion: "Local grande en zona premium",
        inversionInicial: 100000,
        alquilerMensual: 20000,
        ventasEstimadas: 2000,
        costoUnitario: 15,
        precioVenta: 40,
      },
    ]

    return new CasoEmprendimiento(
      "caso-1",
      "Empanadas del Saber",
      "María quiere abrir un negocio de empanadas educativas. Tiene dos opciones de local y necesita decidir cuál es más viable.",
      "María",
      150000,
      opciones,
    )
  })

  const [opcionSeleccionada, setOpcionSeleccionada] = useState<string>("opcion-1")
  const [ventasEstimadas, setVentasEstimadas] = useState("")
  const [resultado, setResultado] = useState<{
    puntoEquilibrio: number
    utilidadMensual: number
    margenUtilidad: number
    retornoInversion: number
    viabilidad: "alta" | "media" | "baja"
    recomendaciones: string[]
  } | null>(null)

  const calcularViabilidad = () => {
    const ventas = Number.parseInt(ventasEstimadas)
    if (isNaN(ventas) || ventas <= 0) {
      alert("Por favor ingresa un número válido de ventas")
      return
    }

    const opcion = caso.obtenerOpcion(opcionSeleccionada)
    if (!opcion) return

    const opcionActualizada = { ...opcion, ventasEstimadas: ventas }
    const analisis = service.analizarOpcion(opcionActualizada)
    setResultado(analisis)

    // Mark as completed
    if (progreso && !progreso.leccionesCompletadas.includes("emprendimiento-1")) {
      const nuevoProgreso = Progreso.fromJSON({
        ...progreso,
        leccionesCompletadas: [...progreso.leccionesCompletadas, "emprendimiento-1"],
        puntajeTotal: progreso.puntajeTotal + 100,
      })
      actualizarProgreso(nuevoProgreso)
    }
  }

  const opcionActual = caso.obtenerOpcion(opcionSeleccionada)

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
        <header className="border-b bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Dashboard
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center p-3 bg-green-100 rounded-full mb-4">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Caso de Emprendimiento</h1>
            <p className="text-muted-foreground">Analiza la viabilidad de un negocio real</p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{caso.titulo}</CardTitle>
              <CardDescription>{caso.descripcion}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="opcion">Selecciona una opción de local</Label>
                <select
                  id="opcion"
                  value={opcionSeleccionada}
                  onChange={(e) => setOpcionSeleccionada(e.target.value)}
                  className="w-full mt-2 p-2 border rounded-md"
                >
                  {caso.opciones.map((op) => (
                    <option key={op.id} value={op.id}>
                      {op.nombre} - {op.descripcion}
                    </option>
                  ))}
                </select>
              </div>

              {opcionActual && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Inversión Inicial</p>
                    <p className="text-2xl font-bold">${opcionActual.inversionInicial.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Precio por Unidad</p>
                    <p className="text-2xl font-bold">${opcionActual.precioVenta}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Costo por Unidad</p>
                    <p className="text-2xl font-bold">${opcionActual.costoUnitario}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Alquiler Mensual</p>
                    <p className="text-2xl font-bold">${opcionActual.alquilerMensual.toLocaleString()}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Análisis de Viabilidad</CardTitle>
              <CardDescription>Ingresa las ventas mensuales estimadas para analizar el negocio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ventas">Ventas Mensuales Estimadas (unidades)</Label>
                <Input
                  id="ventas"
                  type="number"
                  placeholder="Ej: 1000"
                  value={ventasEstimadas}
                  onChange={(e) => setVentasEstimadas(e.target.value)}
                />
              </div>
              <Button onClick={calcularViabilidad} className="w-full">
                Calcular Viabilidad
              </Button>
            </CardContent>
          </Card>

          {resultado && (
            <Card
              className={
                resultado.viabilidad === "alta"
                  ? "border-green-500"
                  : resultado.viabilidad === "media"
                    ? "border-yellow-500"
                    : "border-red-500"
              }
            >
              <CardHeader>
                <CardTitle>Resultados del Análisis</CardTitle>
                <CardDescription>
                  Viabilidad: <strong className="uppercase">{resultado.viabilidad}</strong>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Punto de Equilibrio</p>
                    <p className="text-xl font-bold">{resultado.puntoEquilibrio} unidades</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Utilidad Mensual</p>
                    <p
                      className={`text-xl font-bold ${resultado.utilidadMensual > 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      ${resultado.utilidadMensual.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Margen de Utilidad</p>
                    <p className="text-xl font-bold text-blue-600">{resultado.margenUtilidad.toFixed(2)}%</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Retorno de Inversión</p>
                    <p className="text-xl font-bold">{resultado.retornoInversion.toFixed(1)} meses</p>
                  </div>
                </div>

                {resultado.recomendaciones.length > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="font-medium text-blue-900 mb-2">Recomendaciones:</p>
                    <ul className="space-y-1 text-sm text-blue-800">
                      {resultado.recomendaciones.map((rec, i) => (
                        <li key={i}>• {rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}
