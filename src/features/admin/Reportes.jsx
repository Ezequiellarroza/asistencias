import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Search,
  RefreshCw,
  Filter,
  X,
  Briefcase,
  Building2,
  Phone,
  Mail,
  FileText,
  ChevronRight
} from 'lucide-react';
import adminService from '../../services/adminService';
import Pagination from '../../components/ui/Pagination';

function Reportes() {
  const navigate = useNavigate();

  // Estados principales
  const [empleados, setEmpleados] = useState([]);
  const [pagination, setPagination] = useState({});
  const [oficinas, setOficinas] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);

  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Estados de filtros
  const [filtros, setFiltros] = useState({
    activo: 1, // Solo activos por defecto
    oficina_id: '',
    departamento_id: '',
    busqueda: '',
    page: 1,
    limit: 20
  });

  // Cargar empleados
  const cargarEmpleados = async () => {
    try {
      setError('');
      const data = await adminService.getEmpleados(filtros);
      setEmpleados(data.empleados || []);
      setPagination(data.pagination || {});
    } catch (err) {
      console.error('Error al cargar empleados:', err);
      if (err.message === 'No autenticado') {
        setError('Tu sesión ha expirado. Redirigiendo al login...');
      } else {
        setError(err.message || 'Error al cargar empleados');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Cargar oficinas para el select
  const cargarOficinas = async () => {
    try {
      const data = await adminService.getOficinas(false);
      setOficinas(data.oficinas || []);
    } catch (err) {
      console.error('Error al cargar oficinas:', err);
    }
  };

  // Cargar departamentos para el select
  const cargarDepartamentos = async () => {
    try {
      const data = await adminService.getDepartamentos(false);
      setDepartamentos(data.departamentos || []);
    } catch (err) {
      console.error('Error al cargar departamentos:', err);
    }
  };

  // Cargar al montar
  useEffect(() => {
    cargarEmpleados();
    cargarOficinas();
    cargarDepartamentos();
  }, []);

  // Recargar cuando cambien los filtros
  useEffect(() => {
    if (!loading) {
      cargarEmpleados();
    }
  }, [filtros]);

  // Handlers de filtros
  const handleFiltroChange = (key, value) => {
    setFiltros(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Resetear a página 1 cuando cambian filtros
    }));
  };

  const handleLimpiarFiltros = () => {
    setFiltros({
      activo: 1,
      oficina_id: '',
      departamento_id: '',
      busqueda: '',
      page: 1,
      limit: 20
    });
  };

  const handleRefresh = () => {
    setRefreshing(true);
    cargarEmpleados();
  };

  // Handlers de paginación
  const handlePageChange = (newPage) => {
    setFiltros(prev => ({ ...prev, page: newPage }));
  };

  const handleItemsPerPageChange = (newLimit) => {
    setFiltros(prev => ({ ...prev, limit: newLimit, page: 1 }));
  };

  // Navegar a reporte individual
  const handleVerReporte = (empleadoId) => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        navigate(`/admin/reportes/${empleadoId}`);
      });
    } else {
      navigate(`/admin/reportes/${empleadoId}`);
    }
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <RefreshCw className="w-12 h-12 text-amber-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando empleados...</p>
        </div>
      </div>
    );
  }

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
                  Reportes de Asistencia
                </h1>
                <p className="text-sm text-gray-600">
                  Selecciona un empleado para ver su reporte detallado
                </p>
              </div>
            </div>
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

        {/* Filtros */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="font-semibold text-gray-800">Filtros</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Búsqueda */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filtros.busqueda}
                  onChange={(e) => handleFiltroChange('busqueda', e.target.value)}
                  placeholder="Nombre, apellido o teléfono..."
                  className="input-glass pl-10 w-full"
                />
              </div>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={filtros.activo}
                onChange={(e) => handleFiltroChange('activo', e.target.value)}
                className="input-glass w-full"
              >
                <option value="">Todos</option>
                <option value="1">Activos</option>
                <option value="0">Inactivos</option>
              </select>
            </div>

            {/* Oficina */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Oficina
              </label>
              <select
                value={filtros.oficina_id}
                onChange={(e) => handleFiltroChange('oficina_id', e.target.value)}
                className="input-glass w-full"
              >
                <option value="">Todas</option>
                {oficinas.map(ofi => (
                  <option key={ofi.id} value={ofi.id}>
                    {ofi.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Departamento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Departamento
              </label>
              <select
                value={filtros.departamento_id}
                onChange={(e) => handleFiltroChange('departamento_id', e.target.value)}
                className="input-glass w-full"
              >
                <option value="">Todos</option>
                {departamentos.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Botón limpiar filtros */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleLimpiarFiltros}
              className="btn-glass px-4 py-2 text-sm flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Limpiar Filtros
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="glass-card p-4 mb-6 border-l-4 border-red-500">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Lista de empleados */}
        {empleados.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No hay empleados
            </h3>
            <p className="text-gray-600">
              No se encontraron empleados con los filtros aplicados
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 mb-6">
              {empleados.map(empleado => (
                <div
                  key={empleado.id}
                  className="glass-card p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleVerReporte(empleado.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-800">
                          {empleado.nombre_completo}
                        </h3>
                        {!empleado.activo && (
                          <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-full">
                            Inactivo
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4" />
                          {empleado.telefono}
                        </div>
                        {empleado.email && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail className="w-4 h-4" />
                            {empleado.email}
                          </div>
                        )}
                        {empleado.oficina_nombre && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Building2 className="w-4 h-4" />
                            {empleado.oficina_nombre}
                          </div>
                        )}
                        {empleado.departamento_nombre && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Briefcase className="w-4 h-4" />
                            {empleado.departamento_nombre}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVerReporte(empleado.id);
                        }}
                        className="btn-glass-primary px-4 py-2 flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        Ver Reporte
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginación */}
            <Pagination
              currentPage={pagination.page || 1}
              totalPages={pagination.total_pages || 1}
              totalItems={pagination.total_items || 0}
              itemsPerPage={filtros.limit}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default Reportes;