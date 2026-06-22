import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  StatusBar, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { authApi } from '../../api/auth.api';

type Route = RouteProp<AuthStackParamList, 'OTPReset'>;

export default function OTPResetScreen() {
  const navigation = useNavigation();
  const { reset_token } = useRoute<Route>().params;
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.'); return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Weak Password', 'Password must be at least 8 characters.'); return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword({ reset_token, new_username: newUsername, new_password: newPassword, confirm_password: confirmPassword });
      Alert.alert('Success', 'Password updated. Please login with your new credentials.', [
        { text: 'OK', onPress: () => (navigation as any).navigate('Login') },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>‹ Back</Text>
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.icon}>🔑</Text>
        <Text style={styles.title}>Set New Credentials</Text>
        <Text style={styles.subtitle}>Choose a new username and strong password.</Text>

        {[
          { label: 'New Username', value: newUsername, set: setNewUsername, placeholder: 'new_admin', secure: false },
          { label: 'New Password', value: newPassword, set: setNewPassword, placeholder: '••••••••', secure: true },
          { label: 'Confirm Password', value: confirmPassword, set: setConfirmPassword, placeholder: '••••••••', secure: true },
        ].map((f) => (
          <View key={f.label} style={{ marginBottom: 16 }}>
            <Text style={styles.label}>{f.label}</Text>
            <TextInput
              style={styles.input}
              value={f.value}
              onChangeText={f.set}
              placeholder={f.placeholder}
              placeholderTextColor={Colors.textMuted}
              secureTextEntry={f.secure}
              autoCapitalize="none"
            />
          </View>
        ))}

        <TouchableOpacity
          style={[styles.btn, (loading || !newUsername || !newPassword || !confirmPassword) && styles.btnDisabled]}
          onPress={handleReset}
          disabled={loading || !newUsername || !newPassword || !confirmPassword}>
          {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.btnText}>Update Credentials</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg, padding: 24 },
  back: { marginTop: 50, marginBottom: 20 },
  backText: { color: Colors.primary, fontSize: 18, fontWeight: '600' },
  content: { paddingBottom: 40, justifyContent: 'center' },
  icon: { fontSize: 56, textAlign: 'center', marginBottom: 16, marginTop: 20 },
  title: { fontSize: 28, fontWeight: '900', color: Colors.textPrimary, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', marginBottom: 32 },
  label: { fontSize: 12, color: Colors.textSecondary, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 },
  input: {
    backgroundColor: Colors.bgCard, borderRadius: 12, padding: 16,
    color: Colors.textPrimary, fontSize: 15, borderWidth: 1, borderColor: Colors.border,
  },
  btn: { backgroundColor: Colors.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  btnText: { color: Colors.white, fontWeight: '800', fontSize: 16 },
  btnDisabled: { opacity: 0.5 },
});
