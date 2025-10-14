import bcrypt from 'bcrypt';
import { UsuariosService } from './Usuarios.Service';
import { JWTConfig } from '../../config/jwt.config';

const usuariosService = new UsuariosService();

export class AuthService {
  // Autenticar usuario y generar token
  async authenticateUser(username: string, password: string) {
    try {
      const usuario = await usuariosService.validateCredentials(username, password);
      
      // Remover información sensible antes de devolver
      const { password_hash, ...usuarioSeguro } = usuario;
      
      // Generar token JWT
      const token = JWTConfig.generateToken({
        id: usuario.id,
        username: usuario.username,
        email: usuario.email,
        id_role: usuario.id_role,
        id_persona: usuario.id_persona
      });
      
      return {
        usuario: usuarioSeguro,
        token
      };
    } catch (error) {
      throw new Error(`Error de autenticación: ${error}`);
    }
  }

  // Registrar usuario y generar token
  async registerUser(data: {
    username: string;
    password: string;
    email: string;
    id_role: number;
    id_persona: number;
  }) {
    try {
      const usuario = await usuariosService.createUsuario(data);
      
      // Remover información sensible antes de devolver
      const { password_hash, ...usuarioSeguro } = usuario;
      
      // Generar token JWT
      const token = JWTConfig.generateToken({
        id: usuario.id,
        username: usuario.username,
        email: usuario.email,
        id_role: usuario.id_role,
        id_persona: usuario.id_persona
      });
      
      return {
        usuario: usuarioSeguro,
        token
      };
    } catch (error) {
      throw new Error(`Error al registrar usuario: ${error}`);
    }
  }

  // Verificar token JWT
  async verifyToken(token: string) {
    try {
      const decoded = JWTConfig.verifyToken(token);
      
      // Verificar que el usuario aún existe y no está borrado
      const usuario = await usuariosService.getUsuarioById(decoded.id);
      
      // Remover información sensible
      const { password_hash, ...usuarioSeguro } = usuario;
      
      return {
        valid: true,
        usuario: usuarioSeguro,
        decoded
      };
    } catch (error) {
      return {
        valid: false,
        error: `Token inválido: ${error}`
      };
    }
  }

  // Validar fortaleza de contraseña
  static validatePasswordStrength(password: string): { isValid: boolean; message: string } {
    if (password.length < 6) {
      return { isValid: false, message: 'La contraseña debe tener al menos 6 caracteres' };
    }

    if (!/[A-Z]/.test(password)) {
      return { isValid: false, message: 'La contraseña debe contener al menos una letra mayúscula' };
    }

    if (!/[a-z]/.test(password)) {
      return { isValid: false, message: 'La contraseña debe contener al menos una letra minúscula' };
    }

    if (!/\d/.test(password)) {
      return { isValid: false, message: 'La contraseña debe contener al menos un número' };
    }

    return { isValid: true, message: 'Contraseña válida' };
  }

  // Hash de contraseña
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  // Comparar contraseña
  static async comparePasswords(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}