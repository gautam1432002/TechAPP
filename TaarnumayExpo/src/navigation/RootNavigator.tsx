import React, { useEffect, useRef } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuthStore } from '../store/auth.store';
import { setNavigateToLogin } from '../api/client';
import AuthNavigator from './AuthNavigator';
import PublicNavigator from './PublicNavigator';
import AdminNavigator from './AdminNavigator';
import { ActivityIndicator, View } from 'react-native';
import { Colors } from '../constants/colors';

export type RootStackParamList = {
  PublicApp: undefined;
  Auth: undefined;
  AdminApp: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() { console.log('--- ROOT NAVIGATOR ---'); 
  const { isAuthenticated, isLoading, loadStoredAuth } = useAuthStore();
  const navRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  useEffect(() => {
    // Restore auth state on app launch
    loadStoredAuth();
    // Hook the navigate-to-login callback into the axios interceptor
    setNavigateToLogin(() => {
      navRef.current?.reset({ index: 0, routes: [{ name: 'Auth' }] });
    });
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="AdminApp" component={AdminNavigator} />
        ) : (
          <>
            <Stack.Screen name="PublicApp" component={PublicNavigator} />
            <Stack.Screen name="Auth" component={AuthNavigator} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
