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
    return this.usuarioRepository.obtenerPorEmail("estudiante@empanadas.com") !== null &&
           this.usuarioRepository.obtenerPorEmail("docente@empanadas.com") !== null
  }

  // Crear usuarios de prueba
  seedUsuariosPrueba(): void {
    // Solo crear si no existen
    if (this.existenDatos()) {
      console.log("[v0] Usuarios de prueba ya existen")
      return
    }

    // Crear usuario estudiante
    this.crearUsuarioEstudiante()
    
    // Crear usuario docente
    this.crearUsuarioDocente()
  }

  private crearUsuarioEstudiante(): void {
    const datosRegistro: DatosRegistro = {
      nombre: "María",
      apellidos: "González Pérez",
      email: "estudiante@empanadas.com",
      password: "123456",
      semestre: 3,
      rol: "estudiante"
    }

    try {
      // Validar datos
      const validacion = this.authService.validarDatosRegistro(datosRegistro)
      if (!validacion.valido) {
        console.error("[v0] Error validando datos de estudiante:", validacion.errores)
        return
      }

      // Crear usuario
      const usuario = this.authService.crearUsuario(datosRegistro)
      const passwordHash = this.authService.hashPassword(datosRegistro.password)

      // Guardar en repositorio
      this.usuarioRepository.guardarUsuario(usuario, passwordHash)

      console.log("[v0] ✅ Usuario estudiante de prueba creado exitosamente")
      console.log("[v0] Email: estudiante@empanadas.com")
      console.log("[v0] Password: 123456")
    } catch (error) {
      console.error("[v0] Error creando usuario estudiante de prueba:", error)
    }
  }

  private crearUsuarioDocente(): void {
    const datosRegistro: DatosRegistro = {
      nombre: "Profesor",
      apellidos: "García López",
      email: "docente@empanadas.com",
      password: "123456",
      semestre: 1, // Los docentes no necesitan semestre, pero es requerido
      rol: "docente"
    }

    try {
      // Validar datos
      const validacion = this.authService.validarDatosRegistro(datosRegistro)
      if (!validacion.valido) {
        console.error("[v0] Error validando datos de docente:", validacion.errores)
        return
      }

      // Crear usuario
      const usuario = this.authService.crearUsuario(datosRegistro)
      const passwordHash = this.authService.hashPassword(datosRegistro.password)

      // Guardar en repositorio
      this.usuarioRepository.guardarUsuario(usuario, passwordHash)

      console.log("[v0] ✅ Usuario docente de prueba creado exitosamente")
      console.log("[v0] Email: docente@empanadas.com")
      console.log("[v0] Password: 123456")
    } catch (error) {
      console.error("[v0] Error creando usuario docente de prueba:", error)
    }
  }
}

// Función helper para inicializar datos
export function initializeSeedData(): void {
  if (typeof window !== "undefined") {
    const seeder = new DataSeeder()
    seeder.seedUsuariosPrueba()
  }
}
