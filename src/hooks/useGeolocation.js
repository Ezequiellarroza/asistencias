// src/hooks/useGeolocation.js
// Hook personalizado para manejar geolocalización GPS

import { useState, useEffect, useCallback } from 'react';

const useGeolocation = (options = {}) => {
  const [location, setLocation] = useState({
    latitud: null,
    longitud: null,
    accuracy: null,
    timestamp: null
  });
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('prompt'); // 'granted', 'denied', 'prompt'

  // Opciones por defecto para geolocalización
  const defaultOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
    ...options
  };

  /**
   * Verificar el estado del permiso de geolocalización
   */
  const checkPermissionStatus = useCallback(async () => {
    if (!navigator.permissions) {
      return 'unsupported';
    }

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      setPermissionStatus(result.state);
      
      // Escuchar cambios en el permiso
      result.addEventListener('change', () => {
        setPermissionStatus(result.state);
      });
      
      return result.state;
    } catch (err) {
      console.error('Error checking permission:', err);
      return 'unsupported';
    }
  }, []);

  /**
   * Obtener ubicación actual
   */
  const getLocation = useCallback(() => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      const err = new Error('Geolocalización no soportada por el navegador');
      setError(err);
      setLoading(false);
      return Promise.reject(err);
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData = {
            latitud: position.coords.latitude,
            longitud: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };
          
          setLocation(locationData);
          setLoading(false);
          resolve(locationData);
        },
        (err) => {
          let errorMessage = 'Error al obtener ubicación';
          
          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMessage = 'Permiso de ubicación denegado. Por favor, habilita el GPS en la configuración.';
              break;
            case err.POSITION_UNAVAILABLE:
              errorMessage = 'Información de ubicación no disponible';
              break;
            case err.TIMEOUT:
              errorMessage = 'Tiempo de espera agotado al obtener ubicación';
              break;
            default:
              errorMessage = err.message || 'Error desconocido al obtener ubicación';
          }
          
          const error = new Error(errorMessage);
          error.code = err.code;
          
          setError(error);
          setLoading(false);
          reject(error);
        },
        defaultOptions
      );
    });
  }, [defaultOptions]);

  /**
   * Observar ubicación en tiempo real (watchPosition)
   */
  const watchLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError(new Error('Geolocalización no soportada'));
      return null;
    }

    setLoading(true);

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const locationData = {
          latitud: position.coords.latitude,
          longitud: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };
        
        setLocation(locationData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(new Error(err.message));
        setLoading(false);
      },
      defaultOptions
    );

    return watchId;
  }, [defaultOptions]);

  /**
   * Detener observación de ubicación
   */
  const clearWatch = useCallback((watchId) => {
    if (watchId && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  /**
   * Calcular distancia entre dos puntos (en metros)
   * Fórmula de Haversine
   */
  const calcularDistancia = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distancia en metros
  }, []);

  /**
   * Verificar si está dentro del radio permitido
   */
  const estaEnRango = useCallback((oficinaLat, oficinaLng, radio) => {
    if (!location.latitud || !location.longitud) {
      return false;
    }

    const distancia = calcularDistancia(
      location.latitud, 
      location.longitud, 
      oficinaLat, 
      oficinaLng
    );

    return distancia <= radio;
  }, [location, calcularDistancia]);

  // Verificar permiso al montar el componente
  useEffect(() => {
    checkPermissionStatus();
  }, [checkPermissionStatus]);

  return {
    location,
    error,
    loading,
    permissionStatus,
    getLocation,
    watchLocation,
    clearWatch,
    calcularDistancia,
    estaEnRango,
    checkPermissionStatus
  };
};

export default useGeolocation;