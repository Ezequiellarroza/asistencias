import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Building2,
  Clock,
  RefreshCw,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle,
  LogOut,
  MapPinned,
  Calendar
} from 'lucide-react';
import adminService from '../../services/adminService';

function EmpleadosPresentes() {
  const navigate = useNavigate();

  // Estados principales
  const [data, setData] = useState(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(
    new Date().toISOString().split('T')[0]
  );

  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Cargar datos
  const cargarDatos = async (fecha = null) => {
    try {
      setError('');
      
      // Llamar al nuevo endpoint
      const response = await adminService.getEmpleadosPresentes(fecha);
      setData(response);

    } catch (err) {
      console.error('Error al cargar datos:', err);
      if (err.message === 'No autenticado') {
        setError('Tu sesión ha expirado. Redirigiendo al login...');
      } else {
        setError(err.message || 'Error al cargar datos');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Cargar al montar
  useEffect(() => {
    cargarDatos(fechaSeleccionada);
  }, []);

  // Handler de cambio de fecha
  const handleCambioFecha = (e) => {
    const nuevaFecha = e.target.value;
    setFechaSeleccionada(nuevaFecha);
    setLoading(true);
    cargarDatos(nuevaFecha);
  };

  // Handler de refresh
  const handleRefresh = () => {
    setRefreshing(true);
    cargarDatos(fechaSeleccionada);
  };

  // Navegar con transición
  const handleVolver = () => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        navigate('/admin/dashboard');
      });
    } else {
      navigate('/admin/dashboard');
    }
  };

  // Formatear hora
  const formatearHora = (horaCompleta) => {
    if (!horaCompleta) return 'N/A';
    try {
      const fecha = new Date(horaCompleta);
      return fecha.toLocaleTimeString('es-AR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return horaCompleta;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <RefreshCw className="w-12 h-12 text-amber-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando empleados presentes...</p>
        </div>
      </div>
    );
  }

  // Extraer datos
  const resumen = data?.resumen || {};
  const oficinas = data?.oficinas || [];

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handleVolver}
                className="btn-glass p-2"
                aria-label="Volver"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Empleados Presentes
                </h1>
                <p className="text-sm text-gray-600">
                  {resumen.total_presentes_hoy} de {resumen.total_activos} empleados ({resumen.porcentaje_presentes}%)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Selector de fecha */}
              <div className="flex items-center gap-2 bg-white/50 rounded-lg px-3 py-2">
                <Calendar className="w-4 h-4 text-gray-600" />
                <input
                  type="date"
                  value={fechaSeleccionada}
                  onChange={handleCambioFecha}
                  max={new Date().toISOString().split('T')[0]}
                  className="bg-transparent border-none outline-none text-sm text-gray-700"
                />
              </div>

              {/* Botón refresh */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="btn-glass px-4 py-2 flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Actualizar</span>
              </button>
            </div>
          </div>

          {/* Resumen rápido */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-emerald-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
                <div>
                  <p className="text-2xl font-bold text-emerald-700">
                    {resumen.presentes_ahora || 0}
                  </p>
                  <p className="text-sm text-emerald-600">Presentes Ahora</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <LogOut className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-blue-700">
                    {resumen.ya_salieron || 0}
                  </p>
                  <p className="text-sm text-blue-600">Ya Salieron</p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-amber-600" />
                <div>
                  <p className="text-2xl font-bold text-amber-700">
                    {resumen.ausentes || 0}
                  </p>
                  <p className="text-sm text-amber-600">Ausentes</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Building2 className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-purple-700">
                    {data?.oficinas_resumen?.con_presentes || 0}
                  </p>
                  <p className="text-sm text-purple-600">Oficinas con Personal</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="glass-card p-4 mb-6 border-l-4 border-red-500">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Lista por oficinas */}
        {resumen.total_presentes_hoy === 0 ? (
          <div className="glass-card p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No hay empleados presentes
            </h3>
            <p className="text-gray-600">
              Ningún empleado ha marcado entrada el {fechaSeleccionada}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {oficinas.map(oficina => {
              // Solo mostrar oficinas con empleados presentes o que ya salieron
              const totalEmpleados = oficina.empleados?.length || 0;
              if (totalEmpleados === 0) return null;

              return (
                <div key={oficina.id} className="glass-card p-6">
                  {/* Header de oficina */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-amber-200/30">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <Building2 className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-800">
                          {oficina.nombre}
                        </h2>
                        {oficina.direccion && (
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {oficina.direccion}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-2xl font-bold text-emerald-600">
                            {oficina.presentes_ahora}
                          </p>
                          <p className="text-xs text-gray-600">Presentes</p>
                        </div>
                        {oficina.ya_salieron > 0 && (
                          <div>
                            <p className="text-2xl font-bold text-blue-600">
                              {oficina.ya_salieron}
                            </p>
                            <p className="text-xs text-gray-600">Salieron</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Lista de empleados */}
                  <div className="space-y-3">
                    {oficina.empleados.map(empleado => (
                      <div 
                        key={empleado.id} 
                        className={`rounded-lg p-4 transition-colors ${
                          empleado.esta_presente 
                            ? 'bg-emerald-50/50 border border-emerald-200/50' 
                            : 'bg-blue-50/50 border border-blue-200/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-800">
                                {empleado.nombre_completo}
                              </h3>
                              {empleado.esta_presente ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                                  <CheckCircle className="w-3 h-3" />
                                  Presente
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                  <LogOut className="w-3 h-3" />
                                  Ya salió
                                </span>
                              )}
                              {/* Badge de tipo de marcación */}
                              {empleado.entrada?.tipo === 'manual' && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                  Manual
                                </span>
                              )}
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                              {empleado.telefono && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-4 h-4" />
                                  {empleado.telefono}
                                </span>
                              )}
                              {empleado.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="w-4 h-4" />
                                  {empleado.email}
                                </span>
                              )}
                              {/* Info GPS */}
                              {empleado.entrada?.distancia_metros !== null && (
                                <span className={`flex items-center gap-1 ${
                                  empleado.entrada.dentro_rango === false 
                                    ? 'text-amber-600 font-medium' 
                                    : 'text-gray-600'
                                }`}>
                                  <MapPinned className="w-4 h-4" />
                                  {Math.round(empleado.entrada.distancia_metros)}m
                                  {empleado.entrada.dentro_rango === false && ' (fuera de rango)'}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right ml-4">
                            {/* Hora entrada */}
                            <div className="mb-2">
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-lg text-sm font-medium text-gray-700 shadow-sm">
                                <Clock className="w-4 h-4 text-emerald-600" />
                                Entrada: {empleado.entrada?.hora || 'N/A'}
                              </span>
                            </div>
                            
                            {/* Hora salida */}
                            {empleado.salida && (
                              <div>
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-lg text-sm font-medium text-gray-700 shadow-sm">
                                  <LogOut className="w-4 h-4 text-blue-600" />
                                  Salida: {empleado.salida?.hora || 'N/A'}
                                </span>
                              </div>
                            )}
                            
                            {/* Tiempo trabajado */}
                            {empleado.tiempo_trabajado && (
                              <div className="mt-2 text-xs text-gray-500">
                                Trabajado: {empleado.tiempo_trabajado.formato_corto}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default EmpleadosPresentes;