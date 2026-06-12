export interface PlanillaData {
  employeeName: string;
  ci: string;
  cargo: string;
  departamento: string;
  afp: string;
  nua: string;
  cuentaBancaria: string;
  period: string;
  admissionDate: string;
  baseSalary: number;
  horasExtras: number;
  bonos: Bono[];
  descuentos: Descuento[];
}

export interface Bono {
  id: string;
  name: string;
  amount: number;
}

export interface Descuento {
  id: string;
  name: string;
  amount: number;
}

export interface CalculationResult {
  totalBonos: number;
  totalGanado: number;
  aporteLaboral: number;
  sueldoNeto: number;
  rcIva: number;
  totalDescuentos: number;
  liquidoPagable: number;
  yearsOfService: number;
  diasVacaciones: number;
  bonoAntiguedad: number;
  pagoHorasExtras: number;
}

export interface RecordItem {
  id: number;
  user_id: number;
  employee_name: string;
  period: string;
  total_ganado: number;
  liquido_pagable: number;
  data: PlanillaData;
  created_at: string;
}

export interface User {
  email: string;
  role: string;
}
