/**
 * UTILIDAD: Seed Data
 * RESPONSABILIDAD ÚNICA: Inicializar datos de prueba en el sistema
 * RAZÓN PARA CAMBIAR: Solo si cambian los datos de prueba iniciales
 */
import { AuthService, type DatosRegistro } from "@/src/servicios/AuthService"
import { UsuarioRepository } from "@/src/persistencia/UsuarioRepository"

export class DataSeeder {
  private authService: AuthService
  private usuarioRepository: UsuarioRepository

  constructor() {
    this.authService = new AuthService()
    this.usuarioRepository = new UsuarioRepository()
  }

  // Verificar si ya existen datos
  private existenDatos(): boolean {
    return this.usuarioRepository.obtenerPorEmail("estudiante@empanadas.com") !== null
  }

  // Crear usuario de prueba
  seedUsuarioPrueba(): void {
    // Solo crear si no existe
    if (this.existenDatos()) {
      console.log("[v0] Usuario de prueba ya existe")
      return
    }

    const datosRegistro: DatosRegistro = {
      nombre: "María",
      apellidos: "González Pérez",
      email: "estudiante@empanadas.com",
      password: "123456",
      semestre: 3,
    }

    try {
      // Validar datos
      const validacion = this.authService.validarDatosRegistro(datosRegistro)
      if (!validacion.valido) {
        console.error("[v0] Error validando datos de prueba:", validacion.errores)
        return
      }

      // Crear usuario
      const usuario = this.authService.crearUsuario(datosRegistro)
      const passwordHash = this.authService.hashPassword(datosRegistro.password)

      // Guardar en repositorio
      this.usuarioRepository.guardarUsuario(usuario, passwordHash)

      console.log("[v0] ✅ Usuario de prueba creado exitosamente")
      console.log("[v0] Email: estudiante@empanadas.com")
      console.log("[v0] Password: 123456")
    } catch (error) {
      console.error("[v0] Error creando usuario de prueba:", error)
    }
  }
}

// Función helper para inicializar datos
export function initializeSeedData(): void {
  if (typeof window !== "undefined") {
    const seeder = new DataSeeder()
    seeder.seedUsuarioPrueba()
  }
}
