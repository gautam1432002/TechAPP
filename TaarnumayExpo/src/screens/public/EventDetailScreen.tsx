import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, StatusBar,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Colors } from '../../constants/colors';
import { PublicStackParamList } from '../../navigation/PublicNavigator';
import { CyberArt } from '../../components/ui/CyberArt';

type Nav = StackNavigationProp<PublicStackParamList, 'EventDetail'>;
type Route = RouteProp<PublicStackParamList, 'EventDetail'>;

export default function EventDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { event } = useRoute<Route>().params;
  const catColor = Colors.categories[event.category] || Colors.primary;

  const formatTime = (t: string | null) => {
    if (!t) return '';
    const [h, m] = t.split(':');
    const hour = parseInt(h);
    return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Banner */}
      {event.banner_image ? (
        <Image source={{ uri: `https://gautam1432.pythonanywhere.com${event.banner_image}` }} style={styles.banner} />
      ) : (
        <View style={[styles.bannerPlaceholder, { backgroundColor: Colors.bg }]}>
          <CyberArt category={event.category} color={catColor} />
        </View>
      )}
      {/* Back button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>‹</Text>
      </TouchableOpacity>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Category badge */}
        <View style={[styles.badge, { backgroundColor: catColor + '25' }]}>
          <Text style={[styles.badgeText, { color: catColor }]}>{event.category}</Text>
        </View>

        <Text style={styles.title}>{event.title}</Text>

        {/* Info Grid */}
        <View style={styles.infoGrid}>
          <InfoItem icon="📅" label="Date" value={event.event_date} />
          <InfoItem icon="📍" label="Venue" value={event.venue || 'TBA'} />
          {event.start_time && (
            <InfoItem icon="⏰" label="Time" value={`${formatTime(event.start_time)} – ${formatTime(event.end_time)}`} />
          )}
          <InfoItem icon="👥" label="Participants" value={`${event.participant_count} registered`} />
          {event.capacity > 0 && (
            <InfoItem icon="🎟️" label="Capacity" value={`${event.capacity} seats`} />
          )}
        </View>

        {/* Description */}
        {event.description ? (
          <>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{event.description}</Text>
          </>
        ) : null}

        {/* Prizes */}
        {event.prizes?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>🏆 Prizes</Text>
            {event.prizes.map((prize, i) => (
              <View key={i} style={styles.prizeRow}>
                <Text style={styles.prizeRank}>{['🥇', '🥈', '🥉'][i] || '🏅'}</Text>
                <Text style={styles.prizeAmount}>{prize}</Text>
              </View>
            ))}
          </>
        )}

        {/* Register Button */}
        <TouchableOpacity
          style={styles.registerBtn}
          onPress={() => navigation.navigate('Register', { preselectedEvent: event.slug })}>
          <Text style={styles.registerBtnText}>Register for this Event</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function InfoItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={iStyles.item}>
      <Text style={iStyles.icon}>{icon}</Text>
      <View>
        <Text style={iStyles.label}>{label}</Text>
        <Text style={iStyles.value}>{value}</Text>
      </View>
    </View>
  );
}

const iStyles = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  icon: { fontSize: 20, marginRight: 12, marginTop: 2 },
  label: { fontSize: 11, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  value: { fontSize: 14, color: Colors.textPrimary, fontWeight: '600', marginTop: 2 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  banner: { width: '100%', height: 220 },
  bannerPlaceholder: { width: '100%', height: 160, justifyContent: 'center', alignItems: 'center' },
  bannerEmoji: { fontSize: 64 },
  backBtn: {
    position: 'absolute', top: 46, left: 16, width: 40, height: 40,
    borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', zIndex: 10,
  },
  backText: { color: Colors.white, fontSize: 28, fontWeight: '300', lineHeight: 34 },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  badge: {
    alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 12,
    paddingVertical: 5, marginBottom: 12,
  },
  badgeText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  title: { fontSize: 26, fontWeight: '900', color: Colors.textPrimary, marginBottom: 20, lineHeight: 32 },
  infoGrid: {
    backgroundColor: Colors.bgCard, borderRadius: 14, padding: 16, marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16, fontWeight: '800', color: Colors.textPrimary,
    marginBottom: 12, marginTop: 4,
  },
  description: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22, marginBottom: 20 },
  prizeRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bgCard,
    borderRadius: 10, padding: 12, marginBottom: 8,
  },
  prizeRank: { fontSize: 22, marginRight: 12 },
  prizeAmount: { fontSize: 18, fontWeight: '700', color: Colors.warning },
  registerBtn: {
    backgroundColor: Colors.primary, borderRadius: 14, padding: 18,
    alignItems: 'center', marginTop: 20,
  },
  registerBtnText: { color: Colors.white, fontWeight: '800', fontSize: 16 },
});
