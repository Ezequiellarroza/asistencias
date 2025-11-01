import { useState } from 'react';
import { Smartphone, ArrowRight, Loader2 } from 'lucide-react';

function Login({ onLogin, onAdminAccess }) {
  const [telefono, setTelefono] = useState('');
  const [loading, setLoading] = useState(false);

  // Sanitizar teléfono: solo números
  const sanitizarTelefono = (valor) => {
    return valor.replace(/[^0-9]/g, '');
  };

  // Formatear para mostrar (opcional, hace más legible)
  const formatearTelefono = (valor) => {
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
  const validarTelefono = (valor) => {
    const numeros = sanitizarTelefono(valor);
    // Mínimo 10 dígitos para Argentina
    return numeros.length >= 10;
  };

  const handleChange = (e) => {
    const valor = e.target.value;
    const formateado = formatearTelefono(valor);
    setTelefono(formateado);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const telefonoLimpio = sanitizarTelefono(telefono);
    
    if (validarTelefono(telefonoLimpio)) {
      setLoading(true);
      // Simular llamada a API
      setTimeout(() => {
        onLogin(telefonoLimpio); // Enviamos solo números
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md fade-in">
        {/* Logo/Header Card */}
        <div className="glass-card p-8 mb-6 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-emerald-500 via-green-500 to-amber-500 rounded-3xl flex items-center justify-center shadow-xl">
            <Smartphone className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-amber-600 bg-clip-text text-transparent mb-2">
            Sistema de Presentismo
          </h1>
          <p className="text-gray-700 text-sm">
            Ingresá tu número de teléfono para continuar
          </p>
        </div>

        {/* Login Form Card */}
        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Teléfono
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={telefono}
                  onChange={handleChange}
                  placeholder="2494 123 4567"
                  className="input-glass w-full px-4 py-4 text-lg focus:outline-none text-gray-800"
                  maxLength="18"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-600/60">
                  <Smartphone className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Código de área + número (ej: 2494 123 4567)
              </p>
            </div>

            <button
              type="submit"
              disabled={!validarTelefono(telefono) || loading}
              className="btn-glass-primary w-full py-4 px-6 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  Continuar
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 space-y-2">
          <p className="text-sm text-gray-600">
            Trinity Web Development
          </p>
          <button
            onClick={onAdminAccess}
            className="text-xs text-gray-500 hover:text-amber-600 transition-colors duration-200 underline"
          >
            Acceso Administrador
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;