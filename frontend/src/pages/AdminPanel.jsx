import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderFarmacia from '../components/HeaderFarmacia/HeaderFarmacia';
import TarjetaEstadistica from '../components/TarjetaEstadistica/TarjetaEstadistica';
import InventarioTabla from '../components/InventarioTabla/InventarioTabla';
import FormularioMedicamento from '../components/FormularioMedicamento/FormularioMedicamento';

export default function AdminPanel() {
  const navigate = useNavigate();
  const [medicamentos, setMedicamentos] = useState([]);

  // Cargar medicamentos del backend
  useEffect(() => {
    fetch('http://localhost:5000/api/medicines')
      .then(res => res.json())
      .then(data => setMedicamentos(data))
      .catch(err => console.error('Error al cargar medicamentos:', err));
  }, []);

  const handleLogout = () => {
    navigate('/'); 
  };

  const handleAgregarMedicamento = (nuevoMed) => {
    setMedicamentos([nuevoMed, ...medicamentos]);
  };

  // NUEVA FUNCIÓN PARA ELIMINAR
  const handleEliminarMedicamento = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este medicamento?')) return;

    try {
      const token = localStorage.getItem('token'); // Si tu ruta requiere token de admin
      const response = await fetch(`http://localhost:5000/api/medicines/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Filtramos el estado para remover el medicamento eliminado de la interfaz
        setMedicamentos(medicamentos.filter(med => (med._id || med.id) !== id));
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Error al eliminar el medicamento');
      }
    } catch (error) {
      console.error('Error de red al eliminar:', error);
      alert('No se pudo conectar con el servidor para eliminar.');
    }
  };

  return (
    <div style={{ backgroundColor: '#faf5ff', minHeight: '100vh', paddingBottom: '40px' }}>
      <HeaderFarmacia onLogout= {handleLogout} />
      
      <div style={{ maxWidth: '1100px', margin: '20px auto', padding: '0 20px' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          <TarjetaEstadistica titulo="Total Medicamentos" valor={medicamentos.length} colorBorde="#8b5cf6" />
          <TarjetaEstadistica titulo="Stock Crítico" valor={medicamentos.filter(m => (m.stock || m.existenciasTotal) <= 10).length} colorBorde="#e11d48" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
          {/* Pasar la función onDelete a la tabla */}
          <FormularioMedicamento onAgregar={handleAgregarMedicamento} />
          <InventarioTabla medicamentos={medicamentos} onDelete={handleEliminarMedicamento} />
        </div>

      </div>
    </div>
  );
}