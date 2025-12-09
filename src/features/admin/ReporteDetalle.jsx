import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  FileText,
  User,
  Building2,
  Phone,
  Mail,
  Download,
  Filter,
  Moon,
  Info
} from 'lucide-react';
import adminService from '../../services/adminService';
import Modal from '../../components/ui/Modal';

function ReporteDetalle() {
  const navigate = useNavigate();
  const { empleadoId } = useParams();

  // Estados principales
  const [reporte, setReporte] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Estados de selector de fechas
  const hoy = new Date().toISOString().split('T')[0];
  const primerDiaMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  
  const [fechaDesde, setFechaDesde] = useState(primerDiaMes);
  const [fechaHasta, setFechaHasta] = useState(hoy);

  // Estados del modal de marcación manual
  const [modalAbierto, setModalAbierto] = useState(false);
  const [diaProblematico, setDiaProblematico] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [formData, setFormData] = useState({
    fecha_marcacion: '',
    hora: '',
    oficina_id: '',
    observacion: ''
  });
  const [erroresForm, setErroresForm] = useState({});

  // Estados auxiliares
  const [oficinas, setOficinas] = useState([]);
  const [notificacion, setNotificacion] = useState(null);

  // Cargar oficinas para el modal
  const cargarOficinas = async () => {
    try {
      const data = await adminService.getOficinas(false);
      setOficinas(data.oficinas || []);
    } catch (err) {
      console.error('Error al cargar oficinas:', err);
    }
  };

  // Cargar reporte
  const cargarReporte = async () => {
    if (!fechaDesde || !fechaHasta) {
      setError('Debe seleccionar un rango de fechas válido');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await adminService.getReporteEmpleado(empleadoId, fechaDesde, fechaHasta);
      setReporte(data);
    } catch (err) {
      console.error('Error al cargar reporte:', err);
      if (err.message === 'No autenticado') {
        setError('Tu sesión ha expirado. Redirigiendo al login...');
      } else if (err.message.includes('no encontrado')) {
        setError('Empleado no encontrado');
      } else {
        setError(err.message || 'Error al cargar reporte');
      }
    } finally {
      setLoading(false);
    }
  };

  // Cargar al montar y al cambiar fechas
  useEffect(() => {
    cargarOficinas();
    cargarReporte();
  }, [empleadoId, fechaDesde, fechaHasta]);

  // Handler de cambio de fechas
  const handleFechaChange = (tipo, valor) => {
    if (tipo === 'desde') {
      setFechaDesde(valor);
    } else {
      setFechaHasta(valor);
    }
  };

  // Abrir modal para completar marcación
  const handleCompletarMarcacion = (dia) => {
    setDiaProblematico(dia);
    
    // Pre-llenar formulario según el problema
    let fechaMarcacion = '';
    let hora = '08:00';
    let oficinaId = '';

    if (dia.problema === 'entrada_sin_salida' && dia.entrada) {
      // Si falta salida, usar fecha de entrada + 8 horas aproximadamente
      const fechaEntrada = new Date(dia.entrada.fecha_hora);
      fechaMarcacion = fechaEntrada.toISOString().split('T')[0];
      hora = '17:00'; // Hora por defecto para salida
    } else if (dia.problema === 'salida_sin_entrada' && dia.salida) {
      // Si falta entrada, usar fecha de salida - 8 horas aproximadamente
      const fechaSalida = new Date(dia.salida.fecha_hora);
      fechaMarcacion = fechaSalida.toISOString().split('T')[0];
      hora = '08:00'; // Hora por defecto para entrada
      oficinaId = dia.salida.oficina_id || '';
    }

    setFormData({
      fecha_marcacion: fechaMarcacion,
      hora: hora,
      oficina_id: oficinaId,
      observacion: `Completado desde reporte - ${dia.mensaje}`
    });
    setErroresForm({});
    setModalAbierto(true);
  };

  // Cerrar modal
  const handleCerrarModal = () => {
    setModalAbierto(false);
    setDiaProblematico(null);
    setFormData({
      fecha_marcacion: '',
      hora: '',
      oficina_id: '',
      observacion: ''
    });
    setErroresForm({});
  };

  // Validar formulario
  const validarFormulario = () => {
    const errores = {};

    if (!formData.fecha_marcacion) {
      errores.fecha_marcacion = 'La fecha es requerida';
    }

    if (!formData.hora) {
      errores.hora = 'La hora es requerida';
    }

    if (!formData.oficina_id) {
      errores.oficina_id = 'Debe seleccionar una oficina';
    }

    setErroresForm(errores);
    return Object.keys(errores).length === 0;
  };

  // Guardar marcación manual
  const handleGuardarMarcacion = async () => {
    if (!validarFormulario() || !diaProblematico) {
      return;
    }

    setGuardando(true);

    try {
      // Determinar tipo de marcación según el problema
      let tipo = '';
      if (diaProblematico.problema === 'entrada_sin_salida') {
        tipo = 'salida';
      } else if (diaProblematico.problema === 'salida_sin_entrada') {
        tipo = 'entrada';
      }

      // Construir fecha_hora completa
      const fechaHoraCompleta = `${formData.fecha_marcacion} ${formData.hora}:00`;

      await adminService.crearMarcacionManual({
        empleado_id: parseInt(empleadoId),
        tipo: tipo,
        fecha_marcacion: fechaHoraCompleta,
        oficina_id: parseInt(formData.oficina_id),
        observacion: formData.observacion
      });

      mostrarNotificacion('Marcación completada exitosamente', 'success');
      handleCerrarModal();
      
      // Recargar reporte
      cargarReporte();
    } catch (err) {
      console.error('Error al guardar marcación:', err);
      setErroresForm({ general: err.message || 'Error al guardar marcación' });
    } finally {
      setGuardando(false);
    }
  };

  // Mostrar notificación toast
  const mostrarNotificacion = (mensaje, tipo = 'success') => {
    setNotificacion({ mensaje, tipo });
    setTimeout(() => setNotificacion(null), 3000);
  };

  // Navegar con transición
  const handleVolver = () => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        navigate('/admin/reportes');
      });
    } else {
      navigate('/admin/reportes');
    }
  };

  // Formatear hora para mostrar
  const formatearHora = (hora) => {
    if (!hora) return '--:--';
    return hora.substring(0, 5); // HH:MM
  };

  // Formatear fecha para mostrar
  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    const [year, month, day] = fecha.split('-');
    return `${day}/${month}/${year}`;
  };

  // Formatear fecha completa con día de la semana
  const formatearFechaCompleta = (fecha) => {
    if (!fecha) return '';
    const date = new Date(fecha + 'T00:00:00');
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    return `${dias[date.getDay()]} ${date.getDate()} ${meses[date.getMonth()]}`;
  };

  // Loading state
  if (loading && !reporte) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <RefreshCw className="w-12 h-12 text-amber-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando reporte...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !reporte) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card p-8 max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error al cargar reporte</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={handleVolver} className="btn-glass-primary px-6 py-2">
            Volver a Reportes
          </button>
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
                  Reporte de Asistencia
                </h1>
                {reporte && (
                  <p className="text-sm text-gray-600">
                    {reporte.empleado.nombre_completo}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={cargarReporte}
              disabled={loading}
              className="btn-glass px-4 py-2 flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>
          </div>

          {/* Info del empleado */}
          {reporte && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm border-t border-gray-200 pt-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" />
                {reporte.empleado.telefono}
              </div>
              {reporte.empleado.email && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  {reporte.empleado.email}
                </div>
              )}
              {reporte.empleado.oficina_id && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Building2 className="w-4 h-4" />
                  Oficina asignada
                </div>
              )}
            </div>
          )}
        </div>

        {/* Selector de fechas */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-gray-600" />
            <h2 className="font-semibold text-gray-800">Período del Reporte</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Desde
              </label>
              <input
                type="date"
                value={fechaDesde}
                onChange={(e) => handleFechaChange('desde', e.target.value)}
                max={fechaHasta}
                className="input-glass w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Hasta
              </label>
              <input
                type="date"
                value={fechaHasta}
                onChange={(e) => handleFechaChange('hasta', e.target.value)}
                min={fechaDesde}
                max={hoy}
                className="input-glass w-full"
              />
            </div>
          </div>

          {reporte && (
            <p className="text-sm text-gray-500 mt-2">
              Mostrando datos desde {formatearFecha(reporte.periodo.fecha_desde)} hasta {formatearFecha(reporte.periodo.fecha_hasta)}
            </p>
          )}
        </div>

        {/* Resumen estadístico */}
        {reporte && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">
                {reporte.resumen.total_dias_con_marcaciones}
              </h3>
              <p className="text-sm text-gray-600">Días con marcaciones</p>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">
                {reporte.resumen.dias_completos}
              </h3>
              <p className="text-sm text-gray-600">Días completos</p>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">
                {reporte.resumen.total_horas_trabajadas}
              </h3>
              <p className="text-sm text-gray-600">Horas trabajadas</p>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-2">
                <Info className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">
                {reporte.resumen.ausencias_registradas}
              </h3>
              <p className="text-sm text-gray-600">Ausencias</p>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">
                {reporte.resumen.dias_con_problemas}
              </h3>
              <p className="text-sm text-gray-600">Requieren revisión</p>
            </div>
          </div>
        )}

        {/* Días con problemas */}
        {reporte && reporte.dias_con_problemas.length > 0 && (
          <div className="glass-card p-6 mb-6 border-l-4 border-red-500">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h2 className="font-semibold text-gray-800">
                Días que Requieren Revisión ({reporte.dias_con_problemas.length})
              </h2>
            </div>

            <div className="space-y-3">
              {reporte.dias_con_problemas.map((dia, index) => (
                <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle className="w-5 h-5 text-red-600" />
                        <h3 className="font-semibold text-gray-800">
                          {dia.problema === 'entrada_sin_salida' && dia.entrada && 
                            formatearFechaCompleta(dia.entrada.fecha_hora.split(' ')[0])
                          }
                          {dia.problema === 'salida_sin_entrada' && dia.salida && 
                            formatearFechaCompleta(dia.salida.fecha_hora.split(' ')[0])
                          }
                          {dia.problema === 'diferencia_maxima_excedida' && dia.entrada &&
                            formatearFechaCompleta(dia.entrada.fecha_hora.split(' ')[0])
                          }
                        </h3>
                      </div>

                      <p className="text-sm text-gray-700 mb-2">{dia.mensaje}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        {dia.entrada && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Entrada:</span>
                            <span className="text-gray-600">
                              {formatearHora(dia.entrada.fecha_hora.split(' ')[1])} 
                              {dia.entrada.oficina_nombre && ` - ${dia.entrada.oficina_nombre}`}
                              <span className="ml-1 text-xs text-gray-500">({dia.entrada.origen})</span>
                            </span>
                          </div>
                        )}
                        {dia.salida && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Salida:</span>
                            <span className="text-gray-600">
                              {formatearHora(dia.salida.fecha_hora.split(' ')[1])}
                              {dia.salida.oficina_nombre && ` - ${dia.salida.oficina_nombre}`}
                              <span className="ml-1 text-xs text-gray-500">({dia.salida.origen})</span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {dia.problema !== 'diferencia_maxima_excedida' && (
                      <button
                        onClick={() => handleCompletarMarcacion(dia)}
                        className="btn-glass-primary px-4 py-2 text-sm ml-4"
                      >
                        Completar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detalle de marcaciones */}
        {reporte && reporte.marcaciones_detalle.length > 0 && (
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-gray-600" />
              <h2 className="font-semibold text-gray-800">
                Detalle de Marcaciones
              </h2>
            </div>

            <div className="space-y-2">
              {reporte.marcaciones_detalle.map((marcacion, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    marcacion.tipo === 'completo' 
                      ? 'bg-emerald-50 border-emerald-500' 
                      : marcacion.tipo === 'ausencia'
                      ? 'bg-purple-50 border-purple-500'
                      : 'bg-amber-50 border-amber-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-800">
                          {formatearFechaCompleta(marcacion.fecha)}
                        </h3>
                        {marcacion.observacion && marcacion.observacion.includes('Turno nocturno') && (
                          <span className="flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-indigo-100 text-indigo-700 rounded-full">
                            <Moon className="w-3 h-3" />
                            Turno nocturno
                          </span>
                        )}
                        <span className="text-xs text-gray-500">({marcacion.origen})</span>
                      </div>

                      {marcacion.tipo === 'completo' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-700">
                            <span className="font-medium">Entrada:</span>
                            <span>{formatearHora(marcacion.hora_entrada)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <span className="font-medium">Salida:</span>
                            <span>
                              {formatearHora(marcacion.hora_salida)}
                              {marcacion.fecha_salida && marcacion.fecha_salida !== marcacion.fecha && 
                                ` (${formatearFecha(marcacion.fecha_salida)})`
                              }
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                            <Clock className="w-4 h-4" />
                            <span>{marcacion.horas_trabajadas}hs</span>
                          </div>
                        </div>
                      )}

                      {marcacion.tipo === 'ausencia' && (
                        <div className="text-sm text-gray-700">
                          <span className="font-medium">Ausencia registrada</span>
                          {marcacion.observacion && (
                            <span className="ml-2">- {marcacion.observacion}</span>
                          )}
                        </div>
                      )}

                      {marcacion.tipo === 'incompleto' && (
                        <div className="text-sm text-amber-700">
                          <span className="font-medium">{marcacion.observacion}</span>
                          {marcacion.hora_entrada && (
                            <span className="ml-2">Entrada: {formatearHora(marcacion.hora_entrada)}</span>
                          )}
                          {marcacion.hora_salida && (
                            <span className="ml-2">Salida: {formatearHora(marcacion.hora_salida)}</span>
                          )}
                        </div>
                      )}

                      {marcacion.tipo === 'turno_invalido' && (
                        <div className="text-sm text-red-700">
                          <span className="font-medium">{marcacion.observacion}</span>
                        </div>
                      )}

                      {marcacion.oficina_nombre && (
                        <div className="text-xs text-gray-500 mt-1">
                          {marcacion.oficina_nombre}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sin marcaciones */}
        {reporte && reporte.marcaciones_detalle.length === 0 && (
          <div className="glass-card p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Sin marcaciones en este período
            </h3>
            <p className="text-gray-600">
              No se encontraron marcaciones para el rango de fechas seleccionado
            </p>
          </div>
        )}

        {/* Modal para completar marcación */}
        <Modal
          isOpen={modalAbierto}
          onClose={handleCerrarModal}
          title="Completar Marcación"
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
                onClick={handleGuardarMarcacion}
                disabled={guardando}
                className="btn-glass-primary px-4 py-2 flex items-center gap-2"
              >
                {guardando ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar Marcación'
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

            {/* Info del problema */}
            {diaProblematico && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                <p className="font-medium text-amber-800 mb-1">
                  {diaProblematico.problema === 'entrada_sin_salida' 
                    ? 'Completar Salida' 
                    : 'Completar Entrada'
                  }
                </p>
                <p className="text-amber-700">{diaProblematico.mensaje}</p>
              </div>
            )}

            {/* Fecha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha *
              </label>
              <input
                type="date"
                value={formData.fecha_marcacion}
                onChange={(e) => setFormData({ ...formData, fecha_marcacion: e.target.value })}
                className={`input-glass w-full ${erroresForm.fecha_marcacion ? 'border-red-500' : ''}`}
              />
              {erroresForm.fecha_marcacion && (
                <p className="text-red-600 text-sm mt-1">{erroresForm.fecha_marcacion}</p>
              )}
            </div>

            {/* Hora */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora *
              </label>
              <input
                type="time"
                value={formData.hora}
                onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                className={`input-glass w-full ${erroresForm.hora ? 'border-red-500' : ''}`}
              />
              {erroresForm.hora && (
                <p className="text-red-600 text-sm mt-1">{erroresForm.hora}</p>
              )}
            </div>

            {/* Oficina */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Oficina *
              </label>
              <select
                value={formData.oficina_id}
                onChange={(e) => setFormData({ ...formData, oficina_id: e.target.value })}
                className={`input-glass w-full ${erroresForm.oficina_id ? 'border-red-500' : ''}`}
              >
                <option value="">Seleccionar oficina...</option>
                {oficinas.map(ofi => (
                  <option key={ofi.id} value={ofi.id}>
                    {ofi.nombre}
                  </option>
                ))}
              </select>
              {erroresForm.oficina_id && (
                <p className="text-red-600 text-sm mt-1">{erroresForm.oficina_id}</p>
              )}
            </div>

            {/* Observación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observación
              </label>
              <textarea
                value={formData.observacion}
                onChange={(e) => setFormData({ ...formData, observacion: e.target.value })}
                placeholder="Motivo de la corrección..."
                rows="3"
                className="input-glass w-full"
              />
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

export default ReporteDetalle;