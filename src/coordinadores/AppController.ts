/**
 * COORDINADOR: AppController
 * RESPONSABILIDAD ÚNICA: Coordinar el flujo general de la aplicación
 * RAZÓN PARA CAMBIAR: Solo si cambia el flujo de navegación principal
 */
import { Usuario } from "../entidades/Usuario"
import type { Progreso } from "../entidades/Progreso"
import { AuthService, type CredencialesLogin, type DatosRegistro } from "../servicios/AuthService"
import { UsuarioRepository } from "../persistencia/UsuarioRepository"
import { ProgresoRepository } from "../persistencia/ProgresoRepository"

export type EstadoApp = "login" | "registro" | "dashboard" | "modulo"

export interface ResultadoAuth {
  exito: boolean
  mensaje?: string
  usuario?: Usuario
}

export class AppController {
  private authService: AuthService
  private usuarioRepo: UsuarioRepository
  private progresoRepo: ProgresoRepository
  private usuarioActual: Usuario | null = null
  private progresoActual: Progreso | null = null

  constructor() {
    this.authService = new AuthService()
    this.usuarioRepo = new UsuarioRepository()
    this.progresoRepo = new ProgresoRepository()
    this.cargarSesion()
  }

  // Cargar sesión existente
  private cargarSesion(): void {
    const usuarioId = this.usuarioRepo.obtenerSesion()
    if (usuarioId) {
      this.usuarioActual = this.usuarioRepo.obtenerPorId(usuarioId)
      if (this.usuarioActual) {
        this.progresoActual = this.progresoRepo.obtenerProgreso(usuarioId)
        if (!this.progresoActual) {
          this.progresoActual = this.progresoRepo.crearProgresoInicial(usuarioId)
        }
      }
    }
  }

  // Iniciar sesión
  async login(credenciales: CredencialesLogin): Promise<ResultadoAuth> {
    // Validar email
    if (!this.authService.validarEmail(credenciales.email)) {
      return {
        exito: false,
        mensaje: "El email no es válido",
      }
    }

    // Buscar usuario
    const usuarioAlmacenado = this.usuarioRepo.obtenerPorEmail(credenciales.email)
    if (!usuarioAlmacenado) {
      return {
        exito: false,
        mensaje: "Usuario no encontrado",
      }
    }

    // Verificar contraseña
    const passwordValida = this.authService.verificarPassword(credenciales.password, usuarioAlmacenado.passwordHash)

    if (!passwordValida) {
      return {
        exito: false,
        mensaje: "Contraseña incorrecta",
      }
    }

    // Crear sesión
    const usuario = Usuario.fromJSON(usuarioAlmacenado.usuario)
    this.usuarioActual = usuario
    this.usuarioRepo.guardarSesion(usuario.id)

    // Cargar progreso
    this.progresoActual = this.progresoRepo.obtenerProgreso(usuario.id)
    if (!this.progresoActual) {
      this.progresoActual = this.progresoRepo.crearProgresoInicial(usuario.id)
    }

    return {
      exito: true,
      usuario,
    }
  }

  // Registrar nuevo usuario
  async registrar(datos: DatosRegistro): Promise<ResultadoAuth> {
    // Validar datos
    const validacion = this.authService.validarDatosRegistro(datos)
    if (!validacion.valido) {
      return {
        exito: false,
        mensaje: validacion.errores.join(", "),
      }
    }

    try {
      // Crear usuario
      const usuario = this.authService.crearUsuario(datos)
      const passwordHash = this.authService.hashPassword(datos.password)

      // Guardar usuario
      this.usuarioRepo.guardarUsuario(usuario, passwordHash)

      // Crear progreso inicial
      this.progresoRepo.crearProgresoInicial(usuario.id)

      // Iniciar sesión automáticamente
      this.usuarioActual = usuario
      this.usuarioRepo.guardarSesion(usuario.id)
      this.progresoActual = this.progresoRepo.obtenerProgreso(usuario.id)

      return {
        exito: true,
        usuario,
      }
    } catch (error) {
      return {
        exito: false,
        mensaje: error instanceof Error ? error.message : "Error al registrar",
      }
    }
  }

  // Cerrar sesión
  logout(): void {
    this.usuarioRepo.cerrarSesion()
    this.usuarioActual = null
    this.progresoActual = null
  }

  // Obtener usuario actual
  obtenerUsuarioActual(): Usuario | null {
    return this.usuarioActual
  }

  // Obtener progreso actual
  obtenerProgresoActual(): Progreso | null {
    return this.progresoActual
  }

  // Verificar si hay sesión activa
  haySesionActiva(): boolean {
    return this.usuarioActual !== null
  }

  // Guardar progreso
  guardarProgreso(progreso: Progreso): void {
    this.progresoRepo.guardarProgreso(progreso)
    this.progresoActual = progreso
  }

  // Obtener todos los estudiantes (solo para docentes)
  obtenerTodosLosEstudiantes(): Usuario[] {
    if (this.usuarioActual?.rol !== 'docente') {
      throw new Error("Solo los docentes pueden acceder a esta funcionalidad")
    }
    
    // En una implementación real, esto consultaría la base de datos
    // Por ahora, retornamos una lista vacía
    return []
  }

  // Eliminar estudiante (solo para docentes)
  eliminarEstudiante(estudianteId: string): boolean {
    if (this.usuarioActual?.rol !== 'docente') {
      throw new Error("Solo los docentes pueden eliminar estudiantes")
    }
    
    // En una implementación real, esto eliminaría el usuario de la base de datos
    // Por ahora, retornamos true
    return true
  }

  // Obtener progreso de un estudiante específico (solo para docentes)
  obtenerProgresoEstudiante(estudianteId: string): Progreso | null {
    if (this.usuarioActual?.rol !== 'docente') {
      throw new Error("Solo los docentes pueden ver el progreso de estudiantes")
    }
    
    return this.progresoRepo.obtenerProgreso(estudianteId)
  }
}
