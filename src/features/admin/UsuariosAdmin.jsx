import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Shield,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Key,
  Mail,
  User
} from 'lucide-react';
import adminService from '../../services/adminService';
import Modal from '../../components/ui/Modal';
import CambiarPasswordModal from '../../components/ui/CambiarPasswordModal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { useToast } from '../../hooks/useToast';

function UsuariosAdmin() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Estados principales
  const [usuarios, setUsuarios] = useState([]);

  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Estados del modal crear/editar
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoModal, setModoModal] = useState('crear'); // 'crear' | 'editar'
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // Estados del modal cambiar password
  const [modalPasswordAbierto, setModalPasswordAbierto] = useState(false);
  const [usuarioPassword, setUsuarioPassword] = useState(null);

  // Estados del modal de confirmación
  const [modalConfirmAbierto, setModalConfirmAbierto] = useState(false);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  // Estados del formulario
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nombre: '',
    email: ''
  });
  const [erroresForm, setErroresForm] = useState({});

  // Cargar usuarios admin
  const cargarUsuarios = async () => {
    try {
      setError('');
      const data = await adminService.getUsuariosAdmin(false);
      setUsuarios(data.usuarios || []);
    } catch (err) {
      console.error('Error al cargar usuarios admin:', err);
      if (err.message === 'No autenticado') {
        setError('Tu sesión ha expirado. Redirigiendo al login...');
      } else {
        setError(err.message || 'Error al cargar usuarios administradores');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Cargar al montar
  useEffect(() => {
    cargarUsuarios();
  }, []);

  // Handlers
  const handleRefresh = () => {
    setRefreshing(true);
    cargarUsuarios();
  };

  // Handlers del modal crear/editar
  const handleAbrirModalCrear = () => {
    setModoModal('crear');
    setUsuarioSeleccionado(null);
    setFormData({
      username: '',
      password: '',
      nombre: '',
      email: ''
    });
    setErroresForm({});
    setModalAbierto(true);
  };

  const handleAbrirModalEditar = (usuario) => {
    setModoModal('editar');
    setUsuarioSeleccionado(usuario);
    setFormData({
      username: usuario.username,
      password: '', // No se edita aquí
      nombre: usuario.nombre,
      email: usuario.email
    });
    setErroresForm({});
    setModalAbierto(true);
  };

  const handleCerrarModal = () => {
    setModalAbierto(false);
    setUsuarioSeleccionado(null);
    setFormData({
      username: '',
      password: '',
      nombre: '',
      email: ''
    });
    setErroresForm({});
  };

  // Handler del modal cambiar password
  const handleAbrirModalPassword = (usuario) => {
    setUsuarioPassword(usuario);
    setModalPasswordAbierto(true);
  };

  const handleCerrarModalPassword = () => {
    setModalPasswordAbierto(false);
    setUsuarioPassword(null);
  };

  const handlePasswordCambiada = () => {
    handleCerrarModalPassword();
  };

  // Handlers del modal de confirmación eliminar
  const handleAbrirConfirmEliminar = (usuario) => {
    if (usuario.es_usuario_actual) {
      toast.warning('No puedes eliminar tu propio usuario');
      return;
    }
    setUsuarioAEliminar(usuario);
    setModalConfirmAbierto(true);
  };

  const handleCerrarConfirmEliminar = () => {
    setModalConfirmAbierto(false);
    setUsuarioAEliminar(null);
  };

  const handleConfirmEliminar = async () => {
    if (!usuarioAEliminar) return;

    setEliminando(true);

    try {
      await adminService.eliminarUsuarioAdmin(usuarioAEliminar.id);
      toast.success(`Usuario "${usuarioAEliminar.username}" desactivado exitosamente`);
      handleCerrarConfirmEliminar();
      cargarUsuarios();
    } catch (err) {
      console.error('Error al eliminar usuario admin:', err);
      toast.error(err.message || 'Error al desactivar usuario administrador');
    } finally {
      setEliminando(false);
    }
  };

  // Validar formulario
  const validarFormulario = () => {
    const errores = {};

    if (!formData.username.trim()) {
      errores.username = 'El username es requerido';
    }

    if (modoModal === 'crear' && !formData.password.trim()) {
      errores.password = 'La contraseña es requerida';
    }

    if (modoModal === 'crear' && formData.password.length < 6) {
      errores.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!formData.nombre.trim()) {
      errores.nombre = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      errores.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errores.email = 'El formato del email no es válido';
    }

    setErroresForm(errores);
    return Object.keys(errores).length === 0;
  };

  // Guardar usuario admin
  const handleGuardar = async () => {
    if (!validarFormulario()) {
      return;
    }

    setGuardando(true);

    try {
      const datos = {
        username: formData.username.trim(),
        nombre: formData.nombre.trim(),
        email: formData.email.trim()
      };

      if (modoModal === 'crear') {
        datos.password = formData.password;
        await adminService.crearUsuarioAdmin(datos);
        toast.success(`Usuario "${datos.username}" creado exitosamente`);
      } else {
        await adminService.actualizarUsuarioAdmin(usuarioSeleccionado.id, datos);
        toast.success(`Usuario "${datos.username}" actualizado exitosamente`);
      }

      handleCerrarModal();
      cargarUsuarios();
    } catch (err) {
      console.error('Error al guardar usuario admin:', err);
      setErroresForm({ general: err.message || 'Error al guardar usuario administrador' });
    } finally {
      setGuardando(false);
    }
  };

  // Navegar con transición
  const handleVolver = () => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        navigate('/admin/dashboard');
      });
    } else {
      navigate('/admin/dashboard');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <RefreshCw className="w-12 h-12 text-amber-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando usuarios administradores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handleVolver}
                className="btn-glass p-2"
                aria-label="Volver"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Gestión de Usuarios Administradores
                </h1>
                <p className="text-sm text-gray-600">
                  {usuarios.length} usuarios administradores activos
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="btn-glass px-4 py-2 flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Actualizar</span>
              </button>
              <button
                onClick={handleAbrirModalCrear}
                className="btn-glass-primary px-4 py-2 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nuevo Usuario Admin
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="glass-card p-4 mb-6 border-l-4 border-red-500">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Lista de usuarios */}
        {usuarios.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No hay usuarios administradores
            </h3>
            <p className="text-gray-600 mb-4">
              Crea el primer usuario administrador para gestionar el sistema
            </p>
            <button
              onClick={handleAbrirModalCrear}
              className="btn-glass-primary px-6 py-2"
            >
              Crear Primer Usuario Admin
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {usuarios.map(usuario => (
              <div
                key={usuario.id}
                className={`glass-card p-6 hover:shadow-lg transition-shadow ${usuario.es_usuario_actual ? 'ring-2 ring-amber-400' : ''}`}
              >
                {/* Header de la card */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-5 h-5 text-amber-600" />
                      <h3 className="text-xl font-bold text-gray-800">
                        {usuario.username}
                      </h3>
                      {usuario.es_usuario_actual && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
                          Tú
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAbrirModalEditar(usuario)}
                      className="btn-glass p-2"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleAbrirModalPassword(usuario)}
                      className="btn-glass p-2"
                      title="Cambiar Contraseña"
                    >
                      <Key className="w-4 h-4 text-purple-600" />
                    </button>
                    <button
                      onClick={() => handleAbrirConfirmEliminar(usuario)}
                      className="btn-glass p-2"
                      title="Desactivar"
                      disabled={usuario.es_usuario_actual}
                    >
                      <Trash2 className={`w-4 h-4 ${usuario.es_usuario_actual ? 'text-gray-400' : 'text-red-600'}`} />
                    </button>
                  </div>
                </div>

                {/* Información del usuario */}
                <div className="space-y-3">
                  {/* Nombre */}
                  <div className="flex items-center gap-3 text-gray-700">
                    <User className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{usuario.nombre}</p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-center gap-3 text-gray-700">
                    <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm break-all">{usuario.email}</p>
                    </div>
                  </div>
                </div>

                {/* Información adicional */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Creado: {new Date(usuario.creado_en).toLocaleDateString('es-AR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Crear/Editar */}
        <Modal
          isOpen={modalAbierto}
          onClose={handleCerrarModal}
          title={modoModal === 'crear' ? 'Nuevo Usuario Administrador' : 'Editar Usuario Administrador'}
          size="md"
          footer={
            <>
              <button
                onClick={handleCerrarModal}
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
                  'Guardar'
                )}
              </button>
            </>
          }
        >
          <div className="space-y-4">
            {/* Error general */}
            {erroresForm.general && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {erroresForm.general}
              </div>
            )}

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username *
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Ej: admin, maria.garcia"
                className={`input-glass w-full ${erroresForm.username ? 'border-red-500' : ''}`}
                maxLength={50}
              />
              {erroresForm.username && (
                <p className="text-red-600 text-sm mt-1">{erroresForm.username}</p>
              )}
            </div>

            {/* Password (solo en crear) */}
            {modoModal === 'crear' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  className={`input-glass w-full ${erroresForm.password ? 'border-red-500' : ''}`}
                />
                {erroresForm.password && (
                  <p className="text-red-600 text-sm mt-1">{erroresForm.password}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  La contraseña debe tener al menos 6 caracteres
                </p>
              </div>
            )}

            {/* Mensaje en modo editar */}
            {modoModal === 'editar' && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
                Para cambiar la contraseña, usa el botón de "Cambiar Contraseña" en la lista de usuarios.
              </div>
            )}

            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre Completo *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: María García"
                className={`input-glass w-full ${erroresForm.nombre ? 'border-red-500' : ''}`}
                maxLength={100}
              />
              {erroresForm.nombre && (
                <p className="text-red-600 text-sm mt-1">{erroresForm.nombre}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="ejemplo@correo.com"
                className={`input-glass w-full ${erroresForm.email ? 'border-red-500' : ''}`}
                maxLength={100}
              />
              {erroresForm.email && (
                <p className="text-red-600 text-sm mt-1">{erroresForm.email}</p>
              )}
            </div>
          </div>
        </Modal>

        {/* Modal Cambiar Password */}
        <CambiarPasswordModal
          isOpen={modalPasswordAbierto}
          onClose={handleCerrarModalPassword}
          usuario={usuarioPassword}
          onPasswordCambiada={handlePasswordCambiada}
        />

        {/* Modal de Confirmación Eliminar */}
        <ConfirmModal
          isOpen={modalConfirmAbierto}
          onClose={handleCerrarConfirmEliminar}
          onConfirm={handleConfirmEliminar}
          title="Desactivar Usuario Administrador"
          message={`¿Estás seguro de desactivar al usuario administrador "${usuarioAEliminar?.username}"? Esta acción se puede revertir más adelante.`}
          confirmText="Desactivar"
          cancelText="Cancelar"
          type="danger"
          loading={eliminando}
        />
      </div>
    </div>
  );
}

export default UsuariosAdmin;