import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Clock, MapPin, CheckCircle, XCircle, Loader2, CheckSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import useGeolocation from '../../hooks/useGeolocation';
import marcacionService from '../../services/marcacionService';
import ModalSeleccionOficina from '../../components/ui/ModalSeleccionOficina';
import ConfirmModal from '../../components/ui/ConfirmModal';

function Dashboard() {
  const [estado, setEstado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [empleado, setEmpleado] = useState(null);
  const [oficina, setOficina] = useState(null);
  
  // Estados para el modal de selección de oficina
  const [modalAbierto, setModalAbierto] = useState(false);
  const [tipoMarcacion, setTipoMarcacion] = useState(null); // 'entrada' o 'salida'

  // Estados para el modal de confirmación preventivo
  const [confirmModalAbierto, setConfirmModalAbierto] = useState(false);
  const [mensajeConfirmacion, setMensajeConfirmacion] = useState('');
  const [textoBotonConfirmar, setTextoBotonConfirmar] = useState('');
  
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { location, error: gpsError, loading: gpsLoading, getLocation } = useGeolocation();

  useEffect(() => {
    // Cargar datos del localStorage
    const empleadoData = localStorage.getItem('empleado');
    const oficinaData = localStorage.getItem('oficina');

    if (empleadoData) {
      setEmpleado(JSON.parse(empleadoData));
    }
    
    if (oficinaData) {
      setOficina(JSON.parse(oficinaData));
    }

    cargarEstado();
  }, []);

  const cargarEstado = async () => {
    try {
      const data = await marcacionService.obtenerEstado();
      setEstado(data);
    } catch (err) {
      console.error('Error al cargar estado:', err);
      if (err.message === 'No autenticado') {
        setError('Tu sesión ha expirado. Redirigiendo al login...');
      }
    } finally {
      setLoading(false);
    }
  };

  // Variable trabajando calculada para usar en handleMarcar
  const trabajando = estado?.estado_hoy?.trabajando_actualmente || false;

  const handleMarcar = async (tipo) => {
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Intentar obtener ubicación, pero no bloquear si falla
      try {
        await getLocation();
      } catch (gpsErr) {
        console.warn('No se pudo obtener GPS:', gpsErr.message);
        // Continuar sin GPS - se generará alerta en el backend
      }

      setTipoMarcacion(tipo);

      // Verificar si necesita confirmación preventiva
      if (tipo === 'entrada' && trabajando) {
        // Ya tiene entrada sin salida
        const horaEntrada = estado?.estado_hoy?.hora_entrada || 'hora desconocida';
        setMensajeConfirmacion(`Ya tenés una entrada registrada a las ${horaEntrada}. ¿Estás seguro que querés registrar una nueva entrada?`);
        setTextoBotonConfirmar('Sí, registrar entrada');
        setConfirmModalAbierto(true);
      } else if (tipo === 'salida' && !trabajando) {
        // No tiene entrada registrada
        setMensajeConfirmacion('No tenés entrada registrada hoy. ¿Estás seguro que querés registrar una salida?');
        setTextoBotonConfirmar('Sí, registrar salida');
        setConfirmModalAbierto(true);
      } else {
        // Flujo normal - abrir modal de oficina directamente
        setModalAbierto(true);
      }

    } catch (err) {
      console.error('Error inesperado:', err);
      setError(err.message || 'Error inesperado');
    } finally {
      setSubmitting(false);
    }
  };

  // Handler para cuando el usuario confirma la advertencia
  const handleConfirmarAdvertencia = () => {
    setConfirmModalAbierto(false);
    setModalAbierto(true); // Continuar con el flujo normal
  };
  const handleConfirmarMarcacion = async (oficinaId) => {
  setSubmitting(true);
  setModalAbierto(false);

  try {
    // Intentar obtener ubicación actualizada, pero no bloquear si falla
    let ubicacionActual = { latitud: null, longitud: null };
    let motivoSinGPS = null;
    
    try {
      const gps = await getLocation();
      if (gps && gps.latitud && gps.longitud) {
        ubicacionActual = gps;
      }
    } catch (gpsErr) {
      console.warn('No se pudo obtener GPS:', gpsErr.message);
      motivoSinGPS = gpsErr.message;
    }
    
    let data;
    if (tipoMarcacion === 'entrada') {
      data = await marcacionService.marcarEntrada(
        ubicacionActual.latitud, 
        ubicacionActual.longitud,
        oficinaId,
        motivoSinGPS
      );
    } else {
      data = await marcacionService.marcarSalida(
        ubicacionActual.latitud, 
        ubicacionActual.longitud,
        oficinaId,
        motivoSinGPS
      );
    }

    // Mostrar mensaje con advertencia si no hubo GPS
    let mensaje = data.mensaje || `${tipoMarcacion === 'entrada' ? 'Entrada' : 'Salida'} registrada exitosamente`;
    if (!ubicacionActual.latitud) {
      mensaje += ' (sin ubicación GPS)';
    }
    setSuccess(mensaje);
    await cargarEstado();

  } catch (err) {
    console.error('Error al marcar:', err);
    if (err.message === 'No autenticado') {
      setError('Tu sesión ha expirado. Redirigiendo al login...');
    } else {
      setError(err.message || 'Error al registrar marcación');
    }
  } finally {
    setSubmitting(false);
  }
};

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-amber-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                ¡Hola, {empleado?.nombre}!
              </h1>
              <p className="text-gray-600 text-sm mt-1">{oficina?.nombre}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>

        {/* Estado actual */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-emerald-600" />
              <div>
                <p className="text-sm text-gray-600">Estado actual</p>
                <p className="text-xl font-bold text-gray-800">
                  {trabajando ? 'Trabajando' : 'Fuera de turno'}
                </p>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-full ${trabajando ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
              {trabajando ? 'Activo' : 'Inactivo'}
            </div>
          </div>
          
          {trabajando && estado?.estado_hoy?.hora_entrada && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Entrada: <span className="font-semibold text-gray-800">
                  {estado.estado_hoy.hora_entrada}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* GPS Status */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-5 h-5 text-gray-700" />
            <h2 className="font-semibold text-gray-800">Estado de GPS</h2>
          </div>
          
          {gpsLoading && (
            <p className="text-sm text-gray-600">Obteniendo ubicación...</p>
          )}
          
          {gpsError && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <XCircle className="w-4 h-4" />
              <span>{gpsError.message}</span>
            </div>
          )}
          
          {location.latitud && !gpsError && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>Ubicación disponible (precisión: {Math.round(location.accuracy)}m)</span>
            </div>
          )}
        </div>

        {/* Mensajes */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start gap-2">
            <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-start gap-2">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Botones de marcación */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => handleMarcar('entrada')}
            disabled={submitting || gpsLoading}
            className="glass-card p-6 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-800">Marcar Entrada</p>
                <p className="text-xs text-gray-600">Registrar inicio de jornada</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleMarcar('salida')}
            disabled={submitting || gpsLoading}
            className="glass-card p-6 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-800">Marcar Salida</p>
                <p className="text-xs text-gray-600">Registrar fin de jornada</p>
              </div>
            </div>
          </button>
        </div>

        {/* Botón de Tareas (centrado) */}
        <div className="max-w-md mx-auto">
          <button
            onClick={() => navigate('/empleado/tareas')}
            className="glass-card p-4 hover:shadow-lg transition-all w-full"
          >
            <div className="flex items-center justify-center gap-2 text-gray-700">
              <CheckSquare className="w-5 h-5" />
              <span className="font-medium">Mis Tareas</span>
            </div>
          </button>
        </div>
      </div>

      {/* Modal de Selección de Oficina */}
      <ModalSeleccionOficina
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        tipo={tipoMarcacion}
        latitud={location.latitud}
        longitud={location.longitud}
        onConfirmar={handleConfirmarMarcacion}
      />

      {/* Modal de Confirmación - Advertencia de marcación inconsistente */}
      <ConfirmModal
        isOpen={confirmModalAbierto}
        onClose={() => setConfirmModalAbierto(false)}
        onConfirm={handleConfirmarAdvertencia}
        title="Confirmar marcación"
        message={mensajeConfirmacion}
        confirmText={textoBotonConfirmar}
        cancelText="Cancelar"
        type="warning"
      />
    </div>
  );
}

export default Dashboard;