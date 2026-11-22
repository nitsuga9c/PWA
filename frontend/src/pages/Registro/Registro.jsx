import React, { useState } from 'react';
import { registerRequest } from '../../services/api';
import { useNavigate, Link } from 'react-router-dom';
import './Registro.css';

export default function Registro() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
    
    <div className="registro-container">
      <h1>Farmacia Super Morelos</h1>
      <h2>Crear Cuenta</h2>

      <form onSubmit={handleSubmit}>
        <div className="registro-campo">
          <input
            type="text"
            placeholder="Nombre completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="registro-input"
          />
        </div>

        <div className="registro-campo">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="registro-input"
          />
        </div>

        <div className="registro-campo--boton">
          <input
            type="password"
            placeholder="Contraseña (mín. 6 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="registro-input"
          />
        </div>

        {error && <p className="registro-error">{error}</p>}
        {mensaje && <p className="registro-exito">{mensaje}</p>}

        <button type="submit" disabled={loading} className="registro-btn">
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>

      <p className="registro-pie">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="registro-link">
          Inicia sesión aquí
        </Link>
      </p>
    </div>
  );
}