import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderFarmacia from '../components/HeaderFarmacia/HeaderFarmacia';
import TarjetaEstadistica from '../components/TarjetaEstadistica/TarjetaEstadistica';
import InventarioTabla from '../components/InventarioTabla/InventarioTabla';
import FormularioMedicamento from '../components/FormularioMedicamento/FormularioMedicamento';

export default function AdminPanel() {
  const navigate = useNavigate();
  const [medicamentos, setMedicamentos] = useState([]);
  
  // Estado para saber cuál medicamento se está editando actualmente
  const [medicamentoEditando, setMedicamentoEditando] = useState(null);

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

  // Función para actualizar el estado tras una edición exitosa
  const handleActualizarMedicamento = (medicamentoActualizado) => {
    setMedicamentos(medicamentos.map(med => 
      (med._id === medicamentoActualizado._id || med.id === medicamentoActualizado._id) 
        ? medicamentoActualizado 
        : med
    ));
    setMedicamentoEditando(null);
  };

  const handleEliminarMedicamento = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este medicamento?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/medicines/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Eliminar el medicamento del estado local
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
      <HeaderFarmacia onLogout={handleLogout} />
      
      <div style={{ maxWidth: '1100px', margin: '20px auto', padding: '0 20px' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          <TarjetaEstadistica titulo="Total Medicamentos" valor={medicamentos.length} colorBorde="#8b5cf6" />
          <TarjetaEstadistica titulo="Stock Crítico" valor={medicamentos.filter(m => (m.stock || m.existenciasTotal) <= 10  && (m.stock || m.existenciasTotal) >0).length} colorBorde="#e1c71d" />
          <TarjetaEstadistica titulo="Sin Stock" valor={medicamentos.filter(m => (m.stock || m.existenciasTotal) === 0  ).length} colorBorde="#e11d48" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
          <FormularioMedicamento 
            onAgregar={handleAgregarMedicamento} 
            medicamentoEditando={medicamentoEditando}
            onActualizar={handleActualizarMedicamento}
            cancelarEdicion={() => setMedicamentoEditando(null)}
          />
          <InventarioTabla 
            medicamentos={medicamentos} 
            onDelete={handleEliminarMedicamento} 
            onEdit={(med) => setMedicamentoEditando(med)}
          />
        </div>

      </div>
    </div>
  );
}