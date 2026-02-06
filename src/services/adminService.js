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

  // ============================================
  // MÉTODOS DE EMPLEADOS
  // ============================================

  /**
   * Obtener lista de empleados con filtros y paginación
   * @param {Object} filtros - Filtros opcionales
   * @param {number} filtros.activo - 0=inactivos, 1=activos
   * @param {number} filtros.oficina_id - ID de la oficina
   * @param {string} filtros.busqueda - Búsqueda por nombre/apellido/teléfono
   * @param {number} filtros.page - Número de página (default: 1)
   * @param {number} filtros.limit - Registros por página (default: 20)
   * @returns {Promise<Object>} - Lista de empleados con paginación
   */
  async getEmpleados(filtros = {}) {
    try {
      const response = await api.get('/admin/empleados.php', filtros);
      
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
   * Crear nuevo empleado
   * @param {Object} datos - Datos del empleado
   * @param {string} datos.telefono - Teléfono (requerido)
   * @param {string} datos.nombre - Nombre (requerido)
   * @param {string} datos.apellido - Apellido (requerido)
   * @param {string} datos.email - Email (opcional)
   * @param {number} datos.oficina_id - ID de oficina (opcional)
   * @returns {Promise<Object>} - Datos del empleado creado
   */
  async crearEmpleado(datos) {
    try {
      const response = await api.post('/admin/empleados.php', datos);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || response.mensaje || 'Error al crear empleado');
    } catch (error) {
      console.error('Error en crearEmpleado:', error);
      throw error;
    }
  }

  /**
   * Actualizar empleado existente
   * @param {number} empleadoId - ID del empleado
   * @param {Object} datos - Datos a actualizar
   * @returns {Promise<Object>} - Datos del empleado actualizado
   */
  async actualizarEmpleado(empleadoId, datos) {
    try {
      const response = await api.put('/admin/empleados.php', {
        id: empleadoId,
        ...datos
      });
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || response.mensaje || 'Error al actualizar empleado');
    } catch (error) {
      console.error('Error en actualizarEmpleado:', error);
      throw error;
    }
  }

  /**
   * Desactivar empleado (soft delete)
   * @param {number} empleadoId - ID del empleado
   * @returns {Promise<Object>} - Confirmación
   */
  async eliminarEmpleado(empleadoId) {
    try {
      const response = await api.delete(`/admin/empleados.php?id=${empleadoId}`);
      
      if (response.success) {
        return response.data || { mensaje: 'Empleado eliminado' };
      }
      
      throw new Error(response.message || response.mensaje || 'Error al eliminar empleado');
    } catch (error) {
      console.error('Error en eliminarEmpleado:', error);
      throw error;
    }
  }

  // ============================================
  // MÉTODOS DE OFICINAS
  // ============================================

  /**
   * Obtener lista de oficinas con estadísticas
   * @param {boolean} incluirInactivas - Incluir oficinas inactivas (default: false)
   * @returns {Promise<Object>} - Lista de oficinas
   */
  async getOficinas(incluirInactivas = false) {
    try {
      const params = incluirInactivas ? { incluir_inactivas: '1' } : {};
      const response = await api.get('/admin/oficinas.php', params);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || response.mensaje || 'Error al obtener oficinas');
    } catch (error) {
      console.error('Error en getOficinas:', error);
      throw error;
    }
  }

  /**
   * Crear nueva oficina
   * @param {Object} datos - Datos de la oficina
   * @param {string} datos.nombre - Nombre (requerido)
   * @param {string} datos.direccion - Dirección (requerido)
   * @param {number} datos.latitud - Latitud (requerido)
   * @param {number} datos.longitud - Longitud (requerido)
   * @param {number} datos.radio_metros - Radio en metros (opcional, default: 100)
   * @returns {Promise<Object>} - Datos de la oficina creada
   */
  async crearOficina(datos) {
    try {
      const response = await api.post('/admin/oficinas.php', datos);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || response.mensaje || 'Error al crear oficina');
    } catch (error) {
      console.error('Error en crearOficina:', error);
      throw error;
    }
  }

  /**
   * Actualizar oficina existente
   * @param {number} oficinaId - ID de la oficina
   * @param {Object} datos - Datos a actualizar
   * @returns {Promise<Object>} - Datos de la oficina actualizada
   */
  async actualizarOficina(oficinaId, datos) {
    try {
      const response = await api.put('/admin/oficinas.php', {
        id: oficinaId,
        ...datos
      });
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || response.mensaje || 'Error al actualizar oficina');
    } catch (error) {
      console.error('Error en actualizarOficina:', error);
      throw error;
    }
  }

  /**
   * Desactivar oficina (soft delete)
   * @param {number} oficinaId - ID de la oficina
   * @returns {Promise<Object>} - Confirmación
   */
  async eliminarOficina(oficinaId) {
    try {
      const response = await api.delete(`/admin/oficinas.php?id=${oficinaId}`);
      
      if (response.success) {
        return response.data || { mensaje: 'Oficina eliminada' };
      }
      
      throw new Error(response.message || response.mensaje || 'Error al eliminar oficina');
    } catch (error) {
      console.error('Error en eliminarOficina:', error);
      throw error;
    }
  }

  // ============================================
  // MÉTODOS DE DEPARTAMENTOS
  // ============================================

  /**
   * Obtener lista de departamentos con estadísticas
   * @param {boolean} incluirInactivos - Incluir departamentos inactivos (default: false)
   * @returns {Promise<Object>} - Lista de departamentos
   */
  async getDepartamentos(incluirInactivos = false) {
    try {
      const params = incluirInactivos ? { incluir_inactivos: '1' } : {};
      const response = await api.get('/admin/departamentos.php', params);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || response.mensaje || 'Error al obtener departamentos');
    } catch (error) {
      console.error('Error en getDepartamentos:', error);
      throw error;
    }
  }

  /**
   * Crear nuevo departamento
   * @param {Object} datos - Datos del departamento
   * @param {string} datos.nombre - Nombre (requerido)
   * @param {string} datos.descripcion - Descripción (opcional)
   * @returns {Promise<Object>} - Datos del departamento creado
   */
  async crearDepartamento(datos) {
    try {
      const response = await api.post('/admin/departamentos.php', datos);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || response.mensaje || 'Error al crear departamento');
    } catch (error) {
      console.error('Error en crearDepartamento:', error);
      throw error;
    }
  }

  /**
   * Actualizar departamento existente
   * @param {number} departamentoId - ID del departamento
   * @param {Object} datos - Datos a actualizar
   * @returns {Promise<Object>} - Datos del departamento actualizado
   */
  async actualizarDepartamento(departamentoId, datos) {
    try {
      const response = await api.put('/admin/departamentos.php', {
        id: departamentoId,
        ...datos
      });
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || response.mensaje || 'Error al actualizar departamento');
    } catch (error) {
      console.error('Error en actualizarDepartamento:', error);
      throw error;
    }
  }

  /**
   * Desactivar departamento (soft delete)
   * @param {number} departamentoId - ID del departamento
   * @returns {Promise<Object>} - Confirmación
   */
  async eliminarDepartamento(departamentoId) {
    try {
      const response = await api.delete(`/admin/departamentos.php?id=${departamentoId}`);
      
      if (response.success) {
        return response.data || { mensaje: 'Departamento eliminado' };
      }
      
      throw new Error(response.message || response.mensaje || 'Error al eliminar departamento');
    } catch (error) {
      console.error('Error en eliminarDepartamento:', error);
      throw error;
    }
  }

  // ============================================
  // MÉTODOS DE ESPACIOS
  // ============================================

  /**
   * Obtener lista de espacios con filtros y paginación
   * @param {Object} filtros - Filtros opcionales
   * @param {number} filtros.oficina_id - ID de la oficina
   * @param {string} filtros.tipo - Tipo de espacio
   * @param {string} filtros.estado - Estado: activo, inactivo, en_mantenimiento
   * @param {string} filtros.busqueda - Búsqueda por nombre o observaciones
   * @param {number} filtros.page - Número de página (default: 1)
   * @param {number} filtros.limit - Registros por página (default: 50)
   * @returns {Promise<Object>} - Lista de espacios con paginación
   */
  async getEspacios(filtros = {}) {
    try {
      const response = await api.get('/admin/espacios.php', filtros);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || response.mensaje || 'Error al obtener espacios');
    } catch (error) {
      console.error('Error en getEspacios:', error);
      throw error;
    }
  }

  /**
   * Obtener un espacio específico por ID
   * @param {number} espacioId - ID del espacio
   * @returns {Promise<Object>} - Datos del espacio
   */
  async getEspacio(espacioId) {
    try {
      const response = await api.get(`/admin/espacios.php?id=${espacioId}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || response.mensaje || 'Error al obtener espacio');
    } catch (error) {
      console.error('Error en getEspacio:', error);
      throw error;
    }
  }

  /**
   * Crear nuevo espacio
   * @param {Object} datos - Datos del espacio
   * @param {string} datos.nombre - Nombre del espacio (requerido)
   * @param {number} datos.oficina_id - ID de la oficina (requerido)
   * @param {string} datos.tipo - Tipo: cabaña, habitación, etc. (opcional)
   * @param {string} datos.observaciones - Observaciones (opcional)
   * @param {string} datos.estado - Estado: activo, inactivo, en_mantenimiento (default: activo)
   * @returns {Promise<Object>} - Datos del espacio creado
   */
  async crearEspacio(datos) {
    try {
      const response = await api.post('/admin/espacios.php', datos);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || response.mensaje || 'Error al crear espacio');
    } catch (error) {
      console.error('Error en crearEspacio:', error);
      throw error;
    }
  }

  /**
   * Actualizar espacio existente
   * @param {number} espacioId - ID del espacio
   * @param {Object} datos - Datos a actualizar
   * @returns {Promise<Object>} - Datos del espacio actualizado
   */
  async actualizarEspacio(espacioId, datos) {
    try {
      const response = await api.put('/admin/espacios.php', {
        id: espacioId,
        ...datos
      });
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || response.mensaje || 'Error al actualizar espacio');
    } catch (error) {
      console.error('Error en actualizarEspacio:', error);
      throw error;
    }
  }

  /**
   * Eliminar espacio (soft delete si tiene tareas, hard delete si no)
   * @param {number} espacioId - ID del espacio
   * @returns {Promise<Object>} - Confirmación con tipo de acción (eliminado/desactivado)
   */
  async eliminarEspacio(espacioId) {
    try {
      const response = await api.delete(`/admin/espacios.php?id=${espacioId}`);
      
      if (response.success) {
        return response.data || { mensaje: 'Espacio eliminado' };
      }
      
      throw new Error(response.message || response.mensaje || 'Error al eliminar espacio');
    } catch (error) {
      console.error('Error en eliminarEspacio:', error);
      throw error;
    }
  }

  // ============================================
  // MÉTODOS DE TAREAS
  // ============================================

  /**
   * Obtener lista de tareas con filtros y paginación
   * @param {Object} filtros - Filtros opcionales
   * @param {number} filtros.empleado_id - ID del empleado asignado
   * @param {string} filtros.estado - Estado de la tarea (pendiente, en_progreso, completada)
   * @param {string} filtros.prioridad - Prioridad (baja, media, alta)
   * @param {number} filtros.creado_por - ID de quien creó la tarea
   * @param {number} filtros.asignado_por - ID del admin que asignó
   * @param {string} filtros.vencidas - '1' para solo vencidas
   * @param {string} filtros.busqueda - Búsqueda por título o descripción
   * @param {number} filtros.page - Número de página (default: 1)
   * @param {number} filtros.limit - Registros por página (default: 20)
   * @returns {Promise<Object>} - Lista de tareas con paginación
   */
  async getTareas(filtros = {}) {
    try {
      const response = await api.get('/admin/tareas.php', filtros);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || response.mensaje || 'Error al obtener tareas');
    } catch (error) {
      console.error('Error en getTareas:', error);
      throw error;
    }
  }

  /**
   * Obtener una tarea específica por ID
   * @param {number} tareaId - ID de la tarea
   * @returns {Promise<Object>} - Datos de la tarea
   */
  async getTarea(tareaId) {
    try {
      const response = await api.get(`/admin/tareas.php?id=${tareaId}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || response.mensaje || 'Error al obtener tarea');
    } catch (error) {
      console.error('Error en getTarea:', error);
      throw error;
    }
  }

  /**
   * Crear nueva tarea
   * @param {Object} datos - Datos de la tarea
   * @param {string} datos.titulo - Título (requerido)
   * @param {string} datos.descripcion - Descripción (opcional)
   * @param {string} datos.prioridad - Prioridad: baja, media, alta (default: media)
   * @param {number} datos.empleado_id - ID del empleado asignado (opcional)
   * @param {string} datos.fecha_limite - Fecha límite YYYY-MM-DD HH:MM:SS (opcional)
   * @returns {Promise<Object>} - Datos de la tarea creada
   */
  async crearTarea(datos) {
    try {
      const response = await api.post('/admin/tareas.php', datos);
      
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
   * Actualizar tarea existente
   * @param {number} tareaId - ID de la tarea
   * @param {Object} datos - Datos a actualizar
   * @returns {Promise<Object>} - Datos de la tarea actualizada
   */
  async actualizarTarea(tareaId, datos) {
    try {
      const response = await api.put('/admin/tareas.php', {
        id: tareaId,
        ...datos
      });
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || response.mensaje || 'Error al actualizar tarea');
    } catch (error) {
      console.error('Error en actualizarTarea:', error);
      throw error;
    }
  }

  /**
   * Cambiar estado de una tarea
   * @param {number} tareaId - ID de la tarea
   * @param {string} nuevoEstado - Nuevo estado (pendiente, en_progreso, completada)
   * @param {string} respuestaEmpleado - Comentario/respuesta del empleado (opcional)
   * @returns {Promise<Object>} - Datos de la tarea actualizada
   */
  async cambiarEstadoTarea(tareaId, nuevoEstado, respuestaEmpleado = null) {
    try {
      const datos = {
        id: tareaId,
        estado: nuevoEstado
      };
      
      if (respuestaEmpleado) {
        datos.respuesta_empleado = respuestaEmpleado;
      }
      
      const response = await api.put('/admin/tareas.php', datos);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || response.mensaje || 'Error al cambiar estado de tarea');
    } catch (error) {
      console.error('Error en cambiarEstadoTarea:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de tareas
   * @returns {Promise<Object>} - Estadísticas de tareas
   */
  async getEstadisticasTareas() {
    try {
      const response = await api.get('/admin/tareas.php?estadisticas=1');
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || response.mensaje || 'Error al obtener estadísticas');
    } catch (error) {
      console.error('Error en getEstadisticasTareas:', error);
      throw error;
    }
  }

  // ============================================
  // MÉTODOS DE MARCACIONES MANUALES
  // ============================================

  /**
   * Obtener lista de marcaciones manuales con filtros y paginación
   * @param {Object} filtros - Filtros opcionales
   * @param {number} filtros.empleado_id - ID del empleado
   * @param {string} filtros.tipo - Tipo: entrada, salida, ausencia
   * @param {string} filtros.fecha_desde - Fecha desde YYYY-MM-DD
   * @param {string} filtros.fecha_hasta - Fecha hasta YYYY-MM-DD
   * @param {string} filtros.incluir_eliminadas - '1' para incluir eliminadas
   * @param {number} filtros.page - Número de página (default: 1)
   * @param {number} filtros.limit - Registros por página (default: 50)
   * @returns {Promise<Object>} - Lista de marcaciones con paginación
   */
  async getMarcacionesManuales(filtros = {}) {
    try {
      const response = await api.get('/admin/marcaciones-manuales.php', filtros);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || response.mensaje || 'Error al obtener marcaciones manuales');
    } catch (error) {
      console.error('Error en getMarcacionesManuales:', error);
      throw error;
    }
  }

  /**
   * Crear marcación manual de entrada o salida
   * @param {Object} datos - Datos de la marcación
   * @param {number} datos.empleado_id - ID del empleado (requerido)
   * @param {string} datos.tipo - Tipo: entrada o salida (requerido)
   * @param {string} datos.fecha_marcacion - Fecha y hora YYYY-MM-DD HH:MM:SS (requerido)
   * @param {number} datos.oficina_id - ID de la oficina (requerido)
   * @param {string} datos.observacion - Observación (opcional)
   * @returns {Promise<Object>} - Datos de la marcación creada
   */
  async crearMarcacionManual(datos) {
    try {
      const response = await api.post('/admin/marcaciones-manuales.php', datos);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || response.mensaje || 'Error al crear marcación manual');
    } catch (error) {
      console.error('Error en crearMarcacionManual:', error);
      throw error;
    }
  }

  /**
   * Crear ausencia (puede ser múltiples días)
   * @param {Object} datos - Datos de la ausencia
   * @param {number} datos.empleado_id - ID del empleado (requerido)
   * @param {string} datos.tipo - Debe ser 'ausencia' (requerido)
   * @param {string} datos.fecha_desde - Fecha desde YYYY-MM-DD (requerido)
   * @param {string} datos.fecha_hasta - Fecha hasta YYYY-MM-DD (opcional, si no se envía es un solo día)
   * @param {string} datos.observacion - Motivo de la ausencia (requerido para ausencias)
   * @returns {Promise<Object>} - Datos de las ausencias creadas
   */
  async crearAusencia(datos) {
    try {
      const response = await api.post('/admin/marcaciones-manuales.php', {
        ...datos,
        tipo: 'ausencia'
      });
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || response.mensaje || 'Error al crear ausencia');
    } catch (error) {
      console.error('Error en crearAusencia:', error);
      throw error;
    }
  }

  /**
   * Actualizar marcación manual existente
   * @param {number} marcacionId - ID de la marcación
   * @param {Object} datos - Datos a actualizar
   * @param {string} datos.fecha_marcacion - Nueva fecha y hora (opcional)
   * @param {number} datos.oficina_id - Nueva oficina (opcional)
   * @param {string} datos.observacion - Nueva observación (opcional)
   * @returns {Promise<Object>} - Datos de la marcación actualizada
   */
  async actualizarMarcacionManual(marcacionId, datos) {
    try {
      const response = await api.put('/admin/marcaciones-manuales.php', {
        id: marcacionId,
        ...datos
      });
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || response.mensaje || 'Error al actualizar marcación manual');
    } catch (error) {
      console.error('Error en actualizarMarcacionManual:', error);
      throw error;
    }
  }

  /**
   * Eliminar marcación manual (soft delete)
   * @param {number} marcacionId - ID de la marcación
   * @returns {Promise<Object>} - Confirmación
   */
  async eliminarMarcacionManual(marcacionId) {
    try {
      const response = await api.delete(`/admin/marcaciones-manuales.php?id=${marcacionId}`);
      
      if (response.success) {
        return response.data || { mensaje: 'Marcación eliminada' };
      }
      
      throw new Error(response.message || response.mensaje || 'Error al eliminar marcación manual');
    } catch (error) {
      console.error('Error en eliminarMarcacionManual:', error);
      throw error;
    }
  }

  // ============================================
  // MÉTODOS DE USUARIOS ADMINISTRADORES
  // ============================================

  /**
   * Obtener lista de usuarios administradores
   * @param {boolean} incluirInactivos - Incluir usuarios inactivos (default: false)
   * @returns {Promise<Object>} - Lista de usuarios admin
   */
  async getUsuariosAdmin(incluirInactivos = false) {
    try {
      const params = incluirInactivos ? { incluir_inactivos: '1' } : {};
      const response = await api.get('/admin/usuarios-admin.php', params);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || response.mensaje || 'Error al obtener usuarios administradores');
    } catch (error) {
      console.error('Error en getUsuariosAdmin:', error);
      throw error;
    }
  }

  /**
   * Crear nuevo usuario administrador
   * @param {Object} datos - Datos del usuario admin
   * @param {string} datos.username - Username (requerido)
   * @param {string} datos.password - Contraseña (requerido)
   * @param {string} datos.nombre - Nombre completo (requerido)
   * @param {string} datos.email - Email (requerido)
   * @returns {Promise<Object>} - Datos del usuario admin creado
   */
  async crearUsuarioAdmin(datos) {
    try {
      const response = await api.post('/admin/usuarios-admin.php', datos);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || response.mensaje || 'Error al crear usuario administrador');
    } catch (error) {
      console.error('Error en crearUsuarioAdmin:', error);
      throw error;
    }
  }

  /**
   * Actualizar usuario administrador existente
   * @param {number} adminId - ID del usuario admin
   * @param {Object} datos - Datos a actualizar
   * @param {string} datos.username - Username (opcional)
   * @param {string} datos.nombre - Nombre (opcional)
   * @param {string} datos.email - Email (opcional)
   * @param {boolean} datos.activo - Estado activo (opcional)
   * @returns {Promise<Object>} - Datos del usuario admin actualizado
   */
  async actualizarUsuarioAdmin(adminId, datos) {
    try {
      const response = await api.put('/admin/usuarios-admin.php', {
        id: adminId,
        ...datos
      });
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || response.mensaje || 'Error al actualizar usuario administrador');
    } catch (error) {
      console.error('Error en actualizarUsuarioAdmin:', error);
      throw error;
    }
  }

  /**
   * Cambiar contraseña de usuario administrador
   * @param {number} adminId - ID del usuario admin
   * @param {string} nuevaPassword - Nueva contraseña
   * @returns {Promise<Object>} - Confirmación
   */
  async cambiarPasswordAdmin(adminId, nuevaPassword) {
    try {
      const response = await api.patch('/admin/usuarios-admin.php', {
        id: adminId,
        nueva_password: nuevaPassword
      });
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || response.mensaje || 'Error al cambiar contraseña');
    } catch (error) {
      console.error('Error en cambiarPasswordAdmin:', error);
      throw error;
    }
  }

  /**
   * Desactivar usuario administrador (soft delete)
   * @param {number} adminId - ID del usuario admin
   * @returns {Promise<Object>} - Confirmación
   */
  async eliminarUsuarioAdmin(adminId) {
    try {
      const response = await api.delete(`/admin/usuarios-admin.php?id=${adminId}`);
      
      if (response.success) {
        return response.data || { mensaje: 'Usuario administrador eliminado' };
      }
      
      throw new Error(response.message || response.mensaje || 'Error al eliminar usuario administrador');
    } catch (error) {
      console.error('Error en eliminarUsuarioAdmin:', error);
      throw error;
    }
  }
  // ============================================
  // MÉTODOS DE REPORTES
  // ============================================

  /**
   * Obtener reporte de asistencia de un empleado en un rango de fechas
   * @param {number} empleadoId - ID del empleado
   * @param {string} fechaDesde - Fecha inicio YYYY-MM-DD
   * @param {string} fechaHasta - Fecha fin YYYY-MM-DD
   * @returns {Promise<Object>} - Reporte completo con resumen, días problemáticos y detalle
   */
  async getReporteEmpleado(empleadoId, fechaDesde, fechaHasta) {
    try {
      const response = await api.get('/admin/reportes.php', {
        empleado_id: empleadoId,
        fecha_desde: fechaDesde,
        fecha_hasta: fechaHasta
      });
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || response.mensaje || 'Error al obtener reporte');
    } catch (error) {
      console.error('Error en getReporteEmpleado:', error);
      throw error;
    }
  }
  // ============================================
  // MÉTODOS DE EMPLEADOS PRESENTES
  // ============================================

  /**
   * Obtener lista detallada de empleados presentes hoy, agrupados por oficina
   * Incluye marcaciones automáticas (GPS) y manuales (admin)
   * @param {string} fecha - Fecha en formato YYYY-MM-DD (opcional, default: hoy)
   * @returns {Promise<Object>} - Lista de empleados presentes con datos completos
   */
  async getEmpleadosPresentes(fecha = null) {
    try {
      const params = fecha ? { fecha } : {};
      const response = await api.get('/admin/empleados-presentes.php', params);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || response.mensaje || 'Error al obtener empleados presentes');
    } catch (error) {
      console.error('Error en getEmpleadosPresentes:', error);
      throw error;
    }
  }

  // ============================================
  // MÉTODOS DE FERIADOS
  // ============================================

  /**
   * Obtener lista de feriados
   * @param {number} year - Año específico (opcional)
   * @returns {Promise<Object>} - Lista de feriados
   */
  async getFeriados(year = null) {
    try {
      const params = year ? { year } : {};
      const response = await api.get('/admin/feriados.php', params);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || response.mensaje || 'Error al obtener feriados');
    } catch (error) {
      console.error('Error en getFeriados:', error);
      throw error;
    }
  }

  /**
   * Crear nuevo feriado
   * @param {Object} datos - Datos del feriado
   * @param {string} datos.fecha - Fecha YYYY-MM-DD (requerido)
   * @param {string} datos.nombre - Nombre del feriado (requerido)
   * @param {string} datos.descripcion - Descripción (opcional)
   * @returns {Promise<Object>} - Datos del feriado creado
   */
  async crearFeriado(datos) {
    try {
      const response = await api.post('/admin/feriados.php', datos);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || response.mensaje || 'Error al crear feriado');
    } catch (error) {
      console.error('Error en crearFeriado:', error);
      throw error;
    }
  }

  /**
   * Actualizar feriado existente
   * @param {number} feriadoId - ID del feriado
   * @param {Object} datos - Datos a actualizar
   * @returns {Promise<Object>} - Datos del feriado actualizado
   */
  async actualizarFeriado(feriadoId, datos) {
    try {
      const response = await api.put('/admin/feriados.php', {
        id: feriadoId,
        ...datos
      });
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || response.mensaje || 'Error al actualizar feriado');
    } catch (error) {
      console.error('Error en actualizarFeriado:', error);
      throw error;
    }
  }

  /**
   * Eliminar feriado (soft delete)
   * @param {number} feriadoId - ID del feriado
   * @returns {Promise<Object>} - Confirmación
   */
  async eliminarFeriado(feriadoId) {
    try {
      const response = await api.delete(`/admin/feriados.php?id=${feriadoId}`);

      if (response.success) {
        return response.data || { mensaje: 'Feriado eliminado' };
      }

      throw new Error(response.message || response.mensaje || 'Error al eliminar feriado');
    } catch (error) {
      console.error('Error en eliminarFeriado:', error);
      throw error;
    }
  }

  // ============================================
  // MÉTODOS DE NOVEDADES
  // ============================================

  /**
   * Obtener novedades del sistema (implementadas y planificadas)
   * @returns {Promise<Object>} - Lista de novedades { implementado: [...], planificado: [...] }
   */
  async getNovedades() {
    try {
      const response = await api.get('/admin/novedades.php');

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || response.mensaje || 'Error al obtener novedades');
    } catch (error) {
      console.error('Error en getNovedades:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
const adminService = new AdminService();
export default adminService;