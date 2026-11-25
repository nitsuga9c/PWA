import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderFarmacia from '../../components/HeaderFarmacia/HeaderFarmacia';
import TarjetaEstadistica from '../../components/TarjetaEstadistica/TarjetaEstadistica';
import TarjetaCaducidad from '../../components/TarjetaCaducidad/TarjetaCaducidad';
import InventarioTabla from '../../components/InventarioTabla/InventarioTabla';
import FormularioMedicamento from '../../components/FormularioMedicamento/FormularioMedicamento';
import { obtenerColaPendiente, guardarEnColaPendiente, sincronizarColaPendiente,  guardarListaCache, obtenerListaCache, } from '../../services/colaOffline';
import './AdminPanel.css';

const obtenerIdItem = (item) => item?._id || item?.id || item?.tempId;

export default function AdminPanel() {
  const navigate = useNavigate();
  const [medicamentos, setMedicamentos] = useState([]);
  const [medicamentoEditando, setMedicamentoEditando] = useState(null);
  const [pendientesSync, setPendientesSync] = useState(() => obtenerColaPendiente().length);
  const [sincronizando, setSincronizando] = useState(false);

  const actualizarContadorCola = useCallback(() => {
    setPendientesSync(obtenerColaPendiente().length);
  }, []);

  const cargarMedicamentos = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/medicines');
      if (res.ok) {
        const data = await res.json();
        setMedicamentos(data);
        guardarListaCache(data);
      } else {
        const cache = obtenerListaCache();
        if (cache.length > 0) setMedicamentos(cache);
      }
    } catch (err) {
      console.error('Error al cargar medicamentos, usando caché local si existe:', err);
      const cache = obtenerListaCache();
      if (cache.length > 0) setMedicamentos(cache);
    }
  }, []);

  const ejecutarSincronizacion = useCallback(async () => {
    const pendientesActuales = obtenerColaPendiente().length;
    if (!navigator.onLine || pendientesActuales === 0) {
      actualizarContadorCola();
      return;
    }

    setSincronizando(true);
    try {
      const token = localStorage.getItem('token');
      const resultado = await sincronizarColaPendiente(token);
      actualizarContadorCola();

      if (resultado.sincronizados > 0) {
        await cargarMedicamentos();
        alert(`Conexión restaurada, Se sincronizaron ${resultado.sincronizados} cambios pendientes.`);
      }
    } finally {
      setSincronizando(false);
    }
  }, [actualizarContadorCola, cargarMedicamentos]);

  useEffect(() => {
    cargarMedicamentos();
    actualizarContadorCola();

    if (navigator.onLine && obtenerColaPendiente().length > 0) {
      ejecutarSincronizacion();
    }

    const handleOnline = () => {
      ejecutarSincronizacion();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [cargarMedicamentos, actualizarContadorCola, ejecutarSincronizacion]);

  useEffect(() => {
    if (medicamentos.length > 0) {
      guardarListaCache(medicamentos);
    }
  }, [medicamentos]);

  const handleLogout = () => {
    navigate('/');
  };

  const handleAgregarMedicamento = (nuevoMed) => {
    setMedicamentos((prev) => [nuevoMed, ...prev]);
  };

  const handleActualizarMedicamento = (medicamentoActualizado) => {
    const idActualizado = obtenerIdItem(medicamentoActualizado);
    setMedicamentos((prev) =>
      prev.map((med) => (obtenerIdItem(med) === idActualizado ? medicamentoActualizado : med))
    );
    setMedicamentoEditando(null);
  };

  const handleUpdateStock = async (med, nuevoStock) => {
    const id = obtenerIdItem(med);
    const payload = { existenciasTotal: nuevoStock };

    setMedicamentos((prev) =>
      prev.map((item) =>
        obtenerIdItem(item) === id
          ? { ...item, existenciasTotal: nuevoStock, stock: nuevoStock }
          : item
      )
    );

    if (!navigator.onLine || String(id).startsWith('temp-')) {
      guardarEnColaPendiente({ tipo: 'UPDATE', id, payload });
      actualizarContadorCola();
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/medicines/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const actualizado = await response.json();
        setMedicamentos((prev) =>
          prev.map((item) => (obtenerIdItem(item) === id ? actualizado : item))
        );
      } else {
        guardarEnColaPendiente({ tipo: 'UPDATE', id, payload });
        actualizarContadorCola();
      }
    } catch (error) {
      console.error('Error de red al actualizar stock, guardando en cola:', error);
      guardarEnColaPendiente({ tipo: 'UPDATE', id, payload });
      actualizarContadorCola();
    }
  };

  const encolarEliminacionOffline = (id) => {
    guardarEnColaPendiente({ tipo: 'DELETE', id });
    setMedicamentos((prev) => prev.filter((med) => obtenerIdItem(med) !== id));
    actualizarContadorCola();
    alert('Sin conexión: la eliminación se guardó en espera.');
  };

  const handleEliminarMedicamento = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este medicamento?')) return;

    if (!navigator.onLine || String(id).startsWith('temp-')) {
      encolarEliminacionOffline(id);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/medicines/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMedicamentos((prev) => prev.filter((med) => obtenerIdItem(med) !== id));
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Error al eliminar el medicamento');
      }
    } catch (error) {
      console.error('Error de red al eliminar, guardando en cola:', error);
      encolarEliminacionOffline(id);
    }
  };

  const totalMedicamentos = medicamentos.length;
  const stockCritico = medicamentos.filter(
    (m) => (m.stock ?? m.existenciasTotal) <= 10 && (m.stock ?? m.existenciasTotal) > 0
  ).length;
  const sinStock = medicamentos.filter((m) => (m.stock ?? m.existenciasTotal) === 0).length;

  return (
    <div className="admin-page">
      <HeaderFarmacia onLogout={handleLogout} />

      <div className="admin-container">
        {pendientesSync > 0 && (
          <div className="admin-sync-banner">
            <span>
              <strong>{pendientesSync}</strong> cambio(s) guardado(s) sin conexión pendientes de sincronizar.
            </span>
            <button
              type="button"
              onClick={ejecutarSincronizacion}
              disabled={sincronizando}
              className="admin-sync-btn"
            >
              {sincronizando ? 'Sincronizando...' : 'Sincronizar ahora'}
            </button>
          </div>
        )}

        <TarjetaCaducidad medicamentos={medicamentos} />
        <div className="admin-stats-grid">
          <TarjetaEstadistica titulo="Total Medicamentos" valor={totalMedicamentos} colorBorde="#8b5cf6" />
          <TarjetaEstadistica titulo="Stock Crítico" valor={stockCritico} colorBorde="#e1c71d" />
          <TarjetaEstadistica titulo="Sin Stock" valor={sinStock} colorBorde="#e11d48" />
        </div>

        <div className="admin-main-grid">
          <FormularioMedicamento
            onAgregar={handleAgregarMedicamento}
            medicamentoEditando={medicamentoEditando}
            onActualizar={handleActualizarMedicamento}
            cancelarEdicion={() => setMedicamentoEditando(null)}
            onCambioCola={actualizarContadorCola}
          />
          <InventarioTabla
            medicamentos={medicamentos}
            onDelete={handleEliminarMedicamento}
            onEdit={(med) => setMedicamentoEditando(med)}
            onUpdateStock={handleUpdateStock}
          />
        </div>
      </div>
    </div>
  );
}