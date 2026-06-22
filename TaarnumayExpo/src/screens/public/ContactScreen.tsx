import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  StatusBar, ActivityIndicator, ScrollView, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { contactApi } from '../../api/analytics.api';

export default function ContactScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!name || !email || !message) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      await contactApi.submitContact({ name, email, message });
      setSent(true);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to send message.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <View style={styles.successContainer}>
        <Text style={styles.successIcon}>📬</Text>
        <Text style={styles.successTitle}>Message Sent!</Text>
        <Text style={styles.successSub}>We'll get back to you soon.</Text>
        <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.doneBtnText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Us</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Get in Touch</Text>
        <Text style={styles.subtitle}>Have questions? We'd love to hear from you.</Text>

        {[
          { label: 'Your Name', value: name, set: setName, placeholder: 'John Doe' },
          { label: 'Email Address', value: email, set: setEmail, placeholder: 'john@example.com', type: 'email-address' },
        ].map((f) => (
          <View key={f.label} style={{ marginBottom: 16 }}>
            <Text style={styles.label}>{f.label}</Text>
            <TextInput
              style={styles.input}
              value={f.value}
              onChangeText={f.set}
              placeholder={f.placeholder}
              placeholderTextColor={Colors.textMuted}
              keyboardType={(f.type as any) || 'default'}
              autoCapitalize="none"
            />
          </View>
        ))}

        <Text style={styles.label}>Message</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          value={message}
          onChangeText={setMessage}
          placeholder="Write your message here..."
          placeholderTextColor={Colors.textMuted}
          multiline
          numberOfLines={5}
        />

        <TouchableOpacity
          style={[styles.sendBtn, (loading || !name || !email || !message) && styles.btnDisabled]}
          onPress={handleSend}
          disabled={loading || !name || !email || !message}>
          {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.sendBtnText}>Send Message</Text>}
        </TouchableOpacity>
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
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '900', color: Colors.textPrimary, marginBottom: 6 },
  subtitle: { fontSize: 14, color: Colors.textMuted, marginBottom: 24 },
  label: { fontSize: 13, color: Colors.textSecondary, marginBottom: 6, fontWeight: '600' },
  input: {
    backgroundColor: Colors.bgCard, borderRadius: 12, padding: 14,
    color: Colors.textPrimary, fontSize: 15, borderWidth: 1, borderColor: Colors.border, marginBottom: 0,
  },
  textarea: { height: 140, textAlignVertical: 'top', marginBottom: 0 },
  sendBtn: {
    backgroundColor: Colors.primary, borderRadius: 12, padding: 18, alignItems: 'center', marginTop: 24,
  },
  sendBtnText: { color: Colors.white, fontWeight: '800', fontSize: 16 },
  btnDisabled: { opacity: 0.5 },
  successContainer: { flex: 1, backgroundColor: Colors.bg, justifyContent: 'center', alignItems: 'center', padding: 32 },
  successIcon: { fontSize: 72, marginBottom: 16 },
  successTitle: { fontSize: 28, fontWeight: '900', color: Colors.success, marginBottom: 8 },
  successSub: { fontSize: 15, color: Colors.textMuted, marginBottom: 32 },
  doneBtn: { backgroundColor: Colors.primary, borderRadius: 12, padding: 16, paddingHorizontal: 40 },
  doneBtnText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
});
