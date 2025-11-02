// --- MODIFICADO: Imports añadidos ---
import React, { useEffect } from 'react'; // 'useEffect' es nuevo
import { useAuth } from '../../context/AuthContext';
import { LogOut, Clock, Calendar } from 'lucide-react';
import { useGeolocation } from '../../hooks/useGeolocation'; // --- NUEVO IMPORT
import { calcularDistancia } from '../../utils/geolocation'; // --- NUEVO IMPORT

// --- NUEVO: Coordenadas de tu oficina para probar ---
const TU_OFICINA = {
  lat: -34.68983519828894,
  lon: -58.61409300677432,
};

function EmpleadoDashboard() {
  const { user, logout } = useAuth();
  
  // --- NUEVO: Hook de Geolocalización ---
  const { location, isLoading, error, requestLocation } = useGeolocation();

  // --- NUEVO: Lógica que reacciona al obtener la ubicación ---
  useEffect(() => {
    // 1. Solo se ejecuta si tenemos una ubicación válida
    if (location) {
      // 2. Calcula la distancia usando Haversine
      const distancia = calcularDistancia(
        location.latitude,
        location.longitude,
        TU_OFICINA.lat,
        TU_OFICINA.lon
      );

      // 3. Valida el radio de 100 metros
      if (distancia < 100) {
        alert(
          `¡Marcación VÁLIDA! 
Estás a ${distancia.toFixed(0)} metros de la oficina.`
        );
        // Aquí es donde llamarías a tu servicio:
        // marcacionService.marcarEntrada(user.id, location);
      } else {
        alert(
          `Marcación INVÁLIDA. 
Estás a ${distancia.toFixed(0)} metros de la oficina. Debes estar a menos de 100m.`
        );
      }
    }
  }, [location]); // Se ejecuta cada vez que 'location' cambia

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="glass-card p-6 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Dashboard Empleado
            </h1>
            <p className="text-sm text-gray-600">
              Teléfono: {user?.telefono}
            </p>
          </div>
          <button
            onClick={logout}
            className="btn-glass px-4 py-2 flex items-center gap-2 text-red-600"
          >
            <LogOut className="w-4 h-4" />
            Salir
          </button>
        </div>

        {/* Botones de marcación */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          
          {/* --- BOTÓN "MARCAR ENTRADA" MODIFICADO --- */}
          <button
            onClick={requestLocation} // Llama al hook para pedir GPS
            disabled={isLoading}       // Se deshabilita mientras carga
            className="glass-card p-8 hover:scale-105 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Clock className="w-12 h-12 mx-auto mb-4 text-emerald-600" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {/* Texto dinámico según el estado de carga */}
              {isLoading ? 'Obteniendo GPS...' : 'Marcar Entrada'}
            </h3>
            <p className="text-sm text-gray-600">
              Registrar ingreso
            </p>
          </button>
          {/* --- FIN DE MODIFICACIÓN --- */}

          <button className="glass-card p-8 hover:scale-105 transition-transform duration-200">
            <Clock className="w-12 h-12 mx-auto mb-4 text-amber-600" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Marcar Salida
            </h3>
            <p className="text-sm text-gray-600">
              Registrar egreso
            </p>
          </button>
        </div>

        {/* --- NUEVO: Zona para mostrar errores de GPS --- */}
        {error && (
          <div className="glass-card p-4 mb-6 text-red-700 font-semibold">
            <p>Error de GPS: {error}</p>
          </div>
        )}
        {/* --- FIN ZONA DE ERRORES --- */}

        {/* Historial */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-bold text-gray-800">
              Mi Historial
            </h2>
          </div>
          <p className="text-gray-600 text-center py-8">
            No hay registros recientes
          </p>
        </div>
      </div>
    </div>
  );
}

export default EmpleadoDashboard;