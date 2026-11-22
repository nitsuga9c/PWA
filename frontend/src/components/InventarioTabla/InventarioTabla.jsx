import React from 'react';
import './InventarioTabla.css';

export default function InventarioTabla({ medicamentos, onDelete, onEdit }) {
  const medicamentosOrdenados = Array.isArray(medicamentos)
    ? [...medicamentos].sort((a, b) =>
        String(a.codigoArticulo || '').localeCompare(
          String(b.codigoArticulo || ''),
          undefined,
          { numeric: true, sensitivity: 'base' }
        )
      )
    : [];

  return (
    <div className="table-container">
      <h2 className="table-title">Inventario Actual</h2>
      <table className="inventario-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Descripción</th>
            <th>Stock</th>
            <th>Precio Público</th>
            <th>Estado</th>
            <th>Editar</th>
            <th>Eliminar</th>
          </tr>
        </thead>
        <tbody>
          {medicamentosOrdenados.map((med, index) => {
            const uniqueKey = med._id || med.id || med.tempId || `med-${index}`;
            const codigo = med.codigoArticulo || 'N/D';
            const descripcion = med.descripcion || med.name || 'Sin descripción';
            const existencias = med.existenciasTotal !== undefined ? med.existenciasTotal : (med.stock || 0);
            const precio = med.precioPublico !== undefined ? med.precioPublico : (med.precio || 0);

            return (
              <tr key={uniqueKey}>
                <td><strong>{codigo}</strong></td>
                <td>{descripcion}</td>
                <td>{existencias} unidades</td>
                <td>${Number(precio).toFixed(2)}</td>
                <td>
                  <span className={`badge-stock ${existencias >= 10 ? 'ok' : existencias <= 9 && existencias >= 1 ? 'bajo' : 'nulo'}`}>
                    {existencias >= 10 ? 'Disponible' : existencias <= 9 && existencias >= 1 ? 'Stock Bajo' : 'Sin stock'}
                  </span>
                </td>
                <td>
                  <button 
                    onClick={() => onEdit(med)}
                    className="btn-warning"
                    style={{
                      backgroundColor: '#e89c23',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '0.85rem'
                    }}
                  >
                    Editar
                  </button>
                </td>
                <td>
                  <button 
                    onClick={() => onDelete(uniqueKey)}
                    className="btn-danger"
                    style={{
                      backgroundColor: '#e11d48',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '0.85rem'
                    }}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}