const COLA_KEY = 'farmacia_cola_medicines_v1';
const CACHE_LISTA_KEY = 'farmacia_lista_medicamentos_v1';
const rawApiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').trim();
const API_URL = rawApiUrl.replace(/\/+$/, '');

export function guardarListaCache(medicamentos) {
  try {
    localStorage.setItem(CACHE_LISTA_KEY, JSON.stringify(medicamentos));
  } catch {
  }
}

export function obtenerListaCache() {
  try {
    const raw = localStorage.getItem(CACHE_LISTA_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function obtenerColaPendiente() {
  try {
    const raw = localStorage.getItem(COLA_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function guardarCola(cola) {
  localStorage.setItem(COLA_KEY, JSON.stringify(cola));
}

export function guardarEnColaPendiente(operacion) {
  const cola = obtenerColaPendiente();

  // Si se elimina un elemento que aún no existía en el servidor (tempId),
  // quitamos su CREATE pendiente y no enviamos DELETE al backend.
  if (operacion.tipo === 'DELETE' && String(operacion.id).startsWith('temp-')) {
    const filtrada = cola.filter(
      (item) => !(item.tipo === 'CREATE' && item.tempId === operacion.id)
    );
    guardarCola(filtrada);
    return null;
  }

  // Si se edita un elemento que tiene un CREATE pendiente, actualizamos el payload de ese CREATE
  if (operacion.tipo === 'UPDATE' && String(operacion.id).startsWith('temp-')) {
    const actualizada = cola.map((item) => {
      if (item.tipo === 'CREATE' && item.tempId === operacion.id) {
        return {
          ...item,
          payload: { ...item.payload, ...operacion.payload },
        };
      }
      return item;
    });
    guardarCola(actualizada);
    return null;
  }

  const item = {
    idCola: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    creadoEn: new Date().toISOString(),
    ...operacion,
  };

  cola.push(item);
  guardarCola(cola);
  return item;
}

export async function sincronizarColaPendiente(token) {
  if (!navigator.onLine) {
    return { sincronizados: 0, pendientes: obtenerColaPendiente().length };
  }

  const cola = obtenerColaPendiente();
  if (cola.length === 0) {
    return { sincronizados: 0, pendientes: 0 };
  }

  const restantes = [];
  let sincronizados = 0;

  for (const op of cola) {
    try {
      let url = `${API_URL}/medicines`;
      let method = 'POST';
      let body = null;

      if (op.tipo === 'CREATE') {
        method = 'POST';
        body = JSON.stringify(op.payload);
      } else if (op.tipo === 'UPDATE') {
        url = `${API_URL}/medicines/${op.id}`;
        method = 'PUT';
        body = JSON.stringify(op.payload);
      } else if (op.tipo === 'DELETE') {
        url = `${API_URL}/medicines/${op.id}`;
        method = 'DELETE';
      }

      const headers = {
        Authorization: `Bearer ${token || localStorage.getItem('token') || ''}`,
      };
      if (body) {
        headers['Content-Type'] = 'application/json';
      }

      const res = await fetch(url, {
        method,
        headers,
        body,
      });

      if (res.ok) {
        sincronizados += 1;
      } else if (res.status >= 400 && res.status < 500) {
        console.warn('Operación rechazada por el servidor:', op, res.status);
      } else {
        restantes.push(op);
      }
    } catch {
      restantes.push(op);
    }
  }

  guardarCola(restantes);
  return { sincronizados, pendientes: restantes.length };
}