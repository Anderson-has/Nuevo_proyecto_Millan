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
import { ArrowLeft, BookOpen, Plus, Minus, X, Target, Calculator, Wrench, RotateCcw, CheckCircle, Grid3X3, BarChart3, Lightbulb, HelpCircle } from "lucide-react"

export default function MatricesPage() {
  const router = useRouter()
  const { progreso, actualizarProgreso } = useAuth()
  
  const [seccionActual, setSeccionActual] = useState<string>("definicion")
  const [matrices, setMatrices] = useState<{[key: string]: number[][]}>({})
  const [matrizSeleccionada, setMatrizSeleccionada] = useState<string>("")
  const [operacionSeleccionada, setOperacionSeleccionada] = useState<string>("")
  const [resultado, setResultado] = useState<number[][] | null>(null)
  const [pasos, setPasos] = useState<string[]>([])
  const [escalar, setEscalar] = useState<string>("2")
  const [modoGuiado, setModoGuiado] = useState(false)
  const [notaActual, setNotaActual] = useState("")

  const mostrarNota = (nota: string) => {
    if (modoGuiado) {
      setNotaActual(nota)
      setTimeout(() => setNotaActual(""), 3000)
    }
  }

  // Crear una nueva matriz
  const crearMatriz = (nombre: string, filas: number, columnas: number) => {
    const nuevaMatriz = Array(filas).fill(null).map(() => Array(columnas).fill(0))
    setMatrices(prev => ({
      ...prev,
      [nombre]: nuevaMatriz
    }))
    setMatrizSeleccionada(nombre)
    
    // Mostrar nota guiada
    mostrarNota(`📊 Matriz "${nombre}" creada: ${filas}×${columnas}. Esto significa que has definido una matriz con ${filas} filas y ${columnas} columnas para realizar operaciones matriciales.`)
  }

  // Actualizar valor de una matriz
  const actualizarValorMatriz = (nombre: string, fila: number, columna: number, valor: string) => {
    const num = parseFloat(valor)
    if (isNaN(num)) return

    setMatrices(prev => {
      const nuevaMatriz = [...prev[nombre]]
      nuevaMatriz[fila][columna] = num
      return {
        ...prev,
        [nombre]: nuevaMatriz
      }
    })
    
    // Mostrar nota guiada
    if (modoGuiado && valor) {
      mostrarNota(`📝 Elemento [${fila+1},${columna+1}] de "${nombre}": ${valor}. Esto significa que has modificado el valor en la fila ${fila+1}, columna ${columna+1} de la matriz.`)
    }
  }

  // Realizar operaciones
  const realizarOperacion = () => {
    if (!operacionSeleccionada || !matrizSeleccionada) return

    const matriz = matrices[matrizSeleccionada]
    if (!matriz) return

    let resultado: number[][] = []
    let pasosOperacion: string[] = []

    switch (operacionSeleccionada) {
      case "suma":
        if (matrices["A"] && matrices["B"]) {
          resultado = sumarMatrices(matrices["A"], matrices["B"])
          pasosOperacion = generarPasosSuma(matrices["A"], matrices["B"], resultado)
        }
        break
      case "resta":
        if (matrices["A"] && matrices["B"]) {
          resultado = restarMatrices(matrices["A"], matrices["B"])
          pasosOperacion = generarPasosResta(matrices["A"], matrices["B"], resultado)
        }
        break
      case "escalar":
        const k = parseFloat(escalar)
        if (!isNaN(k)) {
          resultado = multiplicarPorEscalar(matriz, k)
          pasosOperacion = generarPasosEscalar(matriz, k, resultado)
        }
        break
      case "multiplicacion":
        if (matrices["A"] && matrices["B"]) {
          resultado = multiplicarMatrices(matrices["A"], matrices["B"])
          pasosOperacion = generarPasosMultiplicacion(matrices["A"], matrices["B"], resultado)
        }
        break
      case "transpuesta":
        resultado = transponerMatriz(matriz)
        pasosOperacion = generarPasosTranspuesta(matriz, resultado)
        break
      case "determinante":
        if (matriz.length === matriz[0].length && matriz.length <= 3) {
          const det = calcularDeterminante(matriz)
          pasosOperacion = generarPasosDeterminante(matriz, det)
        }
        break
    }

    setResultado(resultado)
    setPasos(pasosOperacion)
  }

  // Funciones de operaciones matriciales
  const sumarMatrices = (A: number[][], B: number[][]) => {
    const filas = A.length
    const columnas = A[0].length
    const resultado = Array(filas).fill(null).map(() => Array(columnas).fill(0))
    
    for (let i = 0; i < filas; i++) {
      for (let j = 0; j < columnas; j++) {
        resultado[i][j] = A[i][j] + B[i][j]
      }
    }
    return resultado
  }

  const restarMatrices = (A: number[][], B: number[][]) => {
    const filas = A.length
    const columnas = A[0].length
    const resultado = Array(filas).fill(null).map(() => Array(columnas).fill(0))
    
    for (let i = 0; i < filas; i++) {
      for (let j = 0; j < columnas; j++) {
        resultado[i][j] = A[i][j] - B[i][j]
      }
    }
    return resultado
  }

  const multiplicarPorEscalar = (matriz: number[][], k: number) => {
    return matriz.map(fila => fila.map(valor => valor * k))
  }

  const multiplicarMatrices = (A: number[][], B: number[][]) => {
    const filasA = A.length
    const columnasA = A[0].length
    const columnasB = B[0].length
    const resultado = Array(filasA).fill(null).map(() => Array(columnasB).fill(0))
    
    for (let i = 0; i < filasA; i++) {
      for (let j = 0; j < columnasB; j++) {
        for (let k = 0; k < columnasA; k++) {
          resultado[i][j] += A[i][k] * B[k][j]
        }
      }
    }
    return resultado
  }

  const transponerMatriz = (matriz: number[][]) => {
    const filas = matriz.length
    const columnas = matriz[0].length
    const resultado = Array(columnas).fill(null).map(() => Array(filas).fill(0))
    
    for (let i = 0; i < filas; i++) {
      for (let j = 0; j < columnas; j++) {
        resultado[j][i] = matriz[i][j]
      }
    }
    return resultado
  }

  const calcularDeterminante = (matriz: number[][]) => {
    if (matriz.length === 2) {
      return matriz[0][0] * matriz[1][1] - matriz[0][1] * matriz[1][0]
    } else if (matriz.length === 3) {
      return matriz[0][0] * (matriz[1][1] * matriz[2][2] - matriz[1][2] * matriz[2][1]) -
             matriz[0][1] * (matriz[1][0] * matriz[2][2] - matriz[1][2] * matriz[2][0]) +
             matriz[0][2] * (matriz[1][0] * matriz[2][1] - matriz[1][1] * matriz[2][0])
    }
    return 0
  }

  // Funciones para generar pasos
  const generarPasosSuma = (A: number[][], B: number[][], resultado: number[][]) => {
    const pasos = ["Suma de matrices A + B:"]
    for (let i = 0; i < A.length; i++) {
      for (let j = 0; j < A[0].length; j++) {
        pasos.push(`Elemento (${i+1},${j+1}): ${A[i][j]} + ${B[i][j]} = ${resultado[i][j]}`)
      }
    }
    return pasos
  }

  const generarPasosResta = (A: number[][], B: number[][], resultado: number[][]) => {
    const pasos = ["Resta de matrices A - B:"]
    for (let i = 0; i < A.length; i++) {
      for (let j = 0; j < A[0].length; j++) {
        pasos.push(`Elemento (${i+1},${j+1}): ${A[i][j]} - ${B[i][j]} = ${resultado[i][j]}`)
      }
    }
    return pasos
  }

  const generarPasosEscalar = (matriz: number[][], k: number, resultado: number[][]) => {
    const pasos = [`Multiplicación por escalar ${k}:`]
    for (let i = 0; i < matriz.length; i++) {
      for (let j = 0; j < matriz[0].length; j++) {
        pasos.push(`Elemento (${i+1},${j+1}): ${k} × ${matriz[i][j]} = ${resultado[i][j]}`)
      }
    }
    return pasos
  }

  const generarPasosMultiplicacion = (A: number[][], B: number[][], resultado: number[][]) => {
    const pasos = ["Multiplicación de matrices A × B:"]
    for (let i = 0; i < A.length; i++) {
      for (let j = 0; j < B[0].length; j++) {
        let suma = 0
        let paso = `Elemento (${i+1},${j+1}): `
        for (let k = 0; k < A[0].length; k++) {
          suma += A[i][k] * B[k][j]
          paso += `${A[i][k]} × ${B[k][j]}`
          if (k < A[0].length - 1) paso += " + "
        }
        paso += ` = ${suma}`
        pasos.push(paso)
      }
    }
    return pasos
  }

  const generarPasosTranspuesta = (matriz: number[][], resultado: number[][]) => {
    const pasos = ["Transpuesta de la matriz:"]
    for (let i = 0; i < matriz.length; i++) {
      for (let j = 0; j < matriz[0].length; j++) {
        pasos.push(`Elemento (${i+1},${j+1}) → (${j+1},${i+1}): ${matriz[i][j]} → ${resultado[j][i]}`)
      }
    }
    return pasos
  }

  const generarPasosDeterminante = (matriz: number[][], determinante: number) => {
    const pasos = ["Cálculo del determinante:"]
    if (matriz.length === 2) {
      pasos.push(`Para matriz 2x2: |A| = a₁₁ × a₂₂ - a₁₂ × a₂₁`)
      pasos.push(`|A| = ${matriz[0][0]} × ${matriz[1][1]} - ${matriz[0][1]} × ${matriz[1][0]}`)
      pasos.push(`|A| = ${matriz[0][0] * matriz[1][1]} - ${matriz[0][1] * matriz[1][0]}`)
      pasos.push(`|A| = ${determinante}`)
    }
    return pasos
  }

  // Navegación entre secciones
  const navegarSeccion = (seccion: string) => {
    setSeccionActual(seccion)
    setResultado(null)
    setPasos([])
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
        <header className="border-b bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Dashboard
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header del módulo */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center p-3 bg-purple-100 rounded-full mb-4">
              <BookOpen className="h-8 w-8 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2 text-purple-800">
              ¿Qué son las Matrices?
            </h1>
          </div>

          {/* Sistema de navegación por secciones */}
          <Tabs value={seccionActual} onValueChange={navegarSeccion} className="w-full">
            <TabsList className="grid w-full grid-cols-6 mb-8">
              <TabsTrigger value="definicion">Definición</TabsTrigger>
              <TabsTrigger value="conceptos">Conceptos</TabsTrigger>
              <TabsTrigger value="operaciones">Operaciones</TabsTrigger>
              <TabsTrigger value="gauss">Gauss-Jordan</TabsTrigger>
              <TabsTrigger value="practica">Práctica</TabsTrigger>
              <TabsTrigger value="ejercicios">Ejercicios</TabsTrigger>
            </TabsList>

            {/* DEFINICIÓN DE MATRICES */}
            <TabsContent value="definicion" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-purple-600 flex items-center">
                    <BookOpen className="mr-2 h-5 w-5" />
                    ¿Qué son las Matrices?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-gray-700 leading-relaxed">
                    Una matriz es un arreglo rectangular de números organizados en filas y columnas. 
                    Las matrices son fundamentales en álgebra lineal y tienen muchas aplicaciones en 
                    matemáticas, física, ingeniería y ciencias de la computación.
                  </p>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-bold mb-2">Ejemplo de Matriz 2×3:</h3>
                    <div className="text-center">
                      <div className="inline-block border-2 border-gray-400 p-4 rounded">
                        <div className="font-mono text-lg">
                          [ 1 2 3 ]<br />
                          [ 4 5 6 ]
                        </div>
                      </div>
                    </div>
                  </div>

                  <Card className="bg-green-50 border-l-4 border-l-green-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center text-green-800">
                        <Target className="mr-2 h-4 w-4" />
                        Objetivos de aprendizaje
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="bg-white">
                          <CardContent className="pt-4">
                            <div className="text-center">
                              <div className="text-3xl font-bold text-green-600 mb-2">+</div>
                              <p className="text-sm font-medium">Operaciones básicas</p>
                              <p className="text-xs text-gray-600">Suma, resta y multiplicación por escalar</p>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-white">
                          <CardContent className="pt-4">
                            <div className="text-center">
                              <div className="text-3xl font-bold text-blue-600 mb-2">×</div>
                              <p className="text-sm font-medium">Multiplicación</p>
                              <p className="text-xs text-gray-600">Multiplicación entre matrices</p>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-white">
                          <CardContent className="pt-4">
                            <div className="text-center">
                              <div className="text-3xl font-bold text-purple-600 mb-2">T</div>
                              <p className="text-sm font-medium">Transpuesta</p>
                              <p className="text-xs text-gray-600">Intercambiar filas y columnas</p>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-white">
                          <CardContent className="pt-4">
                            <div className="text-center">
                              <div className="text-3xl font-bold text-orange-600 mb-2">|A|</div>
                              <p className="text-sm font-medium">Determinante</p>
                              <p className="text-xs text-gray-600">Valor escalar de matrices cuadradas</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex gap-4 justify-center">
                    <Button 
                      onClick={() => navegarSeccion("conceptos")}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <BookOpen className="mr-2 h-4 w-4" />
                      Comenzar con Conceptos Básicos
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => navegarSeccion("practica")}
                    >
                      <Calculator className="mr-2 h-4 w-4" />
                      Ir Directo a la Práctica
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* CONCEPTOS BÁSICOS */}
            <TabsContent value="conceptos" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-purple-600 flex items-center">
                    <BookOpen className="mr-2 h-5 w-5" />
                    Conceptos Básicos de Matrices
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-6">
                    <Card className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center">
                          <Grid3X3 className="mr-2 h-4 w-4 text-yellow-500" />
                          Dimensiones de una Matriz
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700 mb-3">
                          Una matriz de m × n tiene:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 mb-4">
                          <li>m filas (horizontal)</li>
                          <li>n columnas (vertical)</li>
                        </ul>
                        <p className="text-sm font-medium mb-2">Ejemplo: Matriz 3×2</p>
                        <div className="text-center">
                          <div className="inline-block border-2 border-gray-400 p-4 rounded">
                            <div className="font-mono text-lg">
                              [ 1 2 ]<br />
                              [ 3 4 ]<br />
                              [ 5 6 ]
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-green-500">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center">
                          <Grid3X3 className="mr-2 h-4 w-4 text-blue-500" />
                          Elementos de una Matriz
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700 mb-3">
                          Los elementos se identifican por su posición (fila, columna):
                        </p>
                        <div className="text-center mb-4">
                          <div className="inline-block border-2 border-gray-400 p-4 rounded">
                            <div className="font-mono text-lg">
                              [ a₁₁ a₁₂ ]<br />
                              [ a₂₁ a₂₂ ]
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">
                          aᵢⱼ = elemento en la fila i, columna j
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-orange-500">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center">
                          <CheckCircle className="mr-2 h-4 w-4 text-yellow-500" />
                          Igualdad de Matrices
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700 mb-3">
                          Dos matrices son iguales si:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 mb-4">
                          <li>Tienen las mismas dimensiones</li>
                          <li>Todos los elementos correspondientes son iguales</li>
                        </ul>
                        <div className="text-center">
                          <div className="flex items-center justify-center space-x-4">
                            <div className="border-2 border-gray-400 p-4 rounded">
                              <div className="font-mono text-lg">
                                [ 1 2 ]<br />
                                [ 3 4 ]
                              </div>
                            </div>
                            <span className="text-2xl">=</span>
                            <div className="border-2 border-gray-400 p-4 rounded">
                              <div className="font-mono text-lg">
                                [ 1 2 ]<br />
                                [ 3 4 ]
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex gap-4 justify-center">
                    <Button 
                      variant="outline"
                      onClick={() => navegarSeccion("definicion")}
                    >
                      ← Anterior
                    </Button>
                    <Button 
                      onClick={() => navegarSeccion("operaciones")}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Siguiente: Operaciones →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* OPERACIONES CON MATRICES */}
            <TabsContent value="operaciones" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-purple-600 flex items-center">
                    <Wrench className="mr-2 h-5 w-5" />
                    Operaciones con Matrices
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-6">
                    <Card className="border-l-4 border-l-green-500">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center">
                          <Plus className="mr-2 h-4 w-4" />
                          Suma de Matrices
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700 mb-3">
                          Para sumar dos matrices, sumamos los elementos correspondientes:
                        </p>
                        <div className="bg-blue-800 text-white p-3 rounded text-center mb-3">
                          <p className="font-bold">(A + B)ij = Aij + Bij</p>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          Condición: Las matrices deben tener las mismas dimensiones
                        </p>
                        <div className="text-center">
                          <div className="flex items-center justify-center space-x-4">
                            <div className="border-2 border-gray-400 p-4 rounded">
                              <div className="font-mono text-lg">
                                [ 1 2 ]<br />
                                [ 3 4 ]
                              </div>
                            </div>
                            <span className="text-2xl">+</span>
                            <div className="border-2 border-gray-400 p-4 rounded">
                              <div className="font-mono text-lg">
                                [ 5 6 ]<br />
                                [ 7 8 ]
                              </div>
                            </div>
                            <span className="text-2xl">=</span>
                            <div className="border-2 border-gray-400 p-4 rounded bg-green-50">
                              <div className="font-mono text-lg">
                                [ 6 8 ]<br />
                                [10 12]
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center">
                          <Grid3X3 className="mr-2 h-4 w-4" />
                          Multiplicación por Escalar
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700 mb-3">
                          Multiplicamos cada elemento de la matriz por el escalar:
                        </p>
                        <div className="bg-blue-800 text-white p-3 rounded text-center mb-3">
                          <p className="font-bold">(kA)ij = k × Aij</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center space-x-4">
                            <span className="text-2xl">2 ×</span>
                            <div className="border-2 border-gray-400 p-4 rounded">
                              <div className="font-mono text-lg">
                                [ 1 2 ]<br />
                                [ 3 4 ]
                              </div>
                            </div>
                            <span className="text-2xl">=</span>
                            <div className="border-2 border-gray-400 p-4 rounded bg-blue-50">
                              <div className="font-mono text-lg">
                                [ 2 4 ]<br />
                                [ 6 8 ]
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-purple-500">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center">
                          <X className="mr-2 h-4 w-4" />
                          Multiplicación de Matrices
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700 mb-3">
                          El elemento (i,j) del producto se calcula como:
                        </p>
                        <div className="bg-blue-800 text-white p-3 rounded text-center mb-3">
                          <p className="font-bold">(AB)ij = Σ(Aik × Bkj)</p>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          Condición: El número de columnas de A debe ser igual al número de filas de B
                        </p>
                        <div className="text-center">
                          <div className="flex items-center justify-center space-x-4">
                            <div className="border-2 border-gray-400 p-4 rounded">
                              <div className="font-mono text-lg">
                                [ 1 2 ]<br />
                                [ 3 4 ]
                              </div>
                            </div>
                            <span className="text-2xl">×</span>
                            <div className="border-2 border-gray-400 p-4 rounded">
                              <div className="font-mono text-lg">
                                [ 5 6 ]<br />
                                [ 7 8 ]
                              </div>
                            </div>
                            <span className="text-2xl">=</span>
                            <div className="border-2 border-gray-400 p-4 rounded bg-purple-50">
                              <div className="font-mono text-lg">
                                [19 22]<br />
                                [43 50]
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex gap-4 justify-center">
                    <Button 
                      variant="outline"
                      onClick={() => navegarSeccion("conceptos")}
                    >
                      ← Anterior
                    </Button>
                    <Button 
                      onClick={() => navegarSeccion("gauss")}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Siguiente: Gauss-Jordan →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* MÉTODO DE GAUSS-JORDAN */}
            <TabsContent value="gauss" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-purple-600 flex items-center">
                    <Wrench className="mr-2 h-5 w-5" />
                    Método de Gauss-Jordan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center">
                        <BookOpen className="mr-2 h-4 w-4 text-green-500" />
                        ¿Qué es Gauss-Jordan?
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700 mb-4">
                        El método de Gauss-Jordan es un algoritmo para resolver sistemas de ecuaciones lineales 
                        y encontrar la matriz inversa. Transforma la matriz en forma escalonada reducida.
                      </p>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-bold mb-2">Pasos del Método:</h4>
                        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                          <li>Formar la matriz aumentada [A|I] para inversa o [A|b] para sistemas</li>
                          <li>Intercambiar filas si es necesario para tener un 1 en la diagonal</li>
                          <li>Hacer ceros debajo del elemento pivote</li>
                          <li>Hacer ceros arriba del elemento pivote</li>
                          <li>Repetir para cada fila</li>
                        </ol>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-blue-50 border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-blue-800">Ejemplo: Encontrar la inversa de una matriz 2×2</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="bg-white">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Paso 1: Matriz original</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-center">
                              <div className="border-2 border-gray-400 p-2 rounded">
                                <div className="font-mono text-sm">
                                  [ 2 1 ]<br />
                                  [ 3 4 ]
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-white">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Paso 2: Matriz aumentada [A|I]</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-center">
                              <div className="border-2 border-gray-400 p-2 rounded">
                                <div className="font-mono text-xs">
                                  [ 2 1 | 1 0 ]<br />
                                  [ 3 4 | 0 1 ]
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-white">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Paso 3: Después de Gauss-Jordan</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-center">
                              <div className="border-2 border-gray-400 p-2 rounded">
                                <div className="font-mono text-xs">
                                  [ 1 0 | 0.8 -0.2 ]<br />
                                  [ 0 1 |-0.6 0.4 ]
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-white">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Resultado: Matriz inversa</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-center">
                              <div className="border-2 border-gray-400 p-2 rounded bg-green-50">
                                <div className="font-mono text-sm">
                                  [ 0.8 -0.2 ]<br />
                                  [-0.6 0.4 ]
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex gap-4 justify-center">
                    <Button 
                      variant="outline"
                      onClick={() => navegarSeccion("operaciones")}
                    >
                      ← Anterior
                    </Button>
                    <Button 
                      onClick={() => navegarSeccion("practica")}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Ir a la Práctica →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* PRÁCTICA CON MATRICES */}
            <TabsContent value="practica" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-purple-600 flex items-center">
                    <Target className="mr-2 h-5 w-5" />
                    🎯 Práctica con Matrices
                  </CardTitle>
                  
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
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Panel izquierdo - Selección y edición de matrices */}
                    <div className="space-y-6">
                      <Card className="border-l-4 border-l-green-500">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center">
                            <Grid3X3 className="mr-2 h-4 w-4 text-green-500" />
                            Seleccionar Matriz
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {Object.keys(matrices).map((nombre) => (
                              <div key={nombre} className="flex items-center justify-between p-2 border rounded">
                                <div className="flex items-center space-x-2">
                                  <Button
                                    size="sm"
                                    variant={matrizSeleccionada === nombre ? "default" : "outline"}
                                    onClick={() => setMatrizSeleccionada(nombre)}
                                  >
                                    {nombre}
                                  </Button>
                                  <span className="text-sm text-gray-600">
                                    {matrices[nombre]?.length}×{matrices[nombre]?.[0]?.length}
                                  </span>
                                </div>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    const nuevasMatrices = { ...matrices }
                                    delete nuevasMatrices[nombre]
                                    setMatrices(nuevasMatrices)
                                    if (matrizSeleccionada === nombre) {
                                      setMatrizSeleccionada("")
                                    }
                                  }}
                                >
                                  ×
                                </Button>
                              </div>
                            ))}
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                size="sm"
                                onClick={() => crearMatriz("A", 2, 2)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                + Agregar Matriz A
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => crearMatriz("B", 2, 2)}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                + Agregar Matriz B
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {matrizSeleccionada && matrices[matrizSeleccionada] && (
                        <Card className="border-l-4 border-l-orange-500">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center">
                              <Grid3X3 className="mr-2 h-4 w-4 text-orange-500" />
                              Editar Matriz {matrizSeleccionada}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <Label>Filas:</Label>
                                  <Input
                                    type="number"
                                    value={matrices[matrizSeleccionada].length}
                                    disabled
                                    className="h-8"
                                  />
                                </div>
                                <div>
                                  <Label>Columnas:</Label>
                                  <Input
                                    type="number"
                                    value={matrices[matrizSeleccionada][0]?.length}
                                    disabled
                                    className="h-8"
                                  />
                                </div>
                              </div>
                              <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                  <tbody>
                                    {matrices[matrizSeleccionada].map((fila, i) => (
                                      <tr key={i}>
                                        {fila.map((valor, j) => (
                                          <td key={j} className="p-1">
                                            <Input
                                              type="number"
                                              value={valor}
                                              onChange={(e) => actualizarValorMatriz(matrizSeleccionada, i, j, e.target.value)}
                                              className="text-center h-8 w-16"
                                              step="0.1"
                                            />
                                          </td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    {/* Panel derecho - Operaciones y resultados */}
                    <div className="space-y-6">
                      <Card className="border-l-4 border-l-orange-500">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center">
                            <Calculator className="mr-2 h-4 w-4 text-orange-500" />
                            Operaciones
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div>
                              <Label>Escalar (k):</Label>
                              <Input
                                type="number"
                                value={escalar}
                                onChange={(e) => setEscalar(e.target.value)}
                                className="h-8"
                                step="0.1"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                size="sm"
                                onClick={() => setOperacionSeleccionada("suma")}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                A + B
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => setOperacionSeleccionada("resta")}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                A - B
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => setOperacionSeleccionada("escalar")}
                                className="bg-orange-600 hover:bg-orange-700"
                              >
                                k × A
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => setOperacionSeleccionada("multiplicacion")}
                                className="bg-purple-600 hover:bg-purple-700"
                              >
                                A × B
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => setOperacionSeleccionada("transpuesta")}
                                className="bg-teal-600 hover:bg-teal-700"
                              >
                                A^T
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => setOperacionSeleccionada("determinante")}
                                className="bg-gray-600 hover:bg-gray-700"
                              >
                                |A|
                              </Button>
                            </div>
                            <Button
                              onClick={realizarOperacion}
                              disabled={!operacionSeleccionada}
                              className="w-full"
                            >
                              Calcular
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-l-4 border-l-green-500">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center">
                            <BarChart3 className="mr-2 h-4 w-4 text-green-500" />
                            Resultado
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {resultado ? (
                            <div className="space-y-4">
                              <div className="text-center">
                                <div className="inline-block border-2 border-gray-400 p-4 rounded bg-green-50">
                                  <div className="font-mono text-sm">
                                    {resultado.map((fila, i) => (
                                      <div key={i}>
                                        [ {fila.map((valor, j) => (
                                          <span key={j}>
                                            {valor.toFixed(2)}
                                            {j < fila.length - 1 ? " " : ""}
                                          </span>
                                        ))} ]
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              {pasos.length > 0 && (
                                <div className="bg-blue-50 p-3 rounded">
                                  <h4 className="font-bold text-sm mb-2">Pasos de la operación:</h4>
                                  <div className="space-y-1 text-xs max-h-40 overflow-y-auto">
                                    {pasos.map((paso, i) => (
                                      <p key={i} className="font-mono">{paso}</p>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-center text-sm">
                              Selecciona una operación para ver el resultado
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div className="flex gap-4 justify-center">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setMatrices({})
                        setMatrizSeleccionada("")
                        setOperacionSeleccionada("")
                        setResultado(null)
                        setPasos([])
                      }}
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Reiniciar
                    </Button>
                    <Button
                      onClick={() => navegarSeccion("ejercicios")}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Continuar a Ejercicios
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* EJERCICIOS */}
            <TabsContent value="ejercicios" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-purple-600 flex items-center">
                    <Target className="mr-2 h-5 w-5" />
                    Ejercicios de Práctica
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">
                      ¡Felicitaciones! Has completado el módulo de Matrices y Gauss-Jordan.
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                      Has aprendido sobre definiciones, conceptos básicos, operaciones y el método de Gauss-Jordan.
                    </p>
                    <Button
                      onClick={() => router.push("/dashboard")}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Volver al Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ProtectedRoute>
  )
}