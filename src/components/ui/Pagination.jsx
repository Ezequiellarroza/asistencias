import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Componente Pagination Reutilizable
 * 
 * @param {number} currentPage - Página actual (1-indexed)
 * @param {number} totalPages - Total de páginas
 * @param {number} totalItems - Total de items
 * @param {number} itemsPerPage - Items por página
 * @param {function} onPageChange - Callback cuando cambia la página
 * @param {function} onItemsPerPageChange - Callback cuando cambia items por página
 */
function Pagination({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange
}) {
  
  // Calcular el rango de items mostrados
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Opciones de items por página
  const limitOptions = [10, 20, 50, 100];

  // Handlers
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value);
    onItemsPerPageChange(newLimit);
  };

  // Si no hay items, mostrar mensaje
  if (totalItems === 0) {
    return (
      <div className="glass-card p-4">
        <p className="text-center text-gray-600 text-sm">
          No hay registros para mostrar
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Info de registros */}
        <div className="text-sm text-gray-600">
          Mostrando <span className="font-semibold text-gray-800">{startItem}</span> a{' '}
          <span className="font-semibold text-gray-800">{endItem}</span> de{' '}
          <span className="font-semibold text-gray-800">{totalItems}</span> registros
        </div>

        {/* Controles de paginación */}
        <div className="flex items-center gap-3">
          
          {/* Selector de items por página */}
          <div className="flex items-center gap-2">
            <label htmlFor="itemsPerPage" className="text-sm text-gray-600 whitespace-nowrap">
              Por página:
            </label>
            <select
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={handleLimitChange}
              className="input-glass px-3 py-1 text-sm"
            >
              {limitOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Botones de navegación */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className="btn-glass px-3 py-2 flex items-center gap-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Anterior</span>
            </button>

            {/* Info de página actual */}
            <div className="px-4 py-2 text-sm">
              <span className="text-gray-600">Página</span>{' '}
              <span className="font-semibold text-gray-800">{currentPage}</span>
              <span className="text-gray-600"> de </span>
              <span className="font-semibold text-gray-800">{totalPages}</span>
            </div>

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="btn-glass px-3 py-2 flex items-center gap-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Página siguiente"
            >
              <span className="hidden sm:inline">Siguiente</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Pagination;