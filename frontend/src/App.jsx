import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import CatalogoUser from './pages/CatalogoUser/CatalogoUser';
import AdminPanel from './pages/AdminPanel/AdminPanel';
import Registro from './pages/Registro/Registro';
import './style.css';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/catalogo" element={<CatalogoUser />} />
      <Route path="/admin" element={<AdminPanel />} />
      <Route path="*" element={<Navigate to="/" />} />
      <Route path="/registro" element={<Registro />} />
    </Routes>
  );
}