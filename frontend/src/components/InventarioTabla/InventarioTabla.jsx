import React from 'react';
import './InventarioTabla.css';

export default function InventarioTabla({ medicamentos, onDelete }) {
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
            <th>Acciones</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {medicamentos && medicamentos.map((med) => {
            // Extraer de forma segura el ID de MongoDB (_id)
            const uniqueKey = med._id || med.id;
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
                  <span className={`badge-stock ${existencias > 10 ? 'ok' : 'bajo'}`}>
                    {existencias > 10 ? 'Disponible' : 'Stock Bajo'}
                  </span>
                </td>
                <td>
                  <button 
                    onClick={() => onEdit(uniqueKey)}
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