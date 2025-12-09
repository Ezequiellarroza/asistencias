// src/services/marcacionService.js
// Servicio de marcaciones (entrada/salida) conectado al backend PHP

import api from './api.js';

class MarcacionService {
  /**
   * Obtener lista de oficinas disponibles
   * @param {number} latitud - Latitud GPS del empleado
   * @param {number} longitud - Longitud GPS del empleado
   * @returns {Promise<Object>} - Lista de oficinas con distancias
   */
  async obtenerOficinas(latitud, longitud) {
    try {
      const params = {};
      if (latitud && longitud) {
        params.latitud = latitud;
        params.longitud = longitud;
      }
      
      const response = await api.get('/empleado/oficinas.php', params);
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.mensaje || 'Error al obtener oficinas');
    } catch (error) {
      console.error('Error en obtenerOficinas:', error);
      throw error;
    }
  }

  /**
 * Marcar entrada
 * @param {number|null} latitud - Latitud GPS (puede ser null si no hay GPS)
 * @param {number|null} longitud - Longitud GPS (puede ser null si no hay GPS)
 * @param {number|null} oficinaId - ID de oficina seleccionada manualmente (opcional)
 * @param {string|null} motivoSinGPS - Motivo por el que no se obtuvo GPS (opcional)
 * @returns {Promise<Object>} - Datos de la marcación
 */
async marcarEntrada(latitud, longitud, oficinaId = null, motivoSinGPS = null) {
  try {
    const payload = {
      latitud,
      longitud
    };
    
    // Agregar oficina_id solo si fue proporcionada
    if (oficinaId !== null && oficinaId !== undefined) {
      payload.oficina_id = oficinaId;
    }
    
    // Agregar motivo si no hay GPS
    if (motivoSinGPS) {
      payload.motivo_sin_gps = motivoSinGPS;
    }
    
    const response = await api.post('/empleado/marcar-entrada.php', payload);
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.mensaje || 'Error al marcar entrada');
  } catch (error) {
    console.error('Error en marcarEntrada:', error);
    throw error;
  }
}

  /**
 * Marcar salida
 * @param {number|null} latitud - Latitud GPS (puede ser null si no hay GPS)
 * @param {number|null} longitud - Longitud GPS (puede ser null si no hay GPS)
 * @param {number|null} oficinaId - ID de oficina seleccionada manualmente (opcional)
 * @param {string|null} motivoSinGPS - Motivo por el que no se obtuvo GPS (opcional)
 * @returns {Promise<Object>} - Datos de la marcación
 */
async marcarSalida(latitud, longitud, oficinaId = null, motivoSinGPS = null) {
  try {
    const payload = {
      latitud,
      longitud
    };
    
    // Agregar oficina_id solo si fue proporcionada
    if (oficinaId !== null && oficinaId !== undefined) {
      payload.oficina_id = oficinaId;
    }
    
    // Agregar motivo si no hay GPS
    if (motivoSinGPS) {
      payload.motivo_sin_gps = motivoSinGPS;
    }
    
    const response = await api.post('/empleado/marcar-salida.php', payload);
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.mensaje || 'Error al marcar salida');
  } catch (error) {
    console.error('Error en marcarSalida:', error);
    throw error;
  }
}

  /**
   * Obtener estado actual del empleado
   * @returns {Promise<Object>} - Estado de marcación actual
   */
  async obtenerEstado() {
    try {
      const response = await api.get('/empleado/estado.php');
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.mensaje || 'Error al obtener estado');
    } catch (error) {
      console.error('Error en obtenerEstado:', error);
      throw error;
    }
  }

  /**
   * Obtener historial de marcaciones
   * @param {number} empleadoId - ID del empleado
   * @param {string} fechaInicio - Fecha inicio (YYYY-MM-DD)
   * @param {string} fechaFin - Fecha fin (YYYY-MM-DD)
   * @returns {Promise<Array>} - Array de marcaciones
   */
  async obtenerHistorial(empleadoId, fechaInicio, fechaFin) {
    try {
      const params = {
        empleado_id: empleadoId
      };
      
      if (fechaInicio) params.fecha_inicio = fechaInicio;
      if (fechaFin) params.fecha_fin = fechaFin;
      
      const response = await api.get('/empleado/marcaciones.php', params);
      
      if (response.success) {
        return response.data || [];
      }
      
      throw new Error(response.mensaje || 'Error al obtener historial');
    } catch (error) {
      console.error('Error en obtenerHistorial:', error);
      throw error;
    }
  }

  /**
   * Calcular horas trabajadas de una marcación
   * @param {Object} marcacion - Objeto de marcación con entrada y salida
   * @returns {string} - Horas trabajadas en formato "HH:MM"
   */
  calcularHorasTrabajadas(marcacion) {
    if (!marcacion.entrada || !marcacion.salida) {
      return '00:00';
    }
    
    const entrada = new Date(marcacion.entrada);
    const salida = new Date(marcacion.salida);
    
    const diffMs = salida - entrada;
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffMins = Math.floor((diffMs % 3600000) / 60000);
    
    return `${String(diffHrs).padStart(2, '0')}:${String(diffMins).padStart(2, '0')}`;
  }

  /**
   * Formatear fecha para display
   * @param {string} fecha - Fecha en formato ISO
   * @returns {string} - Fecha formateada
   */
  formatearFecha(fecha) {
    if (!fecha) return '-';
    
    const date = new Date(fecha);
    const options = { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return date.toLocaleString('es-AR', options);
  }

  /**
   * Validar si las coordenadas están dentro del rango permitido
   * (Esta validación también se hace en el backend)
   * @param {number} latitud - Latitud actual
   * @param {number} longitud - Longitud actual
   * @param {number} oficinaLat - Latitud de la oficina
   * @param {number} oficinaLng - Longitud de la oficina
   * @param {number} radio - Radio permitido en metros
   * @returns {boolean}
   */
  validarUbicacion(latitud, longitud, oficinaLat, oficinaLng, radio) {
    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = latitud * Math.PI / 180;
    const φ2 = oficinaLat * Math.PI / 180;
    const Δφ = (oficinaLat - latitud) * Math.PI / 180;
    const Δλ = (oficinaLng - longitud) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const distancia = R * c;

    return distancia <= radio;
  }
}

// Exportar instancia singleton
const marcacionService = new MarcacionService();
export default marcacionService;