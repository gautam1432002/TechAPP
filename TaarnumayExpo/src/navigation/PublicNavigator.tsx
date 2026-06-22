import React from 'react';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import HomeScreen from '../screens/public/HomeScreen';
import EventsScreen from '../screens/public/EventsScreen';
import EventDetailScreen from '../screens/public/EventDetailScreen';
import RegisterScreen from '../screens/public/RegisterScreen';
import LookupScreen from '../screens/public/LookupScreen';
import VerifyScreen from '../screens/public/VerifyScreen';
import ContactScreen from '../screens/public/ContactScreen';
import { Event } from '../types/event.types';

export type PublicStackParamList = {
  Home: undefined;
  Events: undefined;
  EventDetail: { event: Event };
  Register: { preselectedEvent?: string };
  Lookup: undefined;
  Verify: { token?: string };
  Contact: undefined;
};

const Stack = createStackNavigator<PublicStackParamList>();

export default function PublicNavigator() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS,
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid }} />
      <Stack.Screen name="Events" component={EventsScreen} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Lookup" component={LookupScreen} />
      <Stack.Screen name="Verify" component={VerifyScreen} />
      <Stack.Screen name="Contact" component={ContactScreen} />
    </Stack.Navigator>
  );
}
