import { Request, Response, NextFunction } from 'express';
import { verificarToken } from '../utils/jwt';

// Declara el tipo de payload del token
interface JwtPayload {
  id: number;
  dni: string;
  rol: 'ADMIN' | 'MEDICO' | 'PACIENTE';
}

// Extiende el tipo de Express.Request para incluir `user`
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No autorizado' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verificarToken(token); // ✅ decodifica
    req.user = decoded; // ✅ ya tipado
    next();
  } catch (error) {
    res.status(403).json({ error: 'Token inválido o expirado' });
  }
};
