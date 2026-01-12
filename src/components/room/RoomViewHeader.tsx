import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
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
          <View style={styles.namePill}>
            <Text style={styles.roomName} numberOfLines={1}>
              {roomName}
            </Text>
          </View>
        </View>

        {/* Back Button - Left */}
        <TouchableOpacity onPress={onBack} style={styles.backPill}>
          <ChevronLeft color={colors.text.primary} size={24} />
        </TouchableOpacity>

        {/* Avatar - Right */}
        <View style={styles.avatarPill}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          ) : (
            <User color={colors.text.secondary} size={20} />
          )}
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
  // Back button - circular pill
  backPill: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.liquidGlass.background,
    borderWidth: 1,
    borderColor: colors.liquidGlass.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  // Name - center pill (same height as circular pills)
  namePill: {
    height: 44,
    paddingHorizontal: 20,
    borderRadius: 22,
    backgroundColor: colors.liquidGlass.background,
    borderWidth: 1,
    borderColor: colors.liquidGlass.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roomName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
  },
  // Avatar pill - right side
  avatarPill: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.liquidGlass.background,
    borderWidth: 1,
    borderColor: colors.liquidGlass.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});
