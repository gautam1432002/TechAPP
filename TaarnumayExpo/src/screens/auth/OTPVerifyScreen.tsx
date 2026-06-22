import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Colors } from '../../constants/colors';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { authApi } from '../../api/auth.api';

type Nav = StackNavigationProp<AuthStackParamList, 'OTPVerify'>;
type Route = RouteProp<AuthStackParamList, 'OTPVerify'>;

export default function OTPVerifyScreen() {
  const navigation = useNavigation<Nav>();
  const { email } = useRoute<Route>().params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const refs = Array.from({ length: 6 }, () => useRef<TextInput>(null));

  const handleChange = (val: string, index: number) => {
    const updated = [...otp];
    updated[index] = val;
    setOtp(updated);
    if (val && index < 5) refs[index + 1].current?.focus();
  };

  const handleVerify = async () => {
    const otpStr = otp.join('');
    if (otpStr.length < 6) { Alert.alert('Enter 6-digit OTP'); return; }
    setLoading(true);
    try {
      const res = await authApi.verifyOTP({ email, otp: otpStr });
      navigation.navigate('OTPReset', { reset_token: res.data.data.reset_token });
    } catch (err: any) {
      Alert.alert('Invalid OTP', err?.response?.data?.message || 'OTP verification failed.');
      setOtp(['', '', '', '', '', '']);
      refs[0].current?.focus();
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
      <View style={styles.content}>
        <Text style={styles.icon}>📩</Text>
        <Text style={styles.title}>Enter OTP</Text>
        <Text style={styles.subtitle}>A 6-digit code was sent to</Text>
        <Text style={styles.email}>{email}</Text>

        <View style={styles.otpRow}>
          {otp.map((digit, i) => (
            <TextInput
              key={i}
              ref={refs[i]}
              style={[styles.otpInput, digit ? styles.otpFilled : null]}
              value={digit}
              onChangeText={(v) => handleChange(v.slice(-1), i)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.btn, (loading || otp.join('').length < 6) && styles.btnDisabled]}
          onPress={handleVerify}
          disabled={loading || otp.join('').length < 6}>
          {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.btnText}>Verify OTP</Text>}
        </TouchableOpacity>

        <Text style={styles.expiry}>⏱ OTP expires in 10 minutes</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg, padding: 24 },
  back: { marginTop: 50, marginBottom: 20 },
  backText: { color: Colors.primary, fontSize: 18, fontWeight: '600' },
  content: { flex: 1, justifyContent: 'center' },
  icon: { fontSize: 56, textAlign: 'center', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '900', color: Colors.textPrimary, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: Colors.textMuted, textAlign: 'center' },
  email: { fontSize: 15, fontWeight: '700', color: Colors.primary, textAlign: 'center', marginBottom: 32 },
  otpRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 32 },
  otpInput: {
    width: 48, height: 56, borderRadius: 12, backgroundColor: Colors.bgCard,
    borderWidth: 2, borderColor: Colors.border, textAlign: 'center',
    fontSize: 22, fontWeight: '800', color: Colors.textPrimary,
  },
  otpFilled: { borderColor: Colors.primary, backgroundColor: Colors.primary + '15' },
  btn: { backgroundColor: Colors.primary, borderRadius: 12, padding: 16, alignItems: 'center' },
  btnText: { color: Colors.white, fontWeight: '800', fontSize: 16 },
  btnDisabled: { opacity: 0.5 },
  expiry: { color: Colors.textMuted, textAlign: 'center', marginTop: 16, fontSize: 13 },
});
