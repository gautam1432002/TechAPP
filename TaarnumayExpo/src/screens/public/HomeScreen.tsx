import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Dimensions, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { FadeInUpView, ZoomInView } from '../../components/ui/FadeInUpView';
import { Calendar, PenTool, Search, CheckCircle, Mail, Lock, Settings } from 'lucide-react-native';

import { Colors } from '../../constants/colors';
import { PublicStackParamList } from '../../navigation/PublicNavigator';
import { useAuthStore } from '../../store/auth.store';
import { GlassCard } from '../../components/ui/GlassCard';
import { GradientText } from '../../components/ui/GradientText';
import { GradientButton } from '../../components/ui/GradientButton';
import { FloatingParticles } from '../../components/ui/FloatingParticles';

const { width } = Dimensions.get('window');
const EVENT_DATE = new Date('2026-06-25T09:00:00');

type HomeNav = StackNavigationProp<PublicStackParamList, 'Home'>;

const quickActions = [
  { label: 'View Events', icon: Calendar, screen: 'Events', color: Colors.primary, desc: 'Browse all upcoming events' },
  { label: 'Register Now', icon: PenTool, screen: 'Register', color: Colors.tertiary, desc: 'Sign up for an event' },
  { label: 'Lookup Registration', icon: Search, screen: 'Lookup', color: Colors.success, desc: 'Find your registration' },
  { label: 'Verify Certificate', icon: CheckCircle, screen: 'Verify', color: Colors.winner, desc: 'Validate your certificate' },
  { label: 'Contact Us', icon: Mail, screen: 'Contact', color: Colors.secondary, desc: 'Get in touch with us' },
];

function getCountdown() {
  const now = new Date();
  const diff = EVENT_DATE.getTime() - now.getTime();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <View style={cd.box}>
      <Text style={cd.value}>{String(value).padStart(2, '0')}</Text>
      <Text style={cd.label}>{label}</Text>
    </View>
  );
}

const cd = StyleSheet.create({
  box: {
    alignItems: 'center', minWidth: 60,
    backgroundColor: 'rgba(51,136,255,0.1)',
    borderWidth: 1, borderColor: 'rgba(51,136,255,0.3)',
    borderRadius: 8, paddingVertical: 10, paddingHorizontal: 6,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5, shadowRadius: 8, elevation: 4,
  },
  value: { fontSize: 26, fontFamily: 'Poppins-Black', color: Colors.white, fontVariant: ['tabular-nums'] },
  label: { fontSize: 9, color: Colors.primaryLight, marginTop: 2, letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'Poppins-SemiBold' },
});

export default function HomeScreen() {
  const navigation = useNavigation<HomeNav>();
  const { isAuthenticated } = useAuthStore();
  const [countdown, setCountdown] = useState(getCountdown());

  useEffect(() => {
    const timer = setInterval(() => setCountdown(getCountdown()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <FloatingParticles />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ─── Hero Section ─── */}
        <FadeInUpView duration={800} style={styles.hero}>
          <View style={styles.ring1} />
          <View style={styles.ring2} />


          <GradientText
            text="TAARUNYAM"
            style={styles.heroTitle}
            colors={[Colors.primaryLight, Colors.secondary]}
          />
          <Text style={styles.heroSubtitle}>National Technical Fest</Text>
          <Text style={styles.heroTagline}>LEARN  ·  BUILD  ·  INNOVATE</Text>

          <View style={styles.divider} />

          {/* Countdown */}
          <Text style={styles.countdownLabel}>⏱ EVENT STARTS IN</Text>
          <View style={styles.countdownRow}>
            <CountdownUnit value={countdown.days} label="Days" />
            <Text style={styles.colon}>:</Text>
            <CountdownUnit value={countdown.hours} label="Hrs" />
            <Text style={styles.colon}>:</Text>
            <CountdownUnit value={countdown.minutes} label="Min" />
            <Text style={styles.colon}>:</Text>
            <CountdownUnit value={countdown.seconds} label="Sec" />
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            {[
              { val: '10+', label: 'Events' },
              { val: '500+', label: 'Students' },
              { val: '₹50K', label: 'Prizes' },
              { val: '3', label: 'Tracks' },
            ].map((s, idx) => (
              <ZoomInView delay={300 + idx * 100} key={s.label}>
                <GlassCard style={styles.statChip} intensity={20}>
                  <Text style={styles.statVal}>{s.val}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </GlassCard>
              </ZoomInView>
            ))}
          </View>
        </FadeInUpView>

        {/* ─── Quick Actions ─── */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionLine} />
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.sectionLine} />
        </View>

        <View style={styles.actionsGrid}>
          {quickActions.map((action, i) => (
            <FadeInUpView key={action.screen} delay={500 + i * 100} style={{ width: (width - 42) / 2 }}>
              <TouchableOpacity onPress={() => navigation.navigate(action.screen as any)} activeOpacity={0.7}>
                <GlassCard style={[styles.actionCard, { borderColor: action.color + '40' }]} intensity={30}>
                  <View style={[styles.actionIcon, { backgroundColor: action.color + '15' }]}>
                    <action.icon size={24} color={action.color} />
                  </View>
                  <Text style={[styles.actionLabel, { color: action.color }]}>{action.label}</Text>
                  <Text style={styles.actionDesc}>{action.desc}</Text>
                </GlassCard>
              </TouchableOpacity>
            </FadeInUpView>
          ))}
        </View>

        {/* ─── Admin Button ─── */}
        <FadeInUpView delay={1000} style={styles.adminContainer}>
          {!isAuthenticated ? (
            <GradientButton
              title="Admin Login"
              icon={<Lock size={18} color="#fff" />}
              onPress={() => navigation.navigate('Auth' as any)}
              colors={[Colors.secondary, Colors.primary]}
            />
          ) : (
            <GradientButton
              title="Go to Admin Panel"
              icon={<Settings size={18} color="#fff" />}
              onPress={() => navigation.navigate('AdminApp' as any)}
              colors={[Colors.success, '#059669']}
            />
          )}
        </FadeInUpView>

        <Text style={styles.footer}>© 2026 TAARUNYAM · All rights reserved</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingBottom: 40, paddingTop: Platform.OS === 'ios' ? 40 : StatusBar.currentHeight },

  // Hero
  hero: {
    paddingTop: 30, paddingBottom: 28, paddingHorizontal: 24,
    alignItems: 'center', overflow: 'hidden',
  },
  ring1: {
    position: 'absolute', width: 300, height: 300, borderRadius: 150,
    borderWidth: 1, borderColor: 'rgba(51,136,255,0.1)',
    top: -100, right: -100,
  },
  ring2: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    borderWidth: 1, borderColor: 'rgba(136,85,255,0.1)',
    bottom: 20, left: -60,
  },
  badge: {
    backgroundColor: 'rgba(51,136,255,0.15)', borderWidth: 1,
    borderColor: 'rgba(51,136,255,0.4)', borderRadius: 50,
    paddingHorizontal: 16, paddingVertical: 6, marginBottom: 18,
  },
  badgeText: { fontSize: 11, color: Colors.primaryLight, fontFamily: 'Poppins-Bold', letterSpacing: 1 },
  heroTitle: {
    fontSize: 46, fontFamily: 'Poppins-Black',
    letterSpacing: 6, textAlign: 'center', height: 75,
  },
  heroSubtitle: {
    fontSize: 14, color: Colors.textSecondary, textAlign: 'center',
    letterSpacing: 2, fontFamily: 'Poppins-Medium',
  },
  heroTagline: {
    fontSize: 10, color: Colors.tertiary, textAlign: 'center',
    marginTop: 8, letterSpacing: 4, fontFamily: 'Poppins-Bold',
  },
  divider: {
    width: 60, height: 2, borderRadius: 1,
    backgroundColor: 'rgba(51,136,255,0.4)', marginVertical: 20,
    shadowColor: Colors.primary, shadowOpacity: 1, shadowRadius: 10, elevation: 5,
  },
  countdownLabel: {
    fontSize: 11, color: Colors.textSecondary, letterSpacing: 2,
    marginBottom: 12, fontFamily: 'Poppins-Bold',
  },
  countdownRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  colon: { fontSize: 24, color: Colors.primary, fontFamily: 'Poppins-Black', marginBottom: 14 },
  statsRow: {
    flexDirection: 'row', gap: 10, marginTop: 24,
    flexWrap: 'wrap', justifyContent: 'center',
  },
  statChip: {
    alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10,
  },
  statVal: { fontSize: 18, fontFamily: 'Poppins-Black', color: Colors.white },
  statLabel: { fontSize: 9, color: Colors.textMuted, marginTop: 2, letterSpacing: 0.5, fontFamily: 'Poppins-Medium' },

  // Actions
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginTop: 10, marginBottom: 16 },
  sectionLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  sectionTitle: { fontSize: 12, fontFamily: 'Poppins-Bold', color: Colors.textSecondary, marginHorizontal: 12, letterSpacing: 1, textTransform: 'uppercase' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10 },
  actionCard: {
    padding: 16, alignItems: 'center', minHeight: 140,
  },
  actionIcon: { width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  actionLabel: { fontSize: 12, fontFamily: 'Poppins-Bold', textAlign: 'center', marginBottom: 4 },
  actionDesc: { fontSize: 10, color: Colors.textMuted, textAlign: 'center', lineHeight: 14, fontFamily: 'Poppins-Regular' },

  // Admin
  adminContainer: {
    marginHorizontal: 20, marginTop: 24,
  },

  footer: { textAlign: 'center', color: Colors.textMuted, marginTop: 28, fontSize: 10, letterSpacing: 1, fontFamily: 'Poppins-Medium' },
});
