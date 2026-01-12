import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Easing,
  Image,
} from 'react-native';
import { Send, ImageIcon, X, Lightbulb } from 'lucide-react-native';
import { useAIAssistant } from '../../context/AIAssistantContext';
import { useReply } from '../../context/ReplyContext';
import { EventType, Room } from 'matrix-js-sdk';
import { MsgType, ContentKey } from '../../types/matrix/room';
import { getMatrixClient } from '../../matrixClient';
import { useImageSender } from '../../hooks/message/useImageSender';
import { colors } from '../../theme';

type RoomInputProps = {
  room: Room;
};

export function RoomInput({ room }: RoomInputProps) {
  const [sending, setSending] = useState(false);
  const [generationType, setGenerationType] = useState<'withIdea' | 'withoutIdea' | null>(null);
  const mx = getMatrixClient();
  const {
    pickAndSendImage,
    isUploading,
  } = useImageSender(room.roomId);
  const {
    generateInitialResponse,
    isGeneratingResponse,
    inputValue,
    setInputValue,
    parsedResponse,
    clearParsedResponse,
  } = useAIAssistant();
  const { replyingTo, clearReply } = useReply();

  // Rotation animation for vixx logo
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isGeneratingResponse) {
      const animation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      );
      animation.start();
      return () => animation.stop();
    } else {
      rotateAnim.setValue(0);
      setGenerationType(null);
    }
  }, [isGeneratingResponse, rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Use context's inputValue as the text input
  const inputText = inputValue;
  const setInputText = setInputValue;

  // Clear reasoning when user edits the input
  const handleTextChange = useCallback((text: string) => {
    if (parsedResponse) {
      clearParsedResponse();
    }
    setInputText(text);
  }, [parsedResponse, clearParsedResponse, setInputText]);

  const handleGenerateWithoutIdea = useCallback(() => {
    setGenerationType('withoutIdea');
    generateInitialResponse();
  }, [generateInitialResponse]);

  const handleSend = useCallback(async () => {
    if (!inputText.trim() || !mx || sending) return;

    const text = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      // Build the message content with optional reply relation
      const content = replyingTo
        ? {
            msgtype: MsgType.Text,
            body: text,
            [ContentKey.RelatesTo]: {
              [ContentKey.InReplyTo]: {
                event_id: replyingTo.eventId,
              },
            },
          }
        : {
            msgtype: MsgType.Text,
            body: text,
          };

      if (replyingTo) {
        clearReply();
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await mx.sendEvent(room.roomId, EventType.RoomMessage, content as any);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Restore text on error
      setInputText(text);
    } finally {
      setSending(false);
    }
  }, [inputText, mx, room, sending, setInputText, replyingTo, clearReply]);

  return (
    <View style={styles.container}>
      {/* AI Reasoning Pill */}
      {parsedResponse && parsedResponse.reason && (
        <View style={styles.reasoningPill}>
          <View style={styles.reasoningIcon}>
            <Lightbulb color={colors.text.primary} size={18} />
          </View>
          <Text style={styles.reasoningText}>{parsedResponse.reason}</Text>
          <TouchableOpacity onPress={clearParsedResponse} style={styles.reasoningClose}>
            <X color={colors.text.secondary} size={16} />
          </TouchableOpacity>
        </View>
      )}

      {/* Reply Bar */}
      {replyingTo && (
        <View style={styles.replyBar}>
          <View style={styles.replyBarContent}>
            <View style={styles.replyBarIndicator} />
            <View style={styles.replyBarTextContainer}>
              <Text style={styles.replyBarLabel}>
                Replying to
              </Text>
              <Text style={styles.replyBarMessage} numberOfLines={1}>
                {replyingTo.msgtype === MsgType.Image
                  ? 'Photo'
                  : replyingTo.content}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={clearReply} style={styles.replyBarClose}>
            <X color={colors.text.secondary} size={18} />
          </TouchableOpacity>
        </View>
      )}

      {/* Input Row - Unified Bar + Separate Send */}
      <View style={styles.inputRow}>
        {/* Unified Input Bar - attach, text, AI */}
        <View style={styles.unifiedInputBar}>
          {/* Left - Attachment Button */}
          <TouchableOpacity
            style={[styles.inputBarIcon, isUploading && styles.pillDisabled]}
            onPress={pickAndSendImage}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator size="small" color={colors.text.white} />
            ) : (
              <ImageIcon color={colors.text.white} size={20} />
            )}
          </TouchableOpacity>

          {/* Center - Text Input */}
          <TextInput
            style={styles.inputBarText}
            placeholder="flirt with her..."
            placeholderTextColor={colors.text.placeholder}
            value={inputText}
            onChangeText={handleTextChange}
            multiline
            maxLength={5000}
            onSubmitEditing={handleSend}
            editable={!sending && !isUploading}
          />

          {/* Right - VIXX AI Button */}
          <TouchableOpacity
            style={[styles.inputBarIcon, styles.aiButton]}
            onPress={handleGenerateWithoutIdea}
            disabled={isGeneratingResponse}
          >
            <Animated.View style={generationType === 'withoutIdea' ? { transform: [{ rotate: spin }] } : undefined}>
              <Image
                source={require('../../../assets/logo.png')}
                style={styles.vixxLogo}
              />
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* Separate Send Button */}
        <TouchableOpacity
          style={[styles.sendPill, (!inputText.trim() || sending) && styles.pillDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color={colors.text.white} />
          ) : (
            <Send
              color={inputText.trim() ? colors.text.white : colors.text.tertiary}
              size={22}
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: 'transparent',
  },
  // Row container for unified bar + send button
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  // Unified input bar containing attach, text, and AI
  unifiedInputBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    borderRadius: 22,
    backgroundColor: '#232A36',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 4,
  },
  // Icon buttons inside the unified bar
  inputBarIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Text input inside unified bar
  inputBarText: {
    flex: 1,
    fontSize: 16,
    color: colors.text.input,
    paddingHorizontal: 8,
    paddingVertical: 8,
    maxHeight: 100,
  },
  // Separate send button pill
  sendPill: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#232A36',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillDisabled: {
    opacity: 0.5,
  },
  aiButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 18,
  },
  vixxLogo: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  replyBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.transparent.inputBar,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.transparent.white15,
  },
  replyBarContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyBarIndicator: {
    width: 3,
    height: 32,
    backgroundColor: colors.accent.primary,
    borderRadius: 2,
    marginRight: 10,
  },
  replyBarTextContainer: {
    flex: 1,
  },
  replyBarLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent.primary,
    marginBottom: 2,
  },
  replyBarMessage: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  replyBarClose: {
    padding: 4,
    marginLeft: 8,
  },
  // AI Reasoning Pill styles
  reasoningPill: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.liquidGlass.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.liquidGlass.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  reasoningIcon: {
    marginRight: 10,
  },
  reasoningText: {
    flex: 1,
    fontSize: 13,
    color: colors.text.primary,
    lineHeight: 18,
  },
  reasoningClose: {
    padding: 4,
    marginLeft: 8,
    marginTop: -2,
  },
});
