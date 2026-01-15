// Tipos clonados del proyecto web
export interface Candidate {
  Candidato: string;
  Partido_Movimiento: string;
  Intención_Voto_Porcentaje: number;
  Favorabilidad: number;
  Desfavorabilidad: number;
  Edad: number;
  Tendencia_Política: string;
  Cargo_Actual: string;
  Descripción?: string;
}

export interface RegionalData {
  Región: string;
  percentage: number;
  candidatoLider?: string;
}

export interface AgeData {
  Rango_Edad: string;
  percentage: number;
}

export interface ComparisonData {
  tendencia: string;
  porcentaje2022: number;
  porcentaje2026: number;
}

export interface Noticia {
  id: number;
  title: string;
  content: string;
  date: string;
  source: string;
  candidates: string[];
  political_parties: string[];
}

export interface InsightData {
  title: string;
  description: string;
  impact: string;
  percentage?: string;
  change?: string;
  uncertainty?: string;
}
