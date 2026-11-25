import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMedicines } from '../../services/api';
import HeaderFarmacia from '../../components/HeaderFarmacia/HeaderFarmacia';
import './CatalogoUser.css';

export default function CatalogoUser() {
  const [medicamentos, setMedicamentos] = useState([]);
  const [busquedaNombre, setBusquedaNombre] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getMedicines().then((data) => {
      if (Array.isArray(data)) {
        setMedicamentos(data);
      }
    });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const medicamentosFiltradosYOrdenados = useMemo(() => {
    const termino = busquedaNombre.trim().toLowerCase();

    return [...medicamentos]
      .filter((med) => {
        if (!termino) return true;
        const nombre = String(med.descripcion || med.name || '').toLowerCase();
        const codigo = String(med.codigoArticulo || '').toLowerCase();
        return nombre.includes(termino) || codigo.includes(termino);
      })
      .sort((a, b) =>
        String(a.codigoArticulo || '').localeCompare(
          String(b.codigoArticulo || ''),
          undefined,
          { numeric: true, sensitivity: 'base' }
        )
      );
  }, [medicamentos, busquedaNombre]);

  return (
    <>
      <HeaderFarmacia onLogout={handleLogout} />

      <main className="catalogo-simple">
        <div className="catalogo-box">
          <h1>Catálogo de Medicamentos</h1>

          <div style={{ marginBottom: '18px' }}>
            <input
              type="text"
              value={busquedaNombre}
              onChange={(e) => setBusquedaNombre(e.target.value)}
              placeholder="Buscar medicamento por nombre o código..."
              aria-label="Buscar medicamento por nombre"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                color: '#1e1b2e',
                fontSize: '0.95rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {medicamentosFiltradosYOrdenados.length === 0 ? (
            <p style={{ opacity: 0.85, textAlign: 'center', margin: '20px 0' }}>
              No se encontraron medicamentos con ese nombre.
            </p>
          ) : (
            <ul className="catalogo-lista">
              {medicamentosFiltradosYOrdenados.map((med, index) => (
                <li key={med._id || med.id || `cat-${index}`} className="catalogo-item">
                  <div>
                    <strong>{med.descripcion}</strong>
                    <span>{med.existenciasTotal} disponibles</span>
                    <span> Fecha de Caducidad: {med.fechaCaducidad ? new Date(med.fechaCaducidad).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <span className="catalogo-precio">${Number(med.precioPublico).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}