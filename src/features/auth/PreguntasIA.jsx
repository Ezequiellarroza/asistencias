import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Brain } from 'lucide-react';

function PreguntasIA() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const telefono = location.state?.telefono;

  const handleContinuar = () => {
    // Simular que pasó las preguntas
    login({ telefono, tipo: 'empleado' });
    navigate('/empleado/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md fade-in">
        <div className="glass-card p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-xl">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Preguntas de Verificación
          </h2>
          <p className="text-gray-600 mb-4">
            Teléfono: {telefono}
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Aquí aparecerán las 5 preguntas generadas por Claude AI
          </p>
          <button
            onClick={handleContinuar}
            className="btn-glass-primary w-full py-4 px-6 font-semibold"
          >
            Continuar (Temporal)
          </button>
        </div>
      </div>
    </div>
  );
}

export default PreguntasIA;