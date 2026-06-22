import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator, RefreshControl, Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FadeInUpView, ZoomInView } from '../../components/ui/FadeInUpView';
import { BlurView } from 'expo-blur';
import { Users, Calendar, Flame, Award, Trophy, UserPlus, Mail, MessageSquare, ChevronRight, LogOut, Scan } from 'lucide-react-native';

import { Colors } from '../../constants/colors';
import { analyticsApi } from '../../api/analytics.api';
import { useAuthStore } from '../../store/auth.store';
import { OverviewAnalytics } from '../../types/participant.types';
import { GlassCard } from '../../components/ui/GlassCard';
import { GradientText } from '../../components/ui/GradientText';
import { FloatingParticles } from '../../components/ui/FloatingParticles';

export default function DashboardScreen() {
  const navigation = useNavigation();
  const { user, logout } = useAuthStore();
  const [analytics, setAnalytics] = useState<OverviewAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await analyticsApi.getOverview();
      setAnalytics(res.data.data);
    } catch { /* silently fail */ }
    setLoading(false);
  };

  useEffect(() => { fetchAnalytics(); }, []);

  const statCards = analytics ? [
    { label: 'Participants', value: analytics.totalParticipants, icon: Users, color: Colors.primary },
    { label: 'Total Events', value: analytics.totalEvents, icon: Calendar, color: Colors.secondary },
    { label: 'Active Events', value: analytics.activeEvents, icon: Flame, color: Colors.success },
    { label: 'Certificates', value: analytics.totalCertificates, icon: Award, color: Colors.warning },
    { label: 'Winners', value: analytics.totalWinners, icon: Trophy, color: Colors.winner },
    { label: 'Registrations', value: analytics.totalRegistrations, icon: UserPlus, color: Colors.info },
  ] : [];

  const quickLinks = [
    { label: 'Manage Events', desc: 'Create, edit, delete events', icon: Calendar, tab: 'EventsTab', color: Colors.tertiary },
    { label: 'View Participants', desc: 'Browse all registrations', icon: Users, tab: 'ParticipantsTab', color: Colors.primary },
    { label: 'Scan Ticket', desc: 'Verify QR Code', icon: Scan, tab: 'ScannerTab', color: Colors.winner },
    { label: 'Analytics', desc: 'Charts and statistics', icon: Flame, tab: 'AnalyticsTab', color: Colors.secondary },
    { label: 'Email Logs', desc: 'View sent email history', icon: Mail, screen: 'EmailLogs', color: Colors.info },
    { label: 'Contact Messages', desc: 'View user enquiries', icon: MessageSquare, screen: 'ContactAdmin', color: Colors.success },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <FloatingParticles />

      {/* Admin Header */}
      <BlurView intensity={80} tint="dark" style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>SYSTEM ACCESS GRANTED</Text>
            <GradientText text={`Welcome, ${user?.username || 'Admin'}`} style={styles.username} />
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>● {user?.role?.toUpperCase() || 'ADMIN'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <LogOut size={16} color={Colors.tertiary} />
            <Text style={styles.logoutText}>Disconnect</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSub}>TAARUNYAM 2026 TERMINAL</Text>
      </BlurView>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchAnalytics} tintColor={Colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Grid */}
        <FadeInUpView>
          <Text style={styles.sectionTitle}>// SYSTEM OVERVIEW</Text>
          {loading && !analytics ? (
            <ActivityIndicator color={Colors.primary} size="large" style={{ marginTop: 30 }} />
          ) : (
            <View style={styles.statsGrid}>
              {statCards.map((card, idx) => (
                <ZoomInView key={card.label} delay={idx * 100} style={{ width: '48%' }}>
                  <GlassCard style={[styles.statCard, { borderTopColor: card.color }]} intensity={20}>
                    <card.icon size={28} color={card.color} style={{ marginBottom: 12 }} />
                    <Text style={[styles.statValue, { color: card.color, textShadowColor: card.color, textShadowRadius: 10 }]}>
                      {card.value?.toLocaleString() ?? '—'}
                    </Text>
                    <Text style={styles.statLabel}>{card.label}</Text>
                  </GlassCard>
                </ZoomInView>
              ))}
            </View>
          )}
        </FadeInUpView>

        {/* Quick Links */}
        <FadeInUpView delay={300}>
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>// COMMAND MODULES</Text>
          {quickLinks.map((action, idx) => (
            <FadeInUpView key={action.label} delay={400 + idx * 100}>
              <TouchableOpacity
                onPress={() => {
                  if ((action as any).tab) (navigation as any).navigate((action as any).tab as any);
                  else (navigation as any).navigate((action as any).screen as any);
                }}
                activeOpacity={0.7}
              >
                <GlassCard style={styles.actionCard} intensity={30}>
                  <View style={styles.actionLeft}>
                    <View style={[styles.actionIconBox, { backgroundColor: action.color + '15', borderColor: action.color + '40' }]}>
                      <action.icon size={20} color={action.color} />
                    </View>
                    <View>
                      <Text style={styles.actionLabel}>{action.label}</Text>
                      <Text style={styles.actionDesc}>{action.desc}</Text>
                    </View>
                  </View>
                  <ChevronRight size={20} color={Colors.textMuted} />
                </GlassCard>
              </TouchableOpacity>
            </FadeInUpView>
          ))}
        </FadeInUpView>

        {/* Footer */}
        <FadeInUpView delay={1000}>
          <GlassCard style={styles.footerBar} intensity={10}>
            <Text style={styles.footerText}>TAARUNYAM 2026 · SECURE TERMINAL</Text>
            <Text style={styles.footerSub}>Active Session: {user?.username}</Text>
          </GlassCard>
        </FadeInUpView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight! + 10,
    paddingHorizontal: 20, paddingBottom: 18,
    borderBottomWidth: 1, borderBottomColor: 'rgba(51,136,255,0.3)',
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  greeting: { fontSize: 10, color: Colors.primaryLight, fontFamily: 'Poppins-Bold', letterSpacing: 2 },
  username: { fontSize: 24, fontFamily: 'Poppins-Black', marginTop: 2, height: 32 },
  roleBadge: {
    alignSelf: 'flex-start', marginTop: 4,
    backgroundColor: 'rgba(51,136,255,0.15)', borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(51,136,255,0.4)',
  },
  roleText: { fontSize: 9, color: Colors.primaryLight, fontFamily: 'Poppins-Bold', letterSpacing: 2 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,77,148,0.1)', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: 'rgba(255,77,148,0.3)',
  },
  logoutText: { color: Colors.tertiary, fontFamily: 'Poppins-SemiBold', fontSize: 12 },
  headerSub: { fontSize: 10, color: Colors.textMuted, letterSpacing: 2, fontFamily: 'Poppins-SemiBold' },
  content: { padding: 16, paddingBottom: 50 },
  sectionTitle: {
    fontSize: 14, fontFamily: 'Poppins-Bold', color: Colors.textSecondary,
    marginBottom: 16, letterSpacing: 2,
  },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12, justifyContent: 'space-between' },
  statCard: {
    padding: 16, borderTopWidth: 3, alignItems: 'center', marginBottom: 6,
  },
  statValue: { fontSize: 26, fontFamily: 'Poppins-Black' },
  statLabel: { fontSize: 10, color: Colors.textMuted, marginTop: 4, textAlign: 'center', fontFamily: 'Poppins-SemiBold', textTransform: 'uppercase' },
  
  actionCard: {
    padding: 16, marginBottom: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  actionLeft: { flexDirection: 'row', alignItems: 'center' },
  actionIconBox: {
    width: 44, height: 44, borderRadius: 12, borderWidth: 1,
    justifyContent: 'center', alignItems: 'center', marginRight: 16,
  },
  actionLabel: { fontSize: 14, fontFamily: 'Poppins-Bold', color: Colors.textPrimary },
  actionDesc: { fontSize: 11, color: Colors.textMuted, marginTop: 2, fontFamily: 'Poppins-Regular' },
  
  footerBar: {
    marginTop: 24, padding: 16, alignItems: 'center',
  },
  footerText: { fontSize: 10, color: Colors.primaryLight, fontFamily: 'Poppins-Bold', letterSpacing: 2 },
  footerSub: { fontSize: 10, color: Colors.textMuted, marginTop: 6, fontFamily: 'Poppins-Medium' },
});
