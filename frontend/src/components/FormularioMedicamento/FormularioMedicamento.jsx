import React, { useState, useEffect } from 'react';
import { guardarEnColaPendiente } from '../../services/colaOffline';
import './FormularioMedicamento.css';

const rawApiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').trim();
const API_URL = rawApiUrl.replace(/\/+$/, '');
const PREFIJO_CODIGO = 'MED-';
const CATEGORIA_DEFAULT = 'General';

const CATEGORIAS_FARMACIA = [
  'General',
  'Analgésicos y Antiinflamatorios',
  'Antibióticos',
  'Gastrointestinales',
  'Respiratorios y Antigripales',
  'Cardiovasculares y Metabólicos',
  'Dermatológicos',
  'Vitaminas y Suplementos',
  'Material de Curación',
];

function limpiarPrefijo(codigo = '') {
  return String(codigo).replace(/^MED-/i, '').trim();
}

function formatearCodigo(numeroCodigo = '') {
  const limpio = limpiarPrefijo(numeroCodigo);
  return limpio ? `${PREFIJO_CODIGO}${limpio}` : '';
}

function obtenerNombreCategoria(cat) {
  if (!cat) return CATEGORIA_DEFAULT;
  if (typeof cat === 'object') return cat.name || CATEGORIA_DEFAULT;
  const str = String(cat).trim();
  if (!str || /^[0-9a-fA-F]{24}$/.test(str)) return CATEGORIA_DEFAULT;
  return str;
}

export default function FormularioMedicamento({
  onAgregar,
  medicamentoEditando,
  onActualizar,
  cancelarEdicion,
  onCambioCola
}) {
  const [numeroCodigo, setNumeroCodigo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precioPublico, setPrecioPublico] = useState('');
  const [precioNeto, setPrecioNeto] = useState('');
  const [existenciasTotal, setExistenciasTotal] = useState('');
  const [fechaCaducidad, setFechaCaducidad] = useState('');
  const [categoria, setCategoria] = useState(CATEGORIA_DEFAULT);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setErrorMsg('');
    if (medicamentoEditando) {
      setNumeroCodigo(limpiarPrefijo(medicamentoEditando.codigoArticulo || ''));
      setDescripcion(medicamentoEditando.descripcion || '');
      setPrecioPublico(medicamentoEditando.precioPublico ?? '');
      setPrecioNeto(medicamentoEditando.precioNeto ?? '');
      setExistenciasTotal(medicamentoEditando.existenciasTotal ?? '');
      setFechaCaducidad(medicamentoEditando.fechaCaducidad || '');
      setCategoria(obtenerNombreCategoria(medicamentoEditando.categoria));
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
    setFechaCaducidad('2027-01-01');
    setCategoria(CATEGORIA_DEFAULT);
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

    if (fechaCaducidad === '') {
      return 'Ingrese una fecha valida';
    }

    return '';
  };

  const encolarCreacionOffline = (datosMedicamento) => {
    const tempId = `temp-${Date.now()}`;
    guardarEnColaPendiente({
      tipo: 'CREATE',
      tempId,
      payload: datosMedicamento
    });

    const itemLocal = {
      ...datosMedicamento,
      tempId,
      pendienteSync: true
    };

    onAgregar(itemLocal);
    if (onCambioCola) onCambioCola();
    limpiarFormulario();
    alert('Sin conexión: el medicamento se guardó en espera y se registrará al volver el internet.');
  };

  const encolarEdicionOffline = (datosMedicamento) => {
    const id = medicamentoEditando._id || medicamentoEditando.id || medicamentoEditando.tempId;
    guardarEnColaPendiente({
      tipo: 'UPDATE',
      id,
      payload: datosMedicamento
    });

    const itemActualizado = {
      ...medicamentoEditando,
      ...datosMedicamento,
      _id: medicamentoEditando._id,
      tempId: medicamentoEditando.tempId,
      pendienteSync: true
    };

    onActualizar(itemActualizado);
    if (onCambioCola) onCambioCola();
    cancelarEdicion();
    alert('Sin conexión: los cambios se guardaron en espera y se sincronizarán al volver el internet.');
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
      fechaCaducidad: fechaCaducidad ? new Date(fechaCaducidad) : null,
      categoria
    };

    const token = localStorage.getItem('token');

    if (medicamentoEditando) {
      const id = medicamentoEditando._id || medicamentoEditando.id || medicamentoEditando.tempId;

      if (!navigator.onLine || String(id).startsWith('temp-')) {
        encolarEdicionOffline(datosMedicamento);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/medicines/${id}`, {
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
      } catch (error) {
        console.error('Error de red al actualizar, guardando en cola:', error);
        encolarEdicionOffline(datosMedicamento);
      }
    } else {
      if (!navigator.onLine) {
        encolarCreacionOffline(datosMedicamento);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/medicines`, {
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
          alert('Medicamento registrado con éxito');
          limpiarFormulario();
        } else {
          const errData = await response.json();
          setErrorMsg(errData.error || errData.message || 'Error al registrar');
        }
      } catch (error) {
        console.error('Error de red al registrar, guardando en cola:', error);
        encolarCreacionOffline(datosMedicamento);
      }
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
          <label htmlFor="categoriaMed">Categoría</label>
          <select
            id="categoriaMed"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          >
            {CATEGORIAS_FARMACIA.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
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

        <div className="form-group">
          <label htmlFor="fechaCaducidadMed">Fecha de Caducidad</label>
          <input
            id="fechaCaducidadMed"
            type="date"
            value={fechaCaducidad}
            onChange={(e) => setFechaCaducidad(e.target.value)}
            placeholder="2000-01-01"
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