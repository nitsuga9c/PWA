import React, { useState } from 'react';
import './InventarioTabla.css';

export default function InventarioTabla({ medicamentos, onDelete, onEdit, onUpdateStock }) {
  const [busqueda, setBusqueda] = useState('');

  const medicamentosOrdenados = Array.isArray(medicamentos)
    ? [...medicamentos]
        .filter((med) => {
          const texto = busqueda.trim().toLowerCase();
          if (!texto) return true;
          const nombre = String(med.descripcion || med.name || '').toLowerCase();
          const codigo = String(med.codigoArticulo || '').toLowerCase();
          return nombre.includes(texto) || codigo.includes(texto);
        })
        .sort((a, b) =>
          String(a.codigoArticulo || '').localeCompare(
            String(b.codigoArticulo || ''),
            undefined,
            { numeric: true, sensitivity: 'base' }
          )
        )
    : [];

  const tieneScroll = medicamentosOrdenados.length > 5;

  const cambiarStock = (med, delta) => {
    const stockActual =
      med.existenciasTotal !== undefined ? Number(med.existenciasTotal) : Number(med.stock || 0);
    const nuevoStock = Math.max(0, stockActual + delta);
    if (nuevoStock === stockActual) return;

    if (onUpdateStock) {
      onUpdateStock(med, nuevoStock);
    }
  };

  return (
    <div className="table-container">
      <div className="table-header-bar">
        <h2 className="table-title">Inventario Actual ({medicamentosOrdenados.length})</h2>
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o código..."
          aria-label="Buscar medicamento por nombre o código"
          className="table-search-input"
        />
      </div>

      <div className={`table-scroll-wrapper ${tieneScroll ? 'table-scroll-wrapper--active' : ''}`}>
        <table className="inventario-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Descripción</th>
              <th>Stock</th>
              <th>Fecha de Caducidad</th>
              <th>Precio Público</th>
              <th>Estado</th>
              <th>Editar</th>
              <th>Eliminar</th>
            </tr>
          </thead>
          <tbody>
            {medicamentosOrdenados.length === 0 ? (
              <tr>
                <td colSpan="8" className="table-empty-msg">
                  No se encontraron medicamentos con "{busqueda}".
                </td>
              </tr>
            ) : (
              medicamentosOrdenados.map((med, index) => {
                const uniqueKey = med._id || med.id || med.tempId || `med-${index}`;
                const codigo = med.codigoArticulo || 'N/D';
                const descripcion = med.descripcion || med.name || 'Sin descripción';
                const existencias =
                  med.existenciasTotal !== undefined ? med.existenciasTotal : (med.stock || 0);
                const fechaCaducidad = med.fechaCaducidad
                  ? new Date(med.fechaCaducidad).toLocaleDateString()
                  : 'N/D';
                const precio =
                  med.precioPublico !== undefined ? med.precioPublico : (med.precio || 0);

                return (
                  <tr key={uniqueKey}>
                    <td><strong>{codigo}</strong></td>
                    <td>{descripcion}</td>
                    <td>
                      <div className="stock-control">
                        <button
                          type="button"
                          onClick={() => cambiarStock(med, -1)}
                          disabled={existencias <= 0}
                          className="stock-btn"
                          aria-label={`Restar 1 unidad a ${descripcion}`}
                          title="Quitar 1 unidad"
                        >
                          −
                        </button>
                        <span className="stock-value">{existencias}</span>
                        <button
                          type="button"
                          onClick={() => cambiarStock(med, 1)}
                          className="stock-btn"
                          aria-label={`Sumar 1 unidad a ${descripcion}`}
                          title="Añadir 1 unidad"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td>{fechaCaducidad}</td>
                    <td>${Number(precio).toFixed(2)}</td>
                    <td>
                      <span
                        className={`badge-stock ${
                          existencias >= 10
                            ? 'ok'
                            : existencias <= 9 && existencias >= 1
                            ? 'bajo'
                            : 'nulo'
                        }`}
                      >
                        {existencias >= 10
                          ? 'Disponible'
                          : existencias <= 9 && existencias >= 1
                          ? 'Stock Bajo'
                          : 'Sin stock'}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => onEdit(med)}
                        className="btn-warning"
                      >
                        Editar
                      </button>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => onDelete(uniqueKey)}
                        className="btn-danger"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}