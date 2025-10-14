import { Request, Response, NextFunction } from 'express';
import { JWTConfig } from '../config/jwt.config';
import { ResponseHelperClass } from '../types/api/ResponseHelper';
import { AuthService } from '../services/api/Auth.Service';

const authService = new AuthService();

// Extender la interfaz Request para incluir el usuario
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export class AuthMiddleware {
  // Middleware para verificar token JWT
  static async verifyToken(req: Request, res: Response, next: NextFunction) {
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

      // Agregar información del usuario a la request
      req.user = resultado.usuario;
      
      next();
    } catch (error: any) {
      return ResponseHelperClass.error(res, `Error de autenticación: ${error.message}`, 401);
    }
  }

  // Middleware para verificar roles específicos
  static requireRole(allowedRoles: number[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return ResponseHelperClass.error(res, 'Usuario no autenticado', 401);
      }

      if (!allowedRoles.includes(req.user.id_role)) {
        return ResponseHelperClass.error(res, 'No tienes permisos para acceder a este recurso', 403);
      }

      next();
    };
  }

  // Middleware opcional - no falla si no hay token
  static async optionalAuth(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;

      if (authHeader) {
        const token = JWTConfig.extractTokenFromHeader(authHeader);
        const resultado = await authService.verifyToken(token);

        if (resultado.valid) {
          req.user = resultado.usuario;
        }
      }

      next();
    } catch (error) {
      // En auth opcional, continuamos aunque haya error
      next();
    }
  }
}