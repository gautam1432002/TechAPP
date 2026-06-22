import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import Svg, { Circle, Rect, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Colors } from '../../constants/colors';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedPath = Animated.createAnimatedComponent(Path);

export function CyberArt({ category, color }: { category: string, color: string }) {
  const pulse = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
      ])
    ).start();

    Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: true
      })
    ).start();
  }, []);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] });
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });
  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const renderArt = () => {
    switch (category) {
      case 'Programming':
      case 'Web Development':
        return (
          <Svg width="100%" height="100%" viewBox="0 0 100 100">
            <Defs>
              <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={color} stopOpacity="0.8" />
                <Stop offset="1" stopColor={Colors.bg} stopOpacity="0" />
              </LinearGradient>
            </Defs>
            <Rect x="20" y="20" width="60" height="60" fill="none" stroke={color} strokeWidth="2" strokeDasharray="5,5" />
            <AnimatedRect x="30" y="30" width="40" height="40" fill="url(#grad)" opacity={opacity as any} />
            <Path d="M10 50 L90 50 M50 10 L50 90" stroke={color} strokeWidth="1" strokeOpacity="0.3" />
          </Svg>
        );
      case 'Robotics':
      case 'Hardware':
        return (
          <Animated.View style={{ width: '100%', height: '100%', transform: [{ rotate: spin }] }}>
            <Svg width="100%" height="100%" viewBox="0 0 100 100">
              <Circle cx="50" cy="50" r="30" fill="none" stroke={color} strokeWidth="3" strokeDasharray="10,10" />
              <AnimatedCircle cx="50" cy="50" r="20" fill={color} opacity={opacity as any} />
              <Circle cx="50" cy="50" r="10" fill={Colors.bg} />
            </Svg>
          </Animated.View>
        );
      case 'Artificial Intelligence':
      case 'Design':
      case 'Innovation':
        return (
          <Animated.View style={{ width: '100%', height: '100%', transform: [{ scale }] }}>
            <Svg width="100%" height="100%" viewBox="0 0 100 100">
              <Path 
                d="M10,90 Q50,10 90,90" 
                fill="none" stroke={color} strokeWidth="4" 
              />
              <Path d="M10,90 Q50,50 90,90" fill="none" stroke={color} strokeWidth="2" strokeOpacity="0.5" />
              <Circle cx="50" cy="50" r="5" fill={color} />
            </Svg>
          </Animated.View>
        );
      default:
        // Generic Tech Geometry
        return (
          <Animated.View style={{ width: '100%', height: '100%', transform: [{ scale }] }}>
            <Svg width="100%" height="100%" viewBox="0 0 100 100">
              <Path 
                d="M50 10 L90 50 L50 90 L10 50 Z" 
                fill="none" stroke={color} strokeWidth="2"
              />
              <AnimatedPath 
                d="M50 25 L75 50 L50 75 L25 50 Z" 
                fill={color} 
                opacity={opacity as any} 
              />
            </Svg>
          </Animated.View>
        );
    }
  };

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: color + '10' }]} />
      <View style={styles.artContainer}>
        {renderArt()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  artContainer: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.8,
  }
});
