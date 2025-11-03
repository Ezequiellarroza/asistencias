// src/services/empleadoService.js
// Servicio de empleados para funcionalidades de administración

import api from './api.js';

class EmpleadoService {
  /**
   * Obtener lista de todos los empleados
   * @returns {Promise<Array>} - Array de empleados
   */
  async obtenerEmpleados() {
    try {
      const response = await api.get('/empleados.php');
      
      if (response.success) {
        return response.data || [];
      }
      
      throw new Error(response.mensaje || 'Error al obtener empleados');
    } catch (error) {
      console.error('Error en obtenerEmpleados:', error);
      throw error;
    }
  }

  /**
   * Obtener un empleado específico por ID
   * @param {number} empleadoId - ID del empleado
   * @returns {Promise<Object>} - Datos del empleado
   */
  async obtenerEmpleado(empleadoId) {
    try {
      const response = await api.get('/empleados.php', { id: empleadoId });
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.mensaje || 'Error al obtener empleado');
    } catch (error) {
      console.error('Error en obtenerEmpleado:', error);
      throw error;
    }
  }

  /**
   * Crear un nuevo empleado
   * @param {Object} empleadoData - Datos del empleado
   * @returns {Promise<Object>} - Empleado creado
   */
  async crearEmpleado(empleadoData) {
    try {
      const response = await api.post('/empleados.php', empleadoData);
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.mensaje || 'Error al crear empleado');
    } catch (error) {
      console.error('Error en crearEmpleado:', error);
      throw error;
    }
  }

  /**
   * Actualizar un empleado existente
   * @param {number} empleadoId - ID del empleado
   * @param {Object} empleadoData - Datos a actualizar
   * @returns {Promise<Object>} - Empleado actualizado
   */
  async actualizarEmpleado(empleadoId, empleadoData) {
    try {
      const response = await api.put(`/empleados.php?id=${empleadoId}`, empleadoData);
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.mensaje || 'Error al actualizar empleado');
    } catch (error) {
      console.error('Error en actualizarEmpleado:', error);
      throw error;
    }
  }

  /**
   * Eliminar un empleado
   * @param {number} empleadoId - ID del empleado
   * @returns {Promise<boolean>} - True si se eliminó correctamente
   */
  async eliminarEmpleado(empleadoId) {
    try {
      const response = await api.delete(`/empleados.php?id=${empleadoId}`);
      
      if (response.success) {
        return true;
      }
      
      throw new Error(response.mensaje || 'Error al eliminar empleado');
    } catch (error) {
      console.error('Error en eliminarEmpleado:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de asistencia de un empleado
   * @param {number} empleadoId - ID del empleado
   * @param {string} mes - Mes en formato YYYY-MM
   * @returns {Promise<Object>} - Estadísticas de asistencia
   */
  async obtenerEstadisticas(empleadoId, mes) {
    try {
      // TODO: Implementar endpoint de estadísticas en el backend
      const response = await api.get('/estadisticas.php', {
        empleado_id: empleadoId,
        mes: mes
      });
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.mensaje || 'Error al obtener estadísticas');
    } catch (error) {
      console.error('Error en obtenerEstadisticas:', error);
      throw error;
    }
  }

  /**
   * Validar datos de empleado antes de enviar
   * @param {Object} empleadoData - Datos del empleado
   * @returns {Object} - { valid: boolean, errors: Array }
   */
  validarEmpleado(empleadoData) {
    const errors = [];

    if (!empleadoData.nombre || empleadoData.nombre.trim() === '') {
      errors.push('El nombre es requerido');
    }

    if (!empleadoData.apellido || empleadoData.apellido.trim() === '') {
      errors.push('El apellido es requerido');
    }

    if (!empleadoData.telefono || empleadoData.telefono.trim() === '') {
      errors.push('El teléfono es requerido');
    } else {
      // Validar formato de teléfono (solo números, 10 dígitos para Argentina)
      const telefonoRegex = /^\d{10}$/;
      if (!telefonoRegex.test(empleadoData.telefono)) {
        errors.push('El teléfono debe tener 10 dígitos');
      }
    }

    if (!empleadoData.email || empleadoData.email.trim() === '') {
      errors.push('El email es requerido');
    } else {
      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(empleadoData.email)) {
        errors.push('El formato del email no es válido');
      }
    }

    if (!empleadoData.oficina_id) {
      errors.push('La oficina es requerida');
    }

    return {
      valid: errors.length === 0,
      errors: errors
    };
  }
}

// Exportar instancia singleton
const empleadoService = new EmpleadoService();
export default empleadoService;