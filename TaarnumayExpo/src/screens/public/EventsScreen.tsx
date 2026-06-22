import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, StatusBar, RefreshControl, Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Colors } from '../../constants/colors';
import { PublicStackParamList } from '../../navigation/PublicNavigator';
import { useEventsStore } from '../../store/events.store';
import { Event } from '../../types/event.types';
import { CyberArt } from '../../components/ui/CyberArt';

type Nav = StackNavigationProp<PublicStackParamList, 'Events'>;

export default function EventsScreen() {
  const navigation = useNavigation<Nav>();
  const { publicEvents, isLoading, fetchPublicEvents } = useEventsStore();

  useEffect(() => { fetchPublicEvents(); }, []);

  const renderEvent = ({ item }: { item: Event }) => {
    const catColor = Colors.categories[item.category] || Colors.primary;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('EventDetail', { event: item })}
        activeOpacity={0.85}>
        {item.banner_image ? (
          <Image source={{ uri: `http://10.0.2.2:8000${item.banner_image}` }} style={styles.banner} />
        ) : (
          <View style={[styles.bannerPlaceholder, { overflow: 'hidden' }]}>
            <CyberArt category={item.category} color={catColor} />
          </View>
        )}
        <View style={styles.cardBody}>
          <View style={[styles.badge, { backgroundColor: catColor + '20' }]}>
            <Text style={[styles.badgeText, { color: catColor }]}>{item.category}</Text>
          </View>
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.meta}>📅 {item.event_date} · 📍 {item.venue || 'TBA'}</Text>
          <View style={styles.footer}>
            <Text style={styles.participants}>👥 {item.participant_count} registered</Text>
            {item.prizes?.length > 0 && (
              <Text style={styles.prize}>🏆 Prizes!</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Events</Text>
      </View>
      {isLoading && publicEvents.length === 0 ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={publicEvents}
          renderItem={renderEvent}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={fetchPublicEvents} tintColor={Colors.primary} />
          }
          ListEmptyComponent={
            <Text style={styles.empty}>No active events found.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    backgroundColor: Colors.bgCard, padding: 16, paddingTop: 50,
    flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  back: { marginRight: 12 },
  backText: { color: Colors.primary, fontSize: 18, fontWeight: '600' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  list: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: Colors.bgCard, borderRadius: 16, marginBottom: 16,
    overflow: 'hidden', elevation: 3, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)'
  },
  banner: { width: '100%', height: 140 },
  bannerPlaceholder: { width: '100%', height: 120, position: 'relative' },
  cardBody: { padding: 16 },
  badge: { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 8 },
  badgeText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  title: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, marginBottom: 6 },
  meta: { fontSize: 13, color: Colors.textSecondary, marginBottom: 10 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  participants: { fontSize: 12, color: Colors.textMuted },
  prize: { fontSize: 12, color: Colors.warning, fontWeight: '700' },
  empty: { textAlign: 'center', color: Colors.textMuted, marginTop: 60, fontSize: 16 },
});
