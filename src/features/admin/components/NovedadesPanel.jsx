import { useState, useEffect } from 'react';
import { X, CheckCircle, Clock, Sparkles, Loader2 } from 'lucide-react';
import adminService from '../../../services/adminService';

function NovedadesPanel({ isOpen, onClose }) {
  const [novedades, setNovedades] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      cargarNovedades();
    }
  }, [isOpen]);

  const cargarNovedades = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminService.getNovedades();
      setNovedades(data);
    } catch (err) {
      console.error('Error al cargar novedades:', err);
      setError(err.message || 'Error al cargar novedades');
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div
        className="glass-card w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-gray-800">Novedades del Sistema</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
            </div>
          )}

          {error && (
            <div className="text-center py-8 text-red-600">
              <p>{error}</p>
              <button
                onClick={cargarNovedades}
                className="mt-2 text-sm underline hover:no-underline"
              >
                Reintentar
              </button>
            </div>
          )}

          {!loading && !error && novedades && (
            <div className="space-y-6">
              {/* Implementado */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-semibold text-gray-800">Implementado</h3>
                </div>
                {novedades.implementado?.length > 0 ? (
                  <div className="space-y-2">
                    {novedades.implementado.map((item, index) => (
                      <div
                        key={index}
                        className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-gray-800">{item.titulo}</h4>
                          {item.fecha && (
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {formatearFecha(item.fecha)}
                            </span>
                          )}
                        </div>
                        {item.descripcion && (
                          <p className="text-sm text-gray-600 mt-1">{item.descripcion}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No hay novedades implementadas</p>
                )}
              </section>

              {/* Planificado */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-800">Proximamente</h3>
                </div>
                {novedades.planificado?.length > 0 ? (
                  <div className="space-y-2">
                    {novedades.planificado.map((item, index) => (
                      <div
                        key={index}
                        className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
                      >
                        <h4 className="font-medium text-gray-800">{item.titulo}</h4>
                        {item.descripcion && (
                          <p className="text-sm text-gray-600 mt-1">{item.descripcion}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No hay novedades planificadas</p>
                )}
              </section>
            </div>
          )}

          {!loading && !error && (!novedades ||
            (novedades.implementado?.length === 0 && novedades.planificado?.length === 0)) && (
            <div className="text-center py-12 text-gray-500">
              <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No hay novedades</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NovedadesPanel;
