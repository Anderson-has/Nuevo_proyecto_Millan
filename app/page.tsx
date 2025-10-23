"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Calculator, TrendingUp, Sparkles } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

export default function HomePage() {
  const { usuario, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && usuario) {
      router.push("/dashboard")
    }
  }, [usuario, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (usuario) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-indigo-600" />
            <h1 className="text-xl font-bold text-gray-900">Plataforma Educativa</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Iniciar Sesión</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Registrarse</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
            Aprende Matemáticas y Emprendimiento de Forma Interactiva
          </h2>
          <p className="text-xl text-muted-foreground mb-8 text-balance max-w-2xl mx-auto">
            Una plataforma educativa diseñada para hacer el aprendizaje más dinámico y efectivo
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/register">Comenzar Gratis</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Ya tengo cuenta</Link>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader>
              <div className="p-3 bg-green-100 rounded-lg w-fit mb-2">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Emprendimiento</CardTitle>
              <CardDescription>
                Analiza casos reales de negocios y aprende a tomar decisiones financieras
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader>
              <div className="p-3 bg-blue-100 rounded-lg w-fit mb-2">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Plano Cartesiano</CardTitle>
              <CardDescription>Explora coordenadas y grafica puntos de forma interactiva</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-purple-200 bg-purple-50/50">
            <CardHeader>
              <div className="p-3 bg-purple-100 rounded-lg w-fit mb-2">
                <Calculator className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Vectores 3D</CardTitle>
              <CardDescription>Realiza operaciones con vectores y visualiza los resultados</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-orange-200 bg-orange-50/50">
            <CardHeader>
              <div className="p-3 bg-orange-100 rounded-lg w-fit mb-2">
                <Calculator className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>Matrices</CardTitle>
              <CardDescription>Resuelve sistemas de ecuaciones con el método de Gauss-Jordan</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card className="max-w-3xl mx-auto bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">¿Listo para comenzar?</CardTitle>
            <CardDescription className="text-indigo-100">
              Crea tu cuenta gratis y accede a todos los módulos educativos
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/register">Registrarse Ahora</Link>
            </Button>
          </CardContent>
        </Card>
      </main>

      <footer className="border-t bg-white/80 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>Plataforma Educativa - Matemáticas y Emprendimiento</p>
        </div>
      </footer>
    </div>
  )
}
