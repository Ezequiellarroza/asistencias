// Sanitizar teléfono: solo números
export const sanitizarTelefono = (valor) => {
  return valor.replace(/[^0-9]/g, '');
};

// Formatear para mostrar
export const formatearTelefono = (valor) => {
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
  const numeros = sanitizarTelefono(valor);
  // Mínimo 10 dígitos para Argentina
  return numeros.length >= 10;
};