import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CONFIG } from '../config';

export default function Login({ setAuth }: { setAuth: (status: boolean) => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password === CONFIG.APP_PASSWORD) {
      localStorage.setItem('token', 'authenticated');
      const adminUser = { email: 'admin', role: 'admin' };
      localStorage.setItem('user', JSON.stringify(adminUser));
      setAuth(true);
      navigate('/dashboard');
    } else {
      setError('Contraseña incorrecta');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      
      {/* Blurred Plaza Murillo Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url('../assets/plaza.png')`, 
          filter: 'blur(10px) brightness(0.6)' 
        }}
      ></div>
      <div className="absolute inset-0 bg-gray-900/40"></div>
      
      <div className="bg-white px-10 py-12 rounded-xl shadow-2xl w-full max-w-md relative z-10 flex flex-col items-center">
        {/* Color Band */}
        <div className="absolute top-0 left-0 w-full h-2 rounded-t-xl overflow-hidden flex">
          <div className="h-full w-1/3 bg-[#ce1126]"></div>
          <div className="h-full w-1/3 bg-[#fcd116]"></div>
          <div className="h-full w-1/3 bg-[#007a33]"></div>
        </div>

        <img src="../assets/escudo.png" alt="Escudo de Bolivia" className="w-16 h-16 object-contain mt-4" />

        <h1 className="text-2xl font-bold mt-4 text-[#1a2b4c]">Sistema de Planillas</h1>
        <p className="text-gray-500 font-semibold tracking-widest text-xs mt-2 uppercase text-center mb-8">
          Gobierno del Estado<br/>Plurinacional de Bolivia
        </p>

        <form onSubmit={handleSubmit} className="w-full">
          {error && <div className="mb-4 text-red-600 text-sm font-medium text-center">{error}</div>}
          
          <div className="mb-6">
            <label className="block text-gray-500 font-bold text-xs uppercase tracking-wider mb-2">
              Contraseña
            </label>
            <input 
              type="password" 
              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-700 outline-none focus:border-[#007a33]"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-[#007a33] hover:bg-[#005e26] text-white font-bold py-3 px-4 rounded transition duration-200"
          >
            Ingresar
          </button>
        </form>

        <p className="mt-8 text-xs text-gray-400">Acceso restringido a personal autorizado</p>
      </div>
    </div>
  );
}
