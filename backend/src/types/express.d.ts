import { UsuarioRol } from '@prisma/client';

declare namespace Express {
  export interface Request {
    user?: {
      id: number;
      email: string;
      rol: 'PACIENTE' | 'MEDICO' | 'ADMIN';
    };
  }
}
