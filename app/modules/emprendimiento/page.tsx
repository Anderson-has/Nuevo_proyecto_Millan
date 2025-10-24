"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, TrendingUp, Calculator, DollarSign, Target, ChartBar, Lightbulb, FileText, BarChart3, CheckCircle, AlertTriangle, Home, RotateCcw } from "lucide-react"

export default function EmprendimientoPage() {
  const router = useRouter()
  const { progreso, actualizarProgreso } = useAuth()
  
  const [opcionSeleccionada, setOpcionSeleccionada] = useState<string>("")
  const [decisionTomada, setDecisionTomada] = useState<boolean>(false)
  const [analisisCompletado, setAnalisisCompletado] = useState<boolean>(false)

  // Datos del caso de María
  const casoEmprendimiento = {
    nombre: "María",
    edad: 25,
    capital: 5000000,
    descripcion: "María es una joven emprendedora de 25 años que vive en un barrio popular de la ciudad. Ha trabajado en varios restaurantes y ha desarrollado una receta secreta de empanadas que todos sus amigos y familiares adoran. María está considerando abrir su propio negocio de empanadas, pero tiene dudas sobre la viabilidad de su proyecto. Ha ahorrado $5.000.000 de pesos colombianos y está evaluando dos opciones principales para su emprendimiento.",
    opciones: [
      {
        id: "local-fijo",
        nombre: "Local Fijo",
        descripcion: "Abrir un local pequeño en el barrio con alquiler mensual",
        icono: "🏪",
        inversionInicial: 3000000,
        alquilerMensual: 800000,
        ventasProyectadas: 300,
        costoUnitario: 2500,
        precioVenta: 4000,
        gananciaUnitaria: 1500
      },
      {
        id: "móviles",
        nombre: "Empanadas Móviles",
        descripcion: "Vendedor de empanadas en carrito móvil por el barrio",
        icono: "🚚",
        inversionInicial: 2000000,
        alquilerMensual: 0,
        ventasProyectadas: 200,
        costoUnitario: 2500,
        precioVenta: 4000,
        gananciaUnitaria: 1500
      }
    ]
  }

  const realizarDecision = () => {
    if (opcionSeleccionada) {
      setDecisionTomada(true)
    }
  }

  const confirmarDecision = () => {
    setAnalisisCompletado(true)
    // Marcar como completado en el progreso
    if (progreso && !progreso.leccionesCompletadas.includes("emprendimiento-maria")) {
      const nuevoProgreso = {
        ...progreso,
        leccionesCompletadas: [...progreso.leccionesCompletadas, "emprendimiento-maria"],
        puntajeTotal: progreso.puntajeTotal + 100,
      }
      actualizarProgreso(nuevoProgreso)
    }
  }

  const opcionActual = casoEmprendimiento.opciones.find(op => op.id === opcionSeleccionada)

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
        <header className="border-b bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Dashboard
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header del caso */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center p-3 bg-orange-100 rounded-full mb-4">
              <span className="text-4xl animate-bounce">🥟</span>
            </div>
            <h1 className="text-3xl font-bold mb-2 text-blue-800">
              Caso de Emprendimiento:<br />
              "Empanadas del Barrio"
            </h1>
            <div className="text-4xl mb-4">🧑‍🍳</div>
          </div>

          <Tabs defaultValue="escenario" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="escenario">El Escenario</TabsTrigger>
              <TabsTrigger value="costos">Costos</TabsTrigger>
              <TabsTrigger value="ingresos">Ingresos</TabsTrigger>
              <TabsTrigger value="equilibrio">Equilibrio</TabsTrigger>
              <TabsTrigger value="proyecciones">Proyecciones</TabsTrigger>
              <TabsTrigger value="decision">Decisión</TabsTrigger>
            </TabsList>

            {/* EL ESCENARIO */}
            <TabsContent value="escenario" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-600">El Escenario</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    {casoEmprendimiento.descripcion}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-blue-50">
                      <CardContent className="pt-6">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">💰</div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Capital Disponible</p>
                            <p className="text-lg font-bold text-blue-800">${casoEmprendimiento.capital.toLocaleString()} pesos colombianos</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-red-50">
                      <CardContent className="pt-6">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">🎯</div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Objetivo</p>
                            <p className="text-lg font-bold text-red-800">Crear un negocio sostenible de empanadas</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-green-50">
                      <CardContent className="pt-6">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">📍</div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Ubicación</p>
                            <p className="text-lg font-bold text-green-800">Barrio popular de la ciudad</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ANÁLISIS DE COSTOS Y GASTOS */}
            <TabsContent value="costos" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-600 flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Análisis de Costos y Gastos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center">
                          <Lightbulb className="mr-2 h-4 w-4 text-yellow-500" />
                          Concepto
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700">
                          Los costos son los gastos necesarios para producir un producto o servicio.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-purple-500">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center">
                          <Calculator className="mr-2 h-4 w-4" />
                          Fórmula
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-blue-800 text-white p-3 rounded text-center">
                          <p className="font-bold">Costo Total = Costos Fijos + Costos Variables</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-orange-500">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center">
                          <FileText className="mr-2 h-4 w-4" />
                          Explicación
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700">
                          Los costos fijos no cambian con la cantidad producida (alquiler, salarios), mientras que los costos variables sí cambian (ingredientes, empaques).
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="border-l-4 border-l-green-500 bg-green-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Ejemplo Práctico
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700">
                        Si María paga $500,000 de alquiler (fijo) y $2,000 por cada empanada en ingredientes (variable), para 100 empanadas:<br />
                        <strong>Costo Total = $500,000 + ($2,000 × 100) = $700,000</strong>
                      </p>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>

            {/* CÁLCULO DE INGRESOS Y GANANCIAS */}
            <TabsContent value="ingresos" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600 flex items-center">
                    <DollarSign className="mr-2 h-5 w-5" />
                    Cálculo de Ingresos y Ganancias
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center">
                          <Lightbulb className="mr-2 h-4 w-4 text-yellow-500" />
                          Concepto
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700">
                          Los ingresos son el dinero que entra al negocio por las ventas, y las ganancias son los ingresos menos los costos.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-purple-500">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center">
                          <Calculator className="mr-2 h-4 w-4" />
                          Fórmula
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-green-800 text-white p-3 rounded text-center">
                          <p className="font-bold">Ganancia = (Precio - Costo) × Cantidad</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-orange-500">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center">
                          <FileText className="mr-2 h-4 w-4" />
                          Explicación
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700">
                          La ganancia por unidad se multiplica por la cantidad vendida para obtener la ganancia total.
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="border-l-4 border-l-green-500 bg-green-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Ejemplo Práctico
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700">
                        Si María vende empanadas a $4,000 y cada una le cuesta $2,500, su ganancia por empanada es $1,500.<br />
                        Para 100 empanadas: <strong>Ganancia = $1,500 × 100 = $150,000</strong>
                      </p>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>

            {/* PUNTO DE EQUILIBRIO */}
            <TabsContent value="equilibrio" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600 flex items-center">
                    <Target className="mr-2 h-5 w-5" />
                    Punto de Equilibrio
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center">
                          <Lightbulb className="mr-2 h-4 w-4 text-yellow-500" />
                          Concepto
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700">
                          Es el punto donde los ingresos igualan a los costos totales. No hay ganancia ni pérdida.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-purple-500">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center">
                          <Calculator className="mr-2 h-4 w-4" />
                          Fórmula
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-red-800 text-white p-3 rounded text-center">
                          <p className="font-bold">Punto de Equilibrio = Costos Fijos ÷ (Precio - Costo Variable)</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-orange-500">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center">
                          <FileText className="mr-2 h-4 w-4" />
                          Explicación
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700">
                          Se divide los costos fijos entre la ganancia por unidad para saber cuántas unidades debe vender para cubrir costos.
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="border-l-4 border-l-green-500 bg-green-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Ejemplo Práctico
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700">
                        Si María tiene costos fijos de $800,000 y gana $1,500 por empanada:<br />
                        <strong>Punto de Equilibrio = $800,000 ÷ $1,500 = 533 empanadas/mes</strong>
                      </p>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>

            {/* PROYECCIONES FINANCIERAS */}
            <TabsContent value="proyecciones" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-purple-600 flex items-center">
                    <ChartBar className="mr-2 h-5 w-5" />
                    Proyecciones Financieras
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center">
                          <Lightbulb className="mr-2 h-4 w-4 text-yellow-500" />
                          Concepto
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700">
                          Las proyecciones financieras estiman los resultados futuros del negocio basándose en datos actuales.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-purple-500">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center">
                          <Calculator className="mr-2 h-4 w-4" />
                          Fórmula
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-purple-800 text-white p-3 rounded text-center">
                          <p className="font-bold">Ganancia Mensual = (Ventas × Ganancia Unit.) - Costos Fijos</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-orange-500">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center">
                          <FileText className="mr-2 h-4 w-4" />
                          Explicación
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700">
                          Se calculan los ingresos proyectados y se restan los costos para estimar la ganancia mensual.
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="border-l-4 border-l-green-500 bg-green-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Ejemplo Práctico
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700">
                        Si María proyecta vender 300 empanadas/mes con ganancia de $1,500 cada una y costos fijos de $800,000:<br />
                        <strong>Ganancia Mensual = (300 × $1,500) - $800,000 = $450,000 - $800,000 = -$350,000</strong><br />
                        <span className="text-red-600">¡Necesita ajustar sus proyecciones!</span>
                      </p>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TOMA DE DECISIÓN */}
            <TabsContent value="decision" className="space-y-6">
              {!decisionTomada ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-center text-purple-600 flex items-center justify-center">
                      <span className="text-2xl mr-2">🤔</span>
                      Toma tu decisión
                    </CardTitle>
                    <CardDescription className="text-center">
                      Ahora que has aprendido los conceptos necesarios, es hora de ayudar a María a elegir la mejor opción para su emprendimiento.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {casoEmprendimiento.opciones.map((opcion) => (
                        <Card 
                          key={opcion.id}
                          className={`cursor-pointer transition-all duration-200 ${
                            opcionSeleccionada === opcion.id 
                              ? 'ring-2 ring-purple-500 bg-purple-50' 
                              : 'hover:shadow-lg'
                          }`}
                          onClick={() => setOpcionSeleccionada(opcion.id)}
                        >
                          <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                              <div className="flex items-center">
                                <span className="text-2xl mr-2">{opcion.icono}</span>
                                {opcion.nombre}
                              </div>
                              {opcionSeleccionada === opcion.id ? (
                                <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
                                  <CheckCircle className="w-4 h-4 text-white" />
                                </div>
                              ) : (
                                <div className="w-6 h-6 border-2 border-gray-300 rounded"></div>
                              )}
                            </CardTitle>
                            <CardDescription>{opcion.descripcion}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">💰 Inversión Inicial:</span>
                                <span className="font-bold">${opcion.inversionInicial.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">🏠 Alquiler Mensual:</span>
                                <span className="font-bold">${opcion.alquilerMensual.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">📊 Proyección Ventas:</span>
                                <span className="font-bold">{opcion.ventasProyectadas} empanadas/mes</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    <div className="mt-6 text-center">
                      <Button 
                        onClick={realizarDecision}
                        disabled={!opcionSeleccionada}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        Realizar Análisis
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : !analisisCompletado ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-center text-green-600">Análisis Detallado de la Opción Seleccionada</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {opcionActual && (
                      <div className="space-y-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="font-bold mb-2">Detalles del negocio</h3>
                          <p className="text-sm text-gray-700">
                            {opcionActual.id === "local-fijo" 
                              ? "Local de 20m² en zona comercial del barrio, con cocina básica y mostrador de ventas."
                              : "Carrito móvil para venta ambulante por diferentes puntos del barrio."
                            }
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card className="bg-blue-50">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm text-blue-800">Desglose de Costos</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm">Costo por empanada:</span>
                                  <span className="font-bold">${opcionActual.costoUnitario}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm">Precio de venta:</span>
                                  <span className="font-bold">${opcionActual.precioVenta}</span>
                                </div>
                                <div className="flex justify-between border-t pt-2">
                                  <span className="text-sm">Ganancia por empanada:</span>
                                  <span className="font-bold text-green-600">${opcionActual.gananciaUnitaria}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="bg-green-50">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm text-green-800">Punto de Equilibrio</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                  {Math.ceil(opcionActual.alquilerMensual / opcionActual.gananciaUnitaria)} empanadas/mes
                                </div>
                                <p className="text-xs text-gray-600 mt-1">Punto donde ingresos = costos</p>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="bg-purple-50">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm text-purple-800">Ganancia Mensual</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600">
                                  ${((opcionActual.ventasProyectadas * opcionActual.gananciaUnitaria) - opcionActual.alquilerMensual).toLocaleString()} pesos
                                </div>
                                <p className="text-xs text-gray-600 mt-1">Con {opcionActual.ventasProyectadas} empanadas/mes</p>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        <Card className="bg-orange-50">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm text-orange-800">Recuperación de Inversión</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-orange-600">
                                {Math.ceil(opcionActual.inversionInicial / ((opcionActual.ventasProyectadas * opcionActual.gananciaUnitaria) - opcionActual.alquilerMensual))} meses
                              </div>
                              <p className="text-xs text-gray-600 mt-1">Tiempo para recuperar inversión inicial</p>
                            </div>
                          </CardContent>
                        </Card>

                        <div className="flex gap-4 justify-center">
                          <Button 
                            onClick={confirmarDecision}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Confirmar esta decisión
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => setDecisionTomada(false)}
                          >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Cambiar opción
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-center text-green-600 flex items-center justify-center">
                      <Target className="mr-2 h-5 w-5" />
                      Decisión tomada
                    </CardTitle>
                    <div className="flex justify-center mb-4">
                      <div className="w-12 h-12 bg-green-500 rounded flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {opcionActual && (
                      <div className="space-y-6">
                        <div className="text-center">
                          <p className="text-green-600 font-medium mb-2">Ha elegido:</p>
                          <div className="flex items-center justify-center space-x-2">
                            <span className="text-xl">{opcionActual.icono}</span>
                            <span className="text-lg font-bold text-green-600">{opcionActual.nombre}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{opcionActual.descripcion}</p>
                        </div>

                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center">
                              <BarChart3 className="mr-2 h-4 w-4" />
                              Análisis de tu Decisión
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <Card className="bg-blue-50 border-l-4 border-l-blue-500">
                                <CardContent className="pt-4">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <Lightbulb className="h-4 w-4 text-orange-500" />
                                    <span className="font-medium">Ganancia Mensual Proyectada</span>
                                  </div>
                                  <div className="text-xl font-bold text-green-600">
                                    ${((opcionActual.ventasProyectadas * opcionActual.gananciaUnitaria) - opcionActual.alquilerMensual).toLocaleString()} pesos
                                  </div>
                                </CardContent>
                              </Card>

                              <Card className="bg-green-50 border-l-4 border-l-green-500">
                                <CardContent className="pt-4">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <Target className="h-4 w-4 text-orange-500" />
                                    <span className="font-medium">Tiempo de Recuperación</span>
                                  </div>
                                  <div className="text-xl font-bold text-green-600">
                                    {Math.ceil(opcionActual.inversionInicial / ((opcionActual.ventasProyectadas * opcionActual.gananciaUnitaria) - opcionActual.alquilerMensual))} meses
                                  </div>
                                </CardContent>
                              </Card>

                              <Card className="bg-purple-50 border-l-4 border-l-purple-500">
                                <CardContent className="pt-4">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <ChartBar className="h-4 w-4 text-orange-500" />
                                    <span className="font-medium">Punto de Equilibrio</span>
                                  </div>
                                  <div className="text-xl font-bold text-green-600">
                                    {Math.ceil(opcionActual.alquilerMensual / opcionActual.gananciaUnitaria)} empanadas/mes
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-orange-50 border-l-4 border-l-orange-500">
                          <CardHeader className="pb-3">
                            <CardTitle className="flex items-center">
                              <Lightbulb className="mr-2 h-4 w-4 text-orange-500" />
                              Retroalimentación
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-gray-700 mb-4">
                              {opcionActual.id === "local-fijo" 
                                ? "Opción A - Local Fijo: Excelente elección si buscas estabilidad y mayor volumen de ventas. Aunque requiere más inversión inicial, el local fijo te da credibilidad y permite atender más clientes."
                                : "Opción B - Empanadas Móviles: Buena opción para empezar con menos capital. Te permite probar el mercado y tener flexibilidad de ubicación, aunque con menor capacidad de producción."
                              }
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium text-green-700 mb-2">✅ Ventajas:</h4>
                                <ul className="text-sm text-green-600 space-y-1">
                                  {opcionActual.id === "local-fijo" ? (
                                    <>
                                      <li>• Mayor capacidad de producción</li>
                                      <li>• Presencia estable en el barrio</li>
                                      <li>• Mejor para atender más clientes</li>
                                    </>
                                  ) : (
                                    <>
                                      <li>• Menor inversión inicial</li>
                                      <li>• Flexibilidad de ubicación</li>
                                      <li>• Menor riesgo financiero</li>
                                    </>
                                  )}
                                </ul>
                              </div>
                              <div>
                                <h4 className="font-medium text-orange-700 mb-2">⚠️ Consideraciones:</h4>
                                <ul className="text-sm text-orange-600 space-y-1">
                                  {opcionActual.id === "local-fijo" ? (
                                    <>
                                      <li>• Requiere más capital inicial</li>
                                      <li>• Costos fijos más altos</li>
                                      <li>• Mayor compromiso a largo plazo</li>
                                    </>
                                  ) : (
                                    <>
                                      <li>• Menor volumen de ventas</li>
                                      <li>• Dependencia del clima</li>
                                      <li>• Menos presencia estable</li>
                                    </>
                                  )}
                                </ul>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <div className="flex gap-4 justify-center">
                          <Button 
                            onClick={() => router.push("/dashboard")}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            <Home className="mr-2 h-4 w-4" />
                            Volver al Dashboard
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => {
                              setDecisionTomada(false)
                              setAnalisisCompletado(false)
                              setOpcionSeleccionada("")
                            }}
                          >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Reconsiderar Decisión
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ProtectedRoute>
  )
}