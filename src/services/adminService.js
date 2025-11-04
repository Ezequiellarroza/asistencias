// src/services/adminService.js
// Servicio para API del panel de administración

import api from './api.js';

class AdminService {
  /**
   * Obtener estadísticas del dashboard
   * @param {string} fecha - Fecha en formato YYYY-MM-DD (opcional, default: hoy)
   * @returns {Promise<Object>} - Estadísticas completas
   */
  async getEstadisticas(fecha = null) {
    try {
      const params = fecha ? { fecha } : {};
      const response = await api.get('/admin/estadisticas.php', params);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || response.mensaje || 'Error al obtener estadísticas');
    } catch (error) {
      console.error('Error en getEstadisticas:', error);
      throw error;
    }
  }

  /**
   * Obtener lista de alertas con filtros
   * @param {Object} filtros - Filtros opcionales
   * @param {string} filtros.tipo - Tipo de alerta
   * @param {number} filtros.empleado_id - ID del empleado
   * @param {number} filtros.revisada - 0=pendientes, 1=revisadas
   * @param {string} filtros.fecha_desde - Fecha desde YYYY-MM-DD
   * @param {string} filtros.fecha_hasta - Fecha hasta YYYY-MM-DD
   * @param {number} filtros.page - Número de página
   * @param {number} filtros.limit - Registros por página
   * @returns {Promise<Object>} - Lista de alertas con paginación
   */
  async getAlertas(filtros = {}) {
    try {
      const response = await api.get('/admin/alertas.php', filtros);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || response.mensaje || 'Error al obtener alertas');
    } catch (error) {
      console.error('Error en getAlertas:', error);
      throw error;
    }
  }

  /**
   * Revisar una alerta
   * @param {number} alertaId - ID de la alerta
   * @param {string} notasAdmin - Notas del administrador
   * @param {number} resuelta - 0=no resuelta, 1=resuelta
   * @returns {Promise<Object>} - Datos de la alerta revisada
   */
  async revisarAlerta(alertaId, notasAdmin, resuelta = 1) {
    try {
      const response = await api.post('/admin/revisar-alerta.php', {
        alerta_id: alertaId,
        notas_admin: notasAdmin,
        resuelta: resuelta
      });
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || response.mensaje || 'Error al revisar alerta');
    } catch (error) {
      console.error('Error en revisarAlerta:', error);
      throw error;
    }
  }

  /**
   * Obtener lista de empleados
   * @returns {Promise<Array>} - Lista de empleados activos
   */
  async getEmpleados() {
    try {
      const response = await api.get('/admin/empleados.php');
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || response.mensaje || 'Error al obtener empleados');
    } catch (error) {
      console.error('Error en getEmpleados:', error);
      throw error;
    }
  }

  /**
   * Obtener lista de oficinas
   * @returns {Promise<Array>} - Lista de oficinas activas
   */
  async getOficinas() {
    try {
      const response = await api.get('/admin/oficinas.php');
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || response.mensaje || 'Error al obtener oficinas');
    } catch (error) {
      console.error('Error en getOficinas:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
const adminService = new AdminService();
export default adminService;