import React, { useMemo } from 'react';
import './TarjetaCaducidad.css';

function calcularDiasRestantes(fechaCaducidad) {
  if (!fechaCaducidad) return null;

  const soloFecha = String(fechaCaducidad).split('T')[0];
  const partes = soloFecha.split('-');

  let fechaObj;
  if (partes.length === 3) {
    const [anio, mes, dia] = partes.map(Number);
    fechaObj = new Date(anio, mes - 1, dia);
  } else {
    const parsed = new Date(fechaCaducidad);
    if (Number.isNaN(parsed.getTime())) return null;
    fechaObj = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  }

  const hoy = new Date();
  const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

  const msPorDia = 1000 * 60 * 60 * 24;
  return Math.ceil((fechaObj - inicioHoy) / msPorDia);
}

export default function TarjetaCaducidad({ medicamentos = [] }) {
  const alertas = useMemo(() => {
    if (!Array.isArray(medicamentos)) return [];

    return medicamentos
      .map((med, idx) => {
        const diasRestantes = calcularDiasRestantes(med.fechaCaducidad);
        if (diasRestantes === null || diasRestantes >= 90) return null;

        return {
          key: med._id || med.id || med.tempId || `cad-${idx}`,
          codigo: med.codigoArticulo || 'S/C',
          nombre: med.descripcion || med.name || 'Medicamento sin nombre',
          diasRestantes,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.diasRestantes - b.diasRestantes);
  }, [medicamentos]);

  if (alertas.length === 0) return null;

  const tieneScroll = alertas.length > 5;

  return (
    <section className="tarjeta-caducidad" aria-label="Alertas de caducidad">
      <div className="tarjeta-caducidad__header">
        <h2 className="tarjeta-caducidad__titulo">
          Alerta de caducidad ({alertas.length})
        </h2>
        <span className="tarjeta-caducidad__subtitulo">
          Medicamentos a menos de 90 días de vencer
        </span>
      </div>

      <ul
        className={`tarjeta-caducidad__lista ${tieneScroll ? 'tarjeta-caducidad__lista--scrollable' : ''}`}
      >
        {alertas.map((item) => {
          const vencido = item.diasRestantes <= 0;
          const textoDias = vencido
            ? item.diasRestantes === 0
              ? 'Caduca hoy'
              : `Caducado hace ${Math.abs(item.diasRestantes)} día(s)`
            : `Vence en ${item.diasRestantes} día(s)`;

          return (
            <li
              key={item.key}
              className={`tarjeta-caducidad__item ${vencido ? 'tarjeta-caducidad__item--vencido' : ''}`}
            >
              <span className="tarjeta-caducidad__med">
                <strong>{item.codigo}</strong> · {item.nombre}
              </span>
              <span className="tarjeta-caducidad__dias">{textoDias}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}