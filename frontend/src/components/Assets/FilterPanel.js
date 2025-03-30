// src/components/Assets/FilterPanel.js
import React from 'react';
import styles from './FilterPanel.module.css';
import { ASSET_TYPES } from '../../utils/helpers'; // Importa los tipos

// Recibe los filtros actuales y una función para actualizarlos
function FilterPanel({ filters, onFilterChange }) {

  const handleTypeChange = (e) => {
    const { value, checked } = e.target;
    // Asume que 'filters.type' es un array o Set de tipos seleccionados
    let currentTypes = new Set(filters.type || []);
    if (checked) {
      currentTypes.add(value);
    } else {
      currentTypes.delete(value);
    }
    onFilterChange({ ...filters, type: Array.from(currentTypes) });
  };

  const handleSortChange = (e) => {
      const [sortBy, order] = e.target.value.split('-'); // ej: 'fechaSubida-desc'
      onFilterChange({ ...filters, sortBy, order });
  };

  return (
    <aside className={styles.panel}>
      <h3 className={styles.title}>Filtros</h3>

        <div className={styles.filterGroup}>
            <label htmlFor="sort-select" className={styles.groupLabel}>Ordenar por:</label>
            <select
                id="sort-select"
                className={styles.selectInput}
                value={`${filters.sortBy || 'fechaSubida'}-${filters.order || 'desc'}`}
                onChange={handleSortChange}
            >
                <option value="fechaSubida-desc">Más recientes</option>
                <option value="fechaSubida-asc">Más antiguos</option>
                <option value="titulo-asc">Título (A-Z)</option>
                <option value="titulo-desc">Título (Z-A)</option>
                {/* Añadir más opciones si tu backend las soporta (likes, descargas...) */}
            </select>
        </div>

      <div className={styles.filterGroup}>
        <h4 className={styles.groupLabel}>Tipo de asset</h4>
        {ASSET_TYPES.map((type) => (
          <div key={type} className={styles.checkboxItem}>
            <input
              type="checkbox"
              id={`type-${type}`}
              value={type}
              checked={filters.type?.includes(type) || false}
              onChange={handleTypeChange}
              className={styles.checkboxInput}
            />
            <label htmlFor={`type-${type}`} className={styles.checkboxLabel}>
              {type}
            </label>
          </div>
        ))}
      </div>

      {/* Puedes añadir más filtros aquí (fecha, autor, etc.) */}

      {/* <Button onClick={() => onFilterChange({})} variant="secondary" size="small">
        Limpiar Filtros
      </Button> */}
    </aside>
  );
}

export default FilterPanel;