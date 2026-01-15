import axios from 'axios';
import { Candidate, RegionalData, AgeData, ComparisonData, Noticia } from '../types/election';

const BASE_URL = 'https://elecciones-colombia-2026.vercel.app';

export const fetchCandidates = async (): Promise<Candidate[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/candidatos_presidenciales_2026_completo.csv`);
    const lines = response.data.split('\n');
    
    return lines.slice(1)
      .filter((line: string) => line.trim())
      .map((line: string) => {
        const values = line.split(',');
        return {
          Candidato: values[0]?.replace(/"/g, '').trim() || '',
          Partido_Movimiento: values[1]?.replace(/"/g, '').trim() || '',
          Intención_Voto_Porcentaje: parseFloat(values[2]) || 0,
          Favorabilidad: parseFloat(values[3]) || 0,
          Desfavorabilidad: parseFloat(values[4]) || 0,
          Edad: parseInt(values[5]) || 0,
          Tendencia_Política: values[6]?.replace(/"/g, '').trim() || '',
          Cargo_Actual: values[7]?.replace(/"/g, '').trim() || '',
          Descripción: values[8]?.replace(/"/g, '').trim() || ''
        };
      })
      .filter((c: Candidate) => c.Candidato)
      .sort((a: Candidate, b: Candidate) => b.Intención_Voto_Porcentaje - a.Intención_Voto_Porcentaje);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    return [];
  }
};

export const fetchRegionalData = async (): Promise<RegionalData[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/intencion_voto_regiones_2026.csv`);
    const lines = response.data.split('\n');
    
    return lines.slice(1)
      .filter((line: string) => line.trim())
      .map((line: string) => {
        const values = line.split(',');
        return {
          Región: values[0]?.replace(/"/g, '').trim() || '',
          percentage: parseFloat(values[1]) || 0,
          candidatoLider: values[2]?.replace(/"/g, '').trim() || ''
        };
      })
      .filter((r: RegionalData) => r.Región);
  } catch (error) {
    console.error('Error fetching regional data:', error);
    return [];
  }
};

export const fetchAgeData = async (): Promise<AgeData[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/intencion_voto_edades_2026.csv`);
    const lines = response.data.split('\n');
    
    return lines.slice(1)
      .filter((line: string) => line.trim())
      .map((line: string) => {
        const values = line.split(',');
        return {
          Rango_Edad: values[0]?.replace(/"/g, '').trim() || '',
          percentage: parseFloat(values[1]) || 0
        };
      })
      .filter((a: AgeData) => a.Rango_Edad);
  } catch (error) {
    console.error('Error fetching age data:', error);
    return [];
  }
};

export const fetchComparisonData = async (): Promise<ComparisonData[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/comparacion_2022_2026.csv`);
    const lines = response.data.split('\n');
    
    return lines.slice(1)
      .filter((line: string) => line.trim())
      .map((line: string) => {
        const values = line.split(',');
        return {
          tendencia: values[0]?.replace(/"/g, '').trim() || '',
          porcentaje2022: parseFloat(values[1]) || 0,
          porcentaje2026: parseFloat(values[2]) || 0
        };
      })
      .filter((c: ComparisonData) => c.tendencia);
  } catch (error) {
    console.error('Error fetching comparison data:', error);
    return [];
  }
};

export const fetchFavorabilityData = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/favorabilidad_candidatos_2026.csv`);
    const lines = response.data.split('\n');
    
    return lines.slice(1)
      .filter((line: string) => line.trim())
      .map((line: string) => {
        const values = line.split(',');
        return {
          Candidato: values[0]?.replace(/"/g, '').trim() || '',
          Favorabilidad: parseFloat(values[1]) || 0,
          Desfavorabilidad: parseFloat(values[2]) || 0,
          NoConoce: parseFloat(values[3]) || 0
        };
      });
  } catch (error) {
    console.error('Error fetching favorability data:', error);
    return [];
  }
};

export const fetchSecondRoundScenarios = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/escenarios_segunda_vuelta_2026.csv`);
    const lines = response.data.split('\n');
    
    return lines.slice(1)
      .filter((line: string) => line.trim())
      .map((line: string) => {
        const values = line.split(',');
        return {
          Candidato1: values[0]?.replace(/"/g, '').trim() || '',
          Candidato2: values[1]?.replace(/"/g, '').trim() || '',
          Porcentaje1: parseFloat(values[2]) || 0,
          Porcentaje2: parseFloat(values[3]) || 0
        };
      });
  } catch (error) {
    console.error('Error fetching second round scenarios:', error);
    return [];
  }
};

export const fetchNoticias = async (): Promise<Noticia[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/api/noticias`);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching noticias:', error);
    return [];
  }
};
