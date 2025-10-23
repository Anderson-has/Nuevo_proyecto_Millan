/**
 * SERVICIO: AuthService
 * RESPONSABILIDAD ÚNICA: Gestionar la lógica de autenticación
 * RAZÓN PARA CAMBIAR: Solo si cambian las reglas de autenticación
 */
import { Usuario } from "../entidades/Usuario"

export interface CredencialesLogin {
  email: string
  password: string
}

export interface DatosRegistro {
  nombre: string
  apellidos: string
  email: string
  password: string
  semestre: number
}

export class AuthService {
  // Validar formato de email
  validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  // Validar fortaleza de contraseña
  validarPassword(password: string): { valido: boolean; mensaje?: string } {
    if (password.length < 6) {
      return {
        valido: false,
        mensaje: "La contraseña debe tener al menos 6 caracteres",
      }
    }
    return { valido: true }
  }

  // Validar datos de registro
  validarDatosRegistro(datos: DatosRegistro): {
    valido: boolean
    errores: string[]
  } {
    const errores: string[] = []

    if (!datos.nombre || datos.nombre.trim().length === 0) {
      errores.push("El nombre es requerido")
    }

    if (!datos.apellidos || datos.apellidos.trim().length === 0) {
      errores.push("Los apellidos son requeridos")
    }

    if (!this.validarEmail(datos.email)) {
      errores.push("El email no es válido")
    }

    const validacionPassword = this.validarPassword(datos.password)
    if (!validacionPassword.valido) {
      errores.push(validacionPassword.mensaje!)
    }

    if (datos.semestre < 1 || datos.semestre > 10) {
      errores.push("El semestre debe estar entre 1 y 10")
    }

    return {
      valido: errores.length === 0,
      errores,
    }
  }

  // Hash simple de password (en producción usar bcrypt)
  hashPassword(password: string): string {
    // Implementación simple para demostración
    // En producción, usar una librería como bcrypt
    return btoa(password)
  }

  // Verificar password
  verificarPassword(password: string, hash: string): boolean {
    return this.hashPassword(password) === hash
  }

  // Crear usuario desde datos de registro
  crearUsuario(datos: DatosRegistro): Usuario {
    const id = this.generarId()
    return new Usuario(id, datos.nombre, datos.apellidos, datos.email, datos.semestre, new Date())
  }

  // Generar ID único
  private generarId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}
