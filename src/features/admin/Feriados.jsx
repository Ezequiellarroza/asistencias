import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Plus,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CalendarDays
} from 'lucide-react';
import adminService from '../../services/adminService';
import Modal from '../../components/ui/Modal';

function Feriados() {
  const navigate = useNavigate();

  // Estados principales
  const [feriados, setFeriados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Estados del formulario
  const [formData, setFormData] = useState({
    fecha: '',
    nombre: '',
    descripcion: ''
  });
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState('');

  // Estado para modal de confirmación de eliminación
  const [modalEliminar, setModalEliminar] = useState(false);
  const [feriadoAEliminar, setFeriadoAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  // Estado para notificaciones toast
  const [notificacion, setNotificacion] = useState(null);

  // Filtro por año
  const [yearFiltro, setYearFiltro] = useState(new Date().getFullYear());

  // Cargar feriados
  const cargarFeriados = async () => {
    try {
      setError('');
      const data = await adminService.getFeriados(yearFiltro);
      setFeriados(data.feriados || []);
    } catch (err) {
      console.error('Error al cargar feriados:', err);
      setError(err.message || 'Error al cargar feriados');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    cargarFeriados();
  }, [yearFiltro]);

  const handleRefresh = () => {
    setRefreshing(true);
    cargarFeriados();
  };

  // Mostrar notificación toast
  const mostrarNotificacion = (mensaje, tipo = 'success') => {
    setNotificacion({ mensaje, tipo });
    setTimeout(() => setNotificacion(null), 3000);
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrorForm('');
  };

  // Guardar nuevo feriado
  const handleGuardar = async (e) => {
    e.preventDefault();
    
    // Validar
    if (!formData.fecha) {
      setErrorForm('La fecha es requerida');
      return;
    }
    if (!formData.nombre.trim()) {
      setErrorForm('El nombre es requerido');
      return;
    }

    setGuardando(true);
    setErrorForm('');

    try {
      await adminService.crearFeriado({
        fecha: formData.fecha,
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || null
      });

      mostrarNotificacion('Feriado agregado exitosamente', 'success');
      
      // Limpiar formulario
      setFormData({ fecha: '', nombre: '', descripcion: '' });
      
      // Actualizar año del filtro si es necesario
      const yearFeriado = parseInt(formData.fecha.split('-')[0]);
      if (yearFeriado !== yearFiltro) {
        setYearFiltro(yearFeriado);
      } else {
        cargarFeriados();
      }
    } catch (err) {
      console.error('Error al crear feriado:', err);
      setErrorForm(err.message || 'Error al crear feriado');
    } finally {
      setGuardando(false);
    }
  };

  // Abrir modal de eliminación
  const handleAbrirModalEliminar = (feriado) => {
    setFeriadoAEliminar(feriado);
    setModalEliminar(true);
  };

  // Cerrar modal de eliminación
  const handleCerrarModalEliminar = () => {
    setModalEliminar(false);
    setFeriadoAEliminar(null);
  };

  // Confirmar eliminación
  const handleConfirmarEliminar = async () => {
    if (!feriadoAEliminar) return;

    setEliminando(true);

    try {
      await adminService.eliminarFeriado(feriadoAEliminar.id);
      mostrarNotificacion(`"${feriadoAEliminar.nombre}" eliminado`, 'success');
      handleCerrarModalEliminar();
      cargarFeriados();
    } catch (err) {
      console.error('Error al eliminar feriado:', err);
      mostrarNotificacion(err.message || 'Error al eliminar feriado', 'error');
    } finally {
      setEliminando(false);
    }
  };

  // Formatear fecha para mostrar
  const formatearFecha = (fecha) => {
    const [year, month, day] = fecha.split('-');
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${parseInt(day)} de ${meses[parseInt(month) - 1]}`;
  };

  // Obtener día de la semana
  const obtenerDiaSemana = (fecha) => {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const date = new Date(fecha + 'T12:00:00');
    return dias[date.getDay()];
  };

  // Navegar con transición
  const handleVolver = () => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        navigate('/admin/configuracion');
      });
    } else {
      navigate('/admin/configuracion');
    }
  };

  // Generar opciones de años
  const yearsOptions = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear - 1; y <= currentYear + 2; y++) {
    yearsOptions.push(y);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <RefreshCw className="w-12 h-12 text-amber-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando feriados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleVolver}
                className="btn-glass p-2"
                aria-label="Volver"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    Feriados
                  </h1>
                  <p className="text-sm text-gray-600">
                    {feriados.length} feriados en {yearFiltro}
                  </p>
                </div>
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

        {/* Formulario para agregar feriado */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-600" />
            Agregar Feriado
          </h2>

          <form onSubmit={handleGuardar}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Fecha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha *
                </label>
                <input
                  type="date"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleInputChange}
                  className="input-glass w-full"
                />
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del feriado *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Ej: Navidad"
                  className="input-glass w-full"
                />
              </div>
            </div>

            {/* Descripción */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción (opcional)
              </label>
              <input
                type="text"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                placeholder="Ej: Feriado nacional"
                className="input-glass w-full"
              />
            </div>

            {/* Error del formulario */}
            {errorForm && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {errorForm}
              </div>
            )}

            {/* Botón guardar */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={guardando}
                className="btn-glass-primary px-6 py-2 flex items-center gap-2"
              >
                {guardando ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Agregar Feriado
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Filtro por año */}
        <div className="glass-card p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Filtrar por año:</span>
            <div className="flex gap-2">
              {yearsOptions.map(year => (
                <button
                  key={year}
                  onClick={() => setYearFiltro(year)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    yearFiltro === year
                      ? 'bg-amber-500 text-white'
                      : 'bg-white/50 text-gray-600 hover:bg-white/80'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error general */}
        {error && (
          <div className="glass-card p-4 mb-6 border-l-4 border-red-500">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Lista de feriados */}
        {feriados.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <CalendarDays className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No hay feriados
            </h3>
            <p className="text-gray-600">
              No hay feriados cargados para {yearFiltro}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {feriados.map(feriado => (
              <div
                key={feriado.id}
                className="glass-card p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-amber-100 rounded-xl flex flex-col items-center justify-center">
                    <span className="text-xs text-amber-600 font-medium">
                      {feriado.fecha.split('-')[2]}
                    </span>
                    <span className="text-xs text-amber-800 font-bold">
                      {['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'][parseInt(feriado.fecha.split('-')[1]) - 1]}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {feriado.nombre}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {obtenerDiaSemana(feriado.fecha)} {formatearFecha(feriado.fecha)}
                      {feriado.descripcion && ` • ${feriado.descripcion}`}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleAbrirModalEliminar(feriado)}
                  className="btn-glass p-2"
                  title="Eliminar feriado"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Modal de Confirmación de Eliminación */}
        <Modal
          isOpen={modalEliminar}
          onClose={handleCerrarModalEliminar}
          title="Confirmar Eliminación"
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
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </>
                )}
              </button>
            </>
          }
        >
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              ¿Eliminar feriado?
            </h3>
            <p className="text-gray-600">
              ¿Está seguro de eliminar <strong>"{feriadoAEliminar?.nombre}"</strong>?
            </p>
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

export default Feriados;