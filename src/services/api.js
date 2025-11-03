// src/services/api.js
// Configuración de API para conectar con el backend PHP

const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://ezequiellarroza.com.ar/api',
  timeout: 30000, // 30 segundos para llamadas a IA
  headers: {
    'Content-Type': 'application/json',
  }
};

class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.baseURL;
    this.timeout = API_CONFIG.timeout;
  }

  /**
   * Obtener token JWT del localStorage
   */
  getToken() {
    return localStorage.getItem('jwt_token');
  }

  /**
   * Guardar token JWT en localStorage
   */
  setToken(token) {
    if (token) {
      localStorage.setItem('jwt_token', token);
    } else {
      localStorage.removeItem('jwt_token');
    }
  }

  /**
   * Obtener headers con autenticación
   */
  getAuthHeaders() {
    const headers = { ...API_CONFIG.headers };
    const token = this.getToken();
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  /**
   * Realizar petición fetch con manejo de errores
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Leer el texto de respuesta primero
      const text = await response.text();
      
      // Intentar parsear como JSON
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        console.error('Error parsing JSON:', text);
        throw new Error('Respuesta inválida del servidor');
      }

      if (!response.ok) {
        throw new Error(data.mensaje || data.error || `Error ${response.status}`);
      }

      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('La petición tardó demasiado tiempo');
      }
      
      console.error('API Error:', error);
      throw error;
    }
  }

  /**
   * GET request
   */
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT request
   */
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  /**
   * Limpiar autenticación
   */
  clearAuth() {
    this.setToken(null);
  }
}

// Exportar instancia singleton
const api = new ApiService();
export default api;

// Exportar también la clase por si se necesita
export { ApiService, API_CONFIG };