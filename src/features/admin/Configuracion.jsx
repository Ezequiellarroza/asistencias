import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Settings,
  Users,
  Calendar,
  ChevronRight
} from 'lucide-react';

function Configuracion() {
  const navigate = useNavigate();

  const handleNavigateWithTransition = (path) => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        navigate(path);
      });
    } else {
      navigate(path);
    }
  };

  const handleVolver = () => {
    handleNavigateWithTransition('/admin/dashboard');
  };

  const modulos = [
    {
      id: 'usuarios-admin',
      titulo: 'Usuarios Administradores',
      descripcion: 'Gestionar cuentas de administradores del sistema',
      icono: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      ruta: '/admin/usuarios-admin'
    },
    {
      id: 'feriados',
      titulo: 'Feriados',
      descripcion: 'Configurar días feriados del calendario laboral',
      icono: Calendar,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
      ruta: '/admin/feriados'
    }
  ];

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleVolver}
              className="btn-glass p-2"
              aria-label="Volver"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Configuración
                </h1>
                <p className="text-sm text-gray-600">
                  Ajustes generales del sistema
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de módulos */}
        <div className="space-y-4">
          {modulos.map((modulo) => {
            const IconoModulo = modulo.icono;
            
            return (
              <button
                key={modulo.id}
                onClick={() => handleNavigateWithTransition(modulo.ruta)}
                className="glass-card p-6 w-full text-left hover:scale-[1.02] transition-transform duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${modulo.bgColor} rounded-xl flex items-center justify-center`}>
                      <IconoModulo className={`w-6 h-6 ${modulo.color}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {modulo.titulo}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {modulo.descripcion}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}

export default Configuracion;