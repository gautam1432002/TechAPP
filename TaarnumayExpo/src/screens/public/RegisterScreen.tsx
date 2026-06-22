import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, StatusBar, ActivityIndicator, Alert, Share, Platform, Animated, KeyboardAvoidingView
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { FadeInUpView } from '../../components/ui/FadeInUpView';
import { BlurView } from 'expo-blur';
import { Calendar, MapPin, CheckCircle, Share2, ArrowLeft, Download } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';

import { Colors } from '../../constants/colors';
import { PublicStackParamList } from '../../navigation/PublicNavigator';
import { participantsApi } from '../../api/participants.api';
import { useEventsStore } from '../../store/events.store';
import { RegisterPayload } from '../../types/participant.types';
import { Event } from '../../types/event.types';
import { GlassCard } from '../../components/ui/GlassCard';
import { GradientButton } from '../../components/ui/GradientButton';
import { FloatingParticles } from '../../components/ui/FloatingParticles';
import { GradientText } from '../../components/ui/GradientText';

type Route = RouteProp<PublicStackParamList, 'Register'>;
const YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year'] as const;
type Year = typeof YEAR_OPTIONS[number];

export default function RegisterScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<PublicStackParamList, 'Register'>>();
  const { publicEvents } = useEventsStore();

  const [step, setStep] = useState(1);
  const [selectedEvents, setSelectedEvents] = useState<string[]>(
    route.params?.preselectedEvent ? [route.params.preselectedEvent] : []
  );
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [college, setCollege] = useState('');
  const [course, setCourse] = useState('');
  const [year, setYear] = useState<Year>('1st Year');

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [regId, setRegId] = useState('');
  const [regName, setRegName] = useState('');
  const [regEvents, setRegEvents] = useState<string[]>([]);

  const toggleEvent = (slug: string) => {
    setSelectedEvents((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  };

  const handleNextStep1 = () => {
    if (route.params?.preselectedEvent && selectedEvents.length === 1 && selectedEvents[0] === route.params.preselectedEvent) {
      // Direct submit if came directly from an event
      handleSubmit();
    } else {
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    if (selectedEvents.length === 0) {
      Alert.alert('Error', 'Please select at least one event.');
      return;
    }
    setLoading(true);
    try {
      const payload: RegisterPayload = { name, email, mobile, college, course, year, events: selectedEvents };
      const res = await participantsApi.register(payload);
      const id = res.data.data?.participant?.id || (res.data.data?.participant as any)?.registration_id || 'N/A';
      setRegId(id);
      setRegName(name);
      setRegEvents(selectedEvents);
      setDone(true);
    } catch (err: any) {
      Alert.alert('Registration Failed', err?.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const viewShotRef = React.useRef<any>(null);

  const handleShare = async () => {
    try {
      if (viewShotRef.current?.capture) {
        const uri = await viewShotRef.current.capture();
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri, { dialogTitle: 'Share Virtual Ticket' });
        } else {
          Alert.alert('Error', 'Sharing is not available on this device');
        }
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to share ticket');
    }
  };

  const handleDownload = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Need media library permissions to save ticket.');
        return;
      }
      if (viewShotRef.current?.capture) {
        const uri = await viewShotRef.current.capture();
        try {
          await MediaLibrary.saveToLibraryAsync(uri);
          Alert.alert('Success', 'Virtual Ticket saved to your gallery!');
        } catch (saveErr) {
          // Fallback for Expo Go Android 13+ permission issues
          await Sharing.shareAsync(uri, { dialogTitle: 'Save Virtual Ticket' });
        }
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to generate ticket image.');
    }
  };

  if (done) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <FloatingParticles />
        <ScrollView contentContainerStyle={styles.ticketScroll} showsVerticalScrollIndicator={false}>
          <FadeInUpView>
            <ViewShot ref={viewShotRef} options={{ format: "png", quality: 0.9 }}>
            <GlassCard style={styles.ticket} intensity={40}>
              {/* Ticket Header */}
              <View style={styles.ticketHeader}>
                <GradientText text="BOARDING PASS" style={styles.ticketBrand} />
                <Text style={styles.ticketSubBrand}>TAARUNYAM 2026</Text>
              </View>

              {/* Success Badge */}
              <View style={styles.ticketBody}>
                <View style={styles.successBadge}>
                  <CheckCircle size={40} color={Colors.success} />
                </View>
                <Text style={styles.ticketTitle}>Access Granted</Text>
                <Text style={styles.ticketAttendee}>{regName}</Text>

                {/* Cyberpunk QR Block */}
                <View style={styles.qrBlock}>
                  <View style={{ padding: 10, backgroundColor: Colors.white, borderRadius: 8 }}>
                    <QRCode value={regId} size={100} color={Colors.bg} backgroundColor={Colors.white} />
                  </View>
                  <Text style={styles.qrLabel}>SCAN AT VENUE</Text>
                </View>

                {/* ID Badge */}
                <View style={styles.regIdBox}>
                  <Text style={styles.regIdLabel}>REGISTRATION ID</Text>
                  <Text style={styles.regId}>{regId}</Text>
                </View>

                {/* Events List */}
                <View style={styles.eventsBox}>
                  <Text style={styles.eventsLabel}>AUTHORIZED EVENTS</Text>
                  {regEvents.map((ev, i) => {
                    const evObj = publicEvents.find((e) => e.slug === ev || e.id === ev);
                    return (
                      <View key={i} style={styles.eventTag}>
                        <Text style={styles.eventTagText}>// {evObj?.title || ev}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </GlassCard>
            </ViewShot>
          </FadeInUpView>

          {/* Actions */}
          <FadeInUpView delay={100} style={{ paddingHorizontal: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, marginBottom: 12 }}>
              <GradientButton
                title="Share"
                icon={<Share2 size={18} color="#fff" />}
                onPress={handleShare}
                style={{ flex: 1, marginRight: 8 }}
              />
              <GradientButton
                title="Download"
                icon={<Download size={18} color="#fff" />}
                onPress={handleDownload}
                style={{ flex: 1, marginLeft: 8 }}
                colors={[Colors.secondary, Colors.primary]}
              />
            </View>
            <TouchableOpacity style={styles.homeBtn} onPress={() => (navigation as any).navigate('Home')}>
              <ArrowLeft size={18} color={Colors.textMuted} />
              <Text style={styles.homeBtnText}>Return to Home</Text>
            </TouchableOpacity>
          </FadeInUpView>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <FloatingParticles />
      
      <BlurView intensity={80} tint="dark" style={styles.header}>
        <TouchableOpacity onPress={() => step === 1 ? navigation.goBack() : setStep(1)}>
          <ArrowLeft size={24} color={Colors.primaryLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Registration</Text>
        <View style={styles.stepPills}>
          {[1, 2].map((s) => (
            <View key={s} style={[styles.stepPill, step >= s && styles.stepPillActive]}>
              <Text style={[styles.stepPillText, step >= s && styles.stepPillTextActive]}>{s}</Text>
            </View>
          ))}
        </View>
      </BlurView>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          {step === 1 ? (
            <FadeInUpView>
              <Text style={styles.stepLabel}>Step 1: Protocol Initialization</Text>
              <Text style={styles.stepHint}>Enter your personal details to begin.</Text>
              
              <GlassCard intensity={20} style={styles.cardWrapper}>
                <Field label="Full Name" value={name} onChange={setName} placeholder="John Doe" />
                <Field label="Email Address" value={email} onChange={setEmail} placeholder="john@example.com" keyboardType="email-address" />
                <Field label="Mobile Number" value={mobile} onChange={setMobile} placeholder="9876543210" keyboardType="phone-pad" />
                <Field label="College / Institute" value={college} onChange={setCollege} placeholder="MIT College of Engineering" />
                <Field label="Department / Course" value={course} onChange={setCourse} placeholder="Computer Science" />
                
                <Text style={styles.label}>Year of Study</Text>
                <View style={styles.yearRow}>
                  {YEAR_OPTIONS.map((y) => (
                    <TouchableOpacity
                      key={y}
                      style={[styles.yearChip, year === y && styles.yearChipActive]}
                      onPress={() => setYear(y)}
                    >
                      <Text style={[styles.yearChipText, year === y && styles.yearChipTextActive]}>{y}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </GlassCard>

              <GradientButton
                title={route.params?.preselectedEvent && selectedEvents.length === 1 && selectedEvents[0] === route.params.preselectedEvent ? (loading ? "Processing..." : "Complete Registration") : "Next: Select Events"}
                onPress={handleNextStep1}
                disabled={!name || !email || !mobile || !college || !course || loading}
                colors={(route.params?.preselectedEvent && selectedEvents.length === 1 && selectedEvents[0] === route.params.preselectedEvent) ? [Colors.success, '#059669'] : [Colors.primary, Colors.secondary]}
                style={{ marginTop: 20 }}
              />
            </FadeInUpView>
          ) : (
            <FadeInUpView>
              <Text style={styles.stepLabel}>Step 2: Event Selection</Text>
              <Text style={styles.stepHint}>Choose the events you wish to participate in.</Text>
              
              {publicEvents.length === 0 && (
                <Text style={styles.noEvents}>No active events available at this time.</Text>
              )}
              
              {publicEvents.map((event: Event, index: number) => {
                const selected = selectedEvents.includes(event.slug);
                return (
                  <FadeInUpView key={event.id}>
                    <TouchableOpacity activeOpacity={0.8} onPress={() => toggleEvent(event.slug)}>
                      <GlassCard intensity={selected ? 40 : 20} style={[styles.eventCard, selected ? styles.eventCardActive : {}]}>
                        <View style={[styles.eventCheck, selected ? styles.eventCheckActive : {}]}>
                          {selected && <CheckCircle size={16} color={Colors.white} />}
                        </View>
                        <View style={styles.eventInfo}>
                          <Text style={styles.eventTitle}>{event.title}</Text>
                          <View style={styles.eventMetaRow}>
                            <Calendar size={12} color={Colors.textMuted} />
                            <Text style={styles.eventMeta}>{event.event_date}</Text>
                          </View>
                          <View style={styles.eventMetaRow}>
                            <MapPin size={12} color={Colors.textMuted} />
                            <Text style={styles.eventMeta}>{event.venue || 'TBA'}</Text>
                          </View>
                        </View>
                      </GlassCard>
                    </TouchableOpacity>
                  </FadeInUpView>
                );
              })}

              <GradientButton
                title={loading ? "Processing..." : "Complete Registration"}
                onPress={handleSubmit}
                disabled={loading || selectedEvents.length === 0}
                colors={loading ? [Colors.border, Colors.border] : [Colors.success, '#059669']}
                style={{ marginTop: 24 }}
              />
            </FadeInUpView>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Field({ label, value, onChange, placeholder, keyboardType }: any) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        keyboardType={keyboardType || 'default'}
        autoCapitalize="none"
        selectionColor={Colors.primary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight! + 10,
    paddingHorizontal: 16, paddingBottom: 14,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: 20, fontFamily: 'Poppins-Bold', color: Colors.textPrimary },
  stepPills: { flexDirection: 'row', gap: 6 },
  stepPill: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: Colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  stepPillActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '30', shadowColor: Colors.primary, shadowOpacity: 0.8, shadowRadius: 8 },
  stepPillText: { fontSize: 12, fontFamily: 'Poppins-Bold', color: Colors.textMuted },
  stepPillTextActive: { color: Colors.primaryLight },
  form: { padding: 20, paddingBottom: 60 },
  stepLabel: { fontSize: 18, fontFamily: 'Poppins-Bold', color: Colors.primaryLight, marginBottom: 4 },
  stepHint: { fontSize: 13, color: Colors.textSecondary, marginBottom: 20, fontFamily: 'Poppins-Regular' },
  cardWrapper: { padding: 4 },
  label: { fontSize: 12, color: Colors.textSecondary, marginBottom: 8, fontFamily: 'Poppins-SemiBold', textTransform: 'uppercase', letterSpacing: 1 },
  input: {
    backgroundColor: Colors.bgInput, borderRadius: 12, padding: 16,
    color: Colors.textPrimary, fontSize: 15, borderWidth: 1, borderColor: Colors.border,
    fontFamily: 'Poppins-Regular',
  },
  yearRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
  yearChip: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgInput,
  },
  yearChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '20' },
  yearChipText: { color: Colors.textMuted, fontSize: 13, fontFamily: 'Poppins-Medium' },
  yearChipTextActive: { color: Colors.primaryLight, fontFamily: 'Poppins-Bold' },
  
  eventCard: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 12, borderWidth: 1, borderColor: Colors.border, padding: 16,
  },
  eventCardActive: { borderColor: Colors.primary, backgroundColor: 'rgba(51,136,255,0.1)' },
  eventCheck: {
    width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: Colors.border,
    justifyContent: 'center', alignItems: 'center', marginRight: 16,
  },
  eventCheckActive: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  eventInfo: { flex: 1 },
  eventTitle: { fontSize: 16, fontFamily: 'Poppins-Bold', color: Colors.textPrimary, marginBottom: 6 },
  eventMetaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 6 },
  eventMeta: { fontSize: 12, color: Colors.textMuted, fontFamily: 'Poppins-Medium' },
  noEvents: { color: Colors.textMuted, textAlign: 'center', marginTop: 40, fontSize: 15, fontFamily: 'Poppins-Medium' },

  // Ticket styling
  ticketScroll: { padding: 20, paddingBottom: 60, paddingTop: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight! + 30 },
  ticket: {
    padding: 0,
    borderWidth: 1, borderColor: 'rgba(51,136,255,0.4)',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5, shadowRadius: 20, elevation: 10,
  },
  ticketHeader: {
    backgroundColor: 'rgba(51,136,255,0.15)',
    padding: 24, alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: 'rgba(51,136,255,0.2)',
  },
  ticketBrand: { fontSize: 24, fontFamily: 'Poppins-Black', letterSpacing: 4 },
  ticketSubBrand: { fontSize: 10, color: Colors.primaryLight, letterSpacing: 3, marginTop: 4, fontFamily: 'Poppins-Bold' },
  ticketBody: { padding: 24, alignItems: 'center' },
  successBadge: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(0,230,118,0.1)', borderWidth: 2, borderColor: Colors.success,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    shadowColor: Colors.success, shadowOpacity: 0.6, shadowRadius: 15,
  },
  ticketTitle: { fontSize: 22, fontFamily: 'Poppins-Black', color: Colors.textPrimary, marginBottom: 4 },
  ticketAttendee: { fontSize: 16, color: Colors.textSecondary, marginBottom: 24, fontFamily: 'Poppins-Medium' },
  qrBlock: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 16,
    marginBottom: 24, alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  qrGrid: { flexDirection: 'row', flexWrap: 'wrap', width: 105, height: 105 },
  qrCell: { width: 15, height: 15 },
  qrLabel: { fontSize: 10, color: Colors.primaryLight, letterSpacing: 3, marginTop: 12, fontFamily: 'Poppins-Bold' },
  regIdBox: {
    width: '100%', backgroundColor: 'rgba(51,136,255,0.1)',
    borderRadius: 12, padding: 16, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(51,136,255,0.3)', marginBottom: 20,
  },
  regIdLabel: { fontSize: 10, color: Colors.primaryLight, letterSpacing: 2, fontFamily: 'Poppins-Bold', marginBottom: 4 },
  regId: { fontSize: 22, fontFamily: 'Poppins-Black', color: Colors.white, letterSpacing: 2 },
  eventsBox: { width: '100%' },
  eventsLabel: { fontSize: 10, color: Colors.textMuted, letterSpacing: 2, fontFamily: 'Poppins-Bold', marginBottom: 8 },
  eventTag: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, marginBottom: 8,
    borderLeftWidth: 3, borderLeftColor: Colors.primary,
  },
  eventTagText: { fontSize: 13, color: Colors.textPrimary, fontFamily: 'Poppins-SemiBold' },
  homeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, gap: 8 },
  homeBtnText: { color: Colors.textMuted, fontFamily: 'Poppins-SemiBold', fontSize: 14 },
});
