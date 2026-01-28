// src/services/authService.js
// Servicio de autenticación conectado al backend PHP

import api from './api.js';

class AuthService {
  /**
   * Login de empleado por teléfono
   * @param {string} telefono - Número de teléfono del empleado
   * @returns {Promise<Object>} - Datos del empleado y oficina
   */
  async loginEmpleado(telefono) {
    try {
      const response = await api.post('/empleado/login.php', { telefono });
      
      if (response.success && response.data) {
        // Crear objeto empleado con los datos
        const empleado = {
          id: response.data.empleado_id,
          nombre: response.data.nombre,
          apellido: response.data.apellido,
          telefono: response.data.telefono
        };
        
        // ✅ Guardar JWT token
        api.setToken(response.data.jwt_token);
        
        // Guardar datos del empleado en localStorage
        localStorage.setItem('empleado', JSON.stringify(empleado));
        localStorage.setItem('oficina', JSON.stringify(response.data.oficina));
        
        return response.data;
      }
      
      throw new Error(response.mensaje || 'Error en el login');
    } catch (error) {
      console.error('Error en loginEmpleado:', error);
      throw error;
    }
  }

  /**
   * Generar preguntas de IA para verificación
   * @param {number} empleadoId - ID del empleado
   * @returns {Promise<Object>} - Preguntas y session token
   */
  async generarPreguntas(empleadoId) {
    try {
      const response = await api.post('/empleado/generar-preguntas.php', {
        empleado_id: empleadoId
      });
      
      if (response.success && response.data) {
        // Guardar session_token temporalmente
        sessionStorage.setItem('session_token', response.data.session_token);
        
        return response.data;
      }
      
      throw new Error(response.mensaje || 'Error al generar preguntas');
    } catch (error) {
      console.error('Error en generarPreguntas:', error);
      throw error;
    }
  }

  /**
   * Verificar respuestas de IA
   * @param {string} sessionToken - Token de la sesión de preguntas
   * @param {Array} respuestas - Array de objetos {id, respuesta}
   * @returns {Promise<Object>} - JWT token si las respuestas son correctas
   */
  async verificarRespuestas(sessionToken, respuestas) {
    try {
      const response = await api.post('/empleado/verificar-respuesta.php', {
        session_token: sessionToken,
        respuestas: respuestas
      });
      
      if (response.success && response.data && response.data.token) {
        // Guardar JWT token
        api.setToken(response.data.token);
        
        // Limpiar session token temporal
        sessionStorage.removeItem('session_token');
        
        return response.data;
      }
      
      throw new Error(response.mensaje || 'Error al verificar respuestas');
    } catch (error) {
      console.error('Error en verificarRespuestas:', error);
      throw error;
    }
  }

  /**
   * Login de administrador
   * @param {string} username - Usuario administrador
   * @param {string} password - Contraseña
   * @returns {Promise<Object>} - Datos del administrador y JWT token
   */
  async loginAdmin(username, password) {
    try {
      const response = await api.post('/admin/login.php', {
        username,
        password
      });
      
      if (response.success && response.data && response.data.jwt_token) {
        // Guardar JWT token
        api.setToken(response.data.jwt_token);
        
        return response.data;
      }
      
      throw new Error(response.message || response.mensaje || 'Error en el login de administrador');
    } catch (error) {
      console.error('Error en loginAdmin:', error);
      throw error;
    }
  }

  /**
   * Verificar si el usuario está autenticado
   * @returns {boolean}
   */
  isAuthenticated() {
    const token = api.getToken();
    return !!token;
  }

  /**
   * Obtener datos del empleado actual
   * @returns {Object|null}
   */
  getCurrentEmpleado() {
    try {
      const empleadoStr = localStorage.getItem('empleado');
      return empleadoStr ? JSON.parse(empleadoStr) : null;
    } catch (error) {
      console.error('Error al obtener empleado:', error);
      return null;
    }
  }

  /**
   * Obtener datos de la oficina actual
   * @returns {Object|null}
   */
  getCurrentOficina() {
    try {
      const oficinaStr = localStorage.getItem('oficina');
      return oficinaStr ? JSON.parse(oficinaStr) : null;
    } catch (error) {
      console.error('Error al obtener oficina:', error);
      return null;
    }
  }

  /**
   * Logout - Limpiar toda la autenticación
   */
  logout() {
    api.clearAuth();
    localStorage.removeItem('empleado');
    localStorage.removeItem('oficina');
    localStorage.removeItem('user');
    sessionStorage.removeItem('session_token');
  }

  /**
   * Obtener tipo de usuario desde el token JWT o localStorage
   * @returns {string|null}
   */
  getUserType() {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.tipo || 'empleado';
      }
    } catch (error) {
      console.error('Error al obtener tipo de usuario:', error);
    }
    
    return null;
  }
}

// Exportar instancia singleton
const authService = new AuthService();
export default authService;