import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  Building2,
  Phone,
  Mail,
  RefreshCw,
  Filter,
  X,
  Briefcase,
  Clock
} from 'lucide-react';
import adminService from '../../services/adminService';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';

function Empleados() {
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

  // Estados del modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoModal, setModoModal] = useState('crear'); // 'crear' | 'editar'
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // Estado para modal de confirmación de eliminación
  const [modalEliminar, setModalEliminar] = useState(false);
  const [empleadoAEliminar, setEmpleadoAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  // Estado para notificaciones toast
  const [notificacion, setNotificacion] = useState(null);

  // Estados del formulario
  const [formData, setFormData] = useState({
  telefono: '',
  nombre: '',
  apellido: '',
  email: '',
  oficina_id: '',
  departamento_id: '',
  activo: true,
  jornada: {
    horas_por_dia: '',
    lunes: true,
    martes: true,
    miercoles: true,
    jueves: true,
    viernes: true,
    sabado: false,
    domingo: false
  }
});
  const [erroresForm, setErroresForm] = useState({});

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

  // Handlers del modal
  const handleAbrirModalCrear = () => {
  setModoModal('crear');
  setEmpleadoSeleccionado(null);
  setFormData({
    telefono: '',
    nombre: '',
    apellido: '',
    email: '',
    oficina_id: '',
    departamento_id: '',
    activo: true,
    jornada: {
      horas_por_dia: '',
      lunes: true,
      martes: true,
      miercoles: true,
      jueves: true,
      viernes: true,
      sabado: false,
      domingo: false
    }
  });
  setErroresForm({});
  setModalAbierto(true);
};

  const handleAbrirModalEditar = (empleado) => {
  setModoModal('editar');
  setEmpleadoSeleccionado(empleado);
  setFormData({
    telefono: empleado.telefono,
    nombre: empleado.nombre,
    apellido: empleado.apellido,
    email: empleado.email || '',
    oficina_id: empleado.oficina_id || '',
    departamento_id: empleado.departamento_id || '',
    activo: empleado.activo,
    jornada: {
      horas_por_dia: empleado.jornada?.horas_por_dia || '',
      lunes: empleado.jornada?.lunes ?? true,
      martes: empleado.jornada?.martes ?? true,
      miercoles: empleado.jornada?.miercoles ?? true,
      jueves: empleado.jornada?.jueves ?? true,
      viernes: empleado.jornada?.viernes ?? true,
      sabado: empleado.jornada?.sabado ?? false,
      domingo: empleado.jornada?.domingo ?? false
    }
  });
  setErroresForm({});
  setModalAbierto(true);
};

  const handleCerrarModal = () => {
  setModalAbierto(false);
  setEmpleadoSeleccionado(null);
  setFormData({
    telefono: '',
    nombre: '',
    apellido: '',
    email: '',
    oficina_id: '',
    departamento_id: '',
    activo: true,
    jornada: {
      horas_por_dia: '',
      lunes: true,
      martes: true,
      miercoles: true,
      jueves: true,
      viernes: true,
      sabado: false,
      domingo: false
    }
  });
  setErroresForm({});
};

  // Validar formulario
  const validarFormulario = () => {
    const errores = {};

    if (!formData.telefono.trim()) {
      errores.telefono = 'El teléfono es requerido';
    } else if (formData.telefono.replace(/[^0-9]/g, '').length < 8) {
      errores.telefono = 'El teléfono debe tener al menos 8 dígitos';
    }

    if (!formData.nombre.trim()) {
      errores.nombre = 'El nombre es requerido';
    }

    if (!formData.apellido.trim()) {
      errores.apellido = 'El apellido es requerido';
    }

    if (formData.email && !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errores.email = 'Email inválido';
    }

    setErroresForm(errores);
    return Object.keys(errores).length === 0;
  };

  // Guardar empleado
  const handleGuardar = async () => {
    if (!validarFormulario()) {
      return;
    }

    setGuardando(true);

    try {
      if (modoModal === 'crear') {
        await adminService.crearEmpleado(formData);
        mostrarNotificacion('Empleado creado exitosamente', 'success');
      } else {
        await adminService.actualizarEmpleado(empleadoSeleccionado.id, formData);
        mostrarNotificacion('Empleado actualizado exitosamente', 'success');
      }

      handleCerrarModal();
      cargarEmpleados();
    } catch (err) {
      console.error('Error al guardar empleado:', err);
      setErroresForm({ general: err.message || 'Error al guardar empleado' });
    } finally {
      setGuardando(false);
    }
  };

  // Mostrar notificación toast
  const mostrarNotificacion = (mensaje, tipo = 'success') => {
    setNotificacion({ mensaje, tipo });
    setTimeout(() => setNotificacion(null), 3000);
  };

  // Abrir modal de confirmación para eliminar
  const handleAbrirModalEliminar = (empleado) => {
    setEmpleadoAEliminar(empleado);
    setModalEliminar(true);
  };

  // Cerrar modal de eliminación
  const handleCerrarModalEliminar = () => {
    setModalEliminar(false);
    setEmpleadoAEliminar(null);
  };

  // Confirmar eliminación
  const handleConfirmarEliminar = async () => {
    if (!empleadoAEliminar) return;

    setEliminando(true);

    try {
      await adminService.eliminarEmpleado(empleadoAEliminar.id);
      mostrarNotificacion(`${empleadoAEliminar.nombre_completo} ha sido desactivado`, 'success');
      handleCerrarModalEliminar();
      cargarEmpleados();
    } catch (err) {
      console.error('Error al eliminar empleado:', err);
      mostrarNotificacion(err.message || 'Error al desactivar empleado', 'error');
    } finally {
      setEliminando(false);
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
                  Gestión de Empleados
                </h1>
                <p className="text-sm text-gray-600">
                  {pagination.total_items || 0} empleados registrados
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="btn-glass px-4 py-2 flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Actualizar</span>
              </button>
              <button
                onClick={handleAbrirModalCrear}
                className="btn-glass-primary px-4 py-2 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nuevo Empleado
              </button>
            </div>
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
            <p className="text-gray-600 mb-4">
              No se encontraron empleados con los filtros aplicados
            </p>
            <button
              onClick={handleAbrirModalCrear}
              className="btn-glass-primary px-6 py-2"
            >
              Crear Primer Empleado
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 mb-6">
              {empleados.map(empleado => (
                <div
                  key={empleado.id}
                  className="glass-card p-6 hover:shadow-lg transition-shadow"
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

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleAbrirModalEditar(empleado)}
                        className="btn-glass p-2"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4 text-blue-600" />
                      </button>
                      {empleado.activo && (
                        <button
                          onClick={() => handleAbrirModalEliminar(empleado)}
                          className="btn-glass p-2"
                          title="Desactivar"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      )}
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

        {/* Modal Crear/Editar */}
        <Modal
          isOpen={modalAbierto}
          onClose={handleCerrarModal}
          title={modoModal === 'crear' ? 'Nuevo Empleado' : 'Editar Empleado'}
          size="md"
          footer={
            <>
              <button
                onClick={handleCerrarModal}
                className="btn-glass px-4 py-2"
                disabled={guardando}
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardar}
                disabled={guardando}
                className="btn-glass-primary px-4 py-2 flex items-center gap-2"
              >
                {guardando ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar'
                )}
              </button>
            </>
          }
        >
          <div className="space-y-4">
            {/* Error general */}
            {erroresForm.general && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {erroresForm.general}
              </div>
            )}

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono *
              </label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                placeholder="1234567890"
                className={`input-glass w-full ${erroresForm.telefono ? 'border-red-500' : ''}`}
                disabled={modoModal === 'editar'}
              />
              {erroresForm.telefono && (
                <p className="text-red-600 text-sm mt-1">{erroresForm.telefono}</p>
              )}
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Juan"
                className={`input-glass w-full ${erroresForm.nombre ? 'border-red-500' : ''}`}
              />
              {erroresForm.nombre && (
                <p className="text-red-600 text-sm mt-1">{erroresForm.nombre}</p>
              )}
            </div>

            {/* Apellido */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apellido *
              </label>
              <input
                type="text"
                value={formData.apellido}
                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                placeholder="Pérez"
                className={`input-glass w-full ${erroresForm.apellido ? 'border-red-500' : ''}`}
              />
              {erroresForm.apellido && (
                <p className="text-red-600 text-sm mt-1">{erroresForm.apellido}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email (opcional)
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="juan.perez@ejemplo.com"
                className={`input-glass w-full ${erroresForm.email ? 'border-red-500' : ''}`}
              />
              {erroresForm.email && (
                <p className="text-red-600 text-sm mt-1">{erroresForm.email}</p>
              )}
            </div>

            {/* Oficina */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Oficina (opcional)
              </label>
              <select
                value={formData.oficina_id}
                onChange={(e) => setFormData({ ...formData, oficina_id: e.target.value })}
                className="input-glass w-full"
              >
                <option value="">Sin asignar</option>
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
    Departamento (opcional)
  </label>
  <select
    value={formData.departamento_id}
    onChange={(e) => setFormData({ ...formData, departamento_id: e.target.value })}
    className="input-glass w-full"
  >
    <option value="">Sin asignar</option>
    {departamentos.map(dept => (
      <option key={dept.id} value={dept.id}>
        {dept.nombre}
      </option>
    ))}
  </select>
</div>

{/* Configuración de Jornada */}
<div className="pt-4 border-t border-gray-200">
  <div className="flex items-center gap-2 mb-4">
    <Clock className="w-5 h-5 text-amber-600" />
    <h3 className="font-semibold text-gray-800">Configuración de Jornada</h3>
  </div>

  {/* Horas por día */}
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Horas por día
    </label>
    <input
      type="number"
      step="0.5"
      min="1"
      max="24"
      value={formData.jornada.horas_por_dia}
      onChange={(e) => setFormData({
        ...formData,
        jornada: { ...formData.jornada, horas_por_dia: e.target.value }
      })}
      placeholder="8"
      className="input-glass w-full"
    />
    <p className="text-xs text-gray-500 mt-1">
      Horas que debe trabajar el empleado por día. Si no se configura, no se calcularán horas extras.
    </p>
  </div>

  {/* Días laborables */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Días laborables
    </label>
    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
      {[
        { key: 'lunes', label: 'Lun' },
        { key: 'martes', label: 'Mar' },
        { key: 'miercoles', label: 'Mié' },
        { key: 'jueves', label: 'Jue' },
        { key: 'viernes', label: 'Vie' },
        { key: 'sabado', label: 'Sáb' },
        { key: 'domingo', label: 'Dom' }
      ].map(dia => (
        <label
          key={dia.key}
          className={`flex flex-col items-center justify-center p-2 rounded-lg border cursor-pointer transition-colors ${
            formData.jornada[dia.key]
              ? 'bg-amber-100 border-amber-400 text-amber-800'
              : 'bg-gray-50 border-gray-200 text-gray-500'
          }`}
        >
          <input
            type="checkbox"
            checked={formData.jornada[dia.key]}
            onChange={(e) => setFormData({
              ...formData,
              jornada: { ...formData.jornada, [dia.key]: e.target.checked }
            })}
            className="sr-only"
          />
          <span className="text-sm font-medium">{dia.label}</span>
        </label>
      ))}
    </div>
    <p className="text-xs text-gray-500 mt-2">
      Si trabaja un día no marcado, se resaltará en el reporte para revisión.
    </p>
  </div>
</div>

{/* Estado Activo - SOLO EN MODO EDITAR */}

            {/* Estado Activo - SOLO EN MODO EDITAR */}
            {modoModal === 'editar' && (
              <div className="pt-4 border-t border-gray-200">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="block text-sm font-medium text-gray-700">
                      Estado del empleado
                    </span>
                    <span className="block text-sm text-gray-500 mt-1">
                      {formData.activo ? 'El empleado está activo y puede marcar asistencia' : 'El empleado está inactivo y no puede marcar asistencia'}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={formData.activo}
                      onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
                  </div>
                </label>
              </div>
            )}
          </div>
        </Modal>

        {/* Modal de Confirmación de Eliminación */}
        <Modal
          isOpen={modalEliminar}
          onClose={handleCerrarModalEliminar}
          title="Confirmar Desactivación"
          size="sm"
          footer={
            <>
              <button
                onClick={handleCerrarModalEliminar}
                className="btn-glass px-4 py-2"
                disabled={eliminando}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarEliminar}
                disabled={eliminando}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                {eliminando ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Desactivando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Desactivar
                  </>
                )}
              </button>
            </>
          }
        >
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              ¿Desactivar empleado?
            </h3>
            <p className="text-gray-600 mb-4">
              ¿Está seguro de desactivar a <strong>{empleadoAEliminar?.nombre_completo}</strong>?
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
              <p>El empleado no podrá marcar asistencia mientras esté inactivo. Puede reactivarlo en cualquier momento editándolo.</p>
            </div>
          </div>
        </Modal>

        {/* Notificación Toast */}
        {notificacion && (
          <div className="fixed top-4 right-4 z-50 animate-fade-in-down">
            <div className={`glass-card p-4 flex items-center gap-3 shadow-lg ${
              notificacion.tipo === 'success' ? 'border-l-4 border-emerald-500' : 'border-l-4 border-red-500'
            }`}>
              {notificacion.tipo === 'success' ? (
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : (
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
              <p className="text-gray-800 font-medium">{notificacion.mensaje}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Empleados;