import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Clock, MapPin, CheckCircle, XCircle, Loader2, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import useGeolocation from '../../hooks/useGeolocation';

function Dashboard() {
  const [estado, setEstado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [empleado, setEmpleado] = useState(null);
  const [oficina, setOficina] = useState(null);
  
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { location, error: gpsError, loading: gpsLoading, getLocation } = useGeolocation();

  useEffect(() => {
    // Cargar datos del localStorage
    const empleadoData = localStorage.getItem('empleado');
    const oficinaData = localStorage.getItem('oficina');

    // Si llegamos acá, ProtectedRoute ya validó que user existe
    // Solo necesitamos cargar los datos adicionales
    if (empleadoData) {
      setEmpleado(JSON.parse(empleadoData));
    }
    
    if (oficinaData) {
      setOficina(JSON.parse(oficinaData));
    }

    cargarEstado();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ← Array vacío - solo se ejecuta una vez al montar el componente

  const cargarEstado = async () => {
    const token = localStorage.getItem('jwt_token');
    
    try {
      const response = await fetch('https://ezequiellarroza.com.ar/api/estado.php', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (data.success) {
        setEstado(data.data);
      }
    } catch (err) {
      console.error('Error al cargar estado:', err);
    } finally {
      setLoading(false);
    }
  };

  const calcularDistancia = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distancia en metros
  };

  const handleMarcar = async (tipo) => {
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Obtener ubicación GPS actual
      const ubicacion = await getLocation();

      if (!ubicacion || !ubicacion.latitud || !ubicacion.longitud) {
        throw new Error('No se pudo obtener la ubicación GPS');
      }

      // Verificar que estamos en rango (validación en el frontend también)
      if (oficina) {
        const distancia = calcularDistancia(
          ubicacion.latitud,
          ubicacion.longitud,
          parseFloat(oficina.latitud),
          parseFloat(oficina.longitud)
        );

        // NO bloqueamos la marcación, solo guardamos la distancia
        // El backend generará alerta automáticamente si está fuera de rango
      }

      // Llamar al backend para marcar
      const token = localStorage.getItem('jwt_token');
      const endpoint = tipo === 'entrada' ? '/marcar-entrada.php' : '/marcar-salida.php';
      
      const response = await fetch(`https://ezequiellarroza.com.ar/api${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitud: ubicacion.latitud,
          longitud: ubicacion.longitud
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.mensaje || `${tipo === 'entrada' ? 'Entrada' : 'Salida'} registrada exitosamente`);
        // Recargar estado
        await cargarEstado();
      } else {
        throw new Error(data.mensaje || 'Error al registrar marcación');
      }
    } catch (err) {
      console.error('Error al marcar:', err);
      setError(err.message || 'Error al registrar marcación');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    // Usar el método logout del AuthContext que limpia todo correctamente
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

  const trabajando = estado?.estado_hoy?.trabajando_actualmente || false;

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

        {/* Botón de historial */}
        <button
          onClick={() => navigate('/empleado/historial')}
          className="glass-card p-4 w-full hover:shadow-lg transition-all"
        >
          <div className="flex items-center justify-center gap-2 text-gray-700">
            <Calendar className="w-5 h-5" />
            <span className="font-medium">Ver Historial</span>
          </div>
        </button>
      </div>
    </div>
  );
}

export default Dashboard;