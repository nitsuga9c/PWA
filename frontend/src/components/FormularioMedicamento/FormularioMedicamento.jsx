import React, { useState } from 'react';
import './FormularioMedicamento.css';

export default function FormularioMedicamento({ onAgregar }) {
  const [codigoArticulo, setCodigoArticulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precioPublico, setPrecioPublico] = useState('');
  const [precioNeto, setPrecioNeto] = useState('');
  const [existenciasTotal, setExistenciasTotal] = useState('');
  const [categoria, setCategoria] = useState('6af0c8a462b71c8215d2e940'); // El ID de tu categoría en MongoDB

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!codigoArticulo || !descripcion || !existenciasTotal) return;

    const nuevoMedicamento = {
      codigoArticulo,
      descripcion,
      precioPublico: Number(precioPublico) || 0,
      precioNeto: Number(precioNeto) || 0,
      existenciasTotal: Number(existenciasTotal),
      categoria // Envíe el ID de la categoría que creaste en tu base de datos
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/medicines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(nuevoMedicamento)
      });

      if (response.ok) {
        const data = await response.json();
        onAgregar(data); // Agrega el medicamento guardado en la BD a la tabla de la interfaz
        
        // Limpiamos los campos
        setCodigoArticulo('');
        setDescripcion('');
        setPrecioPublico('');
        setPrecioNeto('');
        setExistenciasTotal('');
        setCategoria('6af0c8a462b71c8215d2e940');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Error al registrar el medicamento');
      }
    } catch (error) {
      console.error('Error de red al guardar:', error);
      alert('No se pudo conectar con el servidor.');
    }
  };

  return (
    <div className="form-container">
      <h3 className="form-title">Agregar Nuevo Medicamento</h3>
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

        <button type="submit" className="form-submit-btn">Guardar</button>
      </form>
    </div>
  );
}