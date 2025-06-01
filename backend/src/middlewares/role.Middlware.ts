import { Request, Response, NextFunction } from 'express';

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.rol !== 'ADMIN') {
    return res.status(403).json({ error: 'Acceso denegado: solo administradores' });
  }
  next();
};

export const requireMedico = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.rol !== 'MEDICO') {
    return res.status(403).json({ error: 'Acceso denegado: solo médicos' });
  }
  next();
};

export const requirePaciente = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.rol !== 'PACIENTE') {
    return res.status(403).json({ error: 'Acceso denegado: solo pacientes' });
  }
  next();
};
