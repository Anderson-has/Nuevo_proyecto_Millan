"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { AppController, type ResultadoAuth } from "@/src/coordinadores/AppController"
import type { Usuario } from "@/src/entidades/Usuario"
import type { Progreso } from "@/src/entidades/Progreso"
import type { CredencialesLogin, DatosRegistro } from "@/src/servicios/AuthService"
import { initializeSeedData } from "./seed-data"

interface AuthContextType {
  usuario: Usuario | null
  progreso: Progreso | null
  isLoading: boolean
  login: (credenciales: CredencialesLogin) => Promise<ResultadoAuth>
  registrar: (datos: DatosRegistro) => Promise<ResultadoAuth>
  logout: () => void
  actualizarProgreso: (progreso: Progreso) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [controller] = useState(() => new AppController())
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [progreso, setProgreso] = useState<Progreso | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    initializeSeedData()

    const currentUser = controller.obtenerUsuarioActual()
    const currentProgress = controller.obtenerProgresoActual()
    setUsuario(currentUser)
    setProgreso(currentProgress)
    setIsLoading(false)
  }, [controller])

  const login = async (credenciales: CredencialesLogin): Promise<ResultadoAuth> => {
    // Usar la API de Spring Boot en lugar del controlador local
    try {
      const { apiClient } = await import('./api-client')
      
      // Convertir las credenciales al formato que espera la API
      const response = await apiClient.login({
        usernameOrEmail: credenciales.email,
        password: credenciales.password,
      })

      // Si llega aquí, el login fue exitoso
      // TODO: Necesitamos obtener los datos del usuario desde el token JWT
      const usuario = {
        id: '', // TODO: extraer del token
        nombre: credenciales.email.split('@')[0],
        apellidos: '',
        email: credenciales.email,
        semestre: 1,
        fechaRegistro: new Date(),
        rol: 'estudiante' as const,
      }

      // Actualizar el estado del usuario
      setUsuario(usuario as any)
      setProgreso(null) // TODO: cargar progreso real desde la API

      return {
        exito: true,
        usuario: usuario as any,
      }
    } catch (error: any) {
      console.error('Error al iniciar sesión:', error)
      return {
        exito: false,
        mensaje: error.message || 'Error al iniciar sesión',
      }
    }
  }

  const registrar = async (datos: DatosRegistro): Promise<ResultadoAuth> => {
    // Usar la API de Spring Boot en lugar del controlador local
    try {
      const { apiClient } = await import('./api-client')
      
      // Convertir los datos al formato que espera la API
      const response = await apiClient.register({
        email: datos.email,
        password: datos.password,
        firstName: datos.nombre,
        lastName: datos.apellidos,
        semester: datos.semestre,
        type: datos.rol === 'docente' ? 'DOCENTE' : 'ESTUDIANTE',
      })

      // Si llega aquí, el registro fue exitoso
      const usuario = {
        id: response.id?.toString() || '',
        nombre: response.username || datos.nombre,
        apellidos: datos.apellidos,
        email: datos.email,
        semestre: datos.semestre,
        fechaRegistro: new Date(),
        rol: datos.rol,
      } as any

      // Actualizar el estado del usuario
      setUsuario(usuario)
      setProgreso(null) // TODO: cargar progreso real desde la API

      return {
        exito: true,
        usuario,
      }
    } catch (error: any) {
      console.error('Error al registrar:', error)
      return {
        exito: false,
        mensaje: error.message || 'Error al registrarse',
      }
    }
  }

  const logout = () => {
    controller.logout()
    setUsuario(null)
    setProgreso(null)
  }

  const actualizarProgreso = (nuevoProgreso: Progreso) => {
    controller.guardarProgreso(nuevoProgreso)
    setProgreso(nuevoProgreso)
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        progreso,
        isLoading,
        login,
        registrar,
        logout,
        actualizarProgreso,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
