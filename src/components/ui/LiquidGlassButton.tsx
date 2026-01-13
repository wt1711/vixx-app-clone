import React, { useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  Animated,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { LiquidGlassView, isLiquidGlassSupported } from '@callstack/liquid-glass';
import { BlurView } from '@react-native-community/blur';

type LiquidGlassButtonProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  effect?: 'regular' | 'clear';
  onPress?: () => void;
  disabled?: boolean;
  borderRadius?: number;
};

export function LiquidGlassButton({
  children,
  style,
  contentStyle,
  effect = 'regular',
  onPress,
  disabled,
  borderRadius = 20,
}: LiquidGlassButtonProps) {
  // Press animation for fallback
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 0.96,
        useNativeDriver: true,
        friction: 8,
        tension: 100,
      }),
      Animated.spring(opacity, {
        toValue: 0.85,
        useNativeDriver: true,
        friction: 8,
        tension: 100,
      }),
    ]).start();
  }, [scale, opacity]);

  const handlePressOut = useCallback(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
        tension: 100,
      }),
      Animated.spring(opacity, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
        tension: 100,
      }),
    ]).start();
  }, [scale, opacity]);

  // iOS 26+: Use native LiquidGlassView
  if (isLiquidGlassSupported) {
    return (
      <LiquidGlassView
        style={[styles.container, { borderRadius }, style]}
        effect={effect}
        interactive
      >
        <Pressable
          onPress={onPress}
          disabled={disabled}
          style={[styles.content, contentStyle]}
        >
          {children}
        </Pressable>
      </LiquidGlassView>
    );
  }

  // Fallback for older iOS: BlurView + dark overlay + directional border
  return (
    <Animated.View
      style={[
        styles.container,
        { borderRadius },
        style,
        { transform: [{ scale }], opacity },
      ]}
    >
      {/* Layer 1: Blur backdrop */}
      <BlurView
        style={[StyleSheet.absoluteFill, { borderRadius }]}
        blurType="thinMaterialDark"
        blurAmount={25}
        reducedTransparencyFallbackColor="rgba(30, 35, 45, 0.9)"
      />
      {/* Layer 2: Dark overlay for deeper black */}
      <View style={[styles.darkOverlay, { borderRadius }]} />
      {/* Layer 3: Subtle border */}
      <View style={[styles.border, { borderRadius }]} />
      {/* Layer 4: Content */}
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[styles.content, contentStyle]}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    // No shadow - recessed dark style like input field
  },
  // Dark overlay for deeper black (matches input field)
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  // Directional border for liquid glass effect - light from top-left
  border: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.25)',
    borderLeftColor: 'rgba(255, 255, 255, 0.18)',
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    borderRightColor: 'rgba(255, 255, 255, 0.10)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 12,
  },
});

export { isLiquidGlassSupported };
