import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from '@react-native-community/blur';
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

  // Use room.name directly - Matrix SDK handles the display name correctly
  const roomName = room.name || 'Unknown';

  // Get avatar from fallback member for direct messages, or room avatar
  const avatarUrl = mx ? getRoomAvatarUrl(mx, room, 96, true) : undefined;

  return (
    <>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        {/* Name - Absolute center */}
        <View style={[styles.centerContainer, { top: insets.top + 8 }]}>
          <View style={styles.namePillContainer}>
            <BlurView
              style={StyleSheet.absoluteFill}
              blurType="ultraThinMaterialDark"
              blurAmount={10}
              reducedTransparencyFallbackColor="rgba(30, 35, 45, 0.6)"
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
        <View style={styles.pillContainer}>
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="ultraThinMaterialDark"
            blurAmount={10}
            reducedTransparencyFallbackColor="rgba(30, 35, 45, 0.6)"
          />
          <View style={styles.glassHighlightRound} pointerEvents="none" />
          <TouchableOpacity onPress={onBack} style={styles.pillContent}>
            <ChevronLeft color={colors.text.primary} size={24} />
          </TouchableOpacity>
        </View>

        {/* Avatar - Right */}
        <View style={styles.pillContainer}>
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="ultraThinMaterialDark"
            blurAmount={10}
            reducedTransparencyFallbackColor="rgba(30, 35, 45, 0.6)"
          />
          <View style={styles.glassHighlightRound} pointerEvents="none" />
          <View style={styles.pillContent}>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  centerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  // Circular pill container with blur
  pillContainer: {
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
  pillContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  // Directional border highlights for liquid glass effect
  glassHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 22,
    borderWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.35)',
    borderLeftColor: 'rgba(255, 255, 255, 0.2)',
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
  },
  glassHighlightRound: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 22,
    borderWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.35)',
    borderLeftColor: 'rgba(255, 255, 255, 0.2)',
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
  },
  roomName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});
