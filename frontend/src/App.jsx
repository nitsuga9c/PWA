import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import CatalogoUser from './pages/CatalogoUser';
import AdminPanel from './pages/AdminPanel';
import Registro from './pages/Registro';
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