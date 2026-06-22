import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  StatusBar, ActivityIndicator, ScrollView, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { participantsApi } from '../../api/participants.api';
import { GlassCard } from '../../components/ui/GlassCard';
import { FadeInUpView } from '../../components/ui/FadeInUpView';
import QRCode from 'react-native-qrcode-svg';
import { Download, Share2 } from 'lucide-react-native';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';

export default function LookupScreen() {
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);
  const viewShotRef = useRef<any>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    setNotFound(false);
    try {
      const res = await participantsApi.lookup(query.trim());
      const data = res.data.data;
      if (data.found) setResult(data.participant);
      else setNotFound(true);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

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
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert('Success', 'Virtual Ticket saved to your gallery!');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to save ticket');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Access Terminal</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Locate Virtual Ticket</Text>
        <Text style={styles.subtitle}>Enter your Registration ID or Email address</Text>

        <View style={styles.searchRow}>
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            placeholder="TAR-2026-001 or john@example.com"
            placeholderTextColor={Colors.textMuted}
            autoCapitalize="none"
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} disabled={loading}>
            {loading ? <ActivityIndicator color={Colors.white} size="small" /> : <Text style={styles.searchBtnText}>Search</Text>}
          </TouchableOpacity>
        </View>

        {notFound && (
          <FadeInUpView style={styles.notFound}>
            <Text style={styles.notFoundIcon}>⚠️</Text>
            <Text style={styles.notFoundText}>No registration found for "{query}"</Text>
          </FadeInUpView>
        )}

        {result && (
          <FadeInUpView delay={100}>
            <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }}>
              <GlassCard intensity={40} style={styles.ticketCard}>
                <View style={styles.ticketHeader}>
                  <Text style={styles.ticketTitle}>VIRTUAL TICKET</Text>
                  <Text style={styles.ticketEvent}>TAARUNYAM 2026</Text>
                </View>
                
                <View style={styles.qrContainer}>
                  <View style={styles.qrBorder}>
                    <QRCode
                      value={result.id}
                      size={200}
                      color={Colors.primary}
                      backgroundColor="transparent"
                    />
                  </View>
                </View>
                
                <View style={styles.ticketBody}>
                  <Text style={styles.resultName}>{result.name}</Text>
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Registration ID:</Text>
                    <Text style={styles.resultValue}>{result.id}</Text>
                  </View>
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Email:</Text>
                    <Text style={styles.resultValue}>{result.email}</Text>
                  </View>
                  {result.certificateId && (
                    <View style={styles.resultRow}>
                      <Text style={styles.resultLabel}>Certificate ID:</Text>
                      <Text style={styles.resultValue}>{result.certificateId}</Text>
                    </View>
                  )}
                </View>
              </GlassCard>
            </ViewShot>

            <View style={styles.ticketActions}>
              <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
                <Share2 size={16} color={Colors.primary} />
                <Text style={styles.actionBtnText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={handleDownload}>
                <Download size={16} color={Colors.primary} />
                <Text style={styles.actionBtnText}>Save Ticket</Text>
              </TouchableOpacity>
            </View>
          </FadeInUpView>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    backgroundColor: Colors.bgCard, paddingTop: 50, paddingHorizontal: 16, paddingBottom: 14,
    flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  back: { color: Colors.primary, fontSize: 18, fontWeight: '600', marginRight: 12 },
  headerTitle: { fontSize: 22, fontFamily: 'Poppins-Black', color: Colors.textPrimary },
  content: { padding: 20 },
  title: { fontSize: 24, fontFamily: 'Poppins-Black', color: Colors.textPrimary, marginBottom: 6 },
  subtitle: { fontSize: 14, color: Colors.textMuted, marginBottom: 24, fontFamily: 'Poppins-Regular' },
  searchRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  input: {
    flex: 1, backgroundColor: Colors.bgCard, borderRadius: 12, padding: 14,
    color: Colors.textPrimary, fontSize: 15, borderWidth: 1, borderColor: Colors.border,
    fontFamily: 'Poppins-Medium'
  },
  searchBtn: {
    backgroundColor: Colors.primary, borderRadius: 12, paddingHorizontal: 20,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: Colors.primary, shadowOpacity: 0.5, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }
  },
  searchBtnText: { color: Colors.white, fontFamily: 'Poppins-Bold', fontSize: 14 },
  notFound: { alignItems: 'center', paddingVertical: 32, backgroundColor: Colors.error + '10', borderRadius: 12, borderWidth: 1, borderColor: Colors.error + '40' },
  notFoundIcon: { fontSize: 48, marginBottom: 12 },
  notFoundText: { color: Colors.textMuted, fontSize: 15, textAlign: 'center', fontFamily: 'Poppins-Medium' },
  
  ticketCard: {
    borderRadius: 20, padding: 0,
    borderWidth: 1, borderColor: 'rgba(51,136,255,0.4)',
    overflow: 'hidden',
    backgroundColor: Colors.bgCard, // ensure opaque bg for viewshot
  },
  ticketHeader: {
    backgroundColor: 'rgba(51,136,255,0.1)',
    paddingVertical: 16, alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: 'rgba(51,136,255,0.2)',
  },
  ticketTitle: { fontSize: 18, fontFamily: 'Poppins-Black', color: Colors.white, letterSpacing: 4 },
  ticketEvent: { fontSize: 10, fontFamily: 'Poppins-Bold', color: Colors.primaryLight, letterSpacing: 2, marginTop: 4 },
  
  qrContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  qrBorder: {
    padding: 16,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: 'rgba(51,136,255,0.5)',
    shadowColor: Colors.primary,
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  
  ticketBody: {
    padding: 24,
    borderTopWidth: 1, borderTopColor: 'rgba(51,136,255,0.2)',
  },
  resultName: { fontSize: 24, fontFamily: 'Poppins-Black', color: Colors.textPrimary, marginBottom: 16, textAlign: 'center' },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' },
  resultLabel: { fontSize: 12, color: Colors.textMuted, fontFamily: 'Poppins-SemiBold', textTransform: 'uppercase' },
  resultValue: { fontSize: 13, color: Colors.primaryLight, fontFamily: 'Poppins-Bold' },
  
  ticketActions: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12
  },
  actionBtn: {
    flex: 1, paddingVertical: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(51,136,255,0.1)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(51,136,255,0.2)'
  },
  actionBtnText: {
    color: Colors.primary, fontFamily: 'Poppins-Bold', fontSize: 13, textTransform: 'uppercase'
  }
});
