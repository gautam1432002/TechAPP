import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  StatusBar, KeyboardAvoidingView, Platform, Alert, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { FadeInUpView } from '../../components/ui/FadeInUpView';
import { Eye, EyeOff, Lock, User, ArrowLeft } from 'lucide-react-native';

import { Colors } from '../../constants/colors';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useAuthStore } from '../../store/auth.store';
import { GlassCard } from '../../components/ui/GlassCard';
import { GradientText } from '../../components/ui/GradientText';
import { GradientButton } from '../../components/ui/GradientButton';
import { FloatingParticles } from '../../components/ui/FloatingParticles';

type Nav = StackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    clearError();
    if (!username || !password) {
      Alert.alert('Missing Fields', 'Enter both username and password.');
      return;
    }
    try {
      await login(username, password);
      // Navigation handled automatically by RootNavigator watching isAuthenticated
    } catch { /* error shown via store */ }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
          <FloatingParticles />

          <FadeInUpView delay={200} style={styles.content}>
            {/* Brand */}
            <View style={styles.brand}>
              <GradientText text="TAARUNYAM" style={styles.brandName} colors={[Colors.primary, Colors.secondary]} />
              <Text style={styles.brandSub}>SYSTEM AUTHORIZATION</Text>
            </View>

            {/* Card */}
            <FadeInUpView>
              <GlassCard style={styles.card} intensity={30}>
                <View style={styles.iconContainer}>
                  <Lock size={32} color={Colors.primaryLight} />
                </View>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Enter credentials to access admin terminal</Text>

                {error ? (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>⚠️ {error}</Text>
                  </View>
                ) : null}

                <Text style={styles.label}>Username</Text>
                <View style={styles.inputWrapper}>
                  <User size={18} color={Colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={username}
                    onChangeText={setUsername}
                    placeholder="admin"
                    placeholderTextColor={Colors.textMuted}
                    autoCapitalize="none"
                    autoCorrect={false}
                    selectionColor={Colors.primary}
                  />
                </View>

                <Text style={styles.label}>Password</Text>
                <View style={[styles.inputWrapper, { marginBottom: 24 }]}>
                  <Lock size={18} color={Colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { paddingRight: 50 }]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    placeholderTextColor={Colors.textMuted}
                    secureTextEntry={!showPass}
                    autoCapitalize="none"
                    selectionColor={Colors.primary}
                  />
                  <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass(!showPass)}>
                    {showPass ? <EyeOff size={20} color={Colors.primaryLight} /> : <Eye size={20} color={Colors.textMuted} />}
                  </TouchableOpacity>
                </View>

                <GradientButton
                  title={isLoading ? 'Authenticating...' : 'Establish Connection'}
                  onPress={handleLogin}
                  disabled={isLoading || !username || !password}
                  colors={isLoading ? [Colors.border, Colors.border] : [Colors.secondary, Colors.primary]}
                />

                <TouchableOpacity style={styles.forgotBtn} onPress={() => navigation.navigate('OTPRequest')}>
                  <Text style={styles.forgotText}>Recover Access via Security Token</Text>
                </TouchableOpacity>
              </GlassCard>
            </FadeInUpView>

            <FadeInUpView>
              <TouchableOpacity style={styles.publicBtn} onPress={() => navigation.navigate('PublicApp' as any)}>
                <ArrowLeft size={16} color={Colors.textMuted} style={{ marginRight: 8 }} />
                <Text style={styles.publicBtnText}>Return to Public Portal</Text>
              </TouchableOpacity>
            </FadeInUpView>
          </FadeInUpView>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: Colors.bg,
  },
  content: {
    flex: 1, justifyContent: 'center', padding: 24, paddingVertical: 60,
  },
  brand: { alignItems: 'center', marginBottom: 40 },
  brandName: { fontSize: 36, fontFamily: 'Poppins-Black', letterSpacing: 6 },
  brandSub: { fontSize: 12, color: Colors.primaryLight, marginTop: 4, letterSpacing: 4, fontFamily: 'Poppins-Bold' },
  card: {
    padding: 24,
    borderWidth: 1, borderColor: 'rgba(51,136,255,0.3)',
    shadowColor: Colors.primary, shadowOpacity: 0.2, shadowRadius: 20,
  },
  iconContainer: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(51,136,255,0.1)',
    justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(51,136,255,0.4)',
  },
  title: { fontSize: 24, fontFamily: 'Poppins-Bold', color: Colors.white, marginBottom: 4, textAlign: 'center' },
  subtitle: { fontSize: 12, color: Colors.textMuted, marginBottom: 24, textAlign: 'center', fontFamily: 'Poppins-Regular' },
  errorBox: {
    backgroundColor: 'rgba(255,77,77,0.1)', borderRadius: 8, padding: 12, marginBottom: 16,
    borderWidth: 1, borderColor: Colors.error,
  },
  errorText: { color: Colors.error, fontSize: 12, fontFamily: 'Poppins-SemiBold' },
  label: { fontSize: 11, color: Colors.primaryLight, fontFamily: 'Poppins-Bold', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bgInput, borderRadius: 12, borderWidth: 1, borderColor: Colors.border,
    marginBottom: 16,
  },
  inputIcon: { marginLeft: 16, marginRight: 8 },
  input: {
    flex: 1, padding: 16, color: Colors.textPrimary, fontSize: 15, fontFamily: 'Poppins-Regular',
  },
  eyeBtn: {
    position: 'absolute', right: 16, padding: 4,
  },
  forgotBtn: { alignItems: 'center', marginTop: 24 },
  forgotText: { color: Colors.tertiary, fontSize: 12, fontFamily: 'Poppins-SemiBold', letterSpacing: 0.5 },
  publicBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 32 },
  publicBtnText: { color: Colors.textMuted, fontSize: 13, fontFamily: 'Poppins-Medium', letterSpacing: 1 },
});
