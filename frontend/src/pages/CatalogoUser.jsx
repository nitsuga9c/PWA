import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMedicines } from '../services/api';
import HeaderFarmacia from '../components/HeaderFarmacia/HeaderFarmacia';
import './CatalogoUser.css';

export default function CatalogoUser() {
  const [medicamentos, setMedicamentos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getMedicines().then((data) => setMedicamentos(data));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <>
      <HeaderFarmacia onLogout={handleLogout} />

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
    </>
  );
}