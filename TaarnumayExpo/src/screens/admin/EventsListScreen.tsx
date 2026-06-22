import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, RefreshControl, Alert, TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { useEventsStore } from '../../store/events.store';
import { Event } from '../../types/event.types';
import { FadeInUpView } from '../../components/ui/FadeInUpView';
import { GlassCard } from '../../components/ui/GlassCard';
import { Search, Plus, Edit2, Trash2, Calendar, Users } from 'lucide-react-native';
import { CyberArt } from '../../components/ui/CyberArt';

export default function EventsListScreen() {
  const navigation = useNavigation();
  const { adminEvents, isLoading, fetchAdminEvents, deleteEvent } = useEventsStore();
  const [search, setSearch] = useState('');

  useEffect(() => { fetchAdminEvents(); }, []);

  const filtered = adminEvents.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = (event: Event) => {
    Alert.alert(
      'Delete Event',
      `Are you sure you want to delete "${event.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteEvent(event.id) },
      ],
    );
  };

  const renderEvent = ({ item, index }: { item: Event; index: number }) => {
    const catColor = Colors.categories[item.category] || Colors.primary;
    return (
      <FadeInUpView delay={index * 50}>
        <GlassCard intensity={20} style={styles.card}>
          <View style={styles.artBg}>
             <CyberArt category={item.category} color={catColor} />
          </View>
          
          <View style={styles.cardTop}>
            <View style={[styles.badge, { backgroundColor: catColor + '20', borderColor: catColor + '50' }]}>
              <Text style={[styles.badgeText, { color: catColor }]}>{item.category}</Text>
            </View>
            <View style={[styles.activeBadge, { backgroundColor: item.is_active ? Colors.success + '20' : Colors.error + '20' }]}>
              <Text style={{ color: item.is_active ? Colors.success : Colors.error, fontSize: 10, fontFamily: 'Poppins-Bold' }}>
                {item.is_active ? '● ACTIVE' : '○ INACTIVE'}
              </Text>
            </View>
          </View>
          
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
          
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Calendar size={14} color={Colors.primaryLight} />
              <Text style={styles.metaText}>{item.event_date}</Text>
            </View>
            <View style={styles.metaItem}>
              <Users size={14} color={Colors.primaryLight} />
              <Text style={styles.metaText}>{item.participant_count} Registered</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => (navigation as any).navigate('EventForm', { event: item })}>
              <Edit2 size={14} color={Colors.primary} />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
              <Trash2 size={14} color={Colors.error} />
              <Text style={styles.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>
      </FadeInUpView>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Events Command</Text>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => (navigation as any).navigate('EventForm', { event: undefined })}>
          <Plus size={16} color={Colors.white} />
          <Text style={styles.createBtnText}>New Event</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={20} color={Colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search events database..."
            placeholderTextColor={Colors.textMuted}
            selectionColor={Colors.primary}
          />
        </View>
      </View>

      {isLoading && adminEvents.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: Colors.primaryLight, fontFamily: 'Poppins-Medium' }}>Decrypting events...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderEvent}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchAdminEvents} tintColor={Colors.primary} />}
          ListEmptyComponent={
            <Text style={styles.empty}>{isLoading ? 'Loading...' : 'No events found.'}</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    backgroundColor: Colors.bgCard, paddingTop: 50, paddingHorizontal: 16, paddingBottom: 14,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: 22, fontFamily: 'Poppins-Black', color: Colors.textPrimary },
  createBtn: { 
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primary, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8,
    shadowColor: Colors.primary, shadowOpacity: 0.5, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }
  },
  createBtnText: { color: Colors.white, fontFamily: 'Poppins-Bold', fontSize: 12 },
  searchContainer: { padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  searchBox: { 
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bgInput, borderRadius: 12, borderWidth: 1, borderColor: Colors.border,
  },
  searchIcon: { marginLeft: 16 },
  searchInput: {
    flex: 1, padding: 14,
    color: Colors.textPrimary, fontSize: 14, fontFamily: 'Poppins-Medium',
  },
  list: { padding: 16, paddingBottom: 100 },
  card: {
    borderRadius: 16, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(51,136,255,0.2)',
    overflow: 'hidden'
  },
  artBg: {
    position: 'absolute',
    top: 0, right: -40,
    width: 150, height: 150,
    opacity: 0.3,
  },
  cardTop: { flexDirection: 'row', gap: 8, marginBottom: 12, zIndex: 2 },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1 },
  badgeText: { fontSize: 9, fontFamily: 'Poppins-Black', textTransform: 'uppercase', letterSpacing: 1 },
  activeBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  title: { fontSize: 18, fontFamily: 'Poppins-Black', color: Colors.textPrimary, marginBottom: 8, zIndex: 2 },
  metaRow: { flexDirection: 'row', gap: 16, marginBottom: 16, zIndex: 2 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 12, color: Colors.textMuted, fontFamily: 'Poppins-Medium' },
  actions: { flexDirection: 'row', gap: 12, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 16, zIndex: 2 },
  editBtn: { flex: 1, flexDirection: 'row', gap: 6, backgroundColor: Colors.primary + '15', borderRadius: 10, padding: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.primary + '30' },
  editBtnText: { color: Colors.primary, fontFamily: 'Poppins-Bold', fontSize: 13 },
  deleteBtn: { flex: 1, flexDirection: 'row', gap: 6, backgroundColor: Colors.error + '15', borderRadius: 10, padding: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.error + '30' },
  deleteBtnText: { color: Colors.error, fontFamily: 'Poppins-Bold', fontSize: 13 },
  empty: { textAlign: 'center', color: Colors.textMuted, marginTop: 60, fontSize: 14, fontFamily: 'Poppins-Medium' },
});
