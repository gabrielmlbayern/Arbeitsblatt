import React, { useState, useEffect } from 'react';
import { Plus, X, Calculator, Save, CheckCircle } from 'lucide-react';
import { PlanillaData, Bono, Descuento, CalculationResult } from '../types';
import { performCalculations, formatCurrency } from '../utils/calculations';

export default function PlanillaForm({ onSave }: { onSave: (data: PlanillaData) => Promise<boolean> }) {
  const [toast, setToast] = useState<string | null>(null);
  const [data, setData] = useState<PlanillaData>({
    employeeName: '',
    ci: '',
    cargo: '',
    departamento: '',
    afp: 'Previsión',
    nua: '',
    cuentaBancaria: '',
    period: '',
    admissionDate: '',
    baseSalary: 0,
    horasExtras: 0,
    bonos: [],
    descuentos: [],
  });

  const [calc, setCalc] = useState<CalculationResult | null>(null);

  useEffect(() => {
    setCalc(performCalculations(data));
  }, [data]);

  const addBono = () => {
    setData(prev => ({
      ...prev,
      bonos: [...prev.bonos, { id: Math.random().toString(), name: '', amount: 0 }]
    }));
  };

  const updateBono = (id: string, field: string, value: any) => {
    setData(prev => ({
      ...prev,
      bonos: prev.bonos.map(b => b.id === id ? { ...b, [field]: value } : b)
    }));
  };

  const removeBono = (id: string) => {
    setData(prev => ({
      ...prev,
      bonos: prev.bonos.filter(b => b.id !== id)
    }));
  };

  const addDescuento = () => {
    setData(prev => ({
      ...prev,
      descuentos: [...prev.descuentos, { id: Math.random().toString(), name: '', amount: 0 }]
    }));
  };

  const updateDescuento = (id: string, field: string, value: any) => {
    setData(prev => ({
      ...prev,
      descuentos: prev.descuentos.map(d => d.id === id ? { ...d, [field]: value } : d)
    }));
  };

  const removeDescuento = (id: string) => {
    setData(prev => ({ ...prev, descuentos: prev.descuentos.filter(d => d.id !== id) }));
  };

  const handleSaveWrapper = async () => {
    if(!data.employeeName) return alert("Ingrese el nombre del empleado");
    if(!data.period) return alert("Ingrese el periodo");
    if(!data.admissionDate) return alert("Ingrese la fecha de ingreso");
    if(!data.baseSalary) return alert("Ingrese un haber mensual válido");
    
    const success = await onSave(data);
    if(success) {
      setToast(`Planilla de ${data.employeeName} guardada correctamente`);
      setTimeout(() => setToast(null), 3000);
      handleClear();
    }
  };

  const handleClear = () => {
    setData({
      employeeName: '',
      ci: '',
      cargo: '',
      departamento: '',
      afp: 'Previsión',
      nua: '',
      cuentaBancaria: '',
      period: '',
      admissionDate: '',
      baseSalary: 0,
      horasExtras: 0,
      bonos: [],
      descuentos: [],
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
      {toast && (
        <div className="fixed top-4 right-4 bg-green-50 text-green-800 border border-green-200 shadow-lg rounded p-3 flex items-start gap-3 z-50 min-w-[300px]">
          <CheckCircle className="text-green-600 shrink-0 mt-0.5" size={18} />
          <div className="flex-1 text-sm">
            <div className="font-bold text-green-700">¡Planilla guardada exitosamente!</div>
            <div className="text-xs text-green-600 mt-0.5">{toast}</div>
          </div>
          <button onClick={() => setToast(null)} className="text-green-600 hover:text-green-800"><X size={14}/></button>
        </div>
      )}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Datos Empleado */}
        <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-[#1a2b4c] mb-6 flex items-center gap-2">
            <Calculator className="text-[#007a33]" size={20} /> Datos del Empleado
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-[#6b7280] uppercase tracking-widest mb-1 shadow-none">NOMBRE DEL EMPLEADO</label>
              <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-[#007a33] text-gray-800"
                value={data.employeeName} onChange={e => setData({...data, employeeName: e.target.value})} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-[#6b7280] uppercase tracking-widest mb-1 shadow-none">CÉDULA DE IDENTIDAD (CI)</label>
                <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-[#007a33] text-gray-800"
                  value={data.ci} onChange={e => setData({...data, ci: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#6b7280] uppercase tracking-widest mb-1 shadow-none">CARGO</label>
                <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-[#007a33] text-gray-800"
                  value={data.cargo} onChange={e => setData({...data, cargo: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-[#6b7280] uppercase tracking-widest mb-1 shadow-none">DEPARTAMENTO / ÁREA</label>
                <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-[#007a33] text-gray-800"
                  value={data.departamento} onChange={e => setData({...data, departamento: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#6b7280] uppercase tracking-widest mb-1 shadow-none">CUENTA BANCARIA</label>
                <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-[#007a33] text-gray-800"
                  value={data.cuentaBancaria} onChange={e => setData({...data, cuentaBancaria: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-[#6b7280] uppercase tracking-widest mb-1 shadow-none">AFP</label>
                <select className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-[#007a33] text-gray-800"
                  value={data.afp} onChange={e => setData({...data, afp: e.target.value})}>
                  <option value="Previsión">Previsión</option>
                  <option value="Futuro">Futuro</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#6b7280] uppercase tracking-widest mb-1 shadow-none">NUA / CUA</label>
                <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-[#007a33] text-gray-800"
                  value={data.nua} onChange={e => setData({...data, nua: e.target.value})} />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-[#6b7280] uppercase tracking-widest mb-1">FECHA DE PLANILLA (MES/AÑO)</label>
                <input type="month" className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-[#007a33] text-gray-800"
                  value={data.period} onChange={e => setData({...data, period: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#6b7280] uppercase tracking-widest mb-1">FECHA DE INGRESO</label>
                <input type="date" className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-[#007a33] text-gray-800"
                  value={data.admissionDate} onChange={e => setData({...data, admissionDate: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-[#6b7280] uppercase tracking-widest mb-1">HABER MENSUAL (BS)</label>
                <input type="number" min="0" step="0.01" className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-[#007a33] text-gray-800"
                  value={data.baseSalary || ''} onChange={e => setData({...data, baseSalary: parseFloat(e.target.value)})} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#6b7280] uppercase tracking-widest mb-1">HORAS EXTRAS (CANTIDAD EN HORAS)</label>
                <input type="number" min="0" step="0.5" className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-[#007a33] text-gray-800"
                  value={data.horasExtras || ''} onChange={e => setData({...data, horasExtras: parseFloat(e.target.value)})} />
              </div>
            </div>
          </div>
        </div>

        {/* Ingresos Adicionales */}
        <div className="bg-white p-6 rounded shadow-sm border border-gray-200 border-t-2 border-t-[#007a33]">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-bold text-[#1a2b4c]">Ingresos Adicionales</h2>
              <p className="text-[10px] text-gray-400">Bonos y beneficios adicionales</p>
            </div>
            <button onClick={addBono} className="bg-[#007a33] text-white px-4 py-2 rounded font-bold flex items-center gap-2 hover:bg-[#005e25] text-sm">
              <Plus size={16} /> Agregar Bono
            </button>
          </div>

          <div className="space-y-3">
             <div className="bg-green-50/50 p-4 rounded border border-green-200 flex justify-between items-center">
              <div>
                <div className="font-bold text-green-800 text-sm">Bono de Antigüedad (Automático)</div>
                <div className="text-xs text-green-600">{calc?.yearsOfService || 0} años de servicio</div>
              </div>
              <div className="font-bold text-green-700">{formatCurrency(calc?.bonoAntiguedad || 0)}</div>
             </div>

             {data.bonos.map(bono => (
               <div key={bono.id} className="flex gap-2 items-center">
                  <input type="text" placeholder="Nombre del bono" className="flex-grow border border-gray-300 rounded px-3 py-2 outline-none text-sm"
                    value={bono.name} onChange={e => updateBono(bono.id, 'name', e.target.value)} />
                  <input type="number" placeholder="Monto" className="w-32 border border-gray-300 rounded px-3 py-2 outline-none text-sm"
                    value={bono.amount || ''} onChange={e => updateBono(bono.id, 'amount', parseFloat(e.target.value))} />
                  <button onClick={() => removeBono(bono.id)} className="p-2 text-red-500 hover:bg-red-50 rounded"><X size={16} /></button>
               </div>
             ))}
             {data.bonos.length === 0 && <p className="text-center text-xs text-gray-400 italic">No hay bonos adicionales agregados</p>}
          </div>
        </div>

        {/* Descuentos */}
        <div className="bg-white p-6 rounded shadow-sm border border-gray-200 border-t-2 border-t-[#ce1126]">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-bold text-[#1a2b4c]">Descuentos</h2>
              <p className="text-[10px] text-gray-400">Deducciones adicionales al salario</p>
            </div>
            <button onClick={addDescuento} className="bg-[#e02434] text-white px-4 py-2 rounded font-bold flex items-center gap-2 hover:bg-[#c81e2c] text-sm">
              <Plus size={16} /> Agregar Descuento
            </button>
          </div>
          
          <div className="space-y-3">
             {data.descuentos.map(descuento => (
               <div key={descuento.id} className="flex gap-2 items-center">
                  <input type="text" placeholder="Concepto del descuento" className="flex-grow border border-gray-300 rounded px-3 py-2 outline-none text-sm"
                    value={descuento.name} onChange={e => updateDescuento(descuento.id, 'name', e.target.value)} />
                  <input type="number" placeholder="Monto" className="w-32 border border-gray-300 rounded px-3 py-2 outline-none text-sm"
                    value={descuento.amount || ''} onChange={e => updateDescuento(descuento.id, 'amount', parseFloat(e.target.value))} />
                  <button onClick={() => removeDescuento(descuento.id)} className="p-2 text-red-500 hover:bg-red-50 rounded"><X size={16} /></button>
               </div>
             ))}
             {data.descuentos.length === 0 && <p className="text-center text-xs text-gray-400 italic mt-6">No hay descuentos adicionales agregados</p>}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={handleSaveWrapper} className="w-full sm:w-[80%] bg-[#007a33] text-white py-3.5 rounded font-bold hover:bg-[#005e26] transition flex items-center justify-center gap-2 order-1 sm:order-none">
            <Save size={18} /> Guardar Planilla
          </button>
          <button onClick={handleClear} className="w-full sm:w-[20%] bg-[#e2e8f0] text-gray-600 font-bold py-3.5 rounded hover:bg-gray-300 transition flex items-center justify-center order-2 sm:order-none">
            Limpiar
          </button>
        </div>

      </div>

      {/* Right Column: Boleta */}
      {calc && (
      <div className="col-span-1 lg:col-span-1 border-t lg:border-t-0 pt-6 lg:pt-0 mt-2 lg:mt-0">
        
        {/* Style the boleta background and typography matching government feel */}
         <div className="bg-white rounded shadow-sm border border-gray-200 sticky top-6 overflow-hidden">
            <div className="bg-gradient-to-r from-red-100 via-yellow-100 to-green-100 p-6 border-b border-gray-100">
              <h2 className="text-2xl font-black flex items-center gap-2 text-[#1a2b4c]">
                📑 Boleta de Pago
              </h2>
              <div className="mt-2 text-sm text-gray-600">
                <div>Empleado: <span className="font-bold text-gray-800">{data.employeeName || '---'}</span></div>
                <div className="grid grid-cols-2 gap-x-2 text-[10px] uppercase mt-2">
                  <div>C.I.: <span className="font-bold text-gray-800">{data.ci || '---'}</span></div>
                  <div>AFP: <span className="font-bold text-gray-800">{data.afp || '---'}</span></div>
                  <div className="col-span-2 mt-1">Cargo: <span className="font-bold text-gray-800">{data.cargo || '---'}</span></div>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200">Período: <span className="font-bold text-gray-800">{data.period || '---'}</span></div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              
              {/* INGRESOS */}
              <div>
                <h3 className="text-[10px] font-bold text-green-700 uppercase tracking-widest mb-3">INGRESOS</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Haber Mensual</span>
                    <span className="font-bold text-[#1a2b4c]">{formatCurrency(data.baseSalary || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Bono de Antigüedad</span>
                    <span className="font-bold text-green-700">{formatCurrency(calc.bonoAntiguedad)}</span>
                  </div>
                  {calc.pagoHorasExtras > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Pago Horas Extras ({data.horasExtras} hrs)</span>
                      <span className="font-bold text-green-700">{formatCurrency(calc.pagoHorasExtras)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-b border-gray-100 pb-3">
                    <span className="text-gray-500">Total Bonos</span>
                    <span className="font-bold text-[#1a2b4c]">{formatCurrency(calc.totalBonos)}</span>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-green-50 rounded border border-green-200 flex justify-between items-center text-[#007a33]">
                  <span className="font-bold text-sm uppercase tracking-wide">TOTAL GANADO</span>
                  <span className="font-black text-xl">{formatCurrency(calc.totalGanado)}</span>
                </div>
              </div>

              {/* DESCUENTOS */}
              <div>
                <h3 className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-3">DESCUENTOS</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Aporte Laboral (12.71%)</span>
                    <span className="font-bold text-red-600">-{formatCurrency(calc.aporteLaboral)}</span>
                  </div>
                </div>
                
                <div className="my-4 p-4 bg-[#f0f7ff] border border-blue-200 rounded flex justify-between items-center text-[#1e3a8a]">
                  <span className="font-bold text-sm uppercase tracking-wide">SUELDO NETO</span>
                  <span className="font-black text-xl text-blue-700">{formatCurrency(calc.sueldoNeto)}</span>
                </div>

                <div className="space-y-3 text-sm border-t border-gray-100 pt-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">RC-IVA</span>
                    <span className="font-bold text-red-600">-{formatCurrency(calc.rcIva)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Descuentos Adicionales</span>
                    <span className="font-bold text-red-600">-{formatCurrency(calc.totalDescuentos)}</span>
                  </div>
                </div>
              </div>

              {/* LIQUIDO PAGABLE */}
              <div className="bg-[#006828] text-white p-5 rounded text-center mt-6 shadow-md">
                <div className="text-xs font-bold tracking-widest uppercase mb-1 opacity-90">LÍQUIDO PAGABLE</div>
                <div className="text-4xl font-black tracking-tight">{formatCurrency(calc.liquidoPagable)}</div>
              </div>
              
              <div className="mt-4 flex flex-col gap-2">
                <div className="p-3 bg-gray-50 border border-gray-200 rounded text-[11px] text-gray-500 flex justify-between items-center transition-colors">
                  <span className="font-bold uppercase tracking-wider">Años de servicio</span> 
                  <span className="font-black text-sm text-gray-700">{calc.yearsOfService} AÑOS</span>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-100 rounded text-[11px] text-blue-600 flex justify-between items-center transition-colors">
                  <span className="font-bold uppercase tracking-wider">Días de Vacaciones</span> 
                  <span className="font-black text-sm text-blue-800">{calc.diasVacaciones} DÍAS HÁBILES</span>
                </div>
              </div>

            </div>
         </div>
      </div>
      )}
    </div>
  );
}
