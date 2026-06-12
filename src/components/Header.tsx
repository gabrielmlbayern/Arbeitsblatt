import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import escudoImg from '../assets/escudo.png';

export default function Header({ setAuth }: { setAuth: (status: boolean) => void }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuth(false);
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <img src={escudoImg} alt="Escudo de Bolivia" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
          <div className="leading-tight">
            <h1 className="text-base sm:text-lg font-bold text-[#1a2b4c] tracking-tight">
              Sistema de Planillas
            </h1>
            <p className="text-gray-500 font-bold tracking-wider text-[8px] sm:text-[10px] uppercase">
              Gobierno de Bolivia
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 border border-red-200 px-2 sm:px-4 py-1.5 rounded cursor-pointer hover:bg-red-50 text-red-600 transition-colors" onClick={handleLogout} title="Salir del sistema">
            <LogOut size={14} />
            <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">Salir</span>
          </div>
        </div>
      </div>
    </header>
  );
}
