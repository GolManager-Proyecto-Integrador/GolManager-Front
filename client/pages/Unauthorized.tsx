export default function Unauthorized() {
  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold text-red-600">403 - Acceso denegado</h1>
      <p className="text-gray-600">No tienes permiso para ver esta página.</p>
    </div>
  );
}