import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { AdminStackParamList } from '../../navigation/AdminNavigator';
import { participantsApi } from '../../api/participants.api';
import { useParticipantsStore } from '../../store/participants.store';
import { Participant } from '../../types/participant.types';
import { FadeInUpView } from '../../components/ui/FadeInUpView';
import { GlassCard } from '../../components/ui/GlassCard';
import QRCode from 'react-native-qrcode-svg';
import { Trash2, Award, CheckCircle, ShieldAlert } from 'lucide-react-native';

type Route = RouteProp<AdminStackParamList, 'ParticipantDetail'>;

export default function ParticipantDetailScreen() {
  const navigation = useNavigation();
  const { registrationId } = useRoute<Route>().params;
  const { toggleWinner, toggleAttendance } = useParticipantsStore();
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await participantsApi.getAdminParticipant(registrationId);
      setParticipant(res.data.data);
    } catch { Alert.alert('Error', 'Failed to load participant.'); }
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const handleToggleWinner = async () => {
    if (!participant) return;
    setActionLoading(true);
    await toggleWinner(registrationId, '1st Place');
    await fetch();
    setActionLoading(false);
  };

  const handleToggleAttendance = async () => {
    if (!participant) return;
    setActionLoading(true);
    await toggleAttendance(registrationId);
    await fetch();
    setActionLoading(false);
  };

  const handleDelete = () => {
    Alert.alert('Erase Identity', 'This will permamently delete the registration record. Confirm?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Erase', style: 'destructive', onPress: async () => {
          try {
            await participantsApi.deleteParticipant(registrationId);
            navigation.goBack();
          } catch { Alert.alert('Error', 'Failed to delete.'); }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  if (!participant) return null;

  const rows = [
    { label: 'Email', value: participant.email },
    { label: 'Mobile', value: participant.mobile },
    { label: 'College', value: participant.college },
    { label: 'Course / Dept', value: participant.course },
    { label: 'Year', value: participant.year },
    { label: 'Events', value: participant.events.join(', ') },
    { label: 'Registered At', value: new Date(participant.registeredAt).toLocaleDateString() },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹ BACK</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>DOSSIER</Text>
        <TouchableOpacity onPress={handleDelete}>
          <Trash2 size={20} color={Colors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <FadeInUpView>
          <GlassCard intensity={20} style={styles.ticketCard}>
            <View style={styles.ticketHeader}>
              <Text style={styles.ticketTitle}>VIRTUAL TICKET</Text>
              <Text style={styles.ticketEvent}>TAARUNYAM 2026</Text>
            </View>
            
            <View style={styles.qrContainer}>
              <View style={styles.qrBorder}>
                <QRCode
                  value={participant.id}
                  size={160}
                  color={Colors.primary}
                  backgroundColor="transparent"
                />
              </View>
            </View>
            
            <View style={styles.ticketBody}>
              <Text style={styles.name}>{participant.name}</Text>
              <Text style={styles.regId}>{participant.id}</Text>
              
              <View style={styles.badges}>
                {participant.isWinner && (
                  <View style={[styles.badge, { backgroundColor: Colors.warning + '20', borderColor: Colors.warning }]}>
                    <Text style={[styles.badgeText, { color: Colors.warning }]}>🏆 WINNER</Text>
                  </View>
                )}
                {participant.certificateIssued && (
                  <View style={[styles.badge, { backgroundColor: Colors.success + '20', borderColor: Colors.success }]}>
                    <Text style={[styles.badgeText, { color: Colors.success }]}>📄 ISSUED</Text>
                  </View>
                )}
              </View>
            </View>
          </GlassCard>
        </FadeInUpView>

        <FadeInUpView delay={100}>
          <Text style={styles.sectionTitle}>// IDENTITY MATRIX</Text>
          <GlassCard style={styles.infoCard} intensity={15}>
            {rows.map((r, i) => (
              <View key={r.label} style={[styles.infoRow, i === rows.length - 1 && { borderBottomWidth: 0 }]}>
                <Text style={styles.infoLabel}>{r.label}</Text>
                <Text style={styles.infoValue}>{r.value || '—'}</Text>
              </View>
            ))}
          </GlassCard>
        </FadeInUpView>

        <FadeInUpView delay={200}>
          <Text style={styles.sectionTitle}>// OVERRIDE CONTROLS</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: Colors.warning + '15', borderColor: Colors.warning + '50' }]}
              onPress={handleToggleWinner}
              disabled={actionLoading}>
              <Award size={24} color={Colors.warning} style={styles.actionIcon} />
              <Text style={[styles.actionLabel, { color: Colors.warning }]}>
                {participant.isWinner ? 'Revoke Status' : 'Mark Winner'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: Colors.info + '15', borderColor: Colors.info + '50' }]}
              onPress={handleToggleAttendance}
              disabled={actionLoading}>
              <CheckCircle size={24} color={Colors.info} style={styles.actionIcon} />
              <Text style={[styles.actionLabel, { color: Colors.info }]}>Toggle Attendance</Text>
            </TouchableOpacity>
          </View>
        </FadeInUpView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg },
  header: {
    backgroundColor: Colors.bgCard, paddingTop: 50, paddingHorizontal: 16, paddingBottom: 14,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  back: { color: Colors.primary, fontSize: 12, fontFamily: 'Poppins-Black', letterSpacing: 2 },
  headerTitle: { fontSize: 18, fontFamily: 'Poppins-Black', color: Colors.textPrimary, letterSpacing: 4 },
  content: { padding: 16, paddingBottom: 40 },
  
  ticketCard: {
    borderRadius: 20, padding: 0, marginBottom: 24,
    borderWidth: 1, borderColor: 'rgba(51,136,255,0.4)',
    overflow: 'hidden',
  },
  ticketHeader: {
    backgroundColor: 'rgba(51,136,255,0.1)',
    paddingVertical: 12, alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: 'rgba(51,136,255,0.2)',
  },
  ticketTitle: { fontSize: 16, fontFamily: 'Poppins-Black', color: Colors.white, letterSpacing: 4 },
  ticketEvent: { fontSize: 10, fontFamily: 'Poppins-Bold', color: Colors.primaryLight, letterSpacing: 2, marginTop: 2 },
  
  qrContainer: {
    alignItems: 'center', paddingVertical: 20, backgroundColor: 'rgba(255,255,255,0.02)',
  },
  qrBorder: {
    padding: 12, backgroundColor: Colors.white, borderRadius: 16,
    borderWidth: 4, borderColor: 'rgba(51,136,255,0.5)',
    shadowColor: Colors.primary, shadowOpacity: 0.5, shadowRadius: 20,
  },
  
  ticketBody: {
    padding: 20, alignItems: 'center',
    borderTopWidth: 1, borderTopColor: 'rgba(51,136,255,0.2)',
  },
  name: { fontSize: 24, fontFamily: 'Poppins-Black', color: Colors.textPrimary, marginBottom: 4, textAlign: 'center' },
  regId: { fontSize: 12, color: Colors.primary, fontFamily: 'Poppins-Bold', letterSpacing: 2, marginBottom: 12 },
  badges: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  badgeText: { fontSize: 9, fontFamily: 'Poppins-Black', letterSpacing: 1 },

  sectionTitle: { fontSize: 12, fontFamily: 'Poppins-Black', color: Colors.textSecondary, marginBottom: 12, letterSpacing: 2 },
  infoCard: { borderRadius: 14, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: Colors.border },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  infoLabel: { fontSize: 10, color: Colors.textMuted, flex: 1, fontFamily: 'Poppins-Bold', textTransform: 'uppercase', letterSpacing: 1 },
  infoValue: { fontSize: 12, color: Colors.textPrimary, fontFamily: 'Poppins-Medium', flex: 2, textAlign: 'right' },
  
  actionsGrid: { flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1, borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1 },
  actionIcon: { marginBottom: 8 },
  actionLabel: { fontSize: 10, fontFamily: 'Poppins-Bold', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1 },
});
