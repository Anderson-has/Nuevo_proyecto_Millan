"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  ArrowLeft, 
  Trophy, 
  BookOpen, 
  Calendar,
  Mail,
  GraduationCap,
  CheckCircle,
  Clock,
  Target
} from "lucide-react"
import type { Usuario } from "@/src/entidades/Usuario"

interface ProgresoDetallado {
  leccionesCompletadas: string[]
  puntajeTotal: number
  ultimaActividad: Date
  tiempoTotalEstudio: number // en minutos
  leccionesPorModulo: Record<string, number>
}

export default function ProgresoEstudiantePage() {
  const { usuario } = useAuth()
  const router = useRouter()
  const params = useParams()
  const estudianteId = params.id as string

  const [estudiante, setEstudiante] = useState<Usuario | null>(null)
  const [progreso, setProgreso] = useState<ProgresoDetallado | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    cargarDatosEstudiante()
  }, [estudianteId])

  const cargarDatosEstudiante = async () => {
    try {
      setIsLoading(true)
      // Simular datos del estudiante
      const estudianteSimulado: Usuario = {
        id: estudianteId,
        nombre: "María",
        apellidos: "González",
        email: "maria@universidad.edu.co",
        semestre: 1,
        fechaRegistro: new Date("2024-01-15"),
        rol: "estudiante"
      } as Usuario

      const progresoSimulado: ProgresoDetallado = {
        leccionesCompletadas: ["cartesiano-1", "vectores-1", "matrices-1"],
        puntajeTotal: 1250,
        ultimaActividad: new Date("2024-01-21"),
        tiempoTotalEstudio: 180, // 3 horas
        leccionesPorModulo: {
          "cartesiano": 1,
          "vectores": 1,
          "matrices": 1,
          "emprendimiento": 0,
          "segmentos": 0,
          "dependencia": 0,
          "ortonormalizacion": 0
        }
      }

      setEstudiante(estudianteSimulado)
      setProgreso(progresoSimulado)
    } catch (err) {
      console.error("Error al cargar datos del estudiante:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const modulos = [
    { id: "emprendimiento", nombre: "Caso de Emprendimiento", totalLecciones: 3 },
    { id: "cartesiano", nombre: "Plano Cartesiano", totalLecciones: 2 },
    { id: "vectores", nombre: "Operaciones con Vectores", totalLecciones: 3 },
    { id: "matrices", nombre: "Matrices y Gauss-Jordan", totalLecciones: 4 },
    { id: "segmentos", nombre: "Segmentos de Recta", totalLecciones: 2 },
    { id: "dependencia", nombre: "Dependencia Lineal", totalLecciones: 2 },
    { id: "ortonormalizacion", nombre: "Ortonormalización", totalLecciones: 3 }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Cargando progreso del estudiante...</p>
        </div>
      </div>
    )
  }

  if (!estudiante || !progreso) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <p className="text-gray-600">No se encontraron datos del estudiante</p>
            <Button 
              variant="outline" 
              onClick={() => router.push("/dashboard")}
              className="mt-4"
            >
              Volver al Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-600 to-orange-400 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push("/dashboard")}
                className="text-white hover:bg-orange-500"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Progreso del Estudiante</h1>
                <p className="text-orange-100">
                  {estudiante.nombre} {estudiante.apellidos}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Información del estudiante */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <GraduationCap className="mr-2 h-5 w-5" />
              Información del Estudiante
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{estudiante.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Semestre</p>
                  <p className="font-medium">Semestre {estudiante.semestre}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Trophy className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Puntaje Total</p>
                  <p className="font-medium text-orange-600">{progreso.puntajeTotal} puntos</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas generales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lecciones Completadas</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progreso.leccionesCompletadas.length}</div>
              <p className="text-xs text-muted-foreground">
                de {modulos.reduce((sum, m) => sum + m.totalLecciones, 0)} total
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tiempo de Estudio</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progreso.tiempoTotalEstudio} min</div>
              <p className="text-xs text-muted-foreground">
                Tiempo total invertido
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Última Actividad</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {progreso.ultimaActividad.toLocaleDateString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Fecha de última conexión
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Progreso por módulo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="mr-2 h-5 w-5" />
              Progreso por Módulo
            </CardTitle>
            <CardDescription>
              Detalle del avance en cada módulo de aprendizaje
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {modulos.map((modulo) => {
                const leccionesCompletadas = progreso.leccionesPorModulo[modulo.id] || 0
                const porcentaje = (leccionesCompletadas / modulo.totalLecciones) * 100
                
                return (
                  <div key={modulo.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{modulo.nombre}</h3>
                      <Badge variant={porcentaje === 100 ? "default" : porcentaje > 0 ? "secondary" : "outline"}>
                        {leccionesCompletadas}/{modulo.totalLecciones} lecciones
                      </Badge>
                    </div>
                    <Progress value={porcentaje} className="h-2" />
                    <p className="text-sm text-gray-600">
                      {porcentaje.toFixed(0)}% completado
                    </p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
