const API_URL = 'http://localhost:5000/api';

// Registro de Usuario
export const registerRequest = async (userData) => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  return res.json();
};

// Login
export const loginRequest = async (credentials) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  return res.json();
};

// Obtener Medicamentos (Catálogo Público)
export const getMedicines = async () => {
  const res = await fetch(`${API_URL}/medicines`);
  return res.json();
};

// Crear Medicamento (Solo Admin)
export const createMedicine = async (medicineData, token) => {
  const res = await fetch(`${API_URL}/medicines`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(medicineData)
  });
  return res.json();
};

// Eliminar Medicamento (Solo Admin)
export const deleteMedicine = async (id, token) => {
  const res = await fetch(`${API_URL}/medicines/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return res.json();
};