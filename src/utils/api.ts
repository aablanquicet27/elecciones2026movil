import axios from 'axios';
import { Candidate, RegionalData, AgeData, ComparisonData, SecondRoundScenario, FavorabilityData, Noticia } from '../types/election';

const BASE_URL = 'https://elecciones-colombia-2026.vercel.app';

// Parse CSV to JSON
const parseCSV = (csv: string): any[] => {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const result: any[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    const obj: any = {};
    
    headers.forEach((header, index) => {
      const value = values[index] || '';
      const numValue = parseFloat(value);
      obj[header] = isNaN(numValue) ? value : numValue;
    });
    
    result.push(obj);
  }
  
  return result;
};

// Normalize keys (remove accents and special chars)
const normalizeKey = (key: string): string => {
  return key
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_]/g, '_');
};

// Normalize object keys
const normalizeObject = (obj: any): any => {
  const normalized: any = {};
  Object.keys(obj).forEach(key => {
    const newKey = normalizeKey(key);
    normalized[newKey] = obj[key];
  });
  return normalized;
};

export const fetchCandidates = async (): Promise<Candidate[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/candidatos_presidenciales_2026_completo.csv`);
    const data = parseCSV(response.data);
    return data.map(normalizeObject).sort((a, b) => b.Intencion_Voto_Porcentaje - a.Intencion_Voto_Porcentaje);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    return [];
  }
};

export const fetchRegionalData = async (): Promise<RegionalData[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/intencion_voto_regiones_2026.csv`);
    const data = parseCSV(response.data);
    return data.map(normalizeObject);
  } catch (error) {
    console.error('Error fetching regional data:', error);
    return [];
  }
};

export const fetchAgeData = async (): Promise<AgeData[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/intencion_voto_edades_2026.csv`);
    const data = parseCSV(response.data);
    return data.map(normalizeObject);
  } catch (error) {
    console.error('Error fetching age data:', error);
    return [];
  }
};

export const fetchComparisonData = async (): Promise<ComparisonData[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/comparacion_2022_2026.csv`);
    const data = parseCSV(response.data);
    return data.map(normalizeObject);
  } catch (error) {
    console.error('Error fetching comparison data:', error);
    return [];
  }
};

export const fetchFavorabilityData = async (): Promise<FavorabilityData[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/favorabilidad_candidatos_2026.csv`);
    const data = parseCSV(response.data);
    return data.map(normalizeObject);
  } catch (error) {
    console.error('Error fetching favorability data:', error);
    return [];
  }
};

export const fetchSecondRoundScenarios = async (): Promise<SecondRoundScenario[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/escenarios_segunda_vuelta_2026.csv`);
    const data = parseCSV(response.data);
    return data.map(normalizeObject);
  } catch (error) {
    console.error('Error fetching second round scenarios:', error);
    return [];
  }
};

export const fetchNoticias = async (): Promise<Noticia[]> => {
  try {
    // This would connect to Supabase or another backend
    // For now, return empty array
    return [];
  } catch (error) {
    console.error('Error fetching noticias:', error);
    return [];
  }
};
