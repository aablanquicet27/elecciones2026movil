import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Dimensions, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { VictoryChart, VictoryBar, VictoryTheme, VictoryAxis, VictoryLabel, VictoryPie, VictoryLegend } from 'victory-native';
import { fetchCandidates, fetchComparisonData, fetchSecondRoundScenarios } from '../utils/api';
import { Candidate, ComparisonData, SecondRoundScenario } from '../types/election';

const { width } = Dimensions.get('window');

const AnalysisScreen: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [comparison, setComparison] = useState<ComparisonData[]>([]);
  const [scenarios, setScenarios] = useState<SecondRoundScenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'comparison' | 'scenarios'>('general');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [c, comp, scen] = await Promise.all([
      fetchCandidates(),
      fetchComparisonData(),
      fetchSecondRoundScenarios()
    ]);
    setCandidates(c);
    setComparison(comp);
    setScenarios(scen);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={styles.loadingText}>Cargando análisis...</Text>
      </View>
    );
  }

  const totalIntention = candidates.reduce((sum, c) => sum + c.Intención_Voto_Porcentaje, 0);
  const undecided = Math.max(0, 100 - totalIntention);
  const avgFavorability = candidates.length > 0 ? candidates.reduce((sum, c) => sum + c.Favorabilidad, 0) / candidates.length : 0;
  const avgAge = candidates.length > 0 ? candidates.reduce((sum, c) => sum + c.Edad, 0) / candidates.length : 0;
  const leftCandidates = candidates.filter(c => c.Tendencia_Política === 'Izquierda').length;
  const centerCandidates = candidates.filter(c => c.Tendencia_Política === 'Centro').length;
  const rightCandidates = candidates.filter(c => c.Tendencia_Política === 'Derecha').length;

  const pieData = [
    { x: 'Izquierda', y: leftCandidates, color: '#ef4444' },
    { x: 'Centro', y: centerCandidates, color: '#3b82f6' },
    { x: 'Derecha', y: rightCandidates, color: '#22c55e' }
  ].filter(d => d.y > 0);

  const tabs = [
    { key: 'general', label: 'General', icon: 'stats-chart' },
    { key: 'comparison', label: '2022 vs 2026', icon: 'git-compare' },
    { key: 'scenarios', label: '2da Vuelta', icon: 'people' }
  ] as const;

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#7c3aed']} />}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Panel de Análisis</Text>
        <Text style={styles.headerSubtitle}>Estadísticas y comparaciones electorales</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Ionicons name={tab.icon as any} size={18} color={activeTab === tab.key ? '#7c3aed' : '#6b7280'} />
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'general' && (
        <>
          {/* Stats Cards */}
          <View style={styles.statsGrid}>
            <View style={styles.statsCard}>
              <Ionicons name="people" size={24} color="#7c3aed" />
              <Text style={styles.statsValue}>{candidates.length}</Text>
              <Text style={styles.statsLabel}>Candidatos</Text>
            </View>
            <View style={styles.statsCard}>
              <Ionicons name="help-circle" size={24} color="#f59e0b" />
              <Text style={styles.statsValue}>{undecided.toFixed(1)}%</Text>
              <Text style={styles.statsLabel}>Indecisos</Text>
            </View>
            <View style={styles.statsCard}>
              <Ionicons name="heart" size={24} color="#22c55e" />
              <Text style={styles.statsValue}>{avgFavorability.toFixed(1)}%</Text>
              <Text style={styles.statsLabel}>Fav. Promedio</Text>
            </View>
            <View style={styles.statsCard}>
              <Ionicons name="calendar" size={24} color="#3b82f6" />
              <Text style={styles.statsValue}>{avgAge.toFixed(0)}</Text>
              <Text style={styles.statsLabel}>Edad Promedio</Text>
            </View>
          </View>

          {/* Tendencias Políticas */}
          <View style={styles.chartCard}>
            <Text style={styles.sectionTitle}>Distribución por Tendencia</Text>
            <View style={styles.pieContainer}>
              <VictoryPie
                data={pieData}
                colorScale={pieData.map(d => d.color)}
                width={width - 64}
                height={200}
                innerRadius={50}
                labels={({ datum }) => datum.x + ': ' + datum.y}
                style={{ labels: { fontSize: 12, fill: '#374151' } }}
              />
            </View>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} /><Text style={styles.legendText}>Izquierda ({leftCandidates})</Text></View>
              <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#3b82f6' }]} /><Text style={styles.legendText}>Centro ({centerCandidates})</Text></View>
              <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#22c55e' }]} /><Text style={styles.legendText}>Derecha ({rightCandidates})</Text></View>
            </View>
          </View>

          {/* Top 5 Favorabilidad */}
          <View style={styles.chartCard}>
            <Text style={styles.sectionTitle}>Top 5 Favorabilidad</Text>
            {candidates.slice(0, 5).sort((a, b) => b.Favorabilidad - a.Favorabilidad).slice(0, 5).map((c, i) => (
              <View key={i} style={styles.favRow}>
                <Text style={styles.favName} numberOfLines={1}>{c.Candidato}</Text>
                <View style={styles.favBarContainer}>
                  <View style={[styles.favBar, { width: c.Favorabilidad + '%', backgroundColor: '#22c55e' }]} />
                </View>
                <Text style={styles.favValue}>{c.Favorabilidad}%</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {activeTab === 'comparison' && (
        <View style={styles.chartCard}>
          <Text style={styles.sectionTitle}>Comparación 2022 vs 2026</Text>
          {comparison.length > 0 ? (
            comparison.map((item, i) => (
              <View key={i} style={styles.comparisonCard}>
                <Text style={styles.compCandidateName}>{item.Candidato}</Text>
                <View style={styles.compRow}>
                  <View style={styles.compColumn}>
                    <Text style={styles.compLabel}>2022</Text>
                    <Text style={[styles.compValue, { color: '#6b7280' }]}>{item.Porcentaje_2022 || 'N/A'}%</Text>
                  </View>
                  <Ionicons name="arrow-forward" size={20} color="#9ca3af" />
                  <View style={styles.compColumn}>
                    <Text style={styles.compLabel}>2026</Text>
                    <Text style={[styles.compValue, { color: '#7c3aed' }]}>{item.Porcentaje_2026}%</Text>
                  </View>
                  <View style={styles.compColumn}>
                    <Text style={styles.compLabel}>Cambio</Text>
                    <Text style={[styles.compValue, { color: item.Cambio >= 0 ? '#22c55e' : '#ef4444' }]}>
                      {item.Cambio >= 0 ? '+' : ''}{item.Cambio}%
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No hay datos de comparación disponibles</Text>
          )}
        </View>
      )}

      {activeTab === 'scenarios' && (
        <View style={styles.chartCard}>
          <Text style={styles.sectionTitle}>Escenarios Segunda Vuelta</Text>
          {scenarios.length > 0 ? (
            scenarios.map((scenario, i) => (
              <View key={i} style={styles.scenarioCard}>
                <View style={styles.scenarioHeader}>
                  <Text style={styles.scenarioTitle}>Escenario {i + 1}</Text>
                </View>
                <View style={styles.scenarioVs}>
                  <View style={styles.scenarioCandidate}>
                    <Text style={styles.scenarioCandName} numberOfLines={1}>{scenario.Candidato_1}</Text>
                    <Text style={[styles.scenarioPercent, { color: scenario.Porcentaje_1 > scenario.Porcentaje_2 ? '#22c55e' : '#6b7280' }]}>
                      {scenario.Porcentaje_1}%
                    </Text>
                  </View>
                  <Text style={styles.vsText}>VS</Text>
                  <View style={styles.scenarioCandidate}>
                    <Text style={styles.scenarioCandName} numberOfLines={1}>{scenario.Candidato_2}</Text>
                    <Text style={[styles.scenarioPercent, { color: scenario.Porcentaje_2 > scenario.Porcentaje_1 ? '#22c55e' : '#6b7280' }]}>
                      {scenario.Porcentaje_2}%
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No hay escenarios disponibles</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#6b7280' },
  header: { backgroundColor: '#1e40af', padding: 24, paddingTop: 60 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#ffffff' },
  headerSubtitle: { fontSize: 14, color: '#93c5fd', marginTop: 4 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#ffffff', padding: 8, marginHorizontal: 16, marginTop: -20, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 8 },
  tabActive: { backgroundColor: '#ede9fe' },
  tabText: { fontSize: 12, color: '#6b7280', marginLeft: 4 },
  tabTextActive: { color: '#7c3aed', fontWeight: '600' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 16, paddingTop: 24 },
  statsCard: { width: (width - 48) / 2, backgroundColor: '#ffffff', padding: 16, borderRadius: 12, marginBottom: 12, marginRight: 8, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  statsValue: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginTop: 8 },
  statsLabel: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  chartCard: { backgroundColor: '#ffffff', margin: 16, padding: 16, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 16 },
  pieContainer: { alignItems: 'center' },
  legendRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', marginTop: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 8, marginVertical: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  legendText: { fontSize: 12, color: '#4b5563' },
  favRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  favName: { width: 100, fontSize: 12, color: '#374151' },
  favBarContainer: { flex: 1, height: 16, backgroundColor: '#e5e7eb', borderRadius: 8, marginHorizontal: 8, overflow: 'hidden' },
  favBar: { height: '100%', borderRadius: 8 },
  favValue: { width: 40, fontSize: 12, fontWeight: '600', color: '#22c55e', textAlign: 'right' },
  comparisonCard: { backgroundColor: '#f9fafb', padding: 12, borderRadius: 12, marginBottom: 12 },
  compCandidateName: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 8 },
  compRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  compColumn: { alignItems: 'center' },
  compLabel: { fontSize: 10, color: '#6b7280' },
  compValue: { fontSize: 16, fontWeight: 'bold', marginTop: 2 },
  noDataText: { fontSize: 14, color: '#6b7280', textAlign: 'center', paddingVertical: 20 },
  scenarioCard: { backgroundColor: '#f9fafb', padding: 16, borderRadius: 12, marginBottom: 12 },
  scenarioHeader: { marginBottom: 12 },
  scenarioTitle: { fontSize: 14, fontWeight: '600', color: '#7c3aed' },
  scenarioVs: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  scenarioCandidate: { flex: 1, alignItems: 'center' },
  scenarioCandName: { fontSize: 12, color: '#374151', textAlign: 'center' },
  scenarioPercent: { fontSize: 22, fontWeight: 'bold', marginTop: 4 },
  vsText: { fontSize: 14, fontWeight: 'bold', color: '#9ca3af', marginHorizontal: 12 }
});

export default AnalysisScreen;
