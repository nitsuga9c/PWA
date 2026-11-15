import React, { useState } from 'react';
import { loginRequest } from '../services/api';
import { useNavigate } from 'react-router-dom';

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
    <div style={{ background: '#684186', padding: 100, fontFamily: 'sans-serif' , borderRadius: 10, borderColor: '#FFF'}}>
      <h1>Farmacia Super Morelos</h1>
      <h2 style={{ color: '#fff', padding: 0}}>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Correo" value={email} onChange={e => setEmail(e.target.value)} required /><br/><br/>
        <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} required /><br/><br/>
        <button style= {{  padding: 10, background:'#65347a', color: '#fff', fontWeight: 600, borderRadius: 10}} type="submit">Iniciar Sesion</button>
      </form>
    </div>
  );
}