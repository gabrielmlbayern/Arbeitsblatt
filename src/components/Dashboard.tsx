import React, { useState, useEffect } from 'react';
import Header from './Header';
import PlanillaForm from './PlanillaForm';
import PlanillaHistory from './PlanillaHistory';
import { PlanillaData, RecordItem } from '../types';
import { performCalculations } from '../utils/calculations';
import { fetchWithAuth } from '../utils/api';
import { FileText, History } from 'lucide-react';

export default function Dashboard({ setAuth }: { setAuth: (status: boolean) => void }) {
  const [records, setRecords] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'form' | 'history'>('form');

  const loadRecords = async () => {
    try {
      const data = await fetchWithAuth('/records');
      setRecords(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const handleSave = async (data: PlanillaData) => {
    const calc = performCalculations(data);
    
    try {
      await fetchWithAuth('/records', {
        method: 'POST',
        body: JSON.stringify({
          employee_name: data.employeeName,
          period: data.period,
          total_ganado: calc.totalGanado,
          liquido_pagable: calc.liquidoPagable,
          data: data
        })
      });
      loadRecords();
      setActiveTab('history');
      return true;
    } catch (e) {
      console.error(e);
      alert('Error guardando planilla: ' + e);
      return false;
    }
  };

  const handleDelete = async (id: number) => {
    if(!confirm("¿Está seguro de eliminar esta planilla?")) return;
    try {
      await fetchWithAuth(`/records/${id}`, { method: 'DELETE' });
      loadRecords();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans pb-[70px] md:pb-0">
      <Header setAuth={setAuth} />
      <main className="flex-grow p-4 sm:p-6 max-w-7xl mx-auto w-full">
        
        <div className={`w-full md:block ${activeTab === 'form' ? 'block' : 'hidden'}`}>
          <PlanillaForm onSave={handleSave} />
        </div>
        
        <div className={`w-full md:block md:mt-8 ${activeTab === 'history' ? 'block' : 'hidden'}`}>
          <PlanillaHistory records={records} onDelete={handleDelete} />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] z-40">
        <button 
          onClick={() => setActiveTab('form')}
          className={`flex-1 py-3 flex flex-col items-center justify-center gap-1 transition-colors ${activeTab === 'form' ? 'text-[#007a33]' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <FileText size={22} strokeWidth={activeTab === 'form' ? 2.5 : 2} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Generar</span>
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 flex flex-col items-center justify-center gap-1 transition-colors ${activeTab === 'history' ? 'text-[#007a33]' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <History size={22} strokeWidth={activeTab === 'history' ? 2.5 : 2} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Historial</span>
        </button>
      </div>
    </div>
  );
}
