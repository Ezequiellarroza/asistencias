import { useAuth } from '../../context/AuthContext';
import { LogOut, Users, FileText, MapPin, Settings, Clock } from 'lucide-react';

function AdminDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="glass-card p-6 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Panel de Administración
            </h1>
            <p className="text-sm text-gray-600">
              Usuario: {user?.usuario}
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

        {/* Cards de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="glass-card p-6">
            <Users className="w-8 h-8 text-emerald-600 mb-2" />
            <h3 className="text-2xl font-bold text-gray-800">24</h3>
            <p className="text-sm text-gray-600">Empleados Activos</p>
          </div>

          <div className="glass-card p-6">
            <Clock className="w-8 h-8 text-amber-600 mb-2" />
            <h3 className="text-2xl font-bold text-gray-800">18</h3>
            <p className="text-sm text-gray-600">Presentes Hoy</p>
          </div>

          <div className="glass-card p-6">
            <MapPin className="w-8 h-8 text-blue-600 mb-2" />
            <h3 className="text-2xl font-bold text-gray-800">3</h3>
            <p className="text-sm text-gray-600">Oficinas</p>
          </div>

          <div className="glass-card p-6">
            <FileText className="w-8 h-8 text-purple-600 mb-2" />
            <h3 className="text-2xl font-bold text-gray-800">142</h3>
            <p className="text-sm text-gray-600">Marcaciones Hoy</p>
          </div>
        </div>

        {/* Menú de acciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button className="glass-card p-8 hover:scale-105 transition-transform duration-200 text-left">
            <Users className="w-10 h-10 text-emerald-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Gestión de Empleados
            </h3>
            <p className="text-sm text-gray-600">
              Administrar empleados y horarios
            </p>
          </button>

          <button className="glass-card p-8 hover:scale-105 transition-transform duration-200 text-left">
            <FileText className="w-10 h-10 text-amber-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Reportes
            </h3>
            <p className="text-sm text-gray-600">
              Ver reportes y estadísticas
            </p>
          </button>

          <button className="glass-card p-8 hover:scale-105 transition-transform duration-200 text-left">
            <MapPin className="w-10 h-10 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Oficinas
            </h3>
            <p className="text-sm text-gray-600">
              Configurar ubicaciones
            </p>
          </button>

          <button className="glass-card p-8 hover:scale-105 transition-transform duration-200 text-left">
            <Clock className="w-10 h-10 text-purple-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Marcación Manual
            </h3>
            <p className="text-sm text-gray-600">
              Registrar asistencias manualmente
            </p>
          </button>

          <button className="glass-card p-8 hover:scale-105 transition-transform duration-200 text-left">
            <Settings className="w-10 h-10 text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Configuración
            </h3>
            <p className="text-sm text-gray-600">
              Ajustes del sistema
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;