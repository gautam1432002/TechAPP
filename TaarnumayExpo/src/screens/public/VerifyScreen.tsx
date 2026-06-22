import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  StatusBar, ActivityIndicator, ScrollView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { PublicStackParamList } from '../../navigation/PublicNavigator';
import { verificationApi } from '../../api/analytics.api';
import { VerificationResult } from '../../types/participant.types';

type Route = RouteProp<PublicStackParamList, 'Verify'>;

export default function VerifyScreen() {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const [token, setToken] = useState(route.params?.token || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (route.params?.token) handleVerify();
  }, []);

  const handleVerify = async () => {
    const q = token.trim();
    if (!q) return;
    setLoading(true);
    setResult(null);
    setError('');
    try {
      const res = await verificationApi.verifyCertificate(q);
      setResult(res.data.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid or expired token.');
    } finally {
      setLoading(false);
    }
  };

  const typeLabel = (type: string) => {
    if (type === 'winner') return { text: '🏆 Winner Certificate', color: Colors.warning };
    if (type === 'entry-pass') return { text: '🎟️ Entry Pass', color: Colors.info };
    return { text: '🎓 Participation Certificate', color: Colors.success };
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verify</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Certificate Verification</Text>
        <Text style={styles.subtitle}>Enter a Certificate UUID or Registration ID</Text>

        <TextInput
          style={styles.input}
          value={token}
          onChangeText={setToken}
          placeholder="UUID or TAR-2026-001"
          placeholderTextColor={Colors.textMuted}
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.verifyBtn} onPress={handleVerify} disabled={loading}>
          {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.verifyBtnText}>Verify</Text>}
        </TouchableOpacity>

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorIcon}>❌</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {result && (
          <View style={styles.resultCard}>
            <Text style={styles.validIcon}>✅</Text>
            <Text style={styles.validLabel}>VALID</Text>

            {/* Type badge */}
            <View style={[styles.typeBadge, { backgroundColor: typeLabel(result.type).color + '20' }]}>
              <Text style={[styles.typeText, { color: typeLabel(result.type).color }]}>
                {typeLabel(result.type).text}
              </Text>
            </View>

            <View style={styles.divider} />

            <ResultRow label="Name" value={result.participant.name} />
            <ResultRow label="College" value={result.participant.college} />
            <ResultRow label="Event" value={result.event.title} />
            <ResultRow label="Date" value={result.event.date} />
            <ResultRow label="Issued At" value={new Date(result.issuedAt).toLocaleDateString()} />
            <ResultRow label="Certificate ID" value={result.certificateId} small />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function ResultRow({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <View style={rrStyles.row}>
      <Text style={rrStyles.label}>{label}</Text>
      <Text style={[rrStyles.value, small && rrStyles.small]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const rrStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  label: { fontSize: 13, color: Colors.textMuted, flex: 1 },
  value: { fontSize: 14, color: Colors.textPrimary, fontWeight: '700', flex: 2, textAlign: 'right' },
  small: { fontSize: 11, fontFamily: 'monospace' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    backgroundColor: Colors.bgCard, paddingTop: 50, paddingHorizontal: 16, paddingBottom: 14,
    flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  back: { color: Colors.primary, fontSize: 18, fontWeight: '600', marginRight: 12 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  content: { padding: 20, paddingBottom: 60 },
  title: { fontSize: 24, fontWeight: '900', color: Colors.textPrimary, marginBottom: 6 },
  subtitle: { fontSize: 14, color: Colors.textMuted, marginBottom: 20 },
  input: {
    backgroundColor: Colors.bgCard, borderRadius: 12, padding: 14,
    color: Colors.textPrimary, fontSize: 15, borderWidth: 1, borderColor: Colors.border, marginBottom: 12,
  },
  verifyBtn: { backgroundColor: Colors.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 24 },
  verifyBtnText: { color: Colors.white, fontWeight: '800', fontSize: 16 },
  errorCard: { alignItems: 'center', backgroundColor: Colors.errorMuted, borderRadius: 12, padding: 24 },
  errorIcon: { fontSize: 40, marginBottom: 8 },
  errorText: { color: Colors.error, fontWeight: '600', textAlign: 'center' },
  resultCard: { backgroundColor: Colors.bgCard, borderRadius: 16, padding: 24, borderWidth: 1, borderColor: Colors.success + '50' },
  validIcon: { fontSize: 56, textAlign: 'center' },
  validLabel: { fontSize: 22, fontWeight: '900', color: Colors.success, textAlign: 'center', letterSpacing: 4, marginBottom: 12 },
  typeBadge: { alignSelf: 'center', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8, marginBottom: 16 },
  typeText: { fontWeight: '800', fontSize: 15 },
  divider: { height: 1, backgroundColor: Colors.border, marginBottom: 12 },
});
