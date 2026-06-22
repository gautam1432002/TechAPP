import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar,
  ActivityIndicator, RefreshControl, Dimensions,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { analyticsApi } from '../../api/analytics.api';
import { OverviewAnalytics, EventAnalytics, RegistrationTimeline } from '../../types/participant.types';
import { BarChart } from 'react-native-chart-kit';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function AnalyticsScreen() {
  const [overview, setOverview] = useState<OverviewAnalytics | null>(null);
  const [eventBreakdown, setEventBreakdown] = useState<EventAnalytics[]>([]);
  const [timeline, setTimeline] = useState<RegistrationTimeline[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [o, e, t] = await Promise.all([
        analyticsApi.getOverview(),
        analyticsApi.getEventsBreakdown(),
        analyticsApi.getRegistrationsTimeline(),
      ]);
      setOverview(o.data.data);
      setEventBreakdown(e.data.data || []);
      setTimeline(t.data.data || []);
    } catch { /* silently fail */ }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const barData = eventBreakdown.length > 0 ? {
    labels: eventBreakdown.slice(0, 5).map((e) => e.eventTitle.slice(0, 8) + '…'),
    datasets: [{ data: eventBreakdown.slice(0, 5).map((e) => e.participantCount) }],
  } : null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchAll} tintColor={Colors.primary} />}>

        {loading && !overview ? (
          <ActivityIndicator color={Colors.primary} size="large" style={{ marginTop: 60 }} />
        ) : (
          <>
            {/* Overview Cards */}
            {overview && (
              <>
                <Text style={styles.sectionTitle}>📊 Overview</Text>
                <View style={styles.grid}>
                  {[
                    { l: 'Participants', v: overview.totalParticipants, c: Colors.primary },
                    { l: 'Registrations', v: overview.totalRegistrations, c: Colors.secondary },
                    { l: 'Events', v: overview.totalEvents, c: Colors.info },
                    { l: 'Active Events', v: overview.activeEvents, c: Colors.success },
                    { l: 'Certificates', v: overview.totalCertificates, c: Colors.warning },
                    { l: 'Winners', v: overview.totalWinners, c: Colors.error },
                  ].map((s) => (
                    <View key={s.l} style={[styles.statCard, { borderTopColor: s.c }]}>
                      <Text style={[styles.statValue, { color: s.c }]}>{s.v?.toLocaleString()}</Text>
                      <Text style={styles.statLabel}>{s.l}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* Bar Chart */}
            {barData && (
              <>
                <Text style={styles.sectionTitle}>📈 Participants per Event</Text>
                <BarChart
                  data={barData}
                  width={SCREEN_WIDTH - 32}
                  height={200}
                  chartConfig={{
                    backgroundColor: Colors.bgCard,
                    backgroundGradientFrom: Colors.bgCard,
                    backgroundGradientTo: Colors.bgCard,
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(99,102,241,${opacity})`,
                    labelColor: () => Colors.textSecondary,
                    style: { borderRadius: 12 },
                  }}
                  style={styles.chart}
                  fromZero
                  yAxisLabel=""
                  yAxisSuffix=""
                />
              </>
            )}

            {/* Event Breakdown Table */}
            {eventBreakdown.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>📋 Event Breakdown</Text>
                {eventBreakdown.map((e) => (
                  <View key={e.eventId} style={styles.tableRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.tableName} numberOfLines={1}>{e.eventTitle}</Text>
                      <Text style={styles.tableMeta}>Fill rate: {e.fillRate}%</Text>
                    </View>
                    <View style={styles.tableStats}>
                      <Text style={[styles.tableNum, { color: Colors.primary }]}>{e.participantCount} 👥</Text>
                      <Text style={[styles.tableNum, { color: Colors.warning }]}>{e.winnerCount} 🏆</Text>
                    </View>
                  </View>
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    backgroundColor: Colors.bgCard, paddingTop: 50, paddingHorizontal: 16, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary, marginTop: 16, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: {
    width: '47%', backgroundColor: Colors.bgCard, borderRadius: 12, padding: 16,
    borderTopWidth: 3, alignItems: 'center',
  },
  statValue: { fontSize: 24, fontWeight: '900' },
  statLabel: { fontSize: 11, color: Colors.textMuted, marginTop: 4, textAlign: 'center' },
  chart: { borderRadius: 12, marginBottom: 8 },
  tableRow: {
    backgroundColor: Colors.bgCard, borderRadius: 10, padding: 14, marginBottom: 8,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  tableName: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  tableMeta: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  tableStats: { alignItems: 'flex-end' },
  tableNum: { fontSize: 13, fontWeight: '700' },
});
