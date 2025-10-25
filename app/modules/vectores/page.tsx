"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Calculator, Plus, Trash2, BookOpen, Info } from "lucide-react"
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
  origenX: number
  origenY: number
  isDragging?: boolean
}

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"]

export default function VectoresPage() {
  const router = useRouter()
  const { progreso, actualizarProgreso } = useAuth()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [renderer, setRenderer] = useState<CanvasRenderer | null>(null)
  const [service] = useState(() => new VectorOperationsService())

  const [vectores, setVectores] = useState<VectorInput[]>([
    { id: "1", x: "", y: "", z: "", color: COLORS[0], origenX: 0, origenY: 0 },
    { id: "2", x: "", y: "", z: "", color: COLORS[1], origenX: 0, origenY: 0 },
  ])
  const [modoInteractivo, setModoInteractivo] = useState(false)
  const [vectorSeleccionado, setVectorSeleccionado] = useState<string | null>(null)
  const [puntoArrastrando, setPuntoArrastrando] = useState<{x: number, y: number} | null>(null)
  const [resultado, setResultado] = useState<Vector3D | number | null>(null)
  const [pasos, setPasos] = useState<string[]>([])
  const [operacion, setOperacion] = useState<string>("suma")
  const [escalar, setEscalar] = useState<string>("2")

  useEffect(() => {
    const initializeCanvas = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current
        console.log("Inicializando canvas...", canvas)
        
        // Asegurar que el canvas tenga el tamaño correcto
        canvas.width = 600
        canvas.height = 600
        
        try {
          const newRenderer = new CanvasRenderer(canvas)
          console.log("Renderer creado:", newRenderer)
          newRenderer.renderizarEscena()
          console.log("Escena renderizada")
          setRenderer(newRenderer)
        } catch (error) {
          console.error("Error al crear renderer:", error)
        }
      }
    }

    // Intentar inicializar inmediatamente
    initializeCanvas()
    
    // También intentar después de un pequeño delay
    const timer = setTimeout(initializeCanvas, 500)
    
    return () => clearTimeout(timer)
  }, [])

  const agregarVector = () => {
    if (vectores.length >= 8) {
      alert("Máximo 8 vectores permitidos")
      return
    }
    const nuevoId = (Math.max(...vectores.map((v) => Number.parseInt(v.id))) + 1).toString()
    setVectores([...vectores, { 
      id: nuevoId, 
      x: "", 
      y: "", 
      z: "", 
      color: COLORS[vectores.length % COLORS.length],
      origenX: 0,
      origenY: 0
    }])
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

  const limpiarVisualizacion = () => {
    if (renderer) {
      renderer.renderizarEscena()
    }
    setResultado(null)
    setPasos([])
    
    // Limpiar todos los vectores
    setVectores([
      { id: "1", x: "", y: "", z: "", color: COLORS[0], origenX: 0, origenY: 0 },
      { id: "2", x: "", y: "", z: "", color: COLORS[1], origenX: 0, origenY: 0 },
    ])
    
    // Limpiar el escalar si está en modo escalar
    setEscalar("2")
    setModoInteractivo(false)
    setVectorSeleccionado(null)
  }

  // Funciones para manejar el arrastre de vectores
  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!modoInteractivo || !renderer) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const canvasX = event.clientX - rect.left
    const canvasY = event.clientY - rect.top
    const coords = renderer.canvasACoordenadas(canvasX, canvasY)

    // Buscar si se hizo clic en algún vector
    const vectorClickeado = vectores.find(v => {
      if (!v.x || !v.y) return false
      const x = parseFloat(v.x)
      const y = parseFloat(v.y)
      const distancia = Math.sqrt((coords.x - (v.origenX + x))**2 + (coords.y - (v.origenY + y))**2)
      return distancia < 0.5 // Radio de detección
    })

    if (vectorClickeado) {
      setVectorSeleccionado(vectorClickeado.id)
      setPuntoArrastrando({ x: coords.x, y: coords.y })
    }
  }

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!modoInteractivo || !vectorSeleccionado || !puntoArrastrando || !renderer) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const canvasX = event.clientX - rect.left
    const canvasY = event.clientY - rect.top
    const coords = renderer.canvasACoordenadas(canvasX, canvasY)

    // Actualizar la posición del vector
    setVectores(vectores.map(v => {
      if (v.id === vectorSeleccionado) {
        const deltaX = coords.x - puntoArrastrando.x
        const deltaY = coords.y - puntoArrastrando.y
        
        // Calcular las nuevas coordenadas del vector
        const nuevaX = parseFloat(v.x || "0") + deltaX
        const nuevaY = parseFloat(v.y || "0") + deltaY
        
        return {
          ...v,
          x: nuevaX.toFixed(1),
          y: nuevaY.toFixed(1),
          origenX: 0, // Mantener origen en (0,0) para modo interactivo
          origenY: 0
        }
      }
      return v
    }))

    setPuntoArrastrando({ x: coords.x, y: coords.y })
    
    // Actualizar visualización en tiempo real
    setTimeout(() => {
      dibujarVectoresInteractivos()
    }, 10)
  }

  const handleMouseUp = () => {
    setVectorSeleccionado(null)
    setPuntoArrastrando(null)
  }

  // Función para alternar modo interactivo
  const toggleModoInteractivo = () => {
    setModoInteractivo(!modoInteractivo)
    if (!modoInteractivo) {
      // Al activar el modo interactivo, reiniciar orígenes y dibujar vectores
      setVectores(vectores.map(v => ({
        ...v,
        origenX: 0,
        origenY: 0
      })))
      // Dibujar los vectores actuales
      setTimeout(() => {
        dibujarVectoresInteractivos()
      }, 100)
    } else {
      // Al desactivar el modo interactivo, limpiar la selección
      setVectorSeleccionado(null)
      setPuntoArrastrando(null)
    }
  }

  // Función para dibujar vectores en modo interactivo
  const dibujarVectoresInteractivos = () => {
    if (!renderer) return

    renderer.renderizarEscena()
    
    vectores.forEach(v => {
      if (v.x && v.y) {
        const x = parseFloat(v.x)
        const y = parseFloat(v.y)
        const z = parseFloat(v.z || "0")
        const vector = new Vector3D(x, y, z, `V${v.id}`)
        // En modo interactivo, siempre dibujar desde el origen (0,0)
        const origen = new Vector3D(0, 0, 0)
        renderer.dibujarVector(vector, v.color, origen)
      }
    })
  }

  // Limpiar visualización cuando cambie la operación
  useEffect(() => {
    limpiarVisualizacion()
  }, [operacion])

  // Actualizar visualización cuando cambien los vectores en modo interactivo
  useEffect(() => {
    if (modoInteractivo && renderer) {
      dibujarVectoresInteractivos()
    }
  }, [vectores, modoInteractivo])

  const crearVector = (v: VectorInput): Vector3D | null => {
    const x = Number.parseFloat(v.x)
    const y = Number.parseFloat(v.y)
    const z = Number.parseFloat(v.z)
    if (isNaN(x) || isNaN(y) || isNaN(z)) {
      return null
    }
    return new Vector3D(x, y, z, `V${v.id}`)
  }

  const realizarOperacion = () => {
    const vectoresValidos = vectores.map(crearVector).filter((v): v is Vector3D => v !== null)

    if (vectoresValidos.length < 2 && operacion !== "escalar") {
      alert("Por favor ingresa al menos 2 vectores válidos")
      return
    }

    if (operacion === "escalar" && vectoresValidos.length < 1) {
      alert("Por favor ingresa al menos 1 vector para la multiplicación por escalar")
      return
    }

    let resultadoOp

    switch (operacion) {
      case "suma":
        resultadoOp = service.sumarMultiples(vectoresValidos)
        break
      case "resta":
        if (vectoresValidos.length !== 2) {
          alert("La resta requiere exactamente 2 vectores")
          return
        }
        resultadoOp = service.restar(vectoresValidos[0], vectoresValidos[1])
        break
      case "escalar":
        const escalarNum = Number.parseFloat(escalar)
        if (isNaN(escalarNum)) {
          alert("Por favor ingresa un escalar válido")
          return
        }
        resultadoOp = service.multiplicarPorEscalar(vectoresValidos[0], escalarNum)
        break
      case "punto":
        if (vectoresValidos.length !== 2) {
          alert("El producto punto requiere exactamente 2 vectores")
          return
        }
        resultadoOp = service.productoEscalar(vectoresValidos[0], vectoresValidos[1])
        break
      case "cruz":
        if (vectoresValidos.length !== 2) {
          alert("El producto cruz requiere exactamente 2 vectores")
          return
        }
        resultadoOp = service.productoCruz(vectoresValidos[0], vectoresValidos[1])
        break
      default:
        alert("Operación no válida")
        return
    }

    setResultado(resultadoOp.resultado)
    setPasos(resultadoOp.pasos)

    // Visualize vectors
    if (renderer) {
      renderer.limpiar()
      renderer.renderizarEscena()

      // Dibujar vectores según la operación
      if (operacion === "suma") {
        // Para suma, dibujar todos los vectores desde el origen
        vectoresValidos.forEach((vec, i) => {
          renderer.dibujarVector(vec, vectores[i].color)
        })
        
        // Dibujar el vector resultante en negro
        if (resultadoOp.resultado instanceof Vector3D) {
          renderer.dibujarVector(resultadoOp.resultado, "#000000")
        }
      } else if (operacion === "resta") {
        // Para resta, dibujar el primer vector y el segundo vector negativo
        if (vectoresValidos.length >= 2) {
          renderer.dibujarVector(vectoresValidos[0], vectores[0].color)
          
          // Dibujar el segundo vector con línea punteada para mostrar que se resta
          const vectorNegativo = new Vector3D(-vectoresValidos[1].x, -vectoresValidos[1].y, -vectoresValidos[1].z, `-${vectoresValidos[1].nombre}`)
          renderer.dibujarVector(vectorNegativo, vectores[1].color)
          
          // Dibujar el resultado
          if (resultadoOp.resultado instanceof Vector3D) {
            renderer.dibujarVector(resultadoOp.resultado, "#000000")
          }
        }
      } else if (operacion === "escalar") {
        // Para multiplicación por escalar, dibujar el vector original y el resultado
        if (vectoresValidos.length >= 1) {
          renderer.dibujarVector(vectoresValidos[0], vectores[0].color)
          
          if (resultadoOp.resultado instanceof Vector3D) {
            renderer.dibujarVector(resultadoOp.resultado, "#000000")
          }
        }
      } else if (operacion === "punto") {
        // Para producto punto, solo dibujar los vectores originales
        if (vectoresValidos.length >= 2) {
          renderer.dibujarVector(vectoresValidos[0], vectores[0].color)
          renderer.dibujarVector(vectoresValidos[1], vectores[1].color)
        }
      } else if (operacion === "cruz") {
        // Para producto cruz, dibujar los vectores originales y el resultado
        if (vectoresValidos.length >= 2) {
          renderer.dibujarVector(vectoresValidos[0], vectores[0].color)
          renderer.dibujarVector(vectoresValidos[1], vectores[1].color)
          
          if (resultadoOp.resultado instanceof Vector3D) {
            renderer.dibujarVector(resultadoOp.resultado, "#000000")
          }
        }
      }
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
            <h1 className="text-3xl font-bold mb-2">Operaciones con Vectores</h1>
            <p className="text-muted-foreground">Aprende teoría y practica operaciones vectoriales</p>
          </div>

          <Tabs defaultValue="teoria" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="teoria" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Teoría
              </TabsTrigger>
              <TabsTrigger value="practica" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Práctica
              </TabsTrigger>
            </TabsList>

            <TabsContent value="teoria" className="space-y-6">
              {/* Sección de teoría */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                    Teoría de Vectores
                  </CardTitle>
                  <CardDescription>Aprende los conceptos fundamentales de los vectores</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Definición de Vector */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-purple-700 flex items-center gap-2">
                      <Info className="h-5 w-5" />
                      1. ¿Qué es un Vector?
                    </h3>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-gray-700 mb-3">
                        Un <strong>vector</strong> es una magnitud física que se caracteriza por tener:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-gray-700">
                        <li><strong>Magnitud (módulo):</strong> La longitud o tamaño del vector</li>
                        <li><strong>Dirección:</strong> La orientación en el espacio</li>
                        <li><strong>Sentido:</strong> Hacia dónde apunta el vector</li>
                      </ul>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="font-medium text-blue-900 mb-2">Características principales:</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-800">
                        <li>Se representa gráficamente con una flecha</li>
                        <li>Se puede expresar mediante coordenadas (componentes)</li>
                        <li>No tiene posición fija en el espacio (vector libre)</li>
                        <li>Puede tener cualquier número de dimensiones</li>
                      </ul>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="font-medium text-green-900 mb-2">Ejemplos cotidianos:</p>
                      <ul className="list-disc list-inside space-y-1 text-green-800">
                        <li><strong>Velocidad:</strong> 60 km/h hacia el norte</li>
                        <li><strong>Fuerza:</strong> 10 N hacia abajo</li>
                        <li><strong>Desplazamiento:</strong> 5 metros hacia el este</li>
                        <li><strong>Aceleración:</strong> 9.8 m/s² hacia abajo</li>
                      </ul>
                    </div>
                  </div>

                  {/* Componentes de un Vector */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-purple-700 flex items-center gap-2">
                      <Info className="h-5 w-5" />
                      2. Componentes de un Vector
                    </h3>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-gray-700 mb-3">
                        Los <strong>componentes</strong> de un vector son las proyecciones del vector sobre los ejes coordenados.
                      </p>
                      <p className="text-gray-700 mb-3">
                        En el espacio tridimensional, un vector se descompone en tres componentes:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-gray-700">
                        <li><strong>Componente X (î):</strong> Proyección sobre el eje horizontal</li>
                        <li><strong>Componente Y (ĵ):</strong> Proyección sobre el eje vertical</li>
                        <li><strong>Componente Z (k̂):</strong> Proyección sobre el eje de profundidad</li>
                      </ul>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="font-medium text-blue-900 mb-2">Notación vectorial:</p>
                      <p className="text-blue-800 font-mono text-lg">
                        v⃗ = (vₓ, vᵧ, vᵤ) = vₓî + vᵧĵ + vᵤk̂
                      </p>
                      <p className="text-blue-800 text-sm mt-2">
                        Donde vₓ, vᵧ, vᵤ son las componentes escalares del vector.
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="font-medium text-green-900 mb-2">Ejemplo:</p>
                      <p className="text-green-800 font-mono">
                        Si v⃗ = (3, 4, 5), entonces:
                      </p>
                      <ul className="list-disc list-inside text-green-800 mt-2">
                        <li>Componente X = 3 (se mueve 3 unidades en X)</li>
                        <li>Componente Y = 4 (se mueve 4 unidades en Y)</li>
                        <li>Componente Z = 5 (se mueve 5 unidades en Z)</li>
                      </ul>
                    </div>
                  </div>

                  {/* Operaciones con Vectores */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-purple-700 flex items-center gap-2">
                      <Info className="h-5 w-5" />
                      3. Operaciones con Vectores
                    </h3>
                    
                    {/* Suma de Vectores */}
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">Suma de Vectores</h4>
                      <p className="text-gray-700 mb-3">
                        Para sumar vectores, se suman las componentes correspondientes:
                      </p>
                      <p className="font-mono text-lg bg-white p-2 rounded border">
                        v⃗₁ + v⃗₂ = (v₁ₓ + v₂ₓ, v₁ᵧ + v₂ᵧ, v₁ᵤ + v₂ᵤ)
                      </p>
                      <div className="bg-green-50 p-3 rounded mt-3">
                        <p className="font-medium text-green-900 mb-1">Ejemplo:</p>
                        <p className="text-green-800">
                          v⃗₁ = (2, 3, 1) + v⃗₂ = (4, -1, 2) = (6, 2, 3)
                        </p>
                      </div>
                    </div>

                    {/* Resta de Vectores */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Resta de Vectores</h4>
                      <p className="text-gray-700 mb-3">
                        Para restar vectores, se restan las componentes correspondientes:
                      </p>
                      <p className="font-mono text-lg bg-white p-2 rounded border">
                        v⃗₁ - v⃗₂ = (v₁ₓ - v₂ₓ, v₁ᵧ - v₂ᵧ, v₁ᵤ - v₂ᵤ)
                      </p>
                      <div className="bg-green-50 p-3 rounded mt-3">
                        <p className="font-medium text-green-900 mb-1">Ejemplo:</p>
                        <p className="text-green-800">
                          v⃗₁ = (5, 2, 3) - v⃗₂ = (1, 4, 1) = (4, -2, 2)
                        </p>
                      </div>
                    </div>

                    {/* Multiplicación por Escalar */}
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-orange-800 mb-2">Multiplicación por Escalar</h4>
                      <p className="text-gray-700 mb-3">
                        Para multiplicar un vector por un escalar, se multiplica cada componente:
                      </p>
                      <p className="font-mono text-lg bg-white p-2 rounded border">
                        k · v⃗ = (k·vₓ, k·vᵧ, k·vᵤ)
                      </p>
                      <div className="bg-green-50 p-3 rounded mt-3">
                        <p className="font-medium text-green-900 mb-1">Ejemplo:</p>
                        <p className="text-green-800">
                          3 · (2, 1, 4) = (6, 3, 12)
                        </p>
                      </div>
                    </div>

                    {/* Producto Escalar */}
                    <div className="bg-pink-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-pink-800 mb-2">Producto Escalar (Punto)</h4>
                      <p className="text-gray-700 mb-3">
                        El producto escalar resulta en un número (escalar):
                      </p>
                      <p className="font-mono text-lg bg-white p-2 rounded border">
                        v⃗₁ · v⃗₂ = v₁ₓ·v₂ₓ + v₁ᵧ·v₂ᵧ + v₁ᵤ·v₂ᵤ
                      </p>
                      <div className="bg-green-50 p-3 rounded mt-3">
                        <p className="font-medium text-green-900 mb-1">Ejemplo:</p>
                        <p className="text-green-800">
                          (2, 3, 1) · (4, -1, 2) = 2·4 + 3·(-1) + 1·2 = 8 - 3 + 2 = 7
                        </p>
                      </div>
                    </div>

                    {/* Producto Vectorial */}
                    <div className="bg-cyan-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-cyan-800 mb-2">Producto Vectorial (Cruz)</h4>
                      <p className="text-gray-700 mb-3">
                        El producto vectorial resulta en un nuevo vector perpendicular a ambos:
                      </p>
                      <p className="font-mono text-lg bg-white p-2 rounded border">
                        v⃗₁ × v⃗₂ = (v₁ᵧ·v₂ᵤ - v₁ᵤ·v₂ᵧ, v₁ᵤ·v₂ₓ - v₁ₓ·v₂ᵤ, v₁ₓ·v₂ᵧ - v₁ᵧ·v₂ₓ)
                      </p>
                      <div className="bg-green-50 p-3 rounded mt-3">
                        <p className="font-medium text-green-900 mb-1">Ejemplo:</p>
                        <p className="text-green-800">
                          (1, 2, 3) × (4, 5, 6) = (2·6-3·5, 3·4-1·6, 1·5-2·4) = (-3, 6, -3)
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
                  <CardDescription>
                    {operacion === "suma" && "Suma de vectores: se muestran todos los vectores y el resultado"}
                    {operacion === "resta" && "Resta de vectores: se muestra el primer vector, el segundo (negativo) y el resultado"}
                    {operacion === "escalar" && "Multiplicación por escalar: se muestra el vector original y el resultado"}
                    {operacion === "punto" && "Producto punto: se muestran los dos vectores (resultado es un escalar)"}
                    {operacion === "cruz" && "Producto cruz: se muestran los vectores originales y el vector perpendicular resultante"}
                  </CardDescription>
                  {modoInteractivo && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Modo Interactivo:</strong> Haz clic y arrastra los vectores para moverlos. 
                        Los campos X, Y se actualizarán automáticamente mientras arrastras.
                      </p>
                      {vectorSeleccionado && (
                        <p className="text-xs text-blue-600 mt-1">
                          ✨ Arrastrando Vector {vectores.findIndex(v => v.id === vectorSeleccionado) + 1} - Los valores se actualizan en tiempo real
                        </p>
                      )}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-2">
                    Estado del canvas: {renderer ? "✅ Listo" : "⏳ Inicializando..."}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center">
                    <canvas
                      ref={canvasRef}
                      width={600}
                      height={600}
                      className={`border-2 rounded-lg bg-white shadow-lg ${
                        modoInteractivo 
                          ? 'border-blue-500 cursor-move' 
                          : 'border-gray-300 cursor-default'
                      }`}
                      style={{ width: '600px', height: '600px' }}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                    />
                  </div>
                  <div className="mt-4 flex justify-center flex-wrap gap-2">
                    <Button
                      onClick={toggleModoInteractivo}
                      variant={modoInteractivo ? "default" : "outline"}
                    >
                      {modoInteractivo ? "Desactivar Arrastre" : "Activar Arrastre"}
                    </Button>
                    {modoInteractivo && (
                      <>
                        <Button
                          onClick={dibujarVectoresInteractivos}
                          variant="outline"
                        >
                          Actualizar Vista
                        </Button>
                        {operacion === "suma" && (
                          <Button
                            onClick={() => {
                              if (renderer && vectores.length >= 2) {
                                renderer.renderizarEscena()
                                // Dibujar paralelogramo para suma
                                const v1 = vectores[0]
                                const v2 = vectores[1]
                                if (v1.x && v1.y && v2.x && v2.y) {
                                  const x1 = parseFloat(v1.x)
                                  const y1 = parseFloat(v1.y)
                                  const x2 = parseFloat(v2.x)
                                  const y2 = parseFloat(v2.y)
                                  
                                  // Dibujar vectores desde el origen
                                  const vector1 = new Vector3D(x1, y1, 0, "V1")
                                  const vector2 = new Vector3D(x2, y2, 0, "V2")
                                  renderer.dibujarVector(vector1, v1.color)
                                  renderer.dibujarVector(vector2, v2.color)
                                  
                                  // Dibujar paralelogramo
                                  const origen = new Vector3D(0, 0, 0)
                                  const p1 = new Vector3D(x1, y1, 0)
                                  const p2 = new Vector3D(x2, y2, 0)
                                  const p3 = new Vector3D(x1 + x2, y1 + y2, 0)
                                  
                                  // Líneas del paralelogramo
                                  renderer.dibujarSegmento(p1, p3, "#888888", 1)
                                  renderer.dibujarSegmento(p2, p3, "#888888", 1)
                                  
                                  // Vector resultante
                                  const resultado = new Vector3D(x1 + x2, y1 + y2, 0, "Resultado")
                                  renderer.dibujarVector(resultado, "#000000")
                                }
                              }
                            }}
                            variant="secondary"
                          >
                            Regla del Paralelogramo
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3 justify-center text-sm">
                    {vectores.map((v, i) => (
                      <div key={v.id} className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: v.color }} />
                        <span>Vector {i + 1}</span>
                      </div>
                    ))}
                    {(operacion === "suma" || operacion === "resta" || operacion === "escalar" || operacion === "cruz") && (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-black rounded" />
                        <span>Resultado</span>
                      </div>
                    )}
                    {operacion === "resta" && (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-dashed border-gray-400 rounded" />
                        <span>Vector Restado</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {resultado !== null && pasos.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Resultado y Pasos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-purple-50 rounded-lg">
                        {typeof resultado === 'number' ? (
                          <>
                            <p className="text-sm text-muted-foreground mb-1">Resultado escalar:</p>
                            <p className="text-xl font-bold">{resultado.toFixed(4)}</p>
                          </>
                        ) : (
                          <>
                            <p className="text-sm text-muted-foreground mb-1">Vector resultante:</p>
                            <p className="font-mono text-lg">
                              ({resultado.x.toFixed(2)}, {resultado.y.toFixed(2)}, {resultado.z.toFixed(2)})
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">Magnitud:</p>
                            <p className="text-xl font-bold">{resultado.magnitud().toFixed(2)}</p>
                          </>
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
                  <CardDescription>Selecciona la operación a realizar</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Operación</Label>
                    <Select value={operacion} onValueChange={setOperacion}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una operación" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="suma">Suma de Vectores</SelectItem>
                        <SelectItem value="resta">Resta de Vectores</SelectItem>
                        <SelectItem value="escalar">Multiplicación por Escalar</SelectItem>
                        <SelectItem value="punto">Producto Punto (Escalar)</SelectItem>
                        <SelectItem value="cruz">Producto Cruz (Vectorial)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {operacion === "escalar" && (
                    <div className="space-y-2">
                      <Label>Escalar</Label>
                      <Input
                        type="number"
                        value={escalar}
                        onChange={(e) => setEscalar(e.target.value)}
                        step="0.1"
                        placeholder="Ingresa el escalar"
                      />
                    </div>
                  )}

                  <Button onClick={realizarOperacion} className="w-full">
                    {operacion === "suma" && "Sumar Vectores"}
                    {operacion === "resta" && "Restar Vectores"}
                    {operacion === "escalar" && "Multiplicar por Escalar"}
                    {operacion === "punto" && "Calcular Producto Punto"}
                    {operacion === "cruz" && "Calcular Producto Cruz"}
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <Button onClick={limpiarVisualizacion} variant="outline">
                      Limpiar Todo
                    </Button>
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
                    >
                      Debug Canvas
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Teoría Rápida</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  {modoInteractivo && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="font-medium text-green-900 mb-2">Modo Interactivo Activo:</p>
                      <ul className="text-green-800 text-xs space-y-1">
                        <li>• Haz clic y arrastra los vectores para moverlos</li>
                        <li>• Experimenta con diferentes posiciones</li>
                        <li>• Usa "Regla del Paralelogramo" para visualizar sumas</li>
                        <li>• Ajusta las posiciones para entender mejor las operaciones</li>
                      </ul>
                    </div>
                  )}
                  {operacion === "suma" && (
                    <>
                      <p className="font-medium">Suma de Vectores:</p>
                      <p className="text-muted-foreground">
                        Para sumar múltiples vectores, se suman todas las componentes X, todas las Y, y todas las Z por
                        separado.
                      </p>
                      <p className="text-muted-foreground mt-2">
                        <strong>Ejemplo:</strong> Si V1=(1,2,3) y V2=(4,5,6), entonces V1+V2=(1+4, 2+5, 3+6)=(5,7,9)
                      </p>
                    </>
                  )}
                  
                  {operacion === "resta" && (
                    <>
                      <p className="font-medium">Resta de Vectores:</p>
                      <p className="text-muted-foreground">
                        Para restar vectores, se restan las componentes correspondientes.
                      </p>
                      <p className="text-muted-foreground mt-2">
                        <strong>Ejemplo:</strong> Si V1=(5,2,3) y V2=(1,4,1), entonces V1-V2=(5-1, 2-4, 3-1)=(4,-2,2)
                      </p>
                    </>
                  )}

                  {operacion === "escalar" && (
                    <>
                      <p className="font-medium">Multiplicación por Escalar:</p>
                      <p className="text-muted-foreground">
                        Se multiplica cada componente del vector por el escalar.
                      </p>
                      <p className="text-muted-foreground mt-2">
                        <strong>Ejemplo:</strong> 3 × (2,1,4) = (3×2, 3×1, 3×4) = (6,3,12)
                      </p>
                    </>
                  )}

                  {operacion === "punto" && (
                    <>
                      <p className="font-medium">Producto Punto (Escalar):</p>
                      <p className="text-muted-foreground">
                        Se multiplican las componentes correspondientes y se suman los resultados.
                      </p>
                      <p className="text-muted-foreground mt-2">
                        <strong>Ejemplo:</strong> (2,3,1) · (4,-1,2) = 2×4 + 3×(-1) + 1×2 = 8-3+2 = 7
                      </p>
                    </>
                  )}

                  {operacion === "cruz" && (
                    <>
                      <p className="font-medium">Producto Cruz (Vectorial):</p>
                      <p className="text-muted-foreground">
                        Genera un vector perpendicular a ambos vectores originales.
                      </p>
                      <p className="text-muted-foreground mt-2">
                        <strong>Ejemplo:</strong> (1,2,3) × (4,5,6) = (2×6-3×5, 3×4-1×6, 1×5-2×4) = (-3,6,-3)
                      </p>
                    </>
                  )}
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
