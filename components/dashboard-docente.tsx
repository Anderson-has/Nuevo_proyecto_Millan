"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Users, 
  LogOut, 
  Trophy, 
  Trash2, 
  Eye, 
  BarChart3, 
  UserCheck,
  Calendar,
  Mail,
  GraduationCap
} from "lucide-react"
import { AppController } from "@/src/coordinadores/AppController"
import type { Usuario } from "@/src/entidades/Usuario"

interface EstudianteConProgreso {
  usuario: Usuario
  progreso: {
    leccionesCompletadas: string[]
    puntajeTotal: number
    ultimaActividad: Date
  }
}

export function DashboardDocente() {
  const { usuario, logout } = useAuth()
  const router = useRouter()
  const [estudiantes, setEstudiantes] = useState<EstudianteConProgreso[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    cargarEstudiantes()
  }, [])

  const cargarEstudiantes = async () => {
    try {
      setIsLoading(true)
      const controller = new AppController()
      // Aquí implementarías la lógica para obtener todos los estudiantes
      // Por ahora, simularemos algunos datos
      const estudiantesSimulados: EstudianteConProgreso[] = [
        {
          usuario: {
            id: "1",
            nombre: "María",
            apellidos: "González",
            email: "maria@universidad.edu.co",
            semestre: 1,
            fechaRegistro: new Date("2024-01-15"),
            rol: "estudiante"
          } as Usuario,
          progreso: {
            leccionesCompletadas: ["cartesiano-1", "vectores-1"],
            puntajeTotal: 850,
            ultimaActividad: new Date("2024-01-20")
          }
        },
        {
          usuario: {
            id: "2",
            nombre: "Carlos",
            apellidos: "Rodríguez",
            email: "carlos@universidad.edu.co",
            semestre: 1,
            fechaRegistro: new Date("2024-01-10"),
            rol: "estudiante"
          } as Usuario,
          progreso: {
            leccionesCompletadas: ["cartesiano-1", "vectores-1", "matrices-1"],
            puntajeTotal: 1200,
            ultimaActividad: new Date("2024-01-21")
          }
        }
      ]
      setEstudiantes(estudiantesSimulados)
    } catch (err) {
      setError("Error al cargar los estudiantes")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const eliminarEstudiante = async (estudianteId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este estudiante?")) {
      try {
        // Aquí implementarías la lógica para eliminar el estudiante
        setEstudiantes(estudiantes.filter(e => e.usuario.id !== estudianteId))
      } catch (err) {
        setError("Error al eliminar el estudiante")
      }
    }
  }

  const verProgresoEstudiante = (estudianteId: string) => {
    // Navegar a una página de detalles del progreso del estudiante
    router.push(`/docente/estudiante/${estudianteId}`)
  }

  const totalEstudiantes = estudiantes.length
  const estudiantesActivos = estudiantes.filter(e => 
    e.progreso.ultimaActividad > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length
  const promedioPuntaje = estudiantes.length > 0 
    ? Math.round(estudiantes.reduce((sum, e) => sum + e.progreso.puntajeTotal, 0) / estudiantes.length)
    : 0

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header con gradiente naranja */}
      <header className="bg-gradient-to-r from-orange-600 to-orange-400 text-white">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-4xl animate-bounce">🥟</span>
            <h1 className="text-2xl font-bold">Empanadas del Saber - Panel Docente</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-lg">¡Hola, Profesor {usuario?.nombre}!</span>
            <Button 
              variant="secondary" 
              onClick={handleLogout}
              className="bg-orange-300 hover:bg-orange-200 text-orange-800 border-0"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Estadísticas generales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Estudiantes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEstudiantes}</div>
              <p className="text-xs text-muted-foreground">
                Registrados en la plataforma
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estudiantes Activos</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estudiantesActivos}</div>
              <p className="text-xs text-muted-foreground">
                Activos en los últimos 7 días
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Promedio Puntaje</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{promedioPuntaje}</div>
              <p className="text-xs text-muted-foreground">
                Puntos promedio por estudiante
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de estudiantes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <GraduationCap className="mr-2 h-5 w-5" />
              Lista de Estudiantes
            </CardTitle>
            <CardDescription>
              Gestiona y monitorea el progreso de tus estudiantes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Cargando estudiantes...</p>
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : estudiantes.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No hay estudiantes registrados</p>
              </div>
            ) : (
              <div className="space-y-4">
                {estudiantes.map((estudiante) => (
                  <div
                    key={estudiante.usuario.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-orange-600 font-semibold">
                          {estudiante.usuario.nombre.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {estudiante.usuario.nombre} {estudiante.usuario.apellidos}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Mail className="h-4 w-4 mr-1" />
                            {estudiante.usuario.email}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Semestre {estudiante.usuario.semestre}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <Trophy className="h-4 w-4 text-yellow-500" />
                          <span className="font-semibold">{estudiante.progreso.puntajeTotal} pts</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {estudiante.progreso.leccionesCompletadas.length} lecciones
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => verProgresoEstudiante(estudiante.usuario.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Progreso
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => eliminarEstudiante(estudiante.usuario.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
