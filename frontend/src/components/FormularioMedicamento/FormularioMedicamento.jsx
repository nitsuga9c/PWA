import React, { useState, useEffect } from 'react';
import './FormularioMedicamento.css';

const PREFIJO_CODIGO = 'MED-';

function limpiarPrefijo(codigo = '') {
  return String(codigo).replace(/^MED-/i, '').trim();
}

function formatearCodigo(numeroCodigo = '') {
  const limpio = limpiarPrefijo(numeroCodigo);
  return limpio ? `${PREFIJO_CODIGO}${limpio}` : '';
}

export default function FormularioMedicamento({ onAgregar, medicamentoEditando, onActualizar, cancelarEdicion }) {
  const [numeroCodigo, setNumeroCodigo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precioPublico, setPrecioPublico] = useState('');
  const [precioNeto, setPrecioNeto] = useState('');
  const [existenciasTotal, setExistenciasTotal] = useState('');
  const [categoria, setCategoria] = useState('6af0c8a462b71c8215d2e940');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setErrorMsg('');
    if (medicamentoEditando) {
      setNumeroCodigo(limpiarPrefijo(medicamentoEditando.codigoArticulo || ''));
      setDescripcion(medicamentoEditando.descripcion || '');
      setPrecioPublico(medicamentoEditando.precioPublico ?? '');
      setPrecioNeto(medicamentoEditando.precioNeto ?? '');
      setExistenciasTotal(medicamentoEditando.existenciasTotal ?? '');
      if (medicamentoEditando.categoria) {
        setCategoria(
          typeof medicamentoEditando.categoria === 'object'
            ? medicamentoEditando.categoria._id
            : medicamentoEditando.categoria
        );
      }
    } else {
      limpiarFormulario();
    }
  }, [medicamentoEditando]);

  const limpiarFormulario = () => {
    setNumeroCodigo('');
    setDescripcion('');
    setPrecioPublico('');
    setPrecioNeto('');
    setExistenciasTotal('');
    setCategoria('6af0c8a462b71c8215d2e940');
    setErrorMsg('');
  };

  const validarCampos = () => {
    const codigoLimpio = limpiarPrefijo(numeroCodigo);
    const descLimpia = descripcion.trim();
    const pub = Number(precioPublico);
    const net = Number(precioNeto);
    const stock = Number(existenciasTotal);

    if (!codigoLimpio) {
      return 'Escribe el número del código de artículo (ej. 002).';
    }
    if (!/^[a-zA-Z0-9-]+$/.test(codigoLimpio)) {
      return 'El código solo puede contener letras, números o guiones.';
    }
    if (descLimpia.length < 3) {
      return 'La descripción debe tener al menos 3 caracteres.';
    }
    if (precioPublico === '' || Number.isNaN(pub) || pub < 0) {
      return 'El precio público debe ser un número válido mayor o igual a 0.';
    }
    if (precioNeto === '' || Number.isNaN(net) || net < 0) {
      return 'El precio neto debe ser un número válido mayor o igual a 0.';
    }
    if (net > pub) {
      return 'El precio neto no puede ser mayor que el precio público.';
    }
    if (existenciasTotal === '' || Number.isNaN(stock) || !Number.isInteger(stock) || stock < 0) {
      return 'Las existencias deben ser un número entero mayor o igual a 0.';
    }

    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validacion = validarCampos();
    if (validacion) {
      setErrorMsg(validacion);
      return;
    }

    setErrorMsg('');

    const datosMedicamento = {
      codigoArticulo: formatearCodigo(numeroCodigo),
      descripcion: descripcion.trim(),
      precioPublico: Number(precioPublico),
      precioNeto: Number(precioNeto),
      existenciasTotal: Number(existenciasTotal),
      categoria
    };

    const token = localStorage.getItem('token');

    try {
      if (medicamentoEditando) {
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
          setErrorMsg(errData.error || errData.message || 'Error al actualizar');
        }
      } else {
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
          setErrorMsg(errData.error || errData.message || 'Error al registrar');
        }
      }
    } catch (error) {
      console.error('Error de red:', error);
      setErrorMsg('No se pudo conectar con el servidor.');
    }
  };

  return (
    <div className="form-container">
      <h3 className="form-title">
        {medicamentoEditando ? 'Editar Medicamento' : 'Agregar Nuevo Medicamento'}
      </h3>

      {errorMsg && (
        <p
          role="alert"
          style={{
            backgroundColor: '#ffe4e6',
            color: '#9f1239',
            padding: '10px 12px',
            borderRadius: '8px',
            fontSize: '0.88rem',
            fontWeight: 600,
            marginBottom: '14px'
          }}
        >
          {errorMsg}
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="codigoNumero">Código de Artículo</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                padding: '10px 12px',
                borderRadius: '6px',
                backgroundColor: '#f3e8ff',
                color: '#581c87',
                fontWeight: 700,
                border: '1px solid #e9d5ff',
                userSelect: 'none'
              }}
            >
              MED-
            </span>
            <input
              id="codigoNumero"
              type="text"
              value={numeroCodigo}
              onChange={(e) => setNumeroCodigo(e.target.value)}
              placeholder="Ej. 002"
              style={{ flex: 1 }}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="descripcionMed">Descripción / Nombre</label>
          <input
            id="descripcionMed"
            type="text"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Ej. Ibuprofeno 400mg"
          />
        </div>

        <div className="form-group">
          <label htmlFor="precioPublicoMed">Precio Público ($)</label>
          <input
            id="precioPublicoMed"
            type="number"
            step="0.01"
            min="0"
            value={precioPublico}
            onChange={(e) => setPrecioPublico(e.target.value)}
            placeholder="Ej. 45.00"
          />
        </div>

        <div className="form-group">
          <label htmlFor="precioNetoMed">Precio Neto ($)</label>
          <input
            id="precioNetoMed"
            type="number"
            step="0.01"
            min="0"
            value={precioNeto}
            onChange={(e) => setPrecioNeto(e.target.value)}
            placeholder="Ej. 25.00"
          />
        </div>

        <div className="form-group">
          <label htmlFor="existenciasMed">Existencias Totales (Stock)</label>
          <input
            id="existenciasMed"
            type="number"
            step="1"
            min="0"
            value={existenciasTotal}
            onChange={(e) => setExistenciasTotal(e.target.value)}
            placeholder="Ej. 50"
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
              className="form-cancel-btn"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}