import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMedicines } from '../../services/api';
import HeaderFarmacia from '../../components/HeaderFarmacia/HeaderFarmacia';
import './CatalogoUser.css';

const ITEMS_POR_PAGINA = 16;

function obtenerEstadoStock(stock = 0) {
  const cantidad = Number(stock) || 0;
  if (cantidad <= 0) return { clave: 'nulo', etiqueta: 'Sin stock' };
  if (cantidad <= 5) return { clave: 'bajo', etiqueta: 'Stock bajo' };
  return { clave: 'ok', etiqueta: 'Disponible' };
}

export default function CatalogoUser() {
  const [medicamentos, setMedicamentos] = useState([]);
  const [busquedaNombre, setBusquedaNombre] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [paginaActual, setPaginaActual] = useState(1);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let activo = true;
    setCargando(true);

    getMedicines()
      .then((data) => {
        if (activo && Array.isArray(data)) {
          setMedicamentos(data);
        }
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    setPaginaActual(1);
  }, [busquedaNombre, filtroEstado]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const medicamentosFiltradosYOrdenados = useMemo(() => {
    const termino = busquedaNombre.trim().toLowerCase();

    return [...medicamentos]
      .filter((med) => med.activo !== false)
      .filter((med) => {
        const estado = obtenerEstadoStock(med.existenciasTotal).clave;
        if (filtroEstado !== 'todos' && estado !== filtroEstado) return false;

        if (!termino) return true;
        const nombre = String(med.descripcion || med.name || '').toLowerCase();
        const codigo = String(med.codigoArticulo || med.codigo || '').toLowerCase();
        return nombre.includes(termino) || codigo.includes(termino);
      })
      .sort((a, b) =>
        String(a.codigoArticulo || a.codigo || '').localeCompare(
          String(b.codigoArticulo || b.codigo || ''),
          undefined,
          { numeric: true, sensitivity: 'base' }
        )
      );
  }, [medicamentos, busquedaNombre, filtroEstado]);

  const totalResultados = medicamentosFiltradosYOrdenados.length;
  const totalPaginas = Math.max(1, Math.ceil(totalResultados / ITEMS_POR_PAGINA));
  const paginaSegura = Math.min(paginaActual, totalPaginas);

  const medicamentosPaginados = useMemo(() => {
    const inicio = (paginaSegura - 1) * ITEMS_POR_PAGINA;
    return medicamentosFiltradosYOrdenados.slice(inicio, inicio + ITEMS_POR_PAGINA);
  }, [medicamentosFiltradosYOrdenados, paginaSegura]);

  const cambiarPagina = (nuevaPagina) => {
    const destino = Math.min(Math.max(1, nuevaPagina), totalPaginas);
    setPaginaActual(destino);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const limpiarFiltros = () => {
    setBusquedaNombre('');
    setFiltroEstado('todos');
    setPaginaActual(1);
  };

  const inicioRango = totalResultados === 0 ? 0 : (paginaSegura - 1) * ITEMS_POR_PAGINA + 1;
  const finRango = Math.min(paginaSegura * ITEMS_POR_PAGINA, totalResultados);

  return (
    <div className="catalogo-shell">
      <HeaderFarmacia onLogout={handleLogout} />

      <main className="catalogo-page">
        <div className="catalogo-container">
          <section className="catalogo-hero">
            <div>
              <span className="catalogo-eyebrow"></span>
              <h1 className="catalogo-title">Catálogo de Medicamentos</h1>
              <p className="catalogo-subtitle">
                Consulta en tiempo real de existencias, fecha de caducidad y precio al público.
              </p>
            </div>
            <div className="catalogo-contador">
              <span className="catalogo-pulso" aria-hidden="true" />
              {totalResultados} {totalResultados === 1 ? 'registro activo' : 'registros activos'}
            </div>
          </section>

          <section className="catalogo-toolbar" aria-label="Filtros del catálogo">
            <div className="catalogo-search-wrap">
              <input
                type="search"
                className="catalogo-search"
                value={busquedaNombre}
                onChange={(e) => setBusquedaNombre(e.target.value)}
                placeholder="Buscar por nombre o código..."
                aria-label="Buscar medicamento por nombre o código"
              />
            </div>

            <div className="catalogo-filtros" role="group" aria-label="Filtrar por disponibilidad">
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'ok', label: 'Disponibles' },
                { id: 'bajo', label: 'Stock bajo' },
                { id: 'nulo', label: 'Sin stock' },
              ].map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  className={`catalogo-chip ${filtroEstado === chip.id ? 'is-active' : ''}`}
                  onClick={() => setFiltroEstado(chip.id)}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </section>

          {cargando ? (
            <div className="catalogo-estado-box">
              <p>Sincronizando base de medicamentos...</p>
            </div>
          ) : medicamentosPaginados.length === 0 ? (
            <div className="catalogo-estado-box">
              <p>No se encontraron medicamentos con esos criterios de búsqueda.</p>
              {(busquedaNombre || filtroEstado !== 'todos') && (
                <button type="button" className="catalogo-limpiar-btn" onClick={limpiarFiltros}>
                  Reiniciar filtros
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="catalogo-grid">
                {medicamentosPaginados.map((med, index) => {
                  const stock = Number(med.existenciasTotal) || 0;
                  const estado = obtenerEstadoStock(stock);
                  const codigo = med.codigoArticulo || med.codigo || 'SIN-CÓD';
                  const nombre = med.descripcion || med.name || 'Medicamento sin nombre';
                  const caducidadTexto = med.fechaCaducidad
                    ? new Date(med.fechaCaducidad).toLocaleDateString('es-MX')
                    : 'N/A';

                  return (
                    <article
                      key={med._id || med.id || `cat-${paginaSegura}-${index}`}
                      className={`catalogo-card ${stock <= 0 ? 'is-agotado' : ''}`}
                    >
                      <div className="catalogo-card-top">
                        <span className="catalogo-codigo">{codigo}</span>
                        <span className={`catalogo-badge ${estado.clave}`}>{estado.etiqueta}</span>
                      </div>

                      <h2 className="catalogo-nombre">{nombre}</h2>

                      <div className="catalogo-detalles">
                        <div className="catalogo-detalle-fila">
                          <span>Existencias</span>
                          <strong>{stock} uds.</strong>
                        </div>
                        <div className="catalogo-detalle-fila">
                          <span>Caducidad</span>
                          <strong>{caducidadTexto}</strong>
                        </div>
                      </div>

                      <div className="catalogo-card-footer">
                        <span className="catalogo-precio-etiqueta">Precio público</span>
                        <span className="catalogo-precio">
                          ${Number(med.precioPublico || 0).toFixed(2)}
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>

              {totalResultados > ITEMS_POR_PAGINA && (
                <nav className="catalogo-paginacion" aria-label="Paginación del catálogo">
                  <span className="catalogo-paginacion-info">
                    Mostrando {inicioRango}–{finRango} de {totalResultados}
                  </span>

                  <div className="catalogo-paginacion-controles">
                    <button
                      type="button"
                      className="catalogo-pag-btn"
                      disabled={paginaSegura <= 1}
                      onClick={() => cambiarPagina(paginaSegura - 1)}
                    >
                      Anterior
                    </button>

                    {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numPag) => (
                      <button
                        key={numPag}
                        type="button"
                        className={`catalogo-pag-num ${paginaSegura === numPag ? 'is-active' : ''}`}
                        onClick={() => cambiarPagina(numPag)}
                        aria-current={paginaSegura === numPag ? 'page' : undefined}
                      >
                        {numPag}
                      </button>
                    ))}

                    <button
                      type="button"
                      className="catalogo-pag-btn"
                      disabled={paginaSegura >= totalPaginas}
                      onClick={() => cambiarPagina(paginaSegura + 1)}
                    >
                      Siguiente
                    </button>
                  </div>
                </nav>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}