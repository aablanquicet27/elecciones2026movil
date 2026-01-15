export interface Candidate {
  Candidato: string;
  Partido_Movimiento: string;
  Tendencia_Politica: string;
  Cargo_Actual: string;
  Edad: number;
  Intencion_Voto_Porcentaje: number;
  Favorabilidad: number;
  Desfavorabilidad: number;
  Descripcion?: string;
  [key: string]: string | number | undefined;
}

export interface RegionalData {
  Region: string;
  [key: string]: string | number;
}

export interface AgeData {
  Grupo_Edad: string;
  [key: string]: string | number;
}

export interface ComparisonData {
  Candidato: string;
  Porcentaje_2022: number;
  Porcentaje_2026: number;
  Cambio: number;
}

export interface SecondRoundScenario {
  Candidato_1: string;
  Candidato_2: string;
  Porcentaje_1: number;
  Porcentaje_2: number;
}

export interface FavorabilityData {
  Candidato: string;
  Favorabilidad: number;
  Desfavorabilidad: number;
  No_Conoce: number;
}

export interface Noticia {
  id: number;
  titulo: string;
  contenido: string;
  fecha: string;
  fuente?: string;
}

export interface InsightData {
  titulo: string;
  descripcion: string;
  valor: string | number;
  icono: string;
  color: string;
}
