import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

/**
 * Componente Toast para notificaciones elegantes
 * Soporta 4 tipos: success, error, info, warning
 */
function Toast({ message, type = 'info', duration = 4000, onClose }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  // Configuración por tipo
  const config = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-800',
      iconColor: 'text-emerald-600',
      progressColor: 'bg-emerald-600'
    },
    error: {
      icon: AlertCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      iconColor: 'text-red-600',
      progressColor: 'bg-red-600'
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-800',
      iconColor: 'text-amber-600',
      progressColor: 'bg-amber-600'
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-600',
      progressColor: 'bg-blue-600'
    }
  };

  const { icon: Icon, bgColor, borderColor, textColor, iconColor, progressColor } = config[type] || config.info;

  return (
    <div
      className={`${bgColor} ${borderColor} ${textColor} rounded-lg border shadow-lg p-4 min-w-[300px] max-w-md animate-slide-in-right`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {/* Icono */}
        <Icon className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`} />
        
        {/* Mensaje */}
        <p className="flex-1 text-sm font-medium leading-relaxed">
          {message}
        </p>
        
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className={`${iconColor} hover:opacity-70 transition-opacity flex-shrink-0`}
          aria-label="Cerrar notificación"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {/* Barra de progreso */}
      {duration > 0 && (
        <div className="mt-3 h-1 bg-white/50 rounded-full overflow-hidden">
          <div
            className={`h-full ${progressColor} animate-progress`}
            style={{ animationDuration: `${duration}ms` }}
          />
        </div>
      )}
    </div>
  );
}

export default Toast;