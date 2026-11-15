import React from 'react';
import './TarjetaEstadistica.css';

export default function TarjetaEstadistica({ titulo, valor, colorBorde }) {
  return (
    <div className="card-stats" style={{ borderLeftColor: colorBorde || '#0ea5e9' }}>
      <h3 className="card-title">{titulo}</h3>
      <p className="card-value">{valor}</p>
    </div>
  );
}