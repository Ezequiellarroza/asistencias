import { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Componente Modal Reutilizable
 * 
 * @param {boolean} isOpen - Controla si el modal está abierto
 * @param {function} onClose - Función para cerrar el modal
 * @param {string} title - Título del modal
 * @param {ReactNode} children - Contenido del modal
 * @param {ReactNode} footer - Footer con botones (opcional)
 * @param {string} size - Tamaño: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
 * @param {boolean} closeOnBackdrop - Cerrar al hacer clic fuera (default: true)
 * @param {boolean} closeOnEsc - Cerrar con tecla ESC (default: true)
 */
function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer = null,
  size = 'md',
  closeOnBackdrop = true,
  closeOnEsc = true
}) {
  
  // Manejar tecla ESC
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;

    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose, closeOnEsc]);

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Si no está abierto, no renderizar nada
  if (!isOpen) return null;

  // Tamaños del modal
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  // Manejar click en el backdrop
  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div 
        className={`glass-card w-full ${sizes[size]} max-h-[90vh] flex flex-col animate-scaleIn`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-amber-200/30">
          <h2 className="text-xl font-bold text-gray-800">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-amber-100/50 transition-colors text-gray-600 hover:text-gray-800"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-amber-200/30">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;