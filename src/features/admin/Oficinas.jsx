import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Plus,
  Edit,
  Trash2,
  Users,
  RefreshCw,
  Navigation,
  ExternalLink
} from 'lucide-react';
import adminService from '../../services/adminService';
import Modal from '../../components/ui/Modal';

function Oficinas() {
  const navigate = useNavigate();

  // Estados principales
  const [oficinas, setOficinas] = useState([]);

  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Estados del modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoModal, setModoModal] = useState('crear'); // 'crear' | 'editar'
  const [oficinaSeleccionada, setOficinaSeleccionada] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // Estados del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    latitud: '',
    longitud: '',
    radio_metros: '100'
  });
  const [erroresForm, setErroresForm] = useState({});

  // Cargar oficinas
  const cargarOficinas = async () => {
    try {
      setError('');
      const data = await adminService.getOficinas(false);
      setOficinas(data.oficinas || []);
    } catch (err) {
      console.error('Error al cargar oficinas:', err);
      if (err.message === 'No autenticado') {
        setError('Tu sesión ha expirado. Redirigiendo al login...');
      } else {
        setError(err.message || 'Error al cargar oficinas');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Cargar al montar
  useEffect(() => {
    cargarOficinas();
  }, []);

  // Handlers
  const handleRefresh = () => {
    setRefreshing(true);
    cargarOficinas();
  };

  // Handlers del modal
  const handleAbrirModalCrear = () => {
    setModoModal('crear');
    setOficinaSeleccionada(null);
    setFormData({
      nombre: '',
      direccion: '',
      latitud: '',
      longitud: '',
      radio_metros: '100'
    });
    setErroresForm({});
    setModalAbierto(true);
  };

  const handleAbrirModalEditar = (oficina) => {
    setModoModal('editar');
    setOficinaSeleccionada(oficina);
    setFormData({
      nombre: oficina.nombre,
      direccion: oficina.direccion,
      latitud: oficina.latitud.toString(),
      longitud: oficina.longitud.toString(),
      radio_metros: oficina.radio_metros.toString()
    });
    setErroresForm({});
    setModalAbierto(true);
  };

  const handleCerrarModal = () => {
    setModalAbierto(false);
    setOficinaSeleccionada(null);
    setFormData({
      nombre: '',
      direccion: '',
      latitud: '',
      longitud: '',
      radio_metros: '100'
    });
    setErroresForm({});
  };

  // Obtener ubicación actual
  const handleObtenerUbicacion = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          latitud: position.coords.latitude.toFixed(6),
          longitud: position.coords.longitude.toFixed(6)
        });
      },
      (error) => {
        console.error('Error al obtener ubicación:', error);
        alert('No se pudo obtener tu ubicación. Verifica los permisos del navegador.');
      }
    );
  };

  // Validar formulario
  const validarFormulario = () => {
    const errores = {};

    if (!formData.nombre.trim()) {
      errores.nombre = 'El nombre es requerido';
    }

    if (!formData.direccion.trim()) {
      errores.direccion = 'La dirección es requerida';
    }

    const lat = parseFloat(formData.latitud);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      errores.latitud = 'Latitud inválida (debe estar entre -90 y 90)';
    }

    const lon = parseFloat(formData.longitud);
    if (isNaN(lon) || lon < -180 || lon > 180) {
      errores.longitud = 'Longitud inválida (debe estar entre -180 y 180)';
    }

    const radio = parseInt(formData.radio_metros);
    if (isNaN(radio) || radio < 10 || radio > 1000) {
      errores.radio_metros = 'Radio debe estar entre 10 y 1000 metros';
    }

    setErroresForm(errores);
    return Object.keys(errores).length === 0;
  };

  // Guardar oficina
  const handleGuardar = async () => {
    if (!validarFormulario()) {
      return;
    }

    setGuardando(true);

    try {
      const datos = {
        nombre: formData.nombre,
        direccion: formData.direccion,
        latitud: parseFloat(formData.latitud),
        longitud: parseFloat(formData.longitud),
        radio_metros: parseInt(formData.radio_metros)
      };

      if (modoModal === 'crear') {
        await adminService.crearOficina(datos);
      } else {
        await adminService.actualizarOficina(oficinaSeleccionada.id, datos);
      }

      handleCerrarModal();
      cargarOficinas();
    } catch (err) {
      console.error('Error al guardar oficina:', err);
      setErroresForm({ general: err.message || 'Error al guardar oficina' });
    } finally {
      setGuardando(false);
    }
  };

  // Eliminar oficina
  const handleEliminar = async (oficina) => {
    if (oficina.total_empleados_asignados > 0) {
      alert('No se puede desactivar una oficina con empleados asignados. Reasigne los empleados primero.');
      return;
    }

    if (!confirm(`¿Está seguro de desactivar la oficina "${oficina.nombre}"?`)) {
      return;
    }

    try {
      await adminService.eliminarOficina(oficina.id);
      cargarOficinas();
    } catch (err) {
      console.error('Error al eliminar oficina:', err);
      alert(err.message || 'Error al desactivar oficina');
    }
  };

  // Abrir en Google Maps
  const handleAbrirMaps = (oficina) => {
    const url = `https://www.google.com/maps?q=${oficina.latitud},${oficina.longitud}`;
    window.open(url, '_blank');
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
          <p className="text-gray-600">Cargando oficinas...</p>
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
                  Gestión de Oficinas
                </h1>
                <p className="text-sm text-gray-600">
                  {oficinas.length} oficinas activas
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
                Nueva Oficina
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="glass-card p-4 mb-6 border-l-4 border-red-500">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Lista de oficinas */}
        {oficinas.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No hay oficinas
            </h3>
            <p className="text-gray-600 mb-4">
              Crea la primera oficina para empezar a gestionar el presentismo
            </p>
            <button
              onClick={handleAbrirModalCrear}
              className="btn-glass-primary px-6 py-2"
            >
              Crear Primera Oficina
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {oficinas.map(oficina => (
              <div
                key={oficina.id}
                className="glass-card p-6 hover:shadow-lg transition-shadow"
              >
                {/* Header de la card */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-1">
                      {oficina.nombre}
                    </h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {oficina.direccion}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAbrirModalEditar(oficina)}
                      className="btn-glass p-2"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleEliminar(oficina)}
                      className="btn-glass p-2"
                      title="Desactivar"
                      disabled={oficina.total_empleados_asignados > 0}
                    >
                      <Trash2 className={`w-4 h-4 ${oficina.total_empleados_asignados > 0 ? 'text-gray-400' : 'text-red-600'}`} />
                    </button>
                  </div>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-amber-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-amber-700">
                      <Users className="w-5 h-5" />
                      <div>
                        <p className="text-2xl font-bold">
                          {oficina.empleados_presentes}
                        </p>
                        <p className="text-xs">Presentes</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-blue-700">
                      <Users className="w-5 h-5" />
                      <div>
                        <p className="text-2xl font-bold">
                          {oficina.total_empleados_asignados}
                        </p>
                        <p className="text-xs">Asignados</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información GPS */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div>
                      <span className="font-medium">Latitud:</span> {oficina.latitud.toFixed(6)}
                    </div>
                    <div>
                      <span className="font-medium">Longitud:</span> {oficina.longitud.toFixed(6)}
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium">Radio:</span> {oficina.radio_metros}m
                    </div>
                  </div>
                </div>

                {/* Botón ver en mapa */}
                <button
                  onClick={() => handleAbrirMaps(oficina)}
                  className="btn-glass w-full flex items-center justify-center gap-2 text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  Ver en Google Maps
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Modal Crear/Editar */}
        <Modal
          isOpen={modalAbierto}
          onClose={handleCerrarModal}
          title={modoModal === 'crear' ? 'Nueva Oficina' : 'Editar Oficina'}
          size="lg"
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

            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Oficina *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Oficina Central"
                className={`input-glass w-full ${erroresForm.nombre ? 'border-red-500' : ''}`}
              />
              {erroresForm.nombre && (
                <p className="text-red-600 text-sm mt-1">{erroresForm.nombre}</p>
              )}
            </div>

            {/* Dirección */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección *
              </label>
              <input
                type="text"
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                placeholder="Av. Siempre Viva 123, Buenos Aires"
                className={`input-glass w-full ${erroresForm.direccion ? 'border-red-500' : ''}`}
              />
              {erroresForm.direccion && (
                <p className="text-red-600 text-sm mt-1">{erroresForm.direccion}</p>
              )}
            </div>

            {/* Coordenadas GPS */}
            <div className="border border-amber-200 rounded-lg p-4 bg-amber-50/50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-800">Coordenadas GPS</h4>
                <button
                  type="button"
                  onClick={handleObtenerUbicacion}
                  className="btn-glass px-3 py-1 text-sm flex items-center gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  Usar mi ubicación
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Latitud */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitud *
                  </label>
                  <input
                    type="text"
                    value={formData.latitud}
                    onChange={(e) => setFormData({ ...formData, latitud: e.target.value })}
                    placeholder="-34.603722"
                    className={`input-glass w-full ${erroresForm.latitud ? 'border-red-500' : ''}`}
                  />
                  {erroresForm.latitud && (
                    <p className="text-red-600 text-sm mt-1">{erroresForm.latitud}</p>
                  )}
                </div>

                {/* Longitud */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitud *
                  </label>
                  <input
                    type="text"
                    value={formData.longitud}
                    onChange={(e) => setFormData({ ...formData, longitud: e.target.value })}
                    placeholder="-58.381592"
                    className={`input-glass w-full ${erroresForm.longitud ? 'border-red-500' : ''}`}
                  />
                  {erroresForm.longitud && (
                    <p className="text-red-600 text-sm mt-1">{erroresForm.longitud}</p>
                  )}
                </div>
              </div>

              <p className="text-xs text-gray-600 mt-2">
                Puedes usar Google Maps para obtener las coordenadas exactas
              </p>
            </div>

            {/* Radio de alcance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Radio de alcance (metros) *
              </label>
              <input
                type="number"
                value={formData.radio_metros}
                onChange={(e) => setFormData({ ...formData, radio_metros: e.target.value })}
                placeholder="100"
                min="10"
                max="1000"
                className={`input-glass w-full ${erroresForm.radio_metros ? 'border-red-500' : ''}`}
              />
              {erroresForm.radio_metros && (
                <p className="text-red-600 text-sm mt-1">{erroresForm.radio_metros}</p>
              )}
              <p className="text-xs text-gray-600 mt-1">
                Distancia máxima permitida para marcar asistencia (entre 10 y 1000 metros)
              </p>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default Oficinas;