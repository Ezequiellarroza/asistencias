// ============================================
// VALIDATORS.JS - ACTUALIZADO
// Soporte para formato internacional +54 y local
// ============================================

// Sanitizar teléfono: extraer solo números y conservar +
export const sanitizarTelefono = (valor) => {
  // Si empieza con +54, mantener formato internacional
  if (valor.startsWith('+54')) {
    return valor.replace(/[^0-9+]/g, '');
  }
  // Si no, solo números (formato local)
  return valor.replace(/[^0-9]/g, '');
};

// Formatear para mostrar
export const formatearTelefono = (valor) => {
  // Si es formato internacional (+54...)
  if (valor.startsWith('+54')) {
    const limpio = valor.replace(/[^0-9+]/g, '');
    
    if (limpio.length <= 3) return limpio; // +54
    if (limpio.length <= 6) return `${limpio.slice(0, 3)} ${limpio.slice(3)}`; // +54 9
    if (limpio.length <= 9) return `${limpio.slice(0, 3)} ${limpio.slice(3, 6)} ${limpio.slice(6)}`; // +54 9 11
    if (limpio.length <= 13) return `${limpio.slice(0, 3)} ${limpio.slice(3, 6)} ${limpio.slice(6, 10)} ${limpio.slice(10)}`; // +54 9 11 1234
    return `${limpio.slice(0, 3)} ${limpio.slice(3, 6)} ${limpio.slice(6, 10)} ${limpio.slice(10, 14)}`; // +54 9 11 1234 5678
  }
  
  // Formato local (sin +54)
  const numeros = sanitizarTelefono(valor);
  
  // Si empieza con 2494 (Tandil)
  if (numeros.startsWith('2494')) {
    if (numeros.length <= 4) return numeros;
    if (numeros.length <= 7) return `${numeros.slice(0, 4)} ${numeros.slice(4)}`;
    return `${numeros.slice(0, 4)} ${numeros.slice(4, 7)} ${numeros.slice(7, 11)}`;
  }
  
  // Si empieza con 11 (CABA/GBA)
  if (numeros.startsWith('11')) {
    if (numeros.length <= 2) return numeros;
    if (numeros.length <= 6) return `${numeros.slice(0, 2)} ${numeros.slice(2)}`;
    return `${numeros.slice(0, 2)} ${numeros.slice(2, 6)} ${numeros.slice(6, 10)}`;
  }
  
  // Otros códigos de área (genérico)
  if (numeros.length <= 4) return numeros;
  if (numeros.length <= 7) return `${numeros.slice(0, 4)} ${numeros.slice(4)}`;
  return `${numeros.slice(0, 4)} ${numeros.slice(4, 7)} ${numeros.slice(7)}`;
};

// Validar si el teléfono es válido
export const validarTelefono = (valor) => {
  const limpio = sanitizarTelefono(valor);
  
  // Formato internacional: +54 9 XXXX XXXXXX (mínimo 13 caracteres)
  if (limpio.startsWith('+54')) {
    // +54 debe tener al menos 13 caracteres (+54 9 11 1234567)
    return limpio.length >= 13 && limpio.length <= 15;
  }
  
  // Formato local: mínimo 10 dígitos para Argentina
  const numeros = limpio.replace(/[^0-9]/g, '');
  return numeros.length >= 10 && numeros.length <= 11;
};