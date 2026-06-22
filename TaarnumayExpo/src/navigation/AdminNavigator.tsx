import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { Colors } from '../constants/colors';
import { BlurView } from 'expo-blur';
import { Home, Calendar as CalendarIcon, Users, Scan, PieChart } from 'lucide-react-native';

// Screens
import DashboardScreen from '../screens/admin/DashboardScreen';
import EventsListScreen from '../screens/admin/EventsListScreen';
import EventFormScreen from '../screens/admin/EventFormScreen';
import ParticipantsScreen from '../screens/admin/ParticipantsScreen';
import ParticipantDetailScreen from '../screens/admin/ParticipantDetailScreen';
import ScannerScreen from '../screens/admin/ScannerScreen';
import AnalyticsScreen from '../screens/admin/AnalyticsScreen';
import EmailLogsScreen from '../screens/admin/EmailLogsScreen';
import ContactAdminScreen from '../screens/admin/ContactAdminScreen';

import { Event } from '../types/event.types';

export type AdminTabParamList = {
  Dashboard: undefined;
  EventsTab: undefined;
  ParticipantsTab: undefined;
  ScannerTab: undefined;
  AnalyticsTab: undefined;
};

export type AdminStackParamList = {
  AdminTabs: undefined;
  EventForm: { event?: Event };
  ParticipantDetail: { registrationId: string };
  EmailLogs: undefined;
  ContactAdmin: undefined;
};

const Tab = createBottomTabNavigator<AdminTabParamList>();
const Stack = createStackNavigator<AdminStackParamList>();

const TAB_CONFIG: Record<string, { label: string; icon: React.FC<any> }> = {
  Dashboard: { label: 'Home', icon: Home },
  EventsTab: { label: 'Events', icon: CalendarIcon },
  ParticipantsTab: { label: 'Users', icon: Users },
  ScannerTab: { label: 'Scanner', icon: Scan },
  AnalyticsTab: { label: 'Stats', icon: PieChart },
};

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const Icon = TAB_CONFIG[name]?.icon || Home;
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Icon size={22} color={focused ? Colors.primary : Colors.textMuted} />
    </View>
  );
}

function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarLabel: ({ focused }) => (
          <Text style={[
            styles.tabLabel,
            { color: focused ? Colors.primary : Colors.textMuted, fontWeight: focused ? '800' : '600' }
          ]}>
            {TAB_CONFIG[route.name]?.label}
          </Text>
        ),
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.OS === 'ios' ? 88 : 68,
        },
        tabBarBackground: () => (
          <BlurView
            tint="dark"
            intensity={80}
            style={StyleSheet.absoluteFill}
          >
            <View style={styles.tabBorder} />
          </BlurView>
        ),
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarShowLabel: true,
        tabBarItemStyle: { paddingTop: 8, paddingBottom: Platform.OS === 'ios' ? 24 : 8 },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="EventsTab" component={EventsListScreen} />
      <Tab.Screen name="ScannerTab" component={ScannerScreen} />
      <Tab.Screen name="ParticipantsTab" component={ParticipantsScreen} />
      <Tab.Screen name="AnalyticsTab" component={AnalyticsScreen} />
    </Tab.Navigator>
  );
}

export default function AdminNavigator() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false, 
        cardStyle: { backgroundColor: Colors.bg },
        cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS,
      }}
    >
      <Stack.Screen name="AdminTabs" component={AdminTabs} options={{ cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid }} />
      <Stack.Screen name="EventForm" component={EventFormScreen} />
      <Stack.Screen name="ParticipantDetail" component={ParticipantDetailScreen} />
      <Stack.Screen name="EmailLogs" component={EmailLogsScreen} />
      <Stack.Screen name="ContactAdmin" component={ContactAdminScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 44,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  iconWrapActive: {
    backgroundColor: Colors.primary + '20',
    borderWidth: 1,
    borderColor: Colors.primary + '40',
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
  },
  tabBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(51, 136, 255, 0.2)',
  },
});
