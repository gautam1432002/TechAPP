import React from 'react';
import { Text, TextStyle } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';

interface GradientTextProps {
  text: string;
  style?: TextStyle | TextStyle[];
  colors?: string[];
}

export function GradientText({ text, style, colors = [Colors.primary, Colors.secondary] }: GradientTextProps) {
  return (
    <MaskedView
      maskElement={
        <Text 
          style={[style, { backgroundColor: 'transparent' }]}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          {text}
        </Text>
      }
    >
      <LinearGradient
        colors={colors as unknown as readonly [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={[style, { opacity: 0 }]}>{text}</Text>
      </LinearGradient>
    </MaskedView>
  );
}
