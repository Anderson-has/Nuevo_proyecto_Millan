"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { 
  LogOut, 
  User, 
  Settings, 
  BookOpen, 
  Users, 
  BarChart3,
  GraduationCap
} from "lucide-react"

export function Navigation() {
  const { usuario, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  if (!usuario) return null

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🥟</span>
            <h1 className="text-xl font-bold text-orange-600">Empanadas del Saber</h1>
          </div>

          {/* Navegación según rol */}
          <div className="flex items-center space-x-4">
            {usuario.rol === 'estudiante' ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => router.push("/dashboard")}
                  className="text-gray-700 hover:text-orange-600"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Módulos
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => router.push("/dashboard")}
                  className="text-gray-700 hover:text-orange-600"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => router.push("/docente/estudiantes")}
                  className="text-gray-700 hover:text-orange-600"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Estudiantes
                </Button>
              </>
            )}

            {/* Menú de usuario */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 font-semibold text-sm">
                      {usuario.nombre.charAt(0)}
                    </span>
                  </div>
                  <span className="text-sm font-medium">{usuario.nombre}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{usuario.nombre} {usuario.apellidos}</p>
                  <p className="text-xs text-gray-500">{usuario.email}</p>
                  <p className="text-xs text-orange-600 capitalize">{usuario.rol}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/perfil")}>
                  <User className="h-4 w-4 mr-2" />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/configuracion")}>
                  <Settings className="h-4 w-4 mr-2" />
                  Configuración
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}
