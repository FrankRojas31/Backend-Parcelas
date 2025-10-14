import jwt from 'jsonwebtoken';

export class JWTConfig {
  private static readonly SECRET_KEY = process.env.JWT_SECRET || 'parcela-backend-secret-key-2024';
  private static readonly EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

  // Generar token JWT
  static generateToken(payload: object): string {
    return jwt.sign(payload as string | object | Buffer, this.SECRET_KEY, { 
      expiresIn: this.EXPIRES_IN 
    } as jwt.SignOptions);
  }

  // Verificar token JWT
  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.SECRET_KEY);
    } catch (error) {
      throw new Error('Token inválido o expirado');
    }
  }

  // Decodificar token sin verificar (para obtener información)
  static decodeToken(token: string): any {
    return jwt.decode(token);
  }

  // Extraer token del header Authorization
  static extractTokenFromHeader(authHeader: string | undefined): string {
    if (!authHeader) {
      throw new Error('Header de autorización no proporcionado');
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new Error('Formato de token inválido. Debe ser: Bearer <token>');
    }

    return authHeader.substring(7); // Remover "Bearer "
  }
}