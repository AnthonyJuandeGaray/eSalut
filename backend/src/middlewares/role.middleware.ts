import { Request, Response, NextFunction } from 'express';

export const requireRole = (rolPermitido: 'PACIENTE' | 'MEDICO' | 'ADMIN') => {
  return (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const rol = req.user?.rol;

    if (!rol || rol !== rolPermitido) {
      return res.status(403).json({ error: 'Acceso denegado: rol no autorizado' });
    }

    next();
  };
};
