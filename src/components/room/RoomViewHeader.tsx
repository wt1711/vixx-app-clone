import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
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

  const roomName = room.name || 'Unknown';
  const avatarUrl = mx ? getRoomAvatarUrl(mx, room, 96, true) : undefined;

  return (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      {/* Solid color overlay - matches list screen */}
      <View style={[styles.solidOverlay, { top: -insets.top }]} />

      {/* Header content */}
      <View style={styles.headerContent}>
        {/* Back Button - liquid glass pill */}
        <View style={styles.pillContainer}>
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="dark"
            blurAmount={20}
            reducedTransparencyFallbackColor="rgba(40, 40, 50, 0.9)"
          />
          <View style={styles.pillBorder} />
          <TouchableOpacity onPress={onBack} style={styles.pillContent} activeOpacity={0.7}>
            <ChevronLeft color={colors.text.primary} size={24} />
          </TouchableOpacity>
        </View>

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
  solidOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: -5,
    backgroundColor: 'rgba(13, 13, 13, 0.9)', // #0D0D0D at 90% opacity
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
    borderTopColor: 'rgba(255, 255, 255, 0.25)',
    borderLeftColor: 'rgba(255, 255, 255, 0.15)',
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    borderRightColor: 'rgba(255, 255, 255, 0.08)',
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
