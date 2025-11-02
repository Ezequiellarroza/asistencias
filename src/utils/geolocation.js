/**
 * Calcula la distancia en metros entre dos coordenadas GPS usando la fórmula de Haversine.
 * Esta fórmula fue extraída del documento de planificación del proyecto.
 *
 *
 * @param {number} lat1 Latitud del primer punto
 * @param {number} lon1 Longitud del primer punto
 * @param {number} lat2 Latitud del segundo punto
 * @param {number} lon2 Longitud del segundo punto
 * @returns {number} La distancia en metros
 */
export function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Radio de la Tierra en metros
  
  // Convertir grados a radianes
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distancia = R * c;
  
  return distancia; // Distancia en metros
}