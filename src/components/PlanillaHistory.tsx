import React, { useState } from 'react';
import { Eye, Trash2, Search, Download } from 'lucide-react';
import { RecordItem } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { formatCurrency, performCalculations } from '../utils/calculations';

export default function PlanillaHistory({ records, onDelete }: { records: RecordItem[], onDelete: (id: number) => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<RecordItem | null>(null);

  const filtered = records.filter(r => 
    r.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.period.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const modalCalc = selectedRecord ? performCalculations(selectedRecord.data) : null;

  const handleExportPDF = (record: RecordItem) => {
    const calc = performCalculations(record.data);
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Top flag banner
    doc.setFillColor(206, 17, 38); // Red
    doc.rect(0, 0, pageWidth / 3, 4, 'F');
    doc.setFillColor(252, 209, 22); // Yellow
    doc.rect(pageWidth / 3, 0, pageWidth / 3, 4, 'F');
    doc.setFillColor(0, 122, 51); // Green
    doc.rect((pageWidth / 3) * 2, 0, pageWidth / 3 + 1, 4, 'F');
    
    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("ESTADO PLURINACIONAL DE BOLIVIA", pageWidth / 2, 16, { align: 'center' });
    doc.setFontSize(11);
    doc.text("Ministerio de Economía y Finanzas Públicas", pageWidth / 2, 22, { align: 'center' });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("BOLETA DE PAGO MENSUAL", pageWidth / 2, 28, { align: 'center' });
    
    doc.setTextColor(0, 0, 0); // reset color
    
    // Metadata info
    let y = 40;
    const dy = 6;
    
    doc.setFont("helvetica", "bold"); doc.text("Empresa:", 14, y); 
    doc.setFont("helvetica", "normal"); doc.text("—", 45, y);
    
    doc.setFont("helvetica", "bold"); doc.text("NIT:", 14, y + dy); 
    doc.setFont("helvetica", "normal"); doc.text("—", 45, y + dy);
    
    doc.setFont("helvetica", "bold"); doc.text("Departamento:", 14, y + 2*dy); 
    doc.setFont("helvetica", "normal"); doc.text(record.data.departamento || "—", 45, y + 2*dy);

    doc.setFont("helvetica", "bold"); doc.text("Empleado:", 105, y); 
    doc.setFont("helvetica", "normal"); doc.text(record.employee_name || "—", 140, y);
    
    doc.setFont("helvetica", "bold"); doc.text("C.I.:", 105, y + dy); 
    doc.setFont("helvetica", "normal"); doc.text(record.data.ci || "—", 140, y + dy);
    
    doc.setFont("helvetica", "bold"); doc.text("Cargo:", 105, y + 2*dy); 
    doc.setFont("helvetica", "normal"); doc.text(record.data.cargo || "—", 140, y + 2*dy);
    
    doc.setFont("helvetica", "bold"); doc.text("Período:", 105, y + 3*dy); 
    doc.setFont("helvetica", "normal"); doc.text(record.period || "—", 140, y + 3*dy);
    
    doc.setFont("helvetica", "bold"); doc.text("Fecha de ingreso:", 105, y + 4*dy); 
    doc.setFont("helvetica", "normal"); doc.text(record.data.admissionDate || "—", 140, y + 4*dy);

    // Prepare table body
    const bonoPorcentaje = calc.yearsOfService > 0 ? ((calc.bonoAntiguedad / (3 * 3300)) * 100).toFixed(0) : '0';
    const tableBody: any[] = [
      ['Haber Mensual', formatCurrency(record.data.baseSalary)],
      [`Bono de Antigüedad (${bonoPorcentaje}% sobre 3 SMN · ${calc.yearsOfService} años)`, formatCurrency(calc.bonoAntiguedad)],
    ];

    if (calc.pagoHorasExtras > 0) {
      tableBody.push([`(+) Pago Horas Extras (${record.data.horasExtras} hrs)`, formatCurrency(calc.pagoHorasExtras)]);
    }

    record.data.bonos.forEach(b => {
      tableBody.push([`(+) ${b.name}`, formatCurrency(Number(b.amount))]);
    });

    tableBody.push([
      { content: 'TOTAL GANADO', styles: { fontStyle: 'bold', fillColor: [245, 245, 245] } },
      { content: formatCurrency(calc.totalGanado), styles: { fontStyle: 'bold', fillColor: [245, 245, 245] } }
    ]);

    tableBody.push([`(-) Aporte Laboral AFP (12.71%)`, `-${formatCurrency(calc.aporteLaboral)}`]);

    tableBody.push([
      { content: 'SUELDO NETO', styles: { fontStyle: 'bold', fillColor: [245, 245, 245] } },
      { content: formatCurrency(calc.sueldoNeto), styles: { fontStyle: 'bold', fillColor: [245, 245, 245] } }
    ]);

    tableBody.push([`(-) RC-IVA`, calc.rcIva > 0 ? `-${formatCurrency(calc.rcIva)}` : `Bs. 0,00`]);

    record.data.descuentos.forEach(d => {
      tableBody.push([`(-) ${d.name}`, `-${formatCurrency(Number(d.amount))}`]);
    });

    tableBody.push([
      { content: 'LÍQUIDO PAGABLE', styles: { fontStyle: 'bold', fillColor: [220, 252, 231], textColor: [0, 122, 51] } },
      { content: formatCurrency(calc.liquidoPagable), styles: { fontStyle: 'bold', fillColor: [220, 252, 231], textColor: [0, 122, 51] } }
    ]);

    autoTable(doc, {
      startY: 75,
      head: [['Concepto', { content: 'Monto (Bs.)', styles: { halign: 'right' } }]],
      body: tableBody,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42] }, // Dark slate
      columnStyles: {
        1: { halign: 'right', cellWidth: 50 },
      },
      styles: { 
        fontSize: 9, 
        cellPadding: 4,
        lineColor: [226, 232, 240], // Light slate gray border
        lineWidth: 0.1,
      }
    });

    // @ts-ignore
    const finalY = doc.lastAutoTable.finalY || 100;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text("Documento generado por el Sistema Oficial de Planilla de Sueldos.", 14, finalY + 12);
    doc.text("Salario Mínimo Nacional vigente: Bs. 3.300,00", 14, finalY + 16);

    // Signatures
    doc.setDrawColor(180, 180, 180);
    doc.line(30, finalY + 45, pageWidth / 2 - 20, finalY + 45);
    doc.line(pageWidth / 2 + 20, finalY + 45, pageWidth - 30, finalY + 45);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.text("Empleado", (30 + (pageWidth / 2 - 20)) / 2, finalY + 50, { align: 'center' });
    doc.text("Empleador / RR.HH.", ((pageWidth / 2 + 20) + (pageWidth - 30)) / 2, finalY + 50, { align: 'center' });

    doc.save(`boleta_${record.employee_name.replace(/\s+/g, '_')}_${record.period}.pdf`);
  };

  const handleExportExcel = (record: RecordItem) => {
    const calc = performCalculations(record.data);
    
    const extraRows = [];
    if (calc.pagoHorasExtras > 0) {
      extraRows.push(["Pago Horas Extras", calc.pagoHorasExtras]);
    }

    const data = [
      ["Empleado", record.employee_name],
      ["CI", record.data.ci || ""],
      ["Cargo", record.data.cargo || ""],
      ["Departamento", record.data.departamento || ""],
      ["AFP", record.data.afp || ""],
      ["NUA/CUA", record.data.nua || ""],
      ["Cuenta Bancaria", record.data.cuentaBancaria || ""],
      ["Periodo", record.period],
      ["Fecha Ingreso", record.data.admissionDate],
      ["Haber Mensual", record.data.baseSalary],
      ["Bono Antiguedad", calc.bonoAntiguedad],
      ...extraRows,
      ...record.data.bonos.map(b => ["Bono: " + b.name, b.amount]),
      ["Total Ganado", calc.totalGanado],
      ["Aporte Laboral", calc.aporteLaboral],
      ["Sueldo Neto", calc.sueldoNeto],
      ["RC-IVA", calc.rcIva],
      ...record.data.descuentos.map(d => ["Descuento: " + d.name, d.amount]),
      ["Líquido Pagable", calc.liquidoPagable],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Boleta");
    XLSX.writeFile(wb, `boleta_${record.employee_name.replace(/\s+/g, '_')}_${record.period}.xlsx`);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Historial de Planillas</h2>
          <p className="text-sm text-gray-500">{records.length} planillas guardadas</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o fecha..." 
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded outline-none focus:border-[#007a33] text-sm"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider font-bold">
            <tr>
              <th className="px-6 py-4">Empleado</th>
              <th className="px-6 py-4">Período</th>
              <th className="px-6 py-4">Total Ganado</th>
              <th className="px-6 py-4">Líquido Pagable</th>
              <th className="px-6 py-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(record => (
              <tr key={record.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-800">{record.employee_name}</div>
                  <div className="text-[10px] text-gray-400">Ingreso: {new Date(record.data.admissionDate).toLocaleDateString()}</div>
                </td>
                <td className="px-6 py-4">{record.period}</td>
                <td className="px-6 py-4 font-medium text-green-700">{formatCurrency(record.total_ganado)}</td>
                <td className="px-6 py-4 font-bold text-gray-800">{formatCurrency(record.liquido_pagable)}</td>
                <td className="px-6 py-4">
                   <div className="flex items-center justify-center gap-3">
                     <button onClick={() => setSelectedRecord(record)} className="text-[#007a33] hover:text-[#005e26] transition" title="Ver Detalle">
                       <Eye size={18} />
                     </button>
                     <button onClick={() => onDelete(record.id)} className="text-red-500 hover:text-red-700 transition" title="Eliminar">
                       <Trash2 size={18} />
                     </button>
                   </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-400 italic">No se encontraron registros.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center sm:p-4">
          <div className="bg-white sm:rounded-lg shadow-2xl w-full sm:max-w-md overflow-hidden flex flex-col h-full sm:h-auto sm:max-h-[90vh]">
            
            {/* Modal Header matching Boleta de Pago */}
            <div className="bg-gradient-to-r from-red-100 via-yellow-100 to-green-100 p-6 border-b border-gray-100 flex-shrink-0 relative">
               <button onClick={() => setSelectedRecord(null)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 bg-white/50 rounded-full p-2 sm:hidden">
                 ✕
               </button>
               <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2 text-[#1a2b4c] pr-8">
                 📑 Detalle de Planilla
               </h2>
               <div className="mt-2 text-sm text-gray-600">
                 <div>Empleado: <span className="font-bold text-gray-800">{selectedRecord.employee_name || '---'}</span></div>
                 <div className="grid grid-cols-2 gap-x-2 text-[10px] uppercase mt-2">
                   <div>C.I.: <span className="font-bold text-gray-800">{selectedRecord.data.ci || '---'}</span></div>
                   <div>AFP: <span className="font-bold text-gray-800">{selectedRecord.data.afp || '---'}</span></div>
                   <div className="col-span-2 mt-1">Cargo: <span className="font-bold text-gray-800">{selectedRecord.data.cargo || '---'}</span></div>
                 </div>
                 <div className="mt-2 pt-2 border-t border-gray-200">Período: <span className="font-bold text-gray-800">{selectedRecord.period || '---'}</span></div>
               </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-8 overflow-y-auto flex-grow space-y-5 sm:space-y-7 pb-6 sm:pb-8">
              
              <div>
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">Información del Empleado</h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-sm">
                  <div>
                    <div className="text-slate-400 text-[10px] uppercase tracking-wider mb-1">Fecha de Ingreso</div>
                    <div className="font-bold text-slate-900">{new Date(selectedRecord.data.admissionDate).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px] uppercase tracking-wider mb-1">Haber Mensual</div>
                    <div className="font-bold text-slate-900">{formatCurrency(selectedRecord.data.baseSalary)}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px] uppercase tracking-wider mb-1">Días Vacaciones</div>
                    <div className="font-bold text-blue-700">{modalCalc!.diasVacaciones} días hábiles</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px] uppercase tracking-wider mb-1">Departamento</div>
                    <div className="font-bold text-slate-900">{selectedRecord.data.departamento || '---'}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px] uppercase tracking-wider mb-1">Cuenta Bancaria</div>
                    <div className="font-bold text-slate-900">{selectedRecord.data.cuentaBancaria || '---'}</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-[11px] font-bold text-[#007a33] uppercase tracking-widest mb-4">Bonos</h3>
                <div className="space-y-3 text-sm pb-4 border-b border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">Bono de Antigüedad</span>
                    <span className="font-bold text-[#007a33]">{formatCurrency(modalCalc!.bonoAntiguedad)}</span>
                  </div>
                  {modalCalc!.pagoHorasExtras > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-medium">Pago Horas Extras ({selectedRecord.data.horasExtras} hrs)</span>
                      <span className="font-bold text-[#007a33]">{formatCurrency(modalCalc!.pagoHorasExtras)}</span>
                    </div>
                  )}
                  {selectedRecord.data.bonos.map(b => (
                    <div key={b.name} className="flex justify-between">
                      <span className="text-slate-600 font-medium">{b.name}</span>
                      <span className="font-bold text-[#007a33]">{formatCurrency(Number(b.amount))}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">Resumen de Cálculo</h3>
                <div className="space-y-4 text-sm">
                   
                   <div className="flex justify-between">
                     <span className="text-slate-600 font-medium">Total Ganado</span>
                     <span className="font-bold text-[#007a33]">{formatCurrency(selectedRecord.total_ganado)}</span>
                   </div>
                   
                   <div className="flex justify-between">
                     <span className="text-slate-600 font-medium">Aporte Laboral (12.71%)</span>
                     <span className="font-bold text-[#ce1126]">-{formatCurrency(modalCalc!.aporteLaboral)}</span>
                   </div>

                   <div className="flex justify-between">
                     <span className="text-slate-600 font-medium">Sueldo Neto</span>
                     <span className="font-bold text-blue-700">{formatCurrency(modalCalc!.sueldoNeto)}</span>
                   </div>

                   <div className="flex justify-between">
                     <span className="text-slate-600 font-medium">RC-IVA</span>
                     <span className="font-bold text-[#ce1126]">-{formatCurrency(modalCalc!.rcIva)}</span>
                   </div>

                   {selectedRecord.data.descuentos.length > 0 && (
                     <>
                       {selectedRecord.data.descuentos.map(d => (
                         <div key={d.name} className="flex justify-between">
                           <span className="text-slate-600 font-medium">{d.name}</span>
                           <span className="font-bold text-[#ce1126]">-{formatCurrency(Number(d.amount))}</span>
                         </div>
                       ))}
                     </>
                   )}
                </div>
              </div>

              <div className="bg-[#005e26] text-white py-5 px-6 rounded shadow-sm flex flex-col items-center justify-center mt-2">
                <div className="text-[10px] font-bold tracking-widest uppercase mb-1 opacity-90">Líquido Pagable</div>
                <div className="text-[32px] font-black tracking-tight">{formatCurrency(selectedRecord.liquido_pagable)}</div>
              </div>

            </div>
            
            {/* Modal Footer */}
            <div className="p-4 sm:p-8 pt-0 flex flex-col gap-3 sm:gap-4 mt-auto sm:mt-0">
               <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                 <button onClick={() => handleExportPDF(selectedRecord)} className="flex-1 bg-[#ce1126] text-white px-4 py-3 sm:py-3.5 rounded font-bold flex items-center justify-center gap-2 hover:bg-[#a00d1d] transition shadow-sm text-sm sm:text-base">
                   <Download size={18} /> Exportar PDF
                 </button>
                 <button onClick={() => handleExportExcel(selectedRecord)} className="flex-1 bg-[#007a33] text-white px-4 py-3 sm:py-3.5 rounded font-bold flex items-center justify-center gap-2 hover:bg-[#005e26] transition shadow-sm text-sm sm:text-base">
                   <Download size={18} /> Exportar Excel
                 </button>
               </div>
               <button onClick={() => setSelectedRecord(null)} className="w-full bg-[#f1f5f9] text-[#334155] px-4 py-3 sm:py-3.5 rounded font-bold hover:bg-[#e2e8f0] transition flex items-center justify-center text-sm sm:text-base">
                 Cerrar Detalle
               </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}
