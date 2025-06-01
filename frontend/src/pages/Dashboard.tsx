import { useAuth } from '../auth/useAuth';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-100 text-gray-800 px-4">
      <h1 className="text-3xl font-bold mb-4">Bienvenido, {user?.nombre} 👋</h1>
      <p className="mb-6">Tu rol: <strong>{user?.rol}</strong></p>
      <button
        onClick={logout}
        className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition"
      >
        Cerrar sesión
      </button>
    </div>
  );
}
