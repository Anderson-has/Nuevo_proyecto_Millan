"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardDocente } from "@/components/dashboard-docente"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, LogOut, Trophy, Calculator, TrendingUp, Ruler, GitBranch, Sparkles } from "lucide-react"

export default function DashboardPage() {
  const { usuario, progreso, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  // Si el usuario es docente, mostrar el dashboard de docente
  if (usuario?.rol === 'docente') {
    return <DashboardDocente />
  }

  const modules = [
    {
      id: "emprendimiento",
      title: "Caso de Emprendimiento",
      description: "Analiza casos reales de negocios y toma decisiones financieras",
      icon: TrendingUp,
      href: "/modules/emprendimiento",
      completed: progreso?.leccionesCompletadas.includes("emprendimiento-1") || false,
    },
    {
      id: "cartesiano",
      title: "Plano Cartesiano",
      description: "Explora coordenadas y grafica puntos en el plano",
      icon: BookOpen,
      href: "/modules/cartesiano",
      completed: progreso?.leccionesCompletadas.includes("cartesiano-1") || false,
    },
    {
      id: "vectores",
      title: "Operaciones con Vectores",
      description: "Suma múltiples vectores y aprende operaciones vectoriales",
      icon: Calculator,
      href: "/modules/vectores",
      completed: progreso?.leccionesCompletadas.includes("vectores-1") || false,
    },
    {
      id: "matrices",
      title: "Matrices y Gauss-Jordan",
      description: "Suma, resta, multiplica matrices y resuelve sistemas",
      icon: Calculator,
      href: "/modules/matrices",
      completed: progreso?.leccionesCompletadas.includes("matrices-1") || false,
    },
    {
      id: "segmentos",
      title: "Segmentos de Recta",
      description: "Geometría analítica y ecuaciones paramétricas",
      icon: Ruler,
      href: "/modules/segmentos",
      completed: progreso?.leccionesCompletadas.includes("segmentos-1") || false,
    },
    {
      id: "dependencia",
      title: "Dependencia Lineal",
      description: "Independencia y dependencia de vectores",
      icon: GitBranch,
      href: "/modules/dependencia",
      completed: progreso?.leccionesCompletadas.includes("dependencia-1") || false,
    },
    {
      id: "ortonormalizacion",
      title: "Ortonormalización",
      description: "Proceso de Gram-Schmidt y bases ortogonales",
      icon: Sparkles,
      href: "/modules/ortonormalizacion",
      completed: progreso?.leccionesCompletadas.includes("ortonormalizacion-1") || false,
    },
  ]

  const completedCount = modules.filter((m) => m.completed).length

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        {/* Header con gradiente naranja */}
        <header className="bg-gradient-to-r from-orange-600 to-orange-400 text-white">
          <div className="container mx-auto px-4 py-6 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Logo de empanada con animación */}
              <span className="text-4xl animate-bounce">🥟</span>
              <h1 className="text-2xl font-bold">Empanadas del Saber</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-lg">¡Hola, {usuario?.nombre || 'Administrador'}!</span>
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

        <main className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Sección de bienvenida */}
          <div className="mb-12 text-center">
            <Card className="max-w-4xl mx-auto border-l-4 border-l-red-500">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold mb-4">
                  ¡Bienvenido al Tablero de Álgebra!
                </CardTitle>
                <CardDescription className="text-lg mb-4">
                  Hola <strong>{usuario?.nombre || 'Administrador'}</strong>, estudiante de 1º Semestre.
                </CardDescription>
                <CardDescription className="text-base">
                  Aquí podrás practicar y aprender álgebra de manera divertida con nuestro tema de empanadas, adaptado a tu nivel académico.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Sección de progreso */}
          <div className="mb-8">
            <Card className="border-l-4 border-l-orange-500">
              <CardHeader>
                <CardTitle>Tu Progreso</CardTitle>
                <CardDescription>
                  Has completado {completedCount} de {modules.length} módulos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-orange-500 h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${(completedCount / modules.length) * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">{progreso?.puntajeTotal || 0} puntos totales</p>
              </CardContent>
            </Card>
          </div>

          {/* Grid de todos los módulos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module) => {
              const Icon = module.icon
              return (
                <Card
                  key={module.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer border-t-4 border-t-orange-400"
                  onClick={() => router.push(module.href)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Icon className="h-8 w-8 text-gray-700" />
                        </div>
                      </div>
                      {module.completed && (
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                          Completado
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-lg font-bold text-gray-900 mb-2">
                      {module.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      {module.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" variant={module.completed ? "outline" : "default"}>
                      {module.completed ? "Revisar" : "Comenzar"}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
