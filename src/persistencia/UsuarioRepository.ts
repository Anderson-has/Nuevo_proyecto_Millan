/**
 * PERSISTENCIA: UsuarioRepository
 * RESPONSABILIDAD ÚNICA: Gestionar la persistencia de usuarios
 * RAZÓN PARA CAMBIAR: Solo si cambia cómo se almacenan los usuarios
 */
import { Usuario } from "../entidades/Usuario"
import { LocalStorageRepository } from "./LocalStorageRepository"

interface UsuarioAlmacenado {
  usuario: ReturnType<Usuario["toJSON"]>
  passwordHash: string
}

export class UsuarioRepository {
  private storage: LocalStorageRepository
  private readonly CLAVE_USUARIOS = "empanadas_usuarios"
  private readonly CLAVE_SESION = "empanadas_sesion_actual"

  constructor() {
    this.storage = new LocalStorageRepository()
  }

  // Guardar nuevo usuario
  guardarUsuario(usuario: Usuario, passwordHash: string): void {
    const usuarios = this.obtenerTodosLosUsuarios()

    // Verificar si el email ya existe
    if (usuarios.some((u) => u.usuario.email === usuario.email)) {
      throw new Error("El email ya está registrado")
    }

    usuarios.push({
      usuario: usuario.toJSON(),
      passwordHash,
    })

    this.storage.guardar(this.CLAVE_USUARIOS, usuarios)
  }

  // Obtener usuario por email
  obtenerPorEmail(email: string): UsuarioAlmacenado | null {
    const usuarios = this.obtenerTodosLosUsuarios()
    return usuarios.find((u) => u.usuario.email === email) || null
  }

  // Obtener usuario por ID
  obtenerPorId(id: string): Usuario | null {
    const usuarios = this.obtenerTodosLosUsuarios()
    const usuarioAlmacenado = usuarios.find((u) => u.usuario.id === id)

    if (!usuarioAlmacenado) return null

    return Usuario.fromJSON(usuarioAlmacenado.usuario)
  }

  // Obtener todos los usuarios
  private obtenerTodosLosUsuarios(): UsuarioAlmacenado[] {
    return this.storage.obtener<UsuarioAlmacenado[]>(this.CLAVE_USUARIOS) || []
  }

  // Guardar sesión actual
  guardarSesion(usuarioId: string): void {
    this.storage.guardar(this.CLAVE_SESION, { usuarioId, fecha: new Date() })
  }

  // Obtener sesión actual
  obtenerSesion(): string | null {
    const sesion = this.storage.obtener<{ usuarioId: string }>(this.CLAVE_SESION)
    return sesion?.usuarioId || null
  }

  // Cerrar sesión
  cerrarSesion(): void {
    this.storage.eliminar(this.CLAVE_SESION)
  }

  // Verificar si hay sesión activa
  haySesionActiva(): boolean {
    return this.storage.existe(this.CLAVE_SESION)
  }
}
