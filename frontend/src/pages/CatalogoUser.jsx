import React, { useEffect, useState } from 'react';
import { getMedicines } from '../services/api';

export default function CatalogoUser() {
  const [medicamentos, setMedicamentos] = useState([]);

  useEffect(() => {
    getMedicines().then(data => setMedicamentos(data));
  }, []);

  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
      <h2>Catálogo de Medicamentos</h2>
      <ul>
        {medicamentos.map(med => (
          <li key={med._id}>
            <strong>{med.descripcion}</strong> - ${med.precioPublico} (Stock: {med.existenciasTotal})
          </li>
        ))}
      </ul>
    </div>
  );
}