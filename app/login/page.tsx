"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const resultado = await login({ email, password })

      if (resultado.exito) {
        router.push("/dashboard")
      } else {
        setError(resultado.mensaje || "Error al iniciar sesión")
      }
    } catch (err) {
      setError("Error inesperado al iniciar sesión")
    } finally {
      setIsLoading(false)
    }
  }

  const usarCredencialesEstudiante = () => {
    setEmail("estudiante@empanadas.com")
    setPassword("123456")
  }

  const usarCredencialesDocente = () => {
    setEmail("docente@empanadas.com")
    setPassword("123456")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="text-6xl">🥟</div>
          </div>
          <CardTitle className="text-3xl font-bold text-center text-amber-900">Empanadas del Saber</CardTitle>
          <CardDescription className="text-center text-amber-700">
            Ingresa tus credenciales para acceder a la plataforma
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Alert className="bg-blue-50 border-blue-200">
                <AlertDescription className="text-sm">
                  <strong className="font-semibold">Estudiante de prueba:</strong>
                  <br />
                  Email: <code className="bg-blue-100 px-1 rounded">estudiante@empanadas.com</code>
                  <br />
                  Contraseña: <code className="bg-blue-100 px-1 rounded">123456</code>
                  <br />
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="h-auto p-0 mt-1 text-blue-600"
                    onClick={usarCredencialesEstudiante}
                  >
                    Usar estas credenciales
                  </Button>
                </AlertDescription>
              </Alert>

              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-sm">
                  <strong className="font-semibold">Docente de prueba:</strong>
                  <br />
                  Email: <code className="bg-green-100 px-1 rounded">docente@empanadas.com</code>
                  <br />
                  Contraseña: <code className="bg-green-100 px-1 rounded">123456</code>
                  <br />
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="h-auto p-0 mt-1 text-green-600"
                    onClick={usarCredencialesDocente}
                  >
                    Usar estas credenciales
                  </Button>
                </AlertDescription>
              </Alert>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner className="mr-2" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              ¿No tienes cuenta?{" "}
              <Link href="/register" className="text-amber-700 hover:underline font-medium">
                Regístrate aquí
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
