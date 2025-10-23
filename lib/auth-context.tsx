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
    const resultado = await controller.login(credenciales)
    if (resultado.exito && resultado.usuario) {
      setUsuario(resultado.usuario)
      setProgreso(controller.obtenerProgresoActual())
    }
    return resultado
  }

  const registrar = async (datos: DatosRegistro): Promise<ResultadoAuth> => {
    const resultado = await controller.registrar(datos)
    if (resultado.exito && resultado.usuario) {
      setUsuario(resultado.usuario)
      setProgreso(controller.obtenerProgresoActual())
    }
    return resultado
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
