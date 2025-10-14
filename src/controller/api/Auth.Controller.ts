import { Request, Response } from 'express';
import { AuthService } from '../../services/api/Auth.Service';
import { PersonaService } from '../../services/api/Persona.Service';
import { ResponseHelperClass } from '../../types/api/ResponseHelper';
import { JWTConfig } from '../../config/jwt.config';

const authService = new AuthService();
const personaService = new PersonaService();

export class AuthController {
  // POST /api/login - Autenticar usuario
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return ResponseHelperClass.error(res, 'Email y password son requeridos', 400);
      }

      const resultado = await authService.authenticateUser(email, password);

      return ResponseHelperClass.success(
        res, 
        resultado, 
        'Login exitoso'
      );
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 401);
    }
  }

  // POST /api/register - Registrar nuevo usuario
  async register(req: Request, res: Response) {
    try {
      const {  
        password, 
        email, 
        nombre, 
        apellido_paterno, 
        apellido_materno,
        telefono,
        direccion,
        fecha_nacimiento
      } = req.body;
      
      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return ResponseHelperClass.error(res, 'El formato del email no es válido', 400);
      }

      if (password.length < 6) {
        return ResponseHelperClass.error(res, 'La contraseña debe tener al menos 6 caracteres', 400);
      }

      // Primero crear la persona
      const persona = await personaService.createPersona({
        nombre,
        apellido_paterno: apellido_paterno.split(' ')[0],
        apellido_materno: apellido_paterno.split(' ')[1],
        telefono,
        direccion,
        fecha_nacimiento
      });

      // Luego crear el usuario con el id_persona obtenido
      const resultado = await authService.registerUser({
        username: email,
        password,
        email,
        id_role: 1, // Rol admin por defecto
        id_persona: persona.id
      });

      return ResponseHelperClass.success(
        res, 
        {
          ...resultado,
          persona: persona
        }, 
        'Usuario y persona registrados exitosamente', 
        201
      );
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 400);
    }
  }

  // POST /api/verify-token - Verificar token JWT
  async verifyToken(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        return ResponseHelperClass.error(res, 'Token de autorización requerido', 401);
      }

      const token = JWTConfig.extractTokenFromHeader(authHeader);
      const resultado = await authService.verifyToken(token);

      if (!resultado.valid) {
        return ResponseHelperClass.error(res, resultado.error, 401);
      }

      return ResponseHelperClass.success(
        res,
        {
          valid: true,
          usuario: resultado.usuario,
          tokenInfo: resultado.decoded
        },
        'Token válido'
      );
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 401);
    }
  }
}