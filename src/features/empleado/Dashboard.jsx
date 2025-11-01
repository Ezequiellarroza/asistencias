import { useAuth } from '../../context/AuthContext';
import { LogOut, Clock, Calendar } from 'lucide-react';

function EmpleadoDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="glass-card p-6 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Dashboard Empleado
            </h1>
            <p className="text-sm text-gray-600">
              Teléfono: {user?.telefono}
            </p>
          </div>
          <button
            onClick={logout}
            className="btn-glass px-4 py-2 flex items-center gap-2 text-red-600"
          >
            <LogOut className="w-4 h-4" />
            Salir
          </button>
        </div>

        {/* Botones de marcación */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button className="glass-card p-8 hover:scale-105 transition-transform duration-200">
            <Clock className="w-12 h-12 mx-auto mb-4 text-emerald-600" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Marcar Entrada
            </h3>
            <p className="text-sm text-gray-600">
              Registrar ingreso
            </p>
          </button>

          <button className="glass-card p-8 hover:scale-105 transition-transform duration-200">
            <Clock className="w-12 h-12 mx-auto mb-4 text-amber-600" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Marcar Salida
            </h3>
            <p className="text-sm text-gray-600">
              Registrar egreso
            </p>
          </button>
        </div>

        {/* Historial */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-bold text-gray-800">
              Mi Historial
            </h2>
          </div>
          <p className="text-gray-600 text-center py-8">
            No hay registros recientes
          </p>
        </div>
      </div>
    </div>
  );
}

export default EmpleadoDashboard;