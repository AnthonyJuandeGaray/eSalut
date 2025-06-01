import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-200 text-gray-800 px-4">
      <h1 className="text-4xl font-bold mb-2">404 - Página no encontrada</h1>
      <p className="mb-6 text-center">
        La página que estás buscando no existe.
      </p>
      <Link
        to="/"
        className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
