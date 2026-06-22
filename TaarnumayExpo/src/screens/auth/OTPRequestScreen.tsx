import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  StatusBar, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Colors } from '../../constants/colors';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { authApi } from '../../api/auth.api';

type Nav = StackNavigationProp<AuthStackParamList, 'OTPRequest'>;

export default function OTPRequestScreen() {
  const navigation = useNavigation<Nav>();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    if (!email) { Alert.alert('Enter email'); return; }
    setLoading(true);
    try {
      await authApi.requestOTP({ email });
      navigation.navigate('OTPVerify', { email });
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <View style={styles.content}>
          <Text style={styles.icon}>🔐</Text>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>Enter your authorized admin email to receive a 6-digit OTP.</Text>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="admin@example.com"
            placeholderTextColor={Colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={[styles.btn, (!email || loading) && styles.btnDisabled]}
            onPress={handleRequest}
            disabled={!email || loading}>
            {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.btnText}>Send OTP</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg, padding: 24 },
  back: { marginTop: 50, marginBottom: 20 },
  backText: { color: Colors.primary, fontSize: 18, fontWeight: '600' },
  content: { flex: 1, justifyContent: 'center' },
  icon: { fontSize: 56, textAlign: 'center', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '900', color: Colors.textPrimary, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', marginBottom: 32, lineHeight: 20 },
  label: { fontSize: 12, color: Colors.textSecondary, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 },
  input: {
    backgroundColor: Colors.bgCard, borderRadius: 12, padding: 16,
    color: Colors.textPrimary, fontSize: 15, borderWidth: 1, borderColor: Colors.border, marginBottom: 20,
  },
  btn: { backgroundColor: Colors.primary, borderRadius: 12, padding: 16, alignItems: 'center' },
  btnText: { color: Colors.white, fontWeight: '800', fontSize: 16 },
  btnDisabled: { opacity: 0.5 },
});
