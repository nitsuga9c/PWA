import React from 'react';
import './HeaderFarmacia.css';

export default function HeaderFarmacia({ onLogout }) {
  const role = localStorage.getItem('role');
  const esAdmin = role === 'admin';

  return (
    <header className="header-farmacia">
      <div className="header-brand-container">
        <h1 className="header-title">Farmacia Super Morelos</h1>

        <div className={`header-status-badge ${esAdmin ? 'header-status-badge--admin' : 'header-status-badge--user'}`}>
          <span className={`header-pulse-dot ${esAdmin ? 'header-pulse-dot--admin' : 'header-pulse-dot--user'}`}></span>
          <span className="header-status-text">
            {esAdmin ? 'Admin · En línea' : 'En línea'}
          </span>
        </div>
      </div>

      <button onClick={onLogout} className="header-logout-btn">
        Cerrar Sesión
      </button>
    </header>
  );
}