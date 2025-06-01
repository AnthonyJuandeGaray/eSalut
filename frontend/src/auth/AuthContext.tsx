import React, {
  createContext,
  useContext,
  useState,
  useEffect
} from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (token: string, usuario: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    console.log("AuthContext useEffect: token recuperado:", token);
    console.log("AuthContext useEffect: storedUser recuperado (string):", storedUser);

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        console.log("AuthContext useEffect: Usuario parseado de localStorage:", parsedUser);
        console.log("AuthContext useEffect: parsedUser.verificado ES:", parsedUser.verificado, "DE TIPO:", typeof parsedUser.verificado);
        setUser(parsedUser);
      } catch (err) {
        console.error('Error leyendo el usuario almacenado', err);
        localStorage.removeItem('user');
        setUser(null);
      }
    }
  }, []);

  const login = (token: string, usuario: User) => {
    console.log("AuthContext login: Datos de 'usuario' recibidos:", usuario);
    console.log("AuthContext login: usuario.verificado ES:", usuario.verificado, "DE TIPO:", typeof usuario.verificado);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(usuario));
    setUser(usuario);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used within AuthProvider');
  return context;
};