import React, { useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView, VibrancyView } from '@react-native-community/blur';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { ChevronLeft, User } from 'lucide-react-native';
import { Room } from 'matrix-js-sdk';
import { getMatrixClient } from '../../matrixClient';
import { getRoomAvatarUrl } from '../../utils/room';
import { colors } from '../../theme';

type RoomViewHeaderProps = {
  room: Room;
  onBack: () => void;
  onAIAssistantClick?: () => void;
};

export function RoomViewHeader({
  room,
  onBack,
}: // onAIAssistantClick,
RoomViewHeaderProps) {
  const mx = getMatrixClient();
  const insets = useSafeAreaInsets();

  const roomName = room.name || 'Unknown';
  const avatarUrl = mx ? getRoomAvatarUrl(mx, room, 96, true) : undefined;

  // Press animation for back button using standard Animated API
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 0.9,
        useNativeDriver: true,
        friction: 8,
        tension: 100,
      }),
      Animated.spring(opacity, {
        toValue: 0.8,
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

  const handlePress = useCallback(() => {
    ReactNativeHapticFeedback.trigger('impactLight');
    onBack();
  }, [onBack]);

  return (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      {/* Header content */}
      <View style={styles.headerContent}>
        {/* Back Button - premium liquid glass pill */}
        <Animated.View
          style={[
            styles.pillContainer,
            {
              transform: [{ scale: scale }],
              opacity: opacity,
            },
          ]}
        >
          {/* Layer 1: BlurView with materialDark for richer glass */}
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="materialDark"
            blurAmount={20}
            reducedTransparencyFallbackColor="rgba(40, 40, 50, 0.9)"
          />
          {/* Layer 2: VibrancyView for enhanced depth */}
          <VibrancyView
            style={StyleSheet.absoluteFill}
            blurType="materialDark"
            blurAmount={10}
          />
          {/* Layer 3: Directional borders (brighter) */}
          <View style={styles.pillBorder} />
          {/* Layer 4: Pressable content */}
          <Pressable
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={styles.pillContent}
          >
            <ChevronLeft color={colors.text.primary} size={24} />
          </Pressable>
        </Animated.View>

        {/* Avatar + Name - inline, no container */}
        <TouchableOpacity style={styles.profileSection} activeOpacity={0.7}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <User color={colors.text.secondary} size={16} />
            </View>
          )}
          <Text style={styles.roomName} numberOfLines={1}>
            {roomName}
          </Text>
        </TouchableOpacity>

        {/* Spacer for balance */}
        <View style={styles.spacer} />
      </View>
    </View>
  );
}

const PILL_HEIGHT = 44;

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    backgroundColor: 'transparent',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
    gap: 10,
  },
  // Back button - liquid glass pill (matches SettingsScreen)
  pillContainer: {
    width: PILL_HEIGHT,
    height: PILL_HEIGHT,
    borderRadius: PILL_HEIGHT / 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  pillBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: PILL_HEIGHT / 2,
    borderWidth: 1,
    // Brighter directional borders for premium glass effect
    borderTopColor: 'rgba(255, 255, 255, 0.35)',
    borderLeftColor: 'rgba(255, 255, 255, 0.25)',
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    borderRightColor: 'rgba(255, 255, 255, 0.12)',
  },
  pillContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Profile section - inline avatar + name (no container)
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarPlaceholder: {
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    maxWidth: 180,
  },
  spacer: {
    flex: 1,
  },
});
