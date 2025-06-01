import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';

interface Payload {
  id: number;
  dni: string;
  rol: 'ADMIN' | 'MEDICO' | 'PACIENTE';
}

export const generarToken = (payload: Payload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' }); // válido por 7 días
};

export const verificarToken = (token: string): Payload => {
  return jwt.verify(token, JWT_SECRET) as Payload;
};
