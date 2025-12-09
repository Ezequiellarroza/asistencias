import { useState, useEffect } from 'react';
import { 
  Clock, 
  Plus, 
  Search, 
  Calendar,
  Filter,
  Trash2,
  Edit,
  AlertCircle,
  Loader2,
  User,
  MapPin,
  ArrowLeft,
  FileText
} from 'lucide-react';
import Modal from '../../components/ui/Modal';
import adminService from '../../services/adminService';
import { useNavigate } from 'react-router-dom'; 

function MarcacionManual() {
  const navigate = useNavigate(); 
  // Estados principales
  const [marcaciones, setMarcaciones] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [oficinas, setOficinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estados de paginación
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total_items: 0,
    total_pages: 0
  });
  
  // Estados de filtros
  const [filtros, setFiltros] = useState({
    empleado_id: '',
    tipo: '',
    fecha_desde: '',
    fecha_hasta: ''
  });
  
  // Estados del modal crear/editar
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('crear'); // 'crear' | 'editar'
  const [formData, setFormData] = useState({
    id: null,
    empleado_id: '',
    tipo: 'entrada',
    fecha_marcacion: '',
    fecha_desde: '',
    fecha_hasta: '',
    oficina_id: '',
    observacion: ''
  });
  const [submitting, setSubmitting] = useState(false);
  
  // Estados del modal confirmar eliminación
  const [modalEliminar, setModalEliminar] = useState(false);
  const [marcacionAEliminar, setMarcacionAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();
  }, [pagination.page, filtros]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Cargar marcaciones con filtros
      const filtrosLimpios = {};
      if (filtros.empleado_id) filtrosLimpios.empleado_id = filtros.empleado_id;
      if (filtros.tipo) filtrosLimpios.tipo = filtros.tipo;
      if (filtros.fecha_desde) filtrosLimpios.fecha_desde = filtros.fecha_desde;
      if (filtros.fecha_hasta) filtrosLimpios.fecha_hasta = filtros.fecha_hasta;
      
      const dataMarcaciones = await adminService.getMarcacionesManuales({
        ...filtrosLimpios,
        page: pagination.page,
        limit: pagination.limit
      });
      
      setMarcaciones(dataMarcaciones.marcaciones || []);
      setPagination(dataMarcaciones.pagination || pagination);
      
      // Cargar empleados y oficinas solo la primera vez
      if (empleados.length === 0) {
        const dataEmpleados = await adminService.getEmpleados({ activo: 1, limit: 1000 });
        setEmpleados(dataEmpleados.empleados || []);
      }
      
      if (oficinas.length === 0) {
        const dataOficinas = await adminService.getOficinas();
        setOficinas(dataOficinas.oficinas || []);
      }
      
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError(err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  // Convertir formato datetime-local a formato MySQL
  const convertirFechaParaBackend = (fechaLocal) => {
    if (!fechaLocal) return '';
    
    // Si ya tiene el formato correcto, retornar
    if (fechaLocal.includes(' ') && fechaLocal.split(':').length === 3) {
      return fechaLocal;
    }
    
    // Convertir de "YYYY-MM-DDTHH:MM" a "YYYY-MM-DD HH:MM:SS"
    const fecha = new Date(fechaLocal);
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    const hora = String(fecha.getHours()).padStart(2, '0');
    const minutos = String(fecha.getMinutes()).padStart(2, '0');
    const segundos = '00';
    
    return `${año}-${mes}-${dia} ${hora}:${minutos}:${segundos}`;
  };

  // Abrir modal para crear
  const handleNuevaMarcacion = () => {
    setModalMode('crear');
    setFormData({
      id: null,
      empleado_id: '',
      tipo: 'entrada',
      fecha_marcacion: '',
      fecha_desde: '',
      fecha_hasta: '',
      oficina_id: '',
      observacion: ''
    });
    setModalOpen(true);
  };

  // Abrir modal para editar
  const handleEditar = (marcacion) => {
    setModalMode('editar');
    setFormData({
      id: marcacion.id,
      empleado_id: marcacion.empleado.id,
      tipo: marcacion.tipo,
      fecha_marcacion: marcacion.fecha_marcacion,
      fecha_desde: marcacion.fecha,
      fecha_hasta: '',
      oficina_id: marcacion.oficina?.id || '',
      observacion: marcacion.observacion || ''
    });
    setModalOpen(true);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setFormData({
      id: null,
      empleado_id: '',
      tipo: 'entrada',
      fecha_marcacion: '',
      fecha_desde: '',
      fecha_hasta: '',
      oficina_id: '',
      observacion: ''
    });
  };

  // Manejar cambios en el formulario
  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (modalMode === 'crear') {
        // Crear nueva marcación
        if (formData.tipo === 'ausencia') {
          // Ausencia
          await adminService.crearAusencia({
            empleado_id: parseInt(formData.empleado_id),
            tipo: 'ausencia',
            fecha_desde: formData.fecha_desde,
            fecha_hasta: formData.fecha_hasta || formData.fecha_desde,
            observacion: formData.observacion
          });
        } else {
          // Entrada o salida
          await adminService.crearMarcacionManual({
            empleado_id: parseInt(formData.empleado_id),
            tipo: formData.tipo,
            fecha_marcacion: convertirFechaParaBackend(formData.fecha_marcacion),
            oficina_id: parseInt(formData.oficina_id),
            observacion: formData.observacion
          });
        }
      } else {
        // Editar marcación existente
        const datosActualizar = {};
        if (formData.fecha_marcacion) {
          datosActualizar.fecha_marcacion = convertirFechaParaBackend(formData.fecha_marcacion);
        }
        if (formData.oficina_id) datosActualizar.oficina_id = parseInt(formData.oficina_id);
        if (formData.observacion !== undefined) datosActualizar.observacion = formData.observacion;
        
        await adminService.actualizarMarcacionManual(formData.id, datosActualizar);
      }

      // Recargar datos
      await cargarDatos();
      handleCloseModal();
      
    } catch (err) {
      console.error('Error al guardar:', err);
      setError(err.message || 'Error al guardar la marcación');
    } finally {
      setSubmitting(false);
    }
  };

  // Confirmar eliminación
  const handleConfirmarEliminar = (marcacion) => {
    setMarcacionAEliminar(marcacion);
    setModalEliminar(true);
  };

  // Eliminar marcación
  const handleEliminar = async () => {
    if (!marcacionAEliminar) return;
    
    setEliminando(true);
    try {
      await adminService.eliminarMarcacionManual(marcacionAEliminar.id);
      await cargarDatos();
      setModalEliminar(false);
      setMarcacionAEliminar(null);
    } catch (err) {
      console.error('Error al eliminar:', err);
      setError(err.message || 'Error al eliminar la marcación');
    } finally {
      setEliminando(false);
    }
  };

  // Aplicar filtros
  const handleAplicarFiltros = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    cargarDatos();
  };

  // Limpiar filtros
  const handleLimpiarFiltros = () => {
    setFiltros({
      empleado_id: '',
      tipo: '',
      fecha_desde: '',
      fecha_hasta: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Cambiar página
  const handleChangePage = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Formatear fecha para mostrar
  const formatearFecha = (fechaStr) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtener color según tipo
  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'entrada': return 'text-green-600 bg-green-100';
      case 'salida': return 'text-blue-600 bg-blue-100';
      case 'ausencia': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Obtener label según tipo
  const getTipoLabel = (tipo) => {
    switch (tipo) {
      case 'entrada': return 'Entrada';
      case 'salida': return 'Salida';
      case 'ausencia': return 'Ausencia';
      default: return tipo;
    }
  };

  if (loading && marcaciones.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <Loader2 className="w-12 h-12 text-amber-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando marcaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="glass-card p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Clock className="w-7 h-7 text-amber-600" />
                Marcación Manual
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Registrar entradas, salidas y ausencias de empleados
              </p>
            </div>
            <button
  onClick={() => navigate('/admin/dashboard')}
  className="btn-glass px-4 py-2 flex items-center gap-2"
>
  <ArrowLeft className="w-4 h-4" />
  Volver
</button>
            <button
              onClick={handleNuevaMarcacion}
              className="btn-glass-primary px-6 py-3 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nueva Marcación
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-800">Filtros</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Filtro Empleado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Empleado
              </label>
              <select
                value={filtros.empleado_id}
                onChange={(e) => setFiltros(prev => ({ ...prev, empleado_id: e.target.value }))}
                className="input-glass w-full"
              >
                <option value="">Todos</option>
                {empleados.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nombre_completo}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo
              </label>
              <select
                value={filtros.tipo}
                onChange={(e) => setFiltros(prev => ({ ...prev, tipo: e.target.value }))}
                className="input-glass w-full"
              >
                <option value="">Todos</option>
                <option value="entrada">Entrada</option>
                <option value="salida">Salida</option>
                <option value="ausencia">Ausencia</option>
              </select>
            </div>

            {/* Filtro Fecha Desde */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Desde
              </label>
              <input
                type="date"
                value={filtros.fecha_desde}
                onChange={(e) => setFiltros(prev => ({ ...prev, fecha_desde: e.target.value }))}
                className="input-glass w-full"
              />
            </div>

            {/* Filtro Fecha Hasta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hasta
              </label>
              <input
                type="date"
                value={filtros.fecha_hasta}
                onChange={(e) => setFiltros(prev => ({ ...prev, fecha_hasta: e.target.value }))}
                className="input-glass w-full"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAplicarFiltros}
              className="btn-glass-primary px-4 py-2 flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Aplicar Filtros
            </button>
            <button
              onClick={handleLimpiarFiltros}
              className="btn-glass px-4 py-2"
            >
              Limpiar
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="glass-card p-4 mb-6 bg-red-50 border border-red-200">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Listado */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-gray-800 mb-4">
            Historial de Marcaciones ({pagination.total_items})
          </h3>

          {marcaciones.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No hay marcaciones registradas</p>
            </div>
          ) : (
            <>
              {/* Tabla */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-amber-200/30">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Empleado</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tipo</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Fecha y Hora</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Oficina</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Observación</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Registrado por</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marcaciones.map(marc => (
                      <tr key={marc.id} className="border-b border-amber-200/20 hover:bg-amber-50/30">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-800">
                              {marc.empleado.nombre_completo}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTipoColor(marc.tipo)}`}>
                            {getTipoLabel(marc.tipo)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">
                          {formatearFecha(marc.fecha_marcacion)}
                        </td>
                        <td className="py-3 px-4">
                          {marc.oficina ? (
                            <div className="flex items-center gap-1 text-sm text-gray-700">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              {marc.oficina.nombre}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {marc.observacion ? (
                            <div className="flex items-start gap-1 text-sm text-gray-600">
                              <FileText className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                              <span className="line-clamp-2">{marc.observacion}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-500">
                          {marc.admin.username}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditar(marc)}
                              className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleConfirmarEliminar(marc)}
                              className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {pagination.total_pages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-amber-200/30">
                  <p className="text-sm text-gray-600">
                    Página {pagination.page} de {pagination.total_pages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleChangePage(pagination.page - 1)}
                      disabled={!pagination.has_prev}
                      className="btn-glass px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => handleChangePage(pagination.page + 1)}
                      disabled={!pagination.has_next}
                      className="btn-glass px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal Crear/Editar */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={modalMode === 'crear' ? 'Nueva Marcación' : 'Editar Marcación'}
        size="lg"
        footer={
          <>
            <button
              type="button"
              onClick={handleCloseModal}
              className="btn-glass px-6 py-2"
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="form-marcacion"
              className="btn-glass-primary px-6 py-2 flex items-center gap-2"
              disabled={submitting}
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {modalMode === 'crear' ? 'Registrar' : 'Actualizar'}
            </button>
          </>
        }
      >
        <form id="form-marcacion" onSubmit={handleSubmit} className="space-y-4">
          
          {/* Empleado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Empleado *
            </label>
            <select
              value={formData.empleado_id}
              onChange={(e) => handleFormChange('empleado_id', e.target.value)}
              className="input-glass w-full"
              required
              disabled={modalMode === 'editar'}
            >
              <option value="">Seleccionar empleado</option>
              {empleados.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.nombre_completo}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Marcación *
            </label>
            <select
              value={formData.tipo}
              onChange={(e) => handleFormChange('tipo', e.target.value)}
              className="input-glass w-full"
              required
              disabled={modalMode === 'editar'}
            >
              <option value="entrada">Entrada</option>
              <option value="salida">Salida</option>
              <option value="ausencia">Ausencia</option>
            </select>
          </div>

          {/* Campos específicos según tipo */}
          {formData.tipo === 'ausencia' ? (
            <>
              {/* Fecha Desde */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha Desde *
                </label>
                <input
                  type="date"
                  value={formData.fecha_desde}
                  onChange={(e) => handleFormChange('fecha_desde', e.target.value)}
                  className="input-glass w-full"
                  required
                  disabled={modalMode === 'editar'}
                />
              </div>

              {/* Fecha Hasta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha Hasta (opcional - para ausencias de múltiples días)
                </label>
                <input
                  type="date"
                  value={formData.fecha_hasta}
                  onChange={(e) => handleFormChange('fecha_hasta', e.target.value)}
                  className="input-glass w-full"
                  min={formData.fecha_desde}
                  disabled={modalMode === 'editar'}
                />
              </div>
            </>
          ) : (
            <>
              {/* Fecha y Hora */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha y Hora *
                </label>
                <input
                  type="datetime-local"
                  value={formData.fecha_marcacion}
                  onChange={(e) => handleFormChange('fecha_marcacion', e.target.value)}
                  className="input-glass w-full"
                  required
                  max={new Date().toISOString().slice(0, 16)}
                />
              </div>

              {/* Oficina */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Oficina *
                </label>
                <select
                  value={formData.oficina_id}
                  onChange={(e) => handleFormChange('oficina_id', e.target.value)}
                  className="input-glass w-full"
                  required
                >
                  <option value="">Seleccionar oficina</option>
                  {oficinas.map(ofi => (
                    <option key={ofi.id} value={ofi.id}>
                      {ofi.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Observación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observación {formData.tipo === 'ausencia' && '*'}
            </label>
            <textarea
              value={formData.observacion}
              onChange={(e) => handleFormChange('observacion', e.target.value)}
              className="input-glass w-full"
              rows="3"
              placeholder={formData.tipo === 'ausencia' ? 'Motivo de la ausencia (ej: Vacaciones, Médico, Franco)' : 'Información adicional (opcional)'}
              required={formData.tipo === 'ausencia'}
            />
          </div>

        </form>
      </Modal>

      {/* Modal Confirmar Eliminación */}
      <Modal
        isOpen={modalEliminar}
        onClose={() => setModalEliminar(false)}
        title="Confirmar Eliminación"
        size="sm"
        footer={
          <>
            <button
              onClick={() => setModalEliminar(false)}
              className="btn-glass px-6 py-2"
              disabled={eliminando}
            >
              Cancelar
            </button>
            <button
              onClick={handleEliminar}
              className="bg-red-600 text-white px-6 py-2 rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2"
              disabled={eliminando}
            >
              {eliminando && <Loader2 className="w-4 h-4 animate-spin" />}
              Eliminar
            </button>
          </>
        }
      >
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-700 mb-2">
            ¿Estás seguro que deseas eliminar esta marcación?
          </p>
          {marcacionAEliminar && (
            <div className="bg-gray-50 rounded-lg p-3 mt-4 text-sm text-left">
              <p><strong>Empleado:</strong> {marcacionAEliminar.empleado.nombre_completo}</p>
              <p><strong>Tipo:</strong> {getTipoLabel(marcacionAEliminar.tipo)}</p>
              <p><strong>Fecha:</strong> {formatearFecha(marcacionAEliminar.fecha_marcacion)}</p>
            </div>
          )}
          <p className="text-sm text-gray-500 mt-4">
            Esta acción no se puede deshacer.
          </p>
        </div>
      </Modal>

    </div>
  );
}

export default MarcacionManual;