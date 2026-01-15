import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Dimensions, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { VictoryChart, VictoryBar, VictoryTheme, VictoryAxis, VictoryLabel } from 'victory-native';
import { fetchCandidates } from '../utils/api';
import { Candidate } from '../types/election';

const { width } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await fetchCandidates();
    setCandidates(data);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'Izquierda': return { bg: '#fee2e2', text: '#991b1b' };
      case 'Centro': return { bg: '#dbeafe', text: '#1e40af' };
      case 'Derecha': return { bg: '#dcfce7', text: '#166534' };
      default: return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={styles.loadingText}>Cargando datos electorales...</Text>
      </View>
    );
  }

  const topCandidates = candidates.slice(0, 6);
  const chartData = topCandidates.map((c) => ({
    x: c.Candidato.split(' ')[0],
    y: c.Intención_Voto_Porcentaje,
    label: c.Intención_Voto_Porcentaje.toFixed(1) + '%'
  }));

  const totalIntention = candidates.reduce((sum, c) => sum + c.Intención_Voto_Porcentaje, 0);
  const undecided = Math.max(0, 100 - totalIntention);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#7c3aed']} />}
    >
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>Elecciones Colombia 2026</Text>
        <Text style={styles.heroSubtitle}>Análisis Electoral en Tiempo Real</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBadge}>
            <Text style={styles.statValue}>{candidates.length}</Text>
            <Text style={styles.statLabel}>Candidatos</Text>
          </View>
          <View style={styles.statBadge}>
            <Text style={styles.statValue}>{undecided.toFixed(1)}%</Text>
            <Text style={styles.statLabel}>Indecisos</Text>
          </View>
          <View style={styles.statBadge}>
            <Text style={styles.statValue}>{topCandidates[0]?.Intención_Voto_Porcentaje || 0}%</Text>
            <Text style={styles.statLabel}>Líder</Text>
          </View>
        </View>
      </View>

      {/* Chart Section */}
      <View style={styles.chartCard}>
        <Text style={styles.sectionTitle}>Top 6 Candidatos</Text>
        <VictoryChart
          theme={VictoryTheme.material}
          width={width - 48}
          height={220}
          domainPadding={{ x: 25 }}
        >
          <VictoryAxis
            style={{
              tickLabels: { fontSize: 9, angle: -45, textAnchor: 'end' }
            }}
          />
          <VictoryAxis
            dependentAxis
            tickFormat={(t) => t + '%'}
            style={{
              tickLabels: { fontSize: 10 }
            }}
          />
          <VictoryBar
            data={chartData}
            style={{
              data: { fill: '#7c3aed' }
            }}
            labels={({ datum }) => datum.label}
            labelComponent={<VictoryLabel dy={-8} style={{ fontSize: 9, fill: '#374151' }} />}
          />
        </VictoryChart>
      </View>

      {/* Candidates List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ranking de Candidatos</Text>
        {candidates.map((candidate, index) => {
          const trendColors = getTrendColor(candidate.Tendencia_Política);
          const isExpanded = selectedCandidate?.Candidato === candidate.Candidato;
          const balance = candidate.Favorabilidad - candidate.Desfavorabilidad;
          
          return (
            <TouchableOpacity
              key={index}
              style={styles.candidateCard}
              onPress={() => setSelectedCandidate(isExpanded ? null : candidate)}
              activeOpacity={0.7}
            >
              <View style={styles.candidateHeader}>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>{index + 1}</Text>
                </View>
                <View style={styles.candidateInfo}>
                  <Text style={styles.candidateName}>{candidate.Candidato}</Text>
                  <Text style={styles.candidateParty}>{candidate.Partido_Movimiento}</Text>
                  <Text style={styles.candidateCargo}>{candidate.Cargo_Actual}</Text>
                </View>
                <View style={styles.percentageContainer}>
                  <Text style={styles.percentageText}>{candidate.Intención_Voto_Porcentaje.toFixed(1)}%</Text>
                  <View style={[styles.trendBadge, { backgroundColor: trendColors.bg }]}>
                    <Text style={[styles.trendText, { color: trendColors.text }]}>{candidate.Tendencia_Política}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Ionicons name="heart" size={14} color="#22c55e" />
                  <Text style={styles.statItemLabel}>Favor.</Text>
                  <Text style={[styles.statItemValue, { color: '#22c55e' }]}>{candidate.Favorabilidad}%</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="heart-dislike" size={14} color="#ef4444" />
                  <Text style={styles.statItemLabel}>Desfav.</Text>
                  <Text style={[styles.statItemValue, { color: '#ef4444' }]}>{candidate.Desfavorabilidad}%</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="scale" size={14} color={balance >= 0 ? '#22c55e' : '#ef4444'} />
                  <Text style={styles.statItemLabel}>Balance</Text>
                  <Text style={[styles.statItemValue, { color: balance >= 0 ? '#22c55e' : '#ef4444' }]}>
                    {balance >= 0 ? '+' : ''}{balance}%
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="calendar" size={14} color="#6b7280" />
                  <Text style={styles.statItemLabel}>Edad</Text>
                  <Text style={styles.statItemValue}>{candidate.Edad} años</Text>
                </View>
              </View>

              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: Math.min(candidate.Intención_Voto_Porcentaje * 6, 100) + '%' }]} />
              </View>

              {isExpanded && candidate.Descripción && (
                <View style={styles.descriptionSection}>
                  <Text style={styles.descriptionText}>{candidate.Descripción}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#6b7280' },
  heroSection: { backgroundColor: '#7c3aed', padding: 24, paddingTop: 60 },
  heroTitle: { fontSize: 28, fontWeight: 'bold', color: '#ffffff', marginBottom: 8 },
  heroSubtitle: { fontSize: 16, color: '#c4b5fd', marginBottom: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statBadge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 16, flex: 1, marginHorizontal: 4, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#ffffff' },
  statLabel: { fontSize: 12, color: '#c4b5fd', marginTop: 4 },
  chartCard: { backgroundColor: '#ffffff', margin: 16, padding: 16, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  section: { padding: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 16 },
  candidateCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  candidateHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  rankBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#7c3aed', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  rankText: { fontSize: 14, fontWeight: 'bold', color: '#ffffff' },
  candidateInfo: { flex: 1 },
  candidateName: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  candidateParty: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  candidateCargo: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  percentageContainer: { alignItems: 'flex-end' },
  percentageText: { fontSize: 22, fontWeight: 'bold', color: '#7c3aed' },
  trendBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginTop: 4 },
  trendText: { fontSize: 11, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  statItem: { alignItems: 'center', flex: 1 },
  statItemLabel: { fontSize: 10, color: '#6b7280', marginTop: 2 },
  statItemValue: { fontSize: 13, fontWeight: '600', color: '#111827' },
  progressBar: { height: 6, backgroundColor: '#e5e7eb', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#7c3aed', borderRadius: 3 },
  descriptionSection: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  descriptionText: { fontSize: 14, color: '#4b5563', lineHeight: 20 }
});

export default HomeScreen;
