import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Briefcase,
  Plus,
  Edit,
  Trash2,
  Users,
  RefreshCw,
  CheckSquare
} from 'lucide-react';
import adminService from '../../services/adminService';
import Modal from '../../components/ui/Modal';

function Departamentos() {
  const navigate = useNavigate();

  // Estados principales
  const [departamentos, setDepartamentos] = useState([]);

  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Estados del modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoModal, setModoModal] = useState('crear'); // 'crear' | 'editar'
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // Estados del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  });
  const [erroresForm, setErroresForm] = useState({});

  // Cargar departamentos
  const cargarDepartamentos = async () => {
    try {
      setError('');
      const data = await adminService.getDepartamentos(false);
      setDepartamentos(data.departamentos || []);
    } catch (err) {
      console.error('Error al cargar departamentos:', err);
      if (err.message === 'No autenticado') {
        setError('Tu sesión ha expirado. Redirigiendo al login...');
      } else {
        setError(err.message || 'Error al cargar departamentos');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Cargar al montar
  useEffect(() => {
    cargarDepartamentos();
  }, []);

  // Handlers
  const handleRefresh = () => {
    setRefreshing(true);
    cargarDepartamentos();
  };

  // Handlers del modal
  const handleAbrirModalCrear = () => {
    setModoModal('crear');
    setDepartamentoSeleccionado(null);
    setFormData({
      nombre: '',
      descripcion: ''
    });
    setErroresForm({});
    setModalAbierto(true);
  };

  const handleAbrirModalEditar = (departamento) => {
    setModoModal('editar');
    setDepartamentoSeleccionado(departamento);
    setFormData({
      nombre: departamento.nombre,
      descripcion: departamento.descripcion || ''
    });
    setErroresForm({});
    setModalAbierto(true);
  };

  const handleCerrarModal = () => {
    setModalAbierto(false);
    setDepartamentoSeleccionado(null);
    setFormData({
      nombre: '',
      descripcion: ''
    });
    setErroresForm({});
  };

  // Validar formulario
  const validarFormulario = () => {
    const errores = {};

    if (!formData.nombre.trim()) {
      errores.nombre = 'El nombre es requerido';
    }

    setErroresForm(errores);
    return Object.keys(errores).length === 0;
  };

  // Guardar departamento
  const handleGuardar = async () => {
    if (!validarFormulario()) {
      return;
    }

    setGuardando(true);

    try {
      const datos = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || null
      };

      if (modoModal === 'crear') {
        await adminService.crearDepartamento(datos);
      } else {
        await adminService.actualizarDepartamento(departamentoSeleccionado.id, datos);
      }

      handleCerrarModal();
      cargarDepartamentos();
    } catch (err) {
      console.error('Error al guardar departamento:', err);
      setErroresForm({ general: err.message || 'Error al guardar departamento' });
    } finally {
      setGuardando(false);
    }
  };

  // Eliminar departamento
  const handleEliminar = async (departamento) => {
    if (departamento.total_empleados > 0) {
      alert('No se puede desactivar un departamento con empleados asignados. Reasigne los empleados primero.');
      return;
    }

    if (departamento.total_tareas > 0) {
      alert('No se puede desactivar un departamento con tareas asignadas. Reasigne o complete las tareas primero.');
      return;
    }

    if (!confirm(`¿Está seguro de desactivar el departamento "${departamento.nombre}"?`)) {
      return;
    }

    try {
      await adminService.eliminarDepartamento(departamento.id);
      cargarDepartamentos();
    } catch (err) {
      console.error('Error al eliminar departamento:', err);
      alert(err.message || 'Error al desactivar departamento');
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
          <p className="text-gray-600">Cargando departamentos...</p>
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
                  Gestión de Departamentos
                </h1>
                <p className="text-sm text-gray-600">
                  {departamentos.length} departamentos activos
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
                Nuevo Departamento
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

        {/* Lista de departamentos */}
        {departamentos.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No hay departamentos
            </h3>
            <p className="text-gray-600 mb-4">
              Crea el primer departamento para organizar a tus empleados
            </p>
            <button
              onClick={handleAbrirModalCrear}
              className="btn-glass-primary px-6 py-2"
            >
              Crear Primer Departamento
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departamentos.map(departamento => (
              <div
                key={departamento.id}
                className="glass-card p-6 hover:shadow-lg transition-shadow"
              >
                {/* Header de la card */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase className="w-5 h-5 text-amber-600" />
                      <h3 className="text-xl font-bold text-gray-800">
                        {departamento.nombre}
                      </h3>
                    </div>
                    {departamento.descripcion && (
                      <p className="text-sm text-gray-600">
                        {departamento.descripcion}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAbrirModalEditar(departamento)}
                      className="btn-glass p-2"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleEliminar(departamento)}
                      className="btn-glass p-2"
                      title="Desactivar"
                      disabled={departamento.total_empleados > 0 || departamento.total_tareas > 0}
                    >
                      <Trash2 className={`w-4 h-4 ${(departamento.total_empleados > 0 || departamento.total_tareas > 0) ? 'text-gray-400' : 'text-red-600'}`} />
                    </button>
                  </div>
                </div>

                {/* Estadísticas */}
                <div className="space-y-3">
                  {/* Empleados */}
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-blue-700">
                        <Users className="w-5 h-5" />
                        <span className="text-sm font-medium">Empleados</span>
                      </div>
                      <span className="text-2xl font-bold text-blue-700">
                        {departamento.total_empleados}
                      </span>
                    </div>
                  </div>

                  {/* Tareas */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-700">
                        <CheckSquare className="w-5 h-5" />
                        <span className="text-sm font-medium">Tareas</span>
                      </div>
                      <span className="text-2xl font-bold text-gray-700">
                        {departamento.total_tareas}
                      </span>
                    </div>
                    {departamento.total_tareas > 0 && (
                      <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                        <div className="text-center">
                          <p className="text-yellow-600 font-semibold">{departamento.tareas_pendientes}</p>
                          <p className="text-gray-500">Pendientes</p>
                        </div>
                        <div className="text-center">
                          <p className="text-blue-600 font-semibold">{departamento.tareas_en_progreso}</p>
                          <p className="text-gray-500">En Progreso</p>
                        </div>
                        <div className="text-center">
                          <p className="text-green-600 font-semibold">{departamento.tareas_completadas}</p>
                          <p className="text-gray-500">Completadas</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Información adicional */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Creado: {new Date(departamento.creado_en).toLocaleDateString('es-AR')}
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
          title={modoModal === 'crear' ? 'Nuevo Departamento' : 'Editar Departamento'}
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

            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Departamento *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Mantenimiento, Limpieza, Seguridad..."
                className={`input-glass w-full ${erroresForm.nombre ? 'border-red-500' : ''}`}
                maxLength={100}
              />
              {erroresForm.nombre && (
                <p className="text-red-600 text-sm mt-1">{erroresForm.nombre}</p>
              )}
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción (opcional)
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Descripción del departamento y sus responsabilidades..."
                rows="4"
                className="input-glass w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Describe las funciones y responsabilidades de este departamento
              </p>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default Departamentos;