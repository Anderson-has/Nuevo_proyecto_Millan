"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Calculator, Plus, Minus, X } from "lucide-react"
import { MatrixOperationsService } from "@/src/servicios/MatrixOperationsService"
import { Matriz } from "@/src/entidades/Matriz"
import { TablaRenderer } from "@/src/presentacion/TablaRenderer"
import { Progreso } from "@/src/entidades/Progreso"

export default function MatricesPage() {
  const router = useRouter()
  const { progreso, actualizarProgreso } = useAuth()
  const [service] = useState(() => new MatrixOperationsService())

  const [modo, setModo] = useState<"gauss" | "operaciones">("gauss")

  // For Gauss-Jordan
  const [filas, setFilas] = useState("3")
  const [columnas, setColumnas] = useState("4")
  const [matriz, setMatriz] = useState<Matriz | null>(null)
  const [resultado, setResultado] = useState<Matriz | null>(null)

  const [matriz1, setMatriz1] = useState<Matriz | null>(null)
  const [matriz2, setMatriz2] = useState<Matriz | null>(null)
  const [filas1, setFilas1] = useState("3")
  const [columnas1, setColumnas1] = useState("3")
  const [filas2, setFilas2] = useState("3")
  const [columnas2, setColumnas2] = useState("3")
  const [resultadoOp, setResultadoOp] = useState<Matriz | null>(null)
  const [pasosOp, setPasosOp] = useState<string[]>([])

  const crearMatriz = () => {
    const f = Number.parseInt(filas)
    const c = Number.parseInt(columnas)

    if (isNaN(f) || isNaN(c) || f < 2 || c < 2 || f > 10 || c > 10) {
      alert("Por favor ingresa dimensiones válidas (2-10)")
      return
    }

    const datos = Array(f)
      .fill(null)
      .map(() => Array(c).fill(0))
    const nuevaMatriz = new Matriz(f, c, datos)
    setMatriz(nuevaMatriz)
    setResultado(null)
  }

  const crearMatriz1 = () => {
    const f = Number.parseInt(filas1)
    const c = Number.parseInt(columnas1)

    if (isNaN(f) || isNaN(c) || f < 2 || c < 2 || f > 10 || c > 10) {
      alert("Por favor ingresa dimensiones válidas (2-10)")
      return
    }

    const datos = Array(f)
      .fill(null)
      .map(() => Array(c).fill(0))
    setMatriz1(new Matriz(f, c, datos))
    setResultadoOp(null)
    setPasosOp([])
  }

  const crearMatriz2 = () => {
    const f = Number.parseInt(filas2)
    const c = Number.parseInt(columnas2)

    if (isNaN(f) || isNaN(c) || f < 2 || c < 2 || f > 10 || c > 10) {
      alert("Por favor ingresa dimensiones válidas (2-10)")
      return
    }

    const datos = Array(f)
      .fill(null)
      .map(() => Array(c).fill(0))
    setMatriz2(new Matriz(f, c, datos))
    setResultadoOp(null)
    setPasosOp([])
  }

  const actualizarValor = (i: number, j: number, valor: string) => {
    if (!matriz || !matriz.datos) return
    const num = Number.parseFloat(valor)
    if (isNaN(num)) return

    const nuevosDatos = matriz.datos.map((fila, fi) => fila.map((val, ci) => (fi === i && ci === j ? num : val)))
    setMatriz(new Matriz(matriz.filas, matriz.columnas, nuevosDatos))
  }

  const actualizarValor1 = (i: number, j: number, valor: string) => {
    if (!matriz1 || !matriz1.datos) return
    const num = Number.parseFloat(valor)
    if (isNaN(num)) return

    const nuevosDatos = matriz1.datos.map((fila, fi) => fila.map((val, ci) => (fi === i && ci === j ? num : val)))
    setMatriz1(new Matriz(matriz1.filas, matriz1.columnas, nuevosDatos))
  }

  const actualizarValor2 = (i: number, j: number, valor: string) => {
    if (!matriz2 || !matriz2.datos) return
    const num = Number.parseFloat(valor)
    if (isNaN(num)) return

    const nuevosDatos = matriz2.datos.map((fila, fi) => fila.map((val, ci) => (fi === i && ci === j ? num : val)))
    setMatriz2(new Matriz(matriz2.filas, matriz2.columnas, nuevosDatos))
  }

  const resolverGaussJordan = () => {
    if (!matriz) return

    try {
      const solucion = service.gaussJordan(matriz)
      setResultado(solucion.resultado)

      if (progreso && !progreso.leccionesCompletadas.includes("matrices-1")) {
        const nuevoProgreso = Progreso.fromJSON({
          ...progreso,
          leccionesCompletadas: [...progreso.leccionesCompletadas, "matrices-1"],
          puntajeTotal: progreso.puntajeTotal + 100,
        })
        actualizarProgreso(nuevoProgreso)
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error al resolver")
    }
  }

  const realizarOperacion = (operacion: "suma" | "resta" | "multiplicacion") => {
    if (!matriz1 || !matriz2) {
      alert("Por favor crea ambas matrices primero")
      return
    }

    try {
      let resultado
      switch (operacion) {
        case "suma":
          resultado = service.sumar(matriz1, matriz2)
          break
        case "resta":
          resultado = service.restar(matriz1, matriz2)
          break
        case "multiplicacion":
          resultado = service.multiplicar(matriz1, matriz2)
          break
      }

      setResultadoOp(resultado.resultado)
      setPasosOp(resultado.pasos)

      if (progreso && !progreso.leccionesCompletadas.includes("matrices-ops")) {
        const nuevoProgreso = Progreso.fromJSON({
          ...progreso,
          leccionesCompletadas: [...progreso.leccionesCompletadas, "matrices-ops"],
          puntajeTotal: progreso.puntajeTotal + 100,
        })
        actualizarProgreso(nuevoProgreso)
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error en la operación")
    }
  }

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

        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center p-3 bg-orange-100 rounded-full mb-4">
              <Calculator className="h-8 w-8 text-orange-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Operaciones con Matrices</h1>
            <p className="text-muted-foreground">Suma, resta, multiplicación y Gauss-Jordan</p>
          </div>

          <div className="mb-6 flex justify-center">
            <Tabs value={modo} onValueChange={(v) => setModo(v as any)} className="w-full max-w-md">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="operaciones">Operaciones Básicas</TabsTrigger>
                <TabsTrigger value="gauss">Gauss-Jordan</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {modo === "gauss" ? (
            // Original Gauss-Jordan interface
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {!matriz ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Crear Matriz</CardTitle>
                      <CardDescription>Define las dimensiones de tu sistema de ecuaciones</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="filas">Número de Filas</Label>
                          <Input
                            id="filas"
                            type="number"
                            value={filas}
                            onChange={(e) => setFilas(e.target.value)}
                            min="2"
                            max="10"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="columnas">Número de Columnas</Label>
                          <Input
                            id="columnas"
                            type="number"
                            value={columnas}
                            onChange={(e) => setColumnas(e.target.value)}
                            min="2"
                            max="10"
                          />
                        </div>
                      </div>
                      <Button onClick={crearMatriz} className="w-full">
                        Crear Matriz
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Matriz Aumentada</CardTitle>
                        <CardDescription>Ingresa los coeficientes del sistema de ecuaciones</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <tbody>
                              {matriz.datos?.map((fila, i) => (
                                <tr key={i}>
                                  {fila.map((valor, j) => (
                                    <td key={j} className="p-1">
                                      <Input
                                        type="number"
                                        value={valor}
                                        onChange={(e) => actualizarValor(i, j, e.target.value)}
                                        className="text-center"
                                        step="0.1"
                                      />
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>

                    {resultado && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Matriz Reducida (Forma Escalonada)</CardTitle>
                          <CardDescription>Resultado del método de Gauss-Jordan</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <TablaRenderer matriz={resultado} />
                          <div className="mt-4 p-4 bg-green-50 rounded-lg">
                            <p className="font-medium text-green-900 mb-2">Solución del Sistema:</p>
                            <div className="space-y-1 text-sm">
                              {resultado.datos.map((fila, i) => {
                                const ultimaColumna = fila[fila.length - 1]
                                return (
                                  <p key={i} className="font-mono">
                                    x{i + 1} = {ultimaColumna.toFixed(4)}
                                  </p>
                                )
                              })}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </div>

              <div className="space-y-6">
                {matriz && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Acciones</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button onClick={resolverGaussJordan} className="w-full">
                          Resolver con Gauss-Jordan
                        </Button>
                        <Button
                          onClick={() => {
                            setMatriz(null)
                            setResultado(null)
                          }}
                          variant="outline"
                          className="w-full"
                        >
                          Nueva Matriz
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Información</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm space-y-2">
                        <p>
                          <strong>Dimensiones:</strong> {matriz.filas} × {matriz.columnas}
                        </p>
                        <p className="text-muted-foreground">
                          El método de Gauss-Jordan transforma la matriz en su forma escalonada reducida para encontrar
                          la solución del sistema.
                        </p>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Matrix 1 */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Matriz A</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {!matriz1 ? (
                        <>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-2">
                              <Label>Filas</Label>
                              <Input
                                type="number"
                                value={filas1}
                                onChange={(e) => setFilas1(e.target.value)}
                                min="2"
                                max="10"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Columnas</Label>
                              <Input
                                type="number"
                                value={columnas1}
                                onChange={(e) => setColumnas1(e.target.value)}
                                min="2"
                                max="10"
                              />
                            </div>
                          </div>
                          <Button onClick={crearMatriz1} className="w-full" size="sm">
                            Crear Matriz A
                          </Button>
                        </>
                      ) : (
                        <>
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                              <tbody>
                                {matriz1.datos?.map((fila, i) => (
                                  <tr key={i}>
                                    {fila.map((valor, j) => (
                                      <td key={j} className="p-1">
                                        <Input
                                          type="number"
                                          value={valor}
                                          onChange={(e) => actualizarValor1(i, j, e.target.value)}
                                          className="text-center text-sm h-8"
                                          step="0.1"
                                        />
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <Button onClick={() => setMatriz1(null)} variant="outline" size="sm" className="w-full">
                            Reiniciar
                          </Button>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  {/* Matrix 2 */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Matriz B</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {!matriz2 ? (
                        <>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-2">
                              <Label>Filas</Label>
                              <Input
                                type="number"
                                value={filas2}
                                onChange={(e) => setFilas2(e.target.value)}
                                min="2"
                                max="10"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Columnas</Label>
                              <Input
                                type="number"
                                value={columnas2}
                                onChange={(e) => setColumnas2(e.target.value)}
                                min="2"
                                max="10"
                              />
                            </div>
                          </div>
                          <Button onClick={crearMatriz2} className="w-full" size="sm">
                            Crear Matriz B
                          </Button>
                        </>
                      ) : (
                        <>
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                              <tbody>
                                {matriz2.datos?.map((fila, i) => (
                                  <tr key={i}>
                                    {fila.map((valor, j) => (
                                      <td key={j} className="p-1">
                                        <Input
                                          type="number"
                                          value={valor}
                                          onChange={(e) => actualizarValor2(i, j, e.target.value)}
                                          className="text-center text-sm h-8"
                                          step="0.1"
                                        />
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <Button onClick={() => setMatriz2(null)} variant="outline" size="sm" className="w-full">
                            Reiniciar
                          </Button>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {resultadoOp && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Resultado</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <TablaRenderer matriz={resultadoOp} />
                      {pasosOp.length > 0 && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                          <p className="font-medium text-blue-900 mb-2">Pasos:</p>
                          <div className="space-y-1 text-sm text-blue-800 max-h-40 overflow-y-auto">
                            {pasosOp.slice(0, 10).map((paso, i) => (
                              <p key={i} className="font-mono text-xs">
                                {paso}
                              </p>
                            ))}
                            {pasosOp.length > 10 && (
                              <p className="text-xs italic">... y {pasosOp.length - 10} pasos más</p>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Operaciones</CardTitle>
                    <CardDescription>Selecciona la operación a realizar</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      onClick={() => realizarOperacion("suma")}
                      className="w-full"
                      disabled={!matriz1 || !matriz2}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Sumar (A + B)
                    </Button>
                    <Button
                      onClick={() => realizarOperacion("resta")}
                      className="w-full"
                      variant="outline"
                      disabled={!matriz1 || !matriz2}
                    >
                      <Minus className="mr-2 h-4 w-4" />
                      Restar (A - B)
                    </Button>
                    <Button
                      onClick={() => realizarOperacion("multiplicacion")}
                      className="w-full"
                      variant="outline"
                      disabled={!matriz1 || !matriz2}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Multiplicar (A × B)
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Teoría</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-3">
                    <div>
                      <p className="font-medium">Suma y Resta:</p>
                      <p className="text-muted-foreground">
                        Las matrices deben tener las mismas dimensiones. Se suman/restan elementos correspondientes.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Multiplicación:</p>
                      <p className="text-muted-foreground">
                        El número de columnas de A debe ser igual al número de filas de B. El resultado es una matriz de
                        dimensiones (filas de A) × (columnas de B).
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}
