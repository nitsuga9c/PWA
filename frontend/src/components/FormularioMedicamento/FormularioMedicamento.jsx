import React, { useState, useEffect } from 'react';
import './FormularioMedicamento.css';

export default function FormularioMedicamento({ onAgregar, medicamentoEditando, onActualizar, cancelarEdicion }) {
  const [codigoArticulo, setCodigoArticulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precioPublico, setPrecioPublico] = useState('');
  const [precioNeto, setPrecioNeto] = useState('');
  const [existenciasTotal, setExistenciasTotal] = useState('');
  const [categoria, setCategoria] = useState('6af0c8a462b71c8215d2e940');

  // Cada vez que cambie "medicamentoEditando", rellenamos el formulario si existe
  useEffect(() => {
    if (medicamentoEditando) {
      setCodigoArticulo(medicamentoEditando.codigoArticulo || '');
      setDescripcion(medicamentoEditando.descripcion || '');
      setPrecioPublico(medicamentoEditando.precioPublico || '');
      setPrecioNeto(medicamentoEditando.precioNeto || '');
      setExistenciasTotal(medicamentoEditando.existenciasTotal || '');
      if (medicamentoEditando.categoria) {
        setCategoria(typeof medicamentoEditando.categoria === 'object' ? medicamentoEditando.categoria._id : medicamentoEditando.categoria);
      }
    } else {
      limpiarFormulario();
    }
  }, [medicamentoEditando]);

  const limpiarFormulario = () => {
    setCodigoArticulo('');
    setDescripcion('');
    setPrecioPublico('');
    setPrecioNeto('');
    setExistenciasTotal('');
    setCategoria('6af0c8a462b71c8215d2e940');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!codigoArticulo || !descripcion || !existenciasTotal) return;

    const datosMedicamento = {
      codigoArticulo,
      descripcion,
      precioPublico: Number(precioPublico) || 0,
      precioNeto: Number(precioNeto) || 0,
      existenciasTotal: Number(existenciasTotal),
      categoria
    };

    const token = localStorage.getItem('token');

    try {
      if (medicamentoEditando) {
        // --- PETICIÓN PUT (ACTUALIZAR) ---
        const id = medicamentoEditando._id || medicamentoEditando.id;
        const response = await fetch(`http://localhost:5000/api/medicines/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(datosMedicamento)
        });

        if (response.ok) {
          const actualizado = await response.json();
          onActualizar(actualizado);
          alert('¡Medicamento actualizado con éxito!');
          cancelarEdicion();
        } else {
          const errData = await response.json();
          alert(errData.error || 'Error al actualizar');
        }
      } else {
        // --- PETICIÓN POST (CREAR) ---
        const response = await fetch('http://localhost:5000/api/medicines', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(datosMedicamento)
        });

        if (response.ok) {
          const nuevo = await response.json();
          onAgregar(nuevo);
          alert('¡Medicamento registrado con éxito!');
          limpiarFormulario();
        } else {
          const errData = await response.json();
          alert(errData.error || 'Error al registrar');
        }
      }
    } catch (error) {
      console.error('Error de red:', error);
      alert('No se pudo conectar con el servidor.');
    }
  };

  return (
    <div className="form-container">
      <h3 className="form-title">
        {medicamentoEditando ? 'Editar Medicamento' : 'Agregar Nuevo Medicamento'}
      </h3>
      <form onSubmit={handleSubmit}>
        
        <div className="form-group">
          <label>Código de Artículo</label>
          <input 
            type="text" 
            value={codigoArticulo} 
            onChange={(e) => setCodigoArticulo(e.target.value)} 
            placeholder="Ej. MED-002" 
            required 
          />
        </div>

        <div className="form-group">
          <label>Descripción / Nombre</label>
          <input 
            type="text" 
            value={descripcion} 
            onChange={(e) => setDescripcion(e.target.value)} 
            placeholder="Ej. Ibuprofeno 400mg" 
            required 
          />
        </div>

        <div className="form-group">
          <label>Precio Público ($)</label>
          <input 
            type="number" 
            step="0.01"
            value={precioPublico} 
            onChange={(e) => setPrecioPublico(e.target.value)} 
            placeholder="Ej. 45.00" 
            required 
          />
        </div>

        <div className="form-group">
          <label>Precio Neto ($)</label>
          <input 
            type="number" 
            step="0.01"
            value={precioNeto} 
            onChange={(e) => setPrecioNeto(e.target.value)} 
            placeholder="Ej. 25.00" 
            required 
          />
        </div>

        <div className="form-group">
          <label>Existencias Totales (Stock)</label>
          <input 
            type="number" 
            value={existenciasTotal} 
            onChange={(e) => setExistenciasTotal(e.target.value)} 
            placeholder="Ej. 50" 
            required 
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" className="form-submit-btn">
            {medicamentoEditando ? 'Actualizar Cambios' : 'Guardar'}
          </button>
          
          {medicamentoEditando && (
            <button 
              type="button" 
              onClick={cancelarEdicion}
              style={{
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '6px',
                fontWeight: '600',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}