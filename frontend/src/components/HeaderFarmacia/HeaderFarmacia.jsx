import React from 'react';
import './HeaderFarmacia.css'; //Css

export default function HeaderFarmacia({ onLogout }) {
  return (
    <header className="header-farmacia">
      <div className="header-brand-container">
        <h1 className="header-title">Farmacia Super Morelos</h1>
        
        <div className="header-status-badge">
          <span className="header-pulse-dot"></span>
          <span className="header-status-text">En línea</span>
        </div>
      </div>

      <button onClick={onLogout} className="header-logout-btn">
        Cerrar Sesión
      </button>
    </header>
  );
}