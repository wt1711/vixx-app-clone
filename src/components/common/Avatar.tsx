import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import { getInitials } from '../../utils/stringUtils';
import { colors } from '../../theme';
import { FOUNDER_ROOM_NAME, FOUNDER_AVATAR_URL } from '../../constants/founder';

export type AvatarProps = {
  avatarUrl?: string;
  name?: string;
  initials?: string;
  size?: number;
};

export const Avatar = ({
  avatarUrl,
  name,
  initials,
  size = 32,
}: AvatarProps) => {
  const displayInitials = initials ?? (name ? getInitials(name) : '?');
  const borderRadius = size / 2;

  const sizeStyle = {
    width: size,
    height: size,
    borderRadius,
  };

  // Use founder avatar for founder room
  const resolvedAvatarUrl = name === FOUNDER_ROOM_NAME ? FOUNDER_AVATAR_URL : avatarUrl;

  if (resolvedAvatarUrl) {
    return <Image source={{ uri: resolvedAvatarUrl }} style={[styles.avatar, sizeStyle]} />;
  }

  return (
    <View style={[styles.avatar, styles.placeholder, sizeStyle]}>
      <Text style={[styles.text, { fontSize: size * 0.375 }]}>
        {displayInitials}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    borderWidth: 2,
    borderColor: colors.transparent.white30,
  },
  placeholder: {
    backgroundColor: colors.background.elevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: colors.text.secondary,
    fontWeight: 'bold',
  },
});
