import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from '@react-native-community/blur';
import { ChevronLeft, User } from 'lucide-react-native';
import { Room } from 'matrix-js-sdk';
import { getMatrixClient } from '../../matrixClient';
import { getRoomAvatarUrl } from '../../utils/room';
import { colors } from '../../theme';

type RoomViewHeaderProps = {
  room: Room;
  onBack: () => void;
  onAIAssistantClick: () => void;
};

export function RoomViewHeader({
  room,
  onBack,
}: // onAIAssistantClick,
RoomViewHeaderProps) {
  const mx = getMatrixClient();
  const insets = useSafeAreaInsets();

  // Use room.name directly - Matrix SDK handles the display name correctly
  const roomName = room.name || 'Unknown';

  // Get avatar from fallback member for direct messages, or room avatar
  const avatarUrl = mx ? getRoomAvatarUrl(mx, room, 96, true) : undefined;

  // Gradient height
  const gradientHeight = insets.top + 140;

  return (
    <>
      {/* Dark gradient for status bar area */}
      <LinearGradient
        colors={[
          'rgba(0, 0, 0, 0.7)',
          'rgba(0, 0, 0, 0.7)',
          'rgba(0, 0, 0, 0.5)',
          'rgba(0, 0, 0, 0.2)',
          'transparent',
        ]}
        locations={[0, 0.4, 0.6, 0.85, 1]}
        style={[styles.gradientOverlay, { height: gradientHeight }]}
        pointerEvents="none"
      />
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        {/* Name - Absolute center */}
        <View style={[styles.centerContainer, { top: insets.top + 8 }]}>
          <View style={styles.namePillContainer}>
            <BlurView
              style={StyleSheet.absoluteFill}
              blurType="dark"
              blurAmount={25}
              reducedTransparencyFallbackColor="rgba(30, 35, 45, 0.9)"
            />
            <View style={styles.glassHighlight} pointerEvents="none" />
            <View style={styles.namePillContent}>
              <Text style={styles.roomName} numberOfLines={1}>
                {roomName}
              </Text>
            </View>
          </View>
        </View>

        {/* Back Button - Left */}
        <View style={styles.backPillContainer}>
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="dark"
            blurAmount={25}
            reducedTransparencyFallbackColor="rgba(30, 35, 45, 0.9)"
          />
          <View style={styles.glassHighlightRound} pointerEvents="none" />
          <TouchableOpacity onPress={onBack} style={styles.backPillContent}>
            <ChevronLeft color={colors.text.primary} size={24} />
          </TouchableOpacity>
        </View>

        {/* Avatar - Right */}
        <View style={styles.avatarPillContainer}>
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="dark"
            blurAmount={25}
            reducedTransparencyFallbackColor="rgba(30, 35, 45, 0.9)"
          />
          <View style={styles.glassHighlightRound} pointerEvents="none" />
          <View style={styles.avatarPillContent}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <User color={colors.text.secondary} size={20} />
            )}
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'transparent',
    // Position absolute to float over content
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  // Name absolutely centered
  centerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 0,
  },
  // Back button container with blur
  backPillContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  backPillContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Circular glass highlight for round pills
  glassHighlightRound: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 22,
    borderWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.25)',
    borderLeftColor: 'rgba(255, 255, 255, 0.15)',
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    borderRightColor: 'rgba(255, 255, 255, 0.08)',
  },
  // Name pill container with blur
  namePillContainer: {
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  namePillContent: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Stadium-shaped glass highlight for name pill
  glassHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 22,
    borderWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.25)',
    borderLeftColor: 'rgba(255, 255, 255, 0.15)',
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    borderRightColor: 'rgba(255, 255, 255, 0.08)',
  },
  roomName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
  },
  // Avatar pill container with blur
  avatarPillContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarPillContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});
