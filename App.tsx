import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ScrollView, Text, Image, ActivityIndicator } from 'react-native';
import axios from 'axios';

interface Candidate {
  Candidato: string;
  Partido: string;
  Intención_Voto_Porcentaje: number;
  Favorabilidad: number;
  Edad: number;
  Ideología: string;
}

export default function App() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await axios.get('https://elecciones-colombia-2026.vercel.app/candidatos_presidenciales_2026_completo.csv');
      const lines = response.data.split('\n');
      
      const parsedCandidates = lines.slice(1)
        .filter((line: string) => line.trim())
        .map((line: string) => {
          const values = line.split(',');
          return {
            Candidato: values[0]?.replace(/"/g, '').trim() || '',
            Partido: values[1]?.replace(/"/g, '').trim() || '',
            Intención_Voto_Porcentaje: parseFloat(values[2]) || 0,
            Favorabilidad: parseFloat(values[3]) || 0,
            Edad: parseInt(values[4]) || 0,
            Ideología: values[5]?.replace(/"/g, '').trim() || ''
          };
        })
        .filter((c: Candidate) => c.Candidato);

      setCandidates(parsedCandidates.slice(0, 12));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Cargando datos electorales...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image 
            source={{ uri: 'https://elecciones-colombia-2026.vercel.app/logoagapai.png' }}
            style={styles.logo}
          />
          <View>
            <Text style={styles.headerTitle}>Colombia 2026</Text>
            <Text style={styles.headerSubtitle}>Elecciones Presidenciales</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Análisis Electoral en Tiempo Real</Text>
          <Text style={styles.heroSubtitle}>
            Seguimiento de candidatos, encuestas y análisis político
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Principales Candidatos</Text>
          {candidates.map((candidate, index) => (
            <View key={index} style={styles.candidateCard}>
              <View style={styles.candidateHeader}>
                <View>
                  <Text style={styles.candidateName}>{candidate.Candidato}</Text>
                  <Text style={styles.candidateParty}>{candidate.Partido}</Text>
                </View>
                <View style={styles.percentageBadge}>
                  <Text style={styles.percentageText}>
                    {candidate.Intención_Voto_Porcentaje.toFixed(1)}%
                  </Text>
                </View>
              </View>
              
              <View style={styles.candidateStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Favorabilidad</Text>
                  <Text style={styles.statValue}>{candidate.Favorabilidad}%</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Edad</Text>
                  <Text style={styles.statValue}>{candidate.Edad} años</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Ideología</Text>
                  <Text style={styles.statValue}>{candidate.Ideología}</Text>
                </View>
              </View>

              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${candidate.Intención_Voto_Porcentaje * 5}%` }]} />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Datos actualizados  Enero 2026
          </Text>
          <Text style={styles.footerSubtext}>
            Análisis electoral Colombia 2026
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    backgroundColor: '#1e40af',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 48,
    height: 48,
    marginRight: 12,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#93c5fd',
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    backgroundColor: '#ffffff',
    padding: 24,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  candidateCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  candidateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  candidateName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  candidateParty: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  percentageBadge: {
    backgroundColor: '#2563eb',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  percentageText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  candidateStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 4,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginTop: 16,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
});
