import React, { useEffect, useState } from 'react';
import { getMedicines } from '../services/api';
import './CatalogoUser.css';

export default function CatalogoUser() {
  const [medicamentos, setMedicamentos] = useState([]);

  useEffect(() => {
    getMedicines().then((data) => setMedicamentos(data));
  }, []);

  return (
    <main className="catalogo-simple">
      <div className="catalogo-box">
        <h1>Catálogo de Medicamentos</h1>

        <ul className="catalogo-lista">
          {medicamentos.map((med) => (
            <li key={med._id} className="catalogo-item">
              <div>
                <strong>{med.descripcion}</strong>
                <span>{med.existenciasTotal} disponibles</span>
              </div>
              <span className="catalogo-precio">${Number(med.precioPublico).toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}