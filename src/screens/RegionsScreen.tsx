import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Dimensions, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchRegionalData, fetchAgeData, fetchCandidates } from '../utils/api';
import { RegionalData, AgeData, Candidate } from '../types/election';

const { width } = Dimensions.get('window');

const RegionsScreen: React.FC = () => {
  const [regionalData, setRegionalData] = useState<RegionalData[]>([]);
  const [ageData, setAgeData] = useState<AgeData[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'regions' | 'ages'>('regions');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [reg, age, cand] = await Promise.all([fetchRegionalData(), fetchAgeData(), fetchCandidates()]);
    setRegionalData(reg);
    setAgeData(age);
    setCandidates(cand);
    setLoading(false);
  };

  const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

  if (loading) return (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color="#7c3aed" />
      <Text style={styles.loadingText}>Cargando datos demograficos...</Text>
    </View>
  );

  const regionColors: { [key: string]: string } = {
    'Costa Caribe': '#ef4444',
    'Andina': '#22c55e',
    'Pacifica': '#3b82f6',
    'Orinoquia': '#f59e0b',
    'Amazonia': '#8b5cf6',
    'Bogota': '#ec4899'
  };

  const ageColors: { [key: string]: string } = {
    '18-25': '#ef4444',
    '26-35': '#f59e0b',
    '36-45': '#22c55e',
    '46-55': '#3b82f6',
    '56+': '#8b5cf6'
  };

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#7c3aed']} />}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Demografia Electoral</Text>
        <Text style={styles.headerSubtitle}>Analisis por regiones y grupos de edad</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, activeTab === 'regions' && styles.tabActive]} onPress={() => setActiveTab('regions')}>
          <Ionicons name="map" size={18} color={activeTab === 'regions' ? '#7c3aed' : '#6b7280'} />
          <Text style={[styles.tabText, activeTab === 'regions' && styles.tabTextActive]}>Regiones</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'ages' && styles.tabActive]} onPress={() => setActiveTab('ages')}>
          <Ionicons name="people" size={18} color={activeTab === 'ages' ? '#7c3aed' : '#6b7280'} />
          <Text style={[styles.tabText, activeTab === 'ages' && styles.tabTextActive]}>Edades</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'regions' && (
        <>
          <View style={styles.summaryContainer}>
            <Text style={styles.sectionTitle}>Intencion de Voto por Region</Text>
            <Text style={styles.sectionSubtitle}>Como varia el apoyo a cada candidato segun la region</Text>
          </View>

          {regionalData.length > 0 ? (
            regionalData.map((region, idx) => (
              <View key={idx} style={styles.regionCard}>
                <View style={styles.regionHeader}>
                  <View style={[styles.regionDot, { backgroundColor: regionColors[region.Region] || '#6b7280' }]} />
                  <Text style={styles.regionName}>{region.Region}</Text>
                </View>
                
                {candidates.slice(0, 5).map((candidate, i) => {
                  const candidateKey = candidate.Candidato.replace(/\s+/g, '_') as keyof RegionalData;
                  const percentage = (region[candidateKey] as number) || 0;
                  
                  return (
                    <View key={i} style={styles.candidateRow}>
                      <Text style={styles.candidateNameSmall} numberOfLines={1}>{candidate.Candidato}</Text>
                      <View style={styles.barContainer}>
                        <View style={[styles.bar, { width: Math.min(percentage * 4, 100) + '%', backgroundColor: regionColors[region.Region] || '#6b7280' }]} />
                      </View>
                      <Text style={styles.percentText}>{percentage}%</Text>
                    </View>
                  );
                })}
              </View>
            ))
          ) : (
            <View style={styles.noDataCard}>
              <Ionicons name="map-outline" size={48} color="#d1d5db" />
              <Text style={styles.noDataText}>No hay datos regionales disponibles</Text>
            </View>
          )}
        </>
      )}

      {activeTab === 'ages' && (
        <>
          <View style={styles.summaryContainer}>
            <Text style={styles.sectionTitle}>Intencion de Voto por Edad</Text>
            <Text style={styles.sectionSubtitle}>Preferencias electorales por grupo etario</Text>
          </View>

          <View style={styles.ageLegend}>
            {Object.entries(ageColors).map(([age, color]) => (
              <View key={age} style={styles.ageItem}>
                <View style={[styles.ageDot, { backgroundColor: color }]} />
                <Text style={styles.ageLabel}>{age}</Text>
              </View>
            ))}
          </View>

          {ageData.length > 0 ? (
            ageData.map((age, idx) => (
              <View key={idx} style={styles.ageCard}>
                <View style={styles.ageHeader}>
                  <View style={[styles.ageBadge, { backgroundColor: ageColors[age.Grupo_Edad] || '#6b7280' }]}>
                    <Text style={styles.ageBadgeText}>{age.Grupo_Edad}</Text>
                  </View>
                  <Text style={styles.ageTitle}>anios</Text>
                </View>
                
                {candidates.slice(0, 5).map((candidate, i) => {
                  const candidateKey = candidate.Candidato.replace(/\s+/g, '_') as keyof AgeData;
                  const percentage = (age[candidateKey] as number) || 0;
                  
                  return (
                    <View key={i} style={styles.candidateRow}>
                      <Text style={styles.candidateNameSmall} numberOfLines={1}>{candidate.Candidato}</Text>
                      <View style={styles.barContainer}>
                        <View style={[styles.bar, { width: Math.min(percentage * 4, 100) + '%', backgroundColor: ageColors[age.Grupo_Edad] || '#6b7280' }]} />
                      </View>
                      <Text style={styles.percentText}>{percentage}%</Text>
                    </View>
                  );
                })}
              </View>
            ))
          ) : (
            <View style={styles.noDataCard}>
              <Ionicons name="people-outline" size={48} color="#d1d5db" />
              <Text style={styles.noDataText}>No hay datos por edad disponibles</Text>
            </View>
          )}
        </>
      )}

      <View style={styles.insightsSection}>
        <Text style={styles.sectionTitle}>Hallazgos Clave</Text>
        <View style={styles.insightCard}>
          <Ionicons name="bulb" size={24} color="#f59e0b" />
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>Variacion Regional</Text>
            <Text style={styles.insightText}>Los candidatos muestran diferencias significativas en apoyo segun la region geografica</Text>
          </View>
        </View>
        <View style={styles.insightCard}>
          <Ionicons name="trending-up" size={24} color="#22c55e" />
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>Factor Generacional</Text>
            <Text style={styles.insightText}>Los votantes jovenes (18-35) muestran preferencias distintas a los mayores de 55</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#6b7280' },
  header: { backgroundColor: '#059669', padding: 24, paddingTop: 60 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#ffffff' },
  headerSubtitle: { fontSize: 14, color: '#a7f3d0', marginTop: 4 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#ffffff', padding: 8, marginHorizontal: 16, marginTop: -20, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 8 },
  tabActive: { backgroundColor: '#ede9fe' },
  tabText: { fontSize: 14, color: '#6b7280', marginLeft: 6 },
  tabTextActive: { color: '#7c3aed', fontWeight: '600' },
  summaryContainer: { padding: 16, paddingTop: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  sectionSubtitle: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  regionCard: { backgroundColor: '#ffffff', marginHorizontal: 16, marginBottom: 12, padding: 16, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  regionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  regionDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  regionName: { fontSize: 16, fontWeight: '600', color: '#111827' },
  candidateRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  candidateNameSmall: { width: 90, fontSize: 11, color: '#4b5563' },
  barContainer: { flex: 1, height: 12, backgroundColor: '#e5e7eb', borderRadius: 6, marginHorizontal: 8, overflow: 'hidden' },
  bar: { height: '100%', borderRadius: 6 },
  percentText: { width: 35, fontSize: 11, fontWeight: '600', color: '#374151', textAlign: 'right' },
  ageLegend: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, marginBottom: 8 },
  ageItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16, marginBottom: 8 },
  ageDot: { width: 10, height: 10, borderRadius: 5, marginRight: 4 },
  ageLabel: { fontSize: 12, color: '#4b5563' },
  ageCard: { backgroundColor: '#ffffff', marginHorizontal: 16, marginBottom: 12, padding: 16, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  ageHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  ageBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  ageBadgeText: { fontSize: 14, fontWeight: 'bold', color: '#ffffff' },
  ageTitle: { fontSize: 14, color: '#6b7280', marginLeft: 6 },
  noDataCard: { backgroundColor: '#ffffff', marginHorizontal: 16, padding: 40, borderRadius: 12, alignItems: 'center' },
  noDataText: { fontSize: 14, color: '#6b7280', marginTop: 12 },
  insightsSection: { padding: 16 },
  insightCard: { backgroundColor: '#ffffff', padding: 16, borderRadius: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'flex-start', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  insightContent: { flex: 1, marginLeft: 12 },
  insightTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  insightText: { fontSize: 13, color: '#6b7280', marginTop: 4, lineHeight: 18 }
});

export default RegionsScreen;
