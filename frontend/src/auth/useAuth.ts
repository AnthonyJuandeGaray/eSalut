import { useAuthContext } from './AuthContext';

export const useAuth = () => {
  const { user, login, logout } = useAuthContext();

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole') as 'ADMIN' | 'MEDICO' | 'PACIENTE' | null;

  const isAuthenticated = !!token;

  return {
    user,
    login,
    logout,
    token,
    role,
    isAuthenticated
  };
};