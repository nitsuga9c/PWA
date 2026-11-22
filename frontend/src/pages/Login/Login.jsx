import React, { useState } from 'react';
import { loginRequest } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = await loginRequest({ email, password });
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      alert(`Bienvenido ${data.name} (${data.role})`);
      if (data.role === 'admin') navigate('/admin');
      else navigate('/catalogo');
    } else {
      alert(data.message || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="login-pantalla">
      <div className="login-card">
        <h1 className="login-titulo">Farmacia Super Morelos</h1>
        <h2 className="login-subtitulo">Iniciar Sesión</h2>

        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="login-input"
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="login-input"
          />

          <div className="login-acciones">
            <button type="submit" className="login-btn">
              Iniciar Sesion
            </button>

            <button
              type="button"
              onClick={() => navigate('/registro')}
              className="login-btn"
            >
              Registrar usuario
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}