import { differenceInYears, differenceInMonths } from "date-fns";
import { PlanillaData, Bono, Descuento, CalculationResult } from "../types";

export const SMN = 3300;

export function calculateBonoAntiguedad(admissionDate: string, periodDate: string): { amount: number; years: number } {
  if (!admissionDate || !periodDate) return { amount: 0, years: 0 };
  
  // Parse dates. assuming period is format YYYY-MM
  const admDate = new Date(admissionDate);
  const perDate = new Date(periodDate + "-01");
  
  if (isNaN(admDate.getTime()) || isNaN(perDate.getTime())) return { amount: 0, years: 0 };
  
  const years = Math.max(0, differenceInYears(perDate, admDate));
  
  let percentage = 0;
  if (years >= 2 && years <= 4) percentage = 0.05;
  else if (years >= 5 && years <= 7) percentage = 0.11;
  else if (years >= 8 && years <= 10) percentage = 0.18;
  else if (years >= 11 && years <= 14) percentage = 0.26;
  else if (years >= 15 && years <= 19) percentage = 0.34;
  else if (years >= 20 && years <= 24) percentage = 0.42;
  else if (years >= 25) percentage = 0.50;

  return { amount: 3 * SMN * percentage, years };
}

export function performCalculations(data: PlanillaData): CalculationResult {
  const baseSalary = data.baseSalary || 0;
  const horasExtras = data.horasExtras || 0;
  
  const { amount: bonoAntiguedad, years: yearsOfService } = calculateBonoAntiguedad(data.admissionDate, data.period);
  
  let diasVacaciones = 0;
  if (yearsOfService >= 1 && yearsOfService <= 4) diasVacaciones = 15;
  else if (yearsOfService >= 5 && yearsOfService <= 9) diasVacaciones = 20;
  else if (yearsOfService >= 10) diasVacaciones = 30;

  const salarioHora = baseSalary / 240; // 30 days * 8 hours
  const pagoHorasExtras = horasExtras * (salarioHora * 2); // Double pay
  
  const providedBonosSum = (data.bonos || []).reduce((acc, b) => acc + (Number(b.amount) || 0), 0);
  const totalBonos = bonoAntiguedad + pagoHorasExtras + providedBonosSum;
  
  const totalGanado = baseSalary + totalBonos;
  
  // Aporte laboral 12.71%
  const aporteLaboral = totalGanado * 0.1271;
  
  const sueldoNeto = totalGanado - aporteLaboral;
  
  // RC-IVA
  // Base imponible = sueldo neto - 2 salarios mínimos
  let rcIva = 0;
  let baseImponible = sueldoNeto - (2 * SMN);
  
  // Aplica si sueldo neto > 3 salarios mínimos according to prompt
  // Prompt formula: se restan 2 salarios mínimos al sueldo neto ... luego calcula el 13%, luego resta el 13% de un salario mínimo
  if (sueldoNeto > 3 * SMN && baseImponible > 0) {
    const impuesto = baseImponible * 0.13;
    rcIva = impuesto - (SMN * 0.13);
    if (rcIva < 0) rcIva = 0;
  }

  const providedDescuentosSum = (data.descuentos || []).reduce((acc, d) => acc + (Number(d.amount) || 0), 0);
  const totalDescuentos = providedDescuentosSum; // No sumamos aporte laboral ni rcIva aqui para el Liquido Pagable, ya que la formula es: Liquido = Sueldo Neto - RC-IVA - Descuentos Adicionales
  
  const liquidoPagable = sueldoNeto - rcIva - totalDescuentos;

  return {
    totalBonos,
    totalGanado,
    aporteLaboral,
    sueldoNeto,
    rcIva,
    totalDescuentos,
    liquidoPagable,
    yearsOfService,
    diasVacaciones,
    bonoAntiguedad,
    pagoHorasExtras
  };
}

export function formatCurrency(amount: number): string {
  return "Bs " + amount.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
