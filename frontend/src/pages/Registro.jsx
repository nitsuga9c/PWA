import React, { useState } from 'react';
import { registerRequest } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

export default function Registro() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const inputStyle = {
    backgroundColor: '#ffffff',
    color: '#1e1b2e',
    padding: '8px 12px',
    borderRadius: 6,
    border: '1px solid #d1c4e9',
    width: '100%',
    maxWidth: 320,
    boxSizing: 'border-box',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const data = await registerRequest({ name, email, password });
      if (data.userId) {
        setMensaje('Cuenta creada con éxito. Redirigiendo al login...');
        setTimeout(() => navigate('/login'), 1200);
      } else {
        setError(data.message || 'Error al registrar usuario.');
      }
    } catch {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: '#684186',
        padding: 60,
        fontFamily: 'sans-serif',
        borderRadius: 10,
        color: '#fff',
      }}
    >
      <h1>Farmacia Super Morelos</h1>
      <h2 style={{ color: '#fff', marginTop: 0 }}>Crear Cuenta</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 14 }}>
          <input
            type="text"
            placeholder="Nombre completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <input
            type="password"
            placeholder="Contraseña (mín. 6 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />
        </div>

        {error && <p style={{ color: '#ffd6d6', marginBottom: 12 }}>{error}</p>}
        {mensaje && <p style={{ color: '#d4ffd8', marginBottom: 12 }}>{mensaje}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px 18px',
            background: '#65347a',
            color: '#fff',
            fontWeight: 600,
            borderRadius: 10,
            border: '1px solid #fff',
            cursor: 'pointer',
          }}
        >
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>

      <p style={{ marginTop: 18 }}>
        ¿Ya tienes cuenta?{' '}
        <Link to="/" style={{ color: '#f3e5f5', fontWeight: 600 }}>
          Inicia sesión aquí
        </Link>
      </p>
    </div>
  );
}