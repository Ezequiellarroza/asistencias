import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

/**
 * Modal de confirmación elegante para reemplazar confirm()
 */
function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = '¿Estás seguro?',
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'warning', // 'warning' | 'danger'
  loading = false
}) {
  const handleConfirm = () => {
    onConfirm();
  };

  const buttonClass = type === 'danger' 
    ? 'bg-red-600 hover:bg-red-700 text-white'
    : 'btn-glass-primary';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button
            onClick={onClose}
            className="btn-glass px-4 py-2"
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`${buttonClass} px-4 py-2`}
          >
            {loading ? 'Procesando...' : confirmText}
          </button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        {type === 'danger' && (
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        )}
        {type === 'warning' && (
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        )}
        <div className="flex-1">
          <p className="text-gray-700 leading-relaxed">
            {message}
          </p>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmModal;