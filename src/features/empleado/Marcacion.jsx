import React, { useEffect } from 'react';
import { useGeolocation } from '../../hooks/useGeolocation';
import { calcularDistancia } from '../../utils/geolocation'; //

// Tus coordenadas de Buenos Aires
const TU_OFICINA = { 
  lat: -34.68983519828894, 
  lon: -58.61409300677432 
};

const MarcacionComponent = () => {
  const { location, isLoading, error, requestLocation } = useGeolocation(); //

  const handleMarcarEntrada = () => {
    // 1. Pide la ubicación
    requestLocation(); //
  };

  // 2. Reacciona cuando la ubicación se obtiene
  useEffect(() => {
    if (location) {
      // 3. Calcula la distancia
      const distancia = calcularDistancia( //
        location.latitude,
        location.longitude,
        TU_OFICINA.lat,
        TU_OFICINA.lon
      );

      // 4. Valida contra el radio permitido (ej. 100 metros)
      //
      if (distancia < 100) {
        alert(`¡Marcación VÁLIDA! 
Estás a ${distancia.toFixed(0)} metros de la oficina.`);
        // Aquí llamarías a tu `marcacionService.js` para enviar al backend
      } else {
        alert(`Marcación INVÁLIDA. 
Estás a ${distancia.toFixed(0)} metros de la oficina. Debes estar a menos de 100m.`);
      }
    }
  }, [location]);

  return (
    <div>
      <button onClick={handleMarcarEntrada} disabled={isLoading}>
        {isLoading ? "Obteniendo GPS..." : "Probar Marcación"}
      </button>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      
      {/* Opcional: para ver los datos mientras pruebas */}
      {location && (
        <div style={{ marginTop: '20px' }}>
          <p><strong>Tu Ubicación (GPS):</strong></p>
          <small>Lat: {location.latitude}</small><br />
          <small>Lon: {location.longitude}</small>
        </div>
      )}
    </div>
  );
};

export default MarcacionComponent;