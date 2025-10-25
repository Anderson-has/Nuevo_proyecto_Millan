"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  ArrowLeft, 
  Search, 
  Users, 
  Mail,
  Calendar,
  Trophy,
  Eye,
  Trash2,
  Filter,
  Download
} from "lucide-react"
import type { Usuario } from "@/src/entidades/Usuario"

interface EstudianteConProgreso {
  usuario: Usuario
  progreso: {
    leccionesCompletadas: string[]
    puntajeTotal: number
    ultimaActividad: Date
  }
}

export default function EstudiantesPage() {
  const { usuario } = useAuth()
  const router = useRouter()
  const [estudiantes, setEstudiantes] = useState<EstudianteConProgreso[]>([])
  const [estudiantesFiltrados, setEstudiantesFiltrados] = useState<EstudianteConProgreso[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [busqueda, setBusqueda] = useState("")
  const [filtroSemestre, setFiltroSemestre] = useState("todos")

  useEffect(() => {
    if (usuario?.rol !== 'docente') {
      router.push("/dashboard")
      return
    }
    cargarEstudiantes()
  }, [usuario, router])

  useEffect(() => {
    filtrarEstudiantes()
  }, [estudiantes, busqueda, filtroSemestre])

  const cargarEstudiantes = async () => {
    try {
      setIsLoading(true)
      // Simular datos de estudiantes
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
        },
        {
          usuario: {
            id: "3",
            nombre: "Ana",
            apellidos: "Martínez",
            email: "ana@universidad.edu.co",
            semestre: 2,
            fechaRegistro: new Date("2024-01-05"),
            rol: "estudiante"
          } as Usuario,
          progreso: {
            leccionesCompletadas: ["cartesiano-1", "vectores-1", "matrices-1", "segmentos-1"],
            puntajeTotal: 1500,
            ultimaActividad: new Date("2024-01-22")
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

  const filtrarEstudiantes = () => {
    let filtrados = estudiantes

    // Filtrar por búsqueda
    if (busqueda) {
      filtrados = filtrados.filter(estudiante =>
        estudiante.usuario.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        estudiante.usuario.apellidos.toLowerCase().includes(busqueda.toLowerCase()) ||
        estudiante.usuario.email.toLowerCase().includes(busqueda.toLowerCase())
      )
    }

    // Filtrar por semestre
    if (filtroSemestre !== "todos") {
      filtrados = filtrados.filter(estudiante =>
        estudiante.usuario.semestre === parseInt(filtroSemestre)
      )
    }

    setEstudiantesFiltrados(filtrados)
  }

  const eliminarEstudiante = async (estudianteId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este estudiante?")) {
      try {
        setEstudiantes(estudiantes.filter(e => e.usuario.id !== estudianteId))
      } catch (err) {
        setError("Error al eliminar el estudiante")
      }
    }
  }

  const exportarDatos = () => {
    // Implementar exportación de datos
    console.log("Exportando datos de estudiantes...")
  }

  if (usuario?.rol !== 'docente') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <p className="text-gray-600">No tienes permisos para acceder a esta página</p>
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
                <h1 className="text-2xl font-bold">Gestión de Estudiantes</h1>
                <p className="text-orange-100">
                  Administra y monitorea el progreso de tus estudiantes
                </p>
              </div>
            </div>
            <Button
              onClick={exportarDatos}
              className="bg-orange-300 hover:bg-orange-200 text-orange-800"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Filtros y búsqueda */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Filtros y Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Buscar estudiante</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Nombre, apellido o email..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Filtrar por semestre</label>
                <select
                  value={filtroSemestre}
                  onChange={(e) => setFiltroSemestre(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="todos">Todos los semestres</option>
                  <option value="1">Semestre 1</option>
                  <option value="2">Semestre 2</option>
                  <option value="3">Semestre 3</option>
                  <option value="4">Semestre 4</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Estadísticas</label>
                <div className="text-sm text-gray-600">
                  {estudiantesFiltrados.length} de {estudiantes.length} estudiantes
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de estudiantes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Lista de Estudiantes
            </CardTitle>
            <CardDescription>
              {estudiantesFiltrados.length} estudiantes encontrados
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
            ) : estudiantesFiltrados.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {busqueda || filtroSemestre !== "todos" 
                    ? "No se encontraron estudiantes con los filtros aplicados"
                    : "No hay estudiantes registrados"
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {estudiantesFiltrados.map((estudiante) => (
                  <div
                    key={estudiante.usuario.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-orange-600 font-semibold text-lg">
                          {estudiante.usuario.nombre.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
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
                          <span className="flex items-center">
                            <Trophy className="h-4 w-4 mr-1" />
                            {estudiante.progreso.puntajeTotal} puntos
                          </span>
                        </div>
                        <div className="mt-1">
                          <Badge variant="secondary">
                            {estudiante.progreso.leccionesCompletadas.length} lecciones completadas
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/docente/estudiante/${estudiante.usuario.id}`)}
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
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
