import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Brain, Loader2, CheckCircle, XCircle } from 'lucide-react';

function PreguntasIA() {
  const [preguntas, setPreguntas] = useState([]);
  const [respuestas, setRespuestas] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [sessionToken, setSessionToken] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const empleadoId = location.state?.empleadoId;

  useEffect(() => {
    if (!empleadoId) {
      navigate('/');
      return;
    }

    cargarPreguntas();
  }, [empleadoId, navigate]);

  const cargarPreguntas = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://ezequiellarroza.com.ar/api/generar-preguntas.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ empleado_id: empleadoId })
      });

      const data = await response.json();

      if (data.success && data.data) {
        setPreguntas(data.data.preguntas);
        setSessionToken(data.data.session_token);
        
        // Inicializar respuestas vacías
        const respuestasIniciales = {};
        data.data.preguntas.forEach(p => {
          respuestasIniciales[p.id] = '';
        });
        setRespuestas(respuestasIniciales);
      } else {
        setError(data.mensaje || 'Error al cargar preguntas');
      }
    } catch (err) {
      console.error('Error al cargar preguntas:', err);
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleRespuestaChange = (preguntaId, valor) => {
    setRespuestas(prev => ({
      ...prev,
      [preguntaId]: valor
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Convertir respuestas a formato del backend
      const respuestasArray = Object.entries(respuestas).map(([id, respuesta]) => ({
        id: parseInt(id),
        respuesta: respuesta.trim()
      }));

      // Verificar que todas las respuestas tengan contenido
      const todasRespondidas = respuestasArray.every(r => r.respuesta.length > 0);
      if (!todasRespondidas) {
        setError('Por favor responde todas las preguntas');
        setSubmitting(false);
        return;
      }

      // Verificar respuestas con el backend
      const response = await fetch('https://ezequiellarroza.com.ar/api/verificar-respuesta.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_token: sessionToken,
          respuestas: respuestasArray
        })
      });

      const data = await response.json();

      if (data.success && data.data && data.data.token) {
        // Guardar JWT token
        localStorage.setItem('jwt_token', data.data.token);
        
        // Navegar al dashboard del empleado
        navigate('/empleado/dashboard');
      } else {
        setError(data.mensaje || 'Las respuestas no son correctas. Intenta nuevamente.');
      }
    } catch (err) {
      console.error('Error al verificar respuestas:', err);
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-700 font-medium">Generando preguntas personalizadas...</p>
          <p className="text-gray-500 text-sm mt-2">Esto puede tomar unos segundos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl fade-in">
        {/* Header Card */}
        <div className="glass-card p-8 mb-6 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-500 rounded-3xl flex items-center justify-center shadow-xl">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Verificación de Identidad
          </h1>
          <p className="text-gray-700 text-sm">
            Por favor responde las siguientes preguntas para confirmar tu identidad
          </p>
        </div>

        {/* Preguntas Form Card */}
        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {preguntas.map((pregunta, index) => (
              <div key={pregunta.id} className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-white text-xs mr-2">
                    {index + 1}
                  </span>
                  {pregunta.pregunta}
                </label>
                <textarea
                  required
                  value={respuestas[pregunta.id] || ''}
                  onChange={(e) => handleRespuestaChange(pregunta.id, e.target.value)}
                  rows={3}
                  className="input-glass w-full px-4 py-3 text-gray-800 resize-none focus:outline-none"
                  placeholder="Escribe tu respuesta aquí..."
                />
              </div>
            ))}

            {/* Mensaje de error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-glass-primary w-full py-4 px-6 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verificando respuestas...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Verificar Respuestas
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-600">
            Las preguntas son generadas por IA basándose en tu información personal
          </p>
        </div>
      </div>
    </div>
  );
}

export default PreguntasIA;