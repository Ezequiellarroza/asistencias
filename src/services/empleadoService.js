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
      const response = await api.get('/admin/empleados.php'); // 👈 AGREGADO /admin/
      
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
      const response = await api.get('/admin/empleados.php', { id: empleadoId }); // 👈 AGREGADO /admin/
      
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
      const response = await api.post('/admin/empleados.php', empleadoData); // 👈 AGREGADO /admin/
      
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
      const response = await api.put(`/admin/empleados.php?id=${empleadoId}`, empleadoData); // 👈 AGREGADO /admin/
      
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
      const response = await api.delete(`/admin/empleados.php?id=${empleadoId}`); // 👈 AGREGADO /admin/
      
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
      const response = await api.get('/admin/estadisticas.php', { // 👈 AGREGADO /admin/
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

  // ... validarEmpleado sin cambios ...

  // ============================================
  // MÉTODOS DE TAREAS (YA ESTÁN CORRECTOS con /empleado/)
  // ============================================

  async getTareas(filtros = {}) {
    try {
      const response = await api.get('/empleado/tareas.php', filtros); // ✅ Ya correcto
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || response.mensaje || 'Error al obtener tareas');
    } catch (error) {
      console.error('Error en getTareas:', error);
      throw error;
    }
  }

  // ... resto de métodos de tareas ya están correctos ...
  
  async getDepartamentos() {
    try {
      const response = await api.get('/empleado/departamentos.php'); // ✅ Ya correcto
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || response.mensaje || 'Error al obtener departamentos');
    } catch (error) {
      console.error('Error en getDepartamentos:', error);
      throw error;
    }
  }

  async crearTarea(tareaData) {
    try {
      const response = await api.post('/empleado/tareas.php', tareaData); // ✅ Ya correcto
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || response.mensaje || 'Error al crear tarea');
    } catch (error) {
      console.error('Error en crearTarea:', error);
      throw error;
    }
  }
  

  /**
 * Cambiar estado de una tarea
 * @param {number} tareaId - ID de la tarea
 * @param {string} nuevoEstado - Nuevo estado (pendiente, en_progreso, completada, no_realizable)
 * @param {string|null} respuestaEmpleado - Comentario opcional del empleado
 * @returns {Promise<Object>} - Tarea actualizada
 */
async cambiarEstadoTarea(tareaId, nuevoEstado, respuestaEmpleado = null) {
  try {
    const datos = {
      id: tareaId,
      estado: nuevoEstado
    };

    // Agregar respuesta si existe
    if (respuestaEmpleado && respuestaEmpleado.trim() !== '') {
      datos.respuesta_empleado = respuestaEmpleado.trim();
    }

    const response = await api.put('/empleado/tareas.php', datos);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.mensaje || response.message || 'Error al cambiar estado de tarea');
  } catch (error) {
    console.error('Error en cambiarEstadoTarea:', error);
    throw error;
  }
}

  async getEspacios(filtros = {}) {
    try {
      const response = await api.get('/empleado/espacios.php', filtros); // ✅ Ya correcto
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || response.mensaje || 'Error al obtener espacios');
    } catch (error) {
      console.error('Error en getEspacios:', error);
      throw error;
    }
  }



}

// Exportar instancia singleton
const empleadoService = new EmpleadoService();
export default empleadoService;
