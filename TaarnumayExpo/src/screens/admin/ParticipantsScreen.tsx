import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, RefreshControl, TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { useParticipantsStore } from '../../store/participants.store';
import { useEventsStore } from '../../store/events.store';
import { Participant } from '../../types/participant.types';

export default function ParticipantsScreen() {
  const navigation = useNavigation();
  const { participants, isLoading, totalCount, fetchParticipants, setSearch } = useParticipantsStore();
  const { adminEvents, fetchAdminEvents } = useEventsStore();
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchParticipants();
    fetchAdminEvents();
  }, []);

  const handleSearch = (text: string) => {
    setSearchText(text);
    setSearch(text);
  };

  const renderParticipant = ({ item }: { item: Participant }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => (navigation as any).navigate('ParticipantDetail', { registrationId: item.id })}>
      <View style={styles.rowLeft}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name[0]?.toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.regId}>{item.id}</Text>
          <Text style={styles.college} numberOfLines={1}>{item.college}</Text>
        </View>
      </View>
      <View style={styles.rowRight}>
        {item.isWinner && <Text style={styles.badge}>🏆</Text>}
        {item.certificateIssued && <Text style={styles.badge}>📄</Text>}
        <Text style={styles.arrow}>›</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Participants</Text>
        <Text style={styles.count}>{totalCount} total</Text>
      </View>
      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          value={searchText}
          onChangeText={handleSearch}
          placeholder="Search by name, email, or ID..."
          placeholderTextColor={Colors.textMuted}
        />
      </View>
      <FlatList
        data={participants}
        renderItem={renderParticipant}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={() => fetchParticipants()} tintColor={Colors.primary} />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>{isLoading ? 'Loading...' : 'No participants found.'}</Text>
        }
      />
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
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  count: { fontSize: 13, color: Colors.textMuted, fontWeight: '600' },
  searchBox: { padding: 12, backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border },
  searchInput: { backgroundColor: Colors.bg, borderRadius: 10, padding: 12, color: Colors.textPrimary, fontSize: 14 },
  list: { padding: 12, paddingBottom: 40 },
  row: {
    backgroundColor: Colors.bgCard, borderRadius: 12, padding: 14, marginBottom: 8,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary + '30',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  avatarText: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  name: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  regId: { fontSize: 11, color: Colors.primary, fontWeight: '600', marginTop: 2 },
  college: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  badge: { fontSize: 16 },
  arrow: { fontSize: 22, color: Colors.textMuted, marginLeft: 4 },
  empty: { textAlign: 'center', color: Colors.textMuted, marginTop: 60, fontSize: 16 },
});
