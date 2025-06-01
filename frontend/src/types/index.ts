export interface User {
  id: number;
  email: string;
  nombre: string;
  rol: 'PACIENTE' | 'MEDICO' | 'ADMIN';
  verificado: boolean; 
  iat?: number; 
  exp?: number; 
}