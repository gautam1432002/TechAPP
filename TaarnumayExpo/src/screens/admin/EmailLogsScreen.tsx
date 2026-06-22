import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { emailApi } from '../../api/analytics.api';

export default function EmailLogsScreen() {
  const navigation = useNavigation();
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [logsRes, statsRes] = await Promise.all([emailApi.getLogs(), emailApi.getStats()]);
      const logsData = logsRes.data.data;
      const list = Array.isArray(logsData) ? logsData : (logsData && Array.isArray((logsData as any).results) ? (logsData as any).results : []);
      setLogs(list);
      setStats(statsRes.data.data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const renderLog = ({ item }: { item: any }) => (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Text style={[styles.status, { color: item.status === 'sent' ? Colors.success : Colors.error }]}>
          {item.status === 'sent' ? '✅' : '❌'} {item.status?.toUpperCase()}
        </Text>
        <Text style={styles.email} numberOfLines={1}>{item.recipient_email || item.email || '—'}</Text>
        <Text style={styles.date}>{item.sent_at ? new Date(item.sent_at).toLocaleDateString() : '—'}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Email Logs</Text>
      </View>
      {stats && (
        <View style={styles.statsRow}>
          <Text style={styles.stat}>📧 Sent: <Text style={{ color: Colors.success }}>{stats.sent ?? 0}</Text></Text>
          <Text style={styles.stat}>❌ Failed: <Text style={{ color: Colors.error }}>{stats.failed ?? 0}</Text></Text>
        </View>
      )}
      <FlatList
        data={logs}
        renderItem={renderLog}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} tintColor={Colors.primary} />}
        ListEmptyComponent={<Text style={styles.empty}>{loading ? 'Loading...' : 'No email logs.'}</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    backgroundColor: Colors.bgCard, paddingTop: 50, paddingHorizontal: 16, paddingBottom: 14,
    flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  back: { color: Colors.primary, fontSize: 18, fontWeight: '600', marginRight: 12 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  statsRow: {
    backgroundColor: Colors.bgCard, padding: 14, flexDirection: 'row', gap: 24,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  stat: { fontSize: 14, color: Colors.textSecondary, fontWeight: '600' },
  list: { padding: 12, paddingBottom: 40 },
  row: { backgroundColor: Colors.bgCard, borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: Colors.border },
  rowLeft: {},
  status: { fontSize: 12, fontWeight: '800', marginBottom: 4 },
  email: { fontSize: 14, color: Colors.textPrimary, fontWeight: '600' },
  date: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  empty: { textAlign: 'center', color: Colors.textMuted, marginTop: 60, fontSize: 16 },
});
