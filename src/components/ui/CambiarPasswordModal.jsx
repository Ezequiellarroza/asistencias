import { useState } from 'react';
import { RefreshCw, Eye, EyeOff } from 'lucide-react';
import Modal from './Modal';
import adminService from '../../services/adminService';
import { useToast } from '../../hooks/useToast';

/**
 * Modal para cambiar contraseña de usuario administrador
 */
function CambiarPasswordModal({ isOpen, onClose, usuario, onPasswordCambiada }) {
   const { toast } = useToast();
  const [formData, setFormData] = useState({
    nuevaPassword: '',
    confirmarPassword: ''
  });
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  // Reset al abrir/cerrar
  const handleClose = () => {
    setFormData({
      nuevaPassword: '',
      confirmarPassword: ''
    });
    setErrores({});
    setMostrarPassword(false);
    setMostrarConfirmar(false);
    onClose();
  };

  // Validar formulario
  const validarFormulario = () => {
    const erroresValidacion = {};

    if (!formData.nuevaPassword) {
      erroresValidacion.nuevaPassword = 'La nueva contraseña es requerida';
    } else if (formData.nuevaPassword.length < 6) {
      erroresValidacion.nuevaPassword = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!formData.confirmarPassword) {
      erroresValidacion.confirmarPassword = 'Debes confirmar la contraseña';
    } else if (formData.nuevaPassword !== formData.confirmarPassword) {
      erroresValidacion.confirmarPassword = 'Las contraseñas no coinciden';
    }

    setErrores(erroresValidacion);
    return Object.keys(erroresValidacion).length === 0;
  };

  // Guardar nueva contraseña
  const handleGuardar = async () => {
    if (!validarFormulario()) {
      return;
    }

    setGuardando(true);

    try {
      await adminService.cambiarPasswordAdmin(usuario.id, formData.nuevaPassword);
      toast.success('Contraseña actualizada exitosamente');
      
      // Cerrar y notificar éxito
      handleClose();
      if (onPasswordCambiada) {
        onPasswordCambiada();
      }
      
     
    } catch (err) {
      console.error('Error al cambiar contraseña:', err);
      setErrores({ general: err.message || 'Error al cambiar contraseña' });
    } finally {
      setGuardando(false);
    }
  };

  if (!usuario) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Cambiar Contraseña"
      size="sm"
      footer={
        <>
          <button
            onClick={handleClose}
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
              'Cambiar Contraseña'
            )}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Información del usuario */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <span className="font-semibold">Usuario:</span> {usuario.username}
          </p>
          <p className="text-sm text-amber-800">
            <span className="font-semibold">Nombre:</span> {usuario.nombre}
          </p>
        </div>

        {/* Error general */}
        {errores.general && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {errores.general}
          </div>
        )}

        {/* Nueva contraseña */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nueva Contraseña *
          </label>
          <div className="relative">
            <input
              type={mostrarPassword ? 'text' : 'password'}
              value={formData.nuevaPassword}
              onChange={(e) => setFormData({ ...formData, nuevaPassword: e.target.value })}
              placeholder="Mínimo 6 caracteres"
              className={`input-glass w-full pr-10 ${errores.nuevaPassword ? 'border-red-500' : ''}`}
            />
            <button
              type="button"
              onClick={() => setMostrarPassword(!mostrarPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {mostrarPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errores.nuevaPassword && (
            <p className="text-red-600 text-sm mt-1">{errores.nuevaPassword}</p>
          )}
        </div>

        {/* Confirmar contraseña */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirmar Contraseña *
          </label>
          <div className="relative">
            <input
              type={mostrarConfirmar ? 'text' : 'password'}
              value={formData.confirmarPassword}
              onChange={(e) => setFormData({ ...formData, confirmarPassword: e.target.value })}
              placeholder="Repite la contraseña"
              className={`input-glass w-full pr-10 ${errores.confirmarPassword ? 'border-red-500' : ''}`}
            />
            <button
              type="button"
              onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {mostrarConfirmar ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errores.confirmarPassword && (
            <p className="text-red-600 text-sm mt-1">{errores.confirmarPassword}</p>
          )}
        </div>

        {/* Información adicional */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
          <p className="font-medium mb-1">Requisitos de seguridad:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Mínimo 6 caracteres</li>
            <li>Ambas contraseñas deben coincidir</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}

export default CambiarPasswordModal;