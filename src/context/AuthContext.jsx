import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay una sesión guardada en localStorage
    // Primero intentar con 'user' (formato nuevo)
    let savedUser = localStorage.getItem('user');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      // Si no existe 'user', intentar construirlo desde 'empleado' + 'jwt_token'
      const empleado = localStorage.getItem('empleado');
      const jwtToken = localStorage.getItem('jwt_token');
      
      if (empleado && jwtToken) {
        const empleadoData = JSON.parse(empleado);
        const userData = {
          id: empleadoData.id,
          tipo: 'empleado',
          nombre: empleadoData.nombre,
          apellido: empleadoData.apellido,
          telefono: empleadoData.telefono
        };
        setUser(userData);
        // Guardar en formato 'user' para próxima vez
        localStorage.setItem('user', JSON.stringify(userData));
      }
    }
    
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('empleado');
    localStorage.removeItem('oficina');
    localStorage.removeItem('jwt_token');
  };

  const isEmpleado = () => {
    return user?.tipo === 'empleado';
  };

  const isAdmin = () => {
    return user?.tipo === 'admin';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      loading,
      isEmpleado,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};