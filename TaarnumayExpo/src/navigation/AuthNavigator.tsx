import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/auth/LoginScreen';
import OTPRequestScreen from '../screens/auth/OTPRequestScreen';
import OTPVerifyScreen from '../screens/auth/OTPVerifyScreen';
import OTPResetScreen from '../screens/auth/OTPResetScreen';

export type AuthStackParamList = {
  Login: undefined;
  OTPRequest: undefined;
  OTPVerify: { email: string };
  OTPReset: { reset_token: string };
};

const Stack = createStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="OTPRequest" component={OTPRequestScreen} />
      <Stack.Screen name="OTPVerify" component={OTPVerifyScreen} />
      <Stack.Screen name="OTPReset" component={OTPResetScreen} />
    </Stack.Navigator>
  );
}
