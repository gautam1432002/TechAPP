import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  StatusBar, ActivityIndicator, Alert, Switch, Image,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../constants/colors';
import { AdminStackParamList } from '../../navigation/AdminNavigator';
import { eventsApi } from '../../api/events.api';
import { useEventsStore } from '../../store/events.store';
import { EventCategory } from '../../types/event.types';

type Route = RouteProp<AdminStackParamList, 'EventForm'>;

const CATEGORIES = [
  'Programming', 'Knowledge', 'Innovation', 'Web Development',
  'Problem Solving', 'Artificial Intelligence', 'Robotics', 'Design', 'Other',
];

export default function EventFormScreen() {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { fetchAdminEvents } = useEventsStore();
  const existingEvent = route.params?.event;
  const isEdit = !!existingEvent;

  const [title, setTitle] = useState(existingEvent?.title || '');
  const [description, setDescription] = useState(existingEvent?.description || '');
  const [category, setCategory] = useState<EventCategory>((existingEvent?.category as EventCategory) || 'Programming');
  const [venue, setVenue] = useState(existingEvent?.venue || '');
  const [eventDate, setEventDate] = useState(existingEvent?.event_date || '');
  const [capacity, setCapacity] = useState(String(existingEvent?.capacity || 0));
  const [isActive, setIsActive] = useState(existingEvent?.is_active ?? true);
  const [prizes, setPrizes] = useState((existingEvent?.prizes || []).join(', '));
  const [bannerUri, setBannerUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickBanner = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setBannerUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!title || !eventDate) {
      Alert.alert('Required Fields', 'Title and Event Date are required.');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('venue', venue);
      formData.append('eventDate', eventDate);
      formData.append('capacity', capacity);
      formData.append('isActive', String(isActive));
      formData.append('prizes', prizes);
      if (bannerUri) {
        const fileName = bannerUri.split('/').pop() || 'banner.jpg';
        formData.append('banner_image', { uri: bannerUri, type: 'image/jpeg', name: fileName } as any);
      }
      if (isEdit && existingEvent) {
        await eventsApi.updateEvent(existingEvent.id, formData);
      } else {
        await eventsApi.createEvent(formData);
      }
      await fetchAdminEvents();
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to save event.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹ Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEdit ? 'Edit Event' : 'Create Event'}</Text>
        <TouchableOpacity onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color={Colors.primary} size="small" /> : <Text style={styles.save}>Save</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.bannerPicker} onPress={pickBanner}>
          {bannerUri ? (
            <Image source={{ uri: bannerUri }} style={styles.bannerPreview} />
          ) : (
            <View style={styles.bannerPlaceholder}>
              <Text style={styles.bannerIcon}>🖼️</Text>
              <Text style={styles.bannerText}>Tap to select banner image</Text>
            </View>
          )}
        </TouchableOpacity>

        <F label="Event Title *" value={title} onChange={setTitle} placeholder="Hackathon 2026" />
        <F label="Description" value={description} onChange={setDescription} placeholder="Event description..." multiline />
        <F label="Venue" value={venue} onChange={setVenue} placeholder="Main Hall, Block A" />
        <F label="Event Date * (YYYY-MM-DD)" value={eventDate} onChange={setEventDate} placeholder="2026-03-15" />
        <F label="Capacity (0 = unlimited)" value={capacity} onChange={setCapacity} placeholder="100" keyboardType="number-pad" />
        <F label="Prizes (comma-separated)" value={prizes} onChange={setPrizes} placeholder="₹10,000, ₹5,000, ₹2,500" />

        <Text style={styles.label}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          {CATEGORIES.map((cat) => {
            const color = (Colors.categories as any)[cat] || Colors.primary;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.catChip, category === cat && { backgroundColor: color + '25', borderColor: color }]}
                onPress={() => setCategory(cat as EventCategory)}>
                <Text style={[styles.catText, category === cat && { color }]}>{cat}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.toggleRow}>
          <Text style={styles.label}>Active (visible to public)</Text>
          <Switch value={isActive} onValueChange={setIsActive} trackColor={{ true: Colors.primary }} />
        </View>
      </ScrollView>
    </View>
  );
}

function F({ label, value, onChange, placeholder, multiline, keyboardType }: any) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.textarea]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        keyboardType={keyboardType || 'default'}
        autoCapitalize="none"
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
  back: { color: Colors.error, fontSize: 16, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  save: { color: Colors.primary, fontSize: 16, fontWeight: '800' },
  content: { padding: 16, paddingBottom: 60 },
  bannerPicker: { borderRadius: 14, overflow: 'hidden', marginBottom: 20, height: 150 },
  bannerPreview: { width: '100%', height: 150 },
  bannerPlaceholder: {
    width: '100%', height: 150, backgroundColor: Colors.bgCard,
    justifyContent: 'center', alignItems: 'center', borderRadius: 14,
    borderWidth: 2, borderColor: Colors.border, borderStyle: 'dashed',
  },
  bannerIcon: { fontSize: 36, marginBottom: 8 },
  bannerText: { color: Colors.textMuted, fontSize: 13 },
  label: { fontSize: 12, color: Colors.textSecondary, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: Colors.bgCard, borderRadius: 10, padding: 14,
    color: Colors.textPrimary, fontSize: 14, borderWidth: 1, borderColor: Colors.border,
  },
  textarea: { height: 100, textAlignVertical: 'top' },
  catChip: {
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgCard, marginRight: 8,
  },
  catText: { color: Colors.textMuted, fontSize: 12, fontWeight: '600' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
});
