import api from '../api/axios';

interface Credentials {
  dni: string;
  password: string;
}

interface RegisterData {
  dni: string;
  nombre: string;
  email: string;
  password: string;
  fechaNacimiento: string; // Formato ISO (ej. new Date().toISOString())
  sexo: 'HOMBRE' | 'MUJER' | 'OTRO';
  telefono: string;
  direccion?: string;
}

interface RegisterResponse {
  mensaje: string;
  usuario: {
    id: number;
    nombre: string;
    dni: string;
    email: string;
    rol: 'ADMIN' | 'MEDICO' | 'PACIENTE';
  };
}

interface LoginResponse {
  token: string;
  usuario: {
    id: number;
    nombre: string;
    dni: string;
    email: string;
    rol: 'ADMIN' | 'MEDICO' | 'PACIENTE';
  };
}

export const loginUser = async (credentials: Credentials): Promise<LoginResponse> => {
  const res = await api.post<LoginResponse>('/auth/login', credentials);
  return res.data;
};

export const registerUser = async (data: RegisterData): Promise<RegisterResponse> => {
  const res = await api.post<RegisterResponse>('/auth/register', data);
  return res.data;
};
