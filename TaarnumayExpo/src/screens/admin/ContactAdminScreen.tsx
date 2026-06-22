import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, RefreshControl, Alert, Modal, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { api } from '../../api/client';
import { ContactMessage } from '../../types/participant.types';

export default function ContactAdminScreen() {
  const navigation = useNavigation();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/contact/');
      const data = res.data?.data;
      // Handle paginated response
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : [];
      setMessages(list);
    } catch (err: any) {
      console.warn('Contact fetch failed:', err?.response?.status, err?.message);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleMarkRead = async (id: string) => {
    try {
      // Backend uses PATCH to /admin/contact/<uuid>/read/
      await api.patch(`/admin/contact/${id}/read/`, { is_read: true });
      setMessages((prev) => prev.map((m) => m.id === id ? { ...m, is_read: true } : m));
      if (selected?.id === id) setSelected((prev) => prev ? { ...prev, is_read: true } : null);
    } catch (err: any) {
      Alert.alert('Error', 'Failed to mark as read.');
    }
  };

  const unreadCount = messages.filter((m) => !m.is_read).length;

  const renderMessage = ({ item }: { item: ContactMessage }) => (
    <TouchableOpacity
      style={[styles.card, !item.is_read && styles.unreadCard]}
      onPress={() => setSelected(item)}
      activeOpacity={0.8}
    >
      <View style={styles.cardTop}>
        <View style={styles.cardLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.name?.[0]?.toUpperCase() || '?'}</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.email}>{item.email}</Text>
          </View>
        </View>
        <View style={styles.cardRight}>
          <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
          {!item.is_read && <View style={styles.unreadDot} />}
        </View>
      </View>
      <Text style={styles.messagePreview} numberOfLines={2}>{item.message}</Text>
      {item.subject && <Text style={styles.subject}>Re: {item.subject}</Text>}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Contact Messages</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount} unread</Text>
            </View>
          )}
        </View>
        <View style={{ width: 36 }} />
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} tintColor={Colors.primary} />}
        ListEmptyComponent={
          <View style={styles.emptyView}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.empty}>{loading ? 'Loading messages...' : 'No messages yet.'}</Text>
          </View>
        }
      />

      {/* Message Detail Modal */}
      <Modal visible={!!selected} animationType="slide" transparent onRequestClose={() => setSelected(null)}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Message Detail</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setSelected(null)}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              {selected && (
                <>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailKey}>From</Text>
                    <Text style={styles.detailVal}>{selected.name}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailKey}>Email</Text>
                    <Text style={[styles.detailVal, { color: Colors.primary }]}>{selected.email}</Text>
                  </View>
                  {selected.subject && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailKey}>Subject</Text>
                      <Text style={styles.detailVal}>{selected.subject}</Text>
                    </View>
                  )}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailKey}>Date</Text>
                    <Text style={styles.detailVal}>{new Date(selected.created_at).toLocaleString()}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailKey}>Status</Text>
                    <View style={[styles.statusBadge, { backgroundColor: selected.is_read ? Colors.success + '20' : Colors.primary + '20' }]}>
                      <Text style={[styles.statusBadgeText, { color: selected.is_read ? Colors.success : Colors.primary }]}>
                        {selected.is_read ? '✓ Read' : '● Unread'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.messageBox}>
                    <Text style={styles.messageLabel}>MESSAGE</Text>
                    <Text style={styles.messageText}>{selected.message}</Text>
                  </View>
                  {!selected.is_read && (
                    <TouchableOpacity
                      style={styles.markReadBtn}
                      onPress={() => handleMarkRead(selected.id)}
                    >
                      <Text style={styles.markReadBtnText}>✓ Mark as Read</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    backgroundColor: Colors.bgCard, paddingTop: 50, paddingHorizontal: 16, paddingBottom: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { width: 36, height: 36, justifyContent: 'center' },
  back: { color: Colors.primary, fontSize: 28, fontWeight: '300', lineHeight: 32 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  unreadBadge: {
    marginTop: 4, backgroundColor: Colors.primary + '20', borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1, borderColor: Colors.primary + '40',
  },
  unreadBadgeText: { fontSize: 11, color: Colors.primary, fontWeight: '700' },
  list: { padding: 12, paddingBottom: 40 },
  card: {
    backgroundColor: Colors.bgCard, borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  unreadCard: { borderColor: Colors.primary + '50', borderWidth: 1.5 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primary + '30',
    justifyContent: 'center', alignItems: 'center', marginRight: 10,
  },
  avatarText: { fontSize: 16, fontWeight: '800', color: Colors.primary },
  cardInfo: { flex: 1 },
  name: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },
  email: { fontSize: 12, color: Colors.primary, marginTop: 2 },
  cardRight: { alignItems: 'flex-end', gap: 6 },
  date: { fontSize: 11, color: Colors.textMuted },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  messagePreview: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },
  subject: { fontSize: 11, color: Colors.textMuted, marginTop: 6, fontStyle: 'italic' },
  emptyView: { marginTop: 80, alignItems: 'center' },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  empty: { textAlign: 'center', color: Colors.textMuted, fontSize: 16 },

  // Modal
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modal: {
    backgroundColor: Colors.bgCard, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.border, justifyContent: 'center', alignItems: 'center' },
  closeBtnText: { color: Colors.textMuted, fontWeight: '700' },
  modalBody: { padding: 20 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  detailKey: { fontSize: 12, color: Colors.textMuted, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  detailVal: { fontSize: 14, color: Colors.textPrimary, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusBadgeText: { fontSize: 12, fontWeight: '700' },
  messageBox: { marginTop: 20, backgroundColor: Colors.bg, borderRadius: 12, padding: 16 },
  messageLabel: { fontSize: 11, color: Colors.textMuted, letterSpacing: 2, fontWeight: '700', marginBottom: 10 },
  messageText: { fontSize: 15, color: Colors.textPrimary, lineHeight: 24 },
  markReadBtn: {
    marginTop: 20, marginBottom: 40, backgroundColor: Colors.primary, borderRadius: 12, padding: 16, alignItems: 'center',
  },
  markReadBtnText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
});
