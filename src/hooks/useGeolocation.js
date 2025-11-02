import { useState } from 'react';

/**
 * Hook personalizado para manejar la Geolocation API.
 * Proporciona el estado de la ubicación, el estado de carga y un manejador de errores,
 * además de una función para solicitar la ubicación actual.
 * * Basado en los requisitos de "Validación GPS" del documento de planificación.
 *
 */
export const useGeolocation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  /**
   * Solicita la ubicación actual del usuario al navegador.
   */
  const requestLocation = () => {
    setIsLoading(true);
    setError(null);
    setLocation(null);

    if (!navigator.geolocation) {
      setError("La geolocalización no es soportada por este navegador.");
      setIsLoading(false);
      return;
    }

    // Opciones para alta precisión, crucial para la validación de oficinas
    const options = {
      enableHighAccuracy: true,
      timeout: 10000, // 10 segundos
      maximumAge: 0,
    };

    // Callback de éxito
    const onSuccess = (position) => {
      const { latitude, longitude } = position.coords;
      setLocation({ latitude, longitude });
      setIsLoading(false);
    };

    // Callback de error
    const onError = (err) => {
      // - Manejo de errores de permisos
      let errorMessage = "Un error desconocido ocurrió.";
      switch (err.code) {
        case err.PERMISSION_DENIED:
          errorMessage = "Permiso de geolocalización denegado.";
          break;
        case err.POSITION_UNAVAILABLE:
          errorMessage = "Información de ubicación no disponible.";
          break;
        case err.TIMEOUT:
          errorMessage = "La solicitud de geolocalización expiró.";
          break;
      }
      setError(errorMessage);
      setIsLoading(false);
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
  };

  return { 
    location,       // Objeto con { latitude, longitude } o null
    isLoading,      // boolean: true mientras busca
    error,          // string con el mensaje de error o null
    requestLocation // Función para iniciar la solicitud
  };
};