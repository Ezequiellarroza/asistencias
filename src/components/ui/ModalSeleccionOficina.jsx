import { useState, useEffect } from 'react';
import { MapPin, AlertCircle, CheckCircle, Building2, Loader2 } from 'lucide-react';
import Modal from '../ui/Modal';
import marcacionService from '../../services/marcacionService';

/**
 * Modal para seleccionar oficina al marcar entrada/salida
 * 
 * @param {boolean} isOpen - Controla si el modal está abierto
 * @param {function} onClose - Función para cerrar el modal
 * @param {string} tipo - Tipo de marcación: 'entrada' o 'salida'
 * @param {number} latitud - Latitud GPS del empleado
 * @param {number} longitud - Longitud GPS del empleado
 * @param {function} onConfirmar - Callback al confirmar selección (recibe oficinaId)
 */
function ModalSeleccionOficina({ 
  isOpen, 
  onClose, 
  tipo, 
  latitud, 
  longitud,
  onConfirmar 
}) {
  const [oficinas, setOficinas] = useState([]);
  const [oficinaSeleccionada, setOficinaSeleccionada] = useState(null);
  const [oficinaAsignadaId, setOficinaAsignadaId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
  if (isOpen) {
    cargarOficinas();
  }
}, [isOpen, latitud, longitud]);

  const cargarOficinas = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await marcacionService.obtenerOficinas(latitud, longitud);
      
      if (data.oficinas && data.oficinas.length > 0) {
        setOficinas(data.oficinas);
        setOficinaAsignadaId(data.oficina_asignada_id);
        
        // Pre-seleccionar la primera oficina (la más cercana)
        setOficinaSeleccionada(data.oficinas[0]);
      } else {
        setError('No hay oficinas disponibles');
      }
    } catch (err) {
      console.error('Error al cargar oficinas:', err);
      setError(err.message || 'Error al cargar oficinas');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmar = () => {
    if (!oficinaSeleccionada) {
      setError('Por favor selecciona una oficina');
      return;
    }
    onConfirmar(oficinaSeleccionada.id);
  };

  const handleClose = () => {
    setOficinaSeleccionada(null);
    setOficinas([]);
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Seleccionar Oficina - ${tipo === 'entrada' ? 'Entrada' : 'Salida'}`}
      size="lg"
      footer={
        <>
          <button
            onClick={handleClose}
            className="btn-glass px-4 py-2"
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            onClick={handleConfirmar}
            disabled={!oficinaSeleccionada || loading}
            className="btn-glass-primary px-4 py-2 flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Confirmar {tipo === 'entrada' ? 'Entrada' : 'Salida'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
       {/* Información GPS */}
{latitud && longitud ? (
  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
    <div className="flex items-start gap-2">
      <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-medium text-blue-800">
          Tu ubicación GPS
        </p>
        <p className="text-xs text-blue-600 mt-1">
          Lat: {latitud?.toFixed(6)}, Lng: {longitud?.toFixed(6)}
        </p>
      </div>
    </div>
  </div>
) : (
  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
    <div className="flex items-start gap-2">
      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-medium text-amber-800">
          Sin ubicación GPS
        </p>
        <p className="text-xs text-amber-700 mt-1">
          La marcación se registrará sin ubicación. Se notificará al administrador.
        </p>
      </div>
    </div>
  </div>
)}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Lista de oficinas */}
        {!loading && !error && oficinas.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Selecciona la oficina donde estás marcando tu {tipo}:
            </p>

            {oficinas.map((oficina) => {
              const esAsignada = oficina.id === oficinaAsignadaId;
              const estaSeleccionada = oficinaSeleccionada?.id === oficina.id;
              const dentroRango = oficina.dentro_rango;

              return (
                <button
                  key={oficina.id}
                  onClick={() => setOficinaSeleccionada(oficina)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    estaSeleccionada
                      ? 'border-emerald-500 bg-emerald-50 shadow-md'
                      : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Nombre y badges */}
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <Building2 className="w-5 h-5 text-gray-700 flex-shrink-0" />
                        <h3 className="font-semibold text-gray-800">
                          {oficina.nombre}
                        </h3>
                        
                        {esAsignada && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            Tu oficina
                          </span>
                        )}
                      </div>

                      {/* Dirección */}
                      <p className="text-sm text-gray-600 mb-2">
                        {oficina.direccion}
                      </p>

                      {/* Distancia y estado */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700 font-medium">
                            {Math.round(oficina.distancia_metros)}m
                          </span>
                        </div>

                        {dentroRango ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <CheckCircle className="w-3 h-3" />
                            Dentro del rango
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                            <AlertCircle className="w-3 h-3" />
                            Fuera del rango ({oficina.radio_metros}m)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Indicador de selección */}
                    {estaSeleccionada && (
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Información adicional */}
        {!loading && !error && oficinaSeleccionada && !oficinaSeleccionada.dentro_rango && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  Estás fuera del rango de la oficina
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  La marcación se registrará, pero se generará una alerta para supervisión.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default ModalSeleccionOficina;