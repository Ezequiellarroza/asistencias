import { createContext, useContext, useState, useCallback } from 'react';

/**
 * Context para gestionar toasts
 * Sin dependencias externas - solo React
 */
const ToastContext = createContext(null);

/**
 * Provider de Toast
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    const newToast = { ...toast, id };
    
    setToasts((prev) => [...prev, newToast]);
    
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const toast = {
    success: (message, duration = 4000) => {
      return addToast({ message, type: 'success', duration });
    },
    
    error: (message, duration = 5000) => {
      return addToast({ message, type: 'error', duration });
    },
    
    warning: (message, duration = 4000) => {
      return addToast({ message, type: 'warning', duration });
    },
    
    info: (message, duration = 4000) => {
      return addToast({ message, type: 'info', duration });
    },
    
    custom: (message, type = 'info', duration = 4000) => {
      return addToast({ message, type, duration });
    }
  };

  return (
    <ToastContext.Provider value={{ toast, toasts, removeToast, clearToasts }}>
      {children}
    </ToastContext.Provider>
  );
}

/**
 * Hook personalizado para usar toasts
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast debe ser usado dentro de ToastProvider');
  }
  
  return context;
};

export default useToast;