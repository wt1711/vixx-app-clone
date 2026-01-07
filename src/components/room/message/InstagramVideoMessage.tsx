import React from 'react';
import {
  StyleSheet,
  Text,
  Pressable,
  Linking,
} from 'react-native';
import { colors } from '../../../theme';

type InstagramVideoMessageProps = {
  instagramUrl: string;
  isOwn: boolean;
  onLongPress?: () => void;
};

export const InstagramVideoMessage = React.memo<InstagramVideoMessageProps>(
  ({ instagramUrl, isOwn, onLongPress }) => {
    const handlePress = () => {
      Linking.openURL(instagramUrl).catch(() => {});
    };

    const linkStyle = [
      styles.linkText,
      isOwn ? styles.linkTextOwn : styles.linkTextOther,
    ];

    return (
      <Pressable
        onPress={handlePress}
        onLongPress={onLongPress}
        delayLongPress={500}
        style={styles.container}
      >
        <Text style={linkStyle} numberOfLines={1}>
          {instagramUrl}
        </Text>
      </Pressable>
    );
  },
);

InstagramVideoMessage.displayName = 'InstagramVideoMessage';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  linkTextOwn: {
    color: colors.text.messageOwn,
  },
  linkTextOther: {
    color: colors.text.messageOther,
  },
});
