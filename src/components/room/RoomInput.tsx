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
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { Send, ImageIcon, X, Lightbulb, Sparkles } from 'lucide-react-native';
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

  // Pulse animation for sparkles icon
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Height animations for reasoning pill and reply bar
  const reasoningHeight = useRef(new Animated.Value(0)).current;
  const replyHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(reasoningHeight, {
      toValue: parsedResponse?.reason ? 1 : 0,
      useNativeDriver: false,
      friction: 10,
      tension: 80,
    }).start();
  }, [parsedResponse?.reason, reasoningHeight]);

  useEffect(() => {
    Animated.spring(replyHeight, {
      toValue: replyingTo ? 1 : 0,
      useNativeDriver: false,
      friction: 10,
      tension: 80,
    }).start();
  }, [replyingTo, replyHeight]);

  const reasoningAnimatedStyle = {
    maxHeight: reasoningHeight.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 100],
    }),
    opacity: reasoningHeight,
    marginBottom: reasoningHeight.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 8],
    }),
  };

  const replyAnimatedStyle = {
    maxHeight: replyHeight.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 60],
    }),
    opacity: replyHeight,
    marginBottom: replyHeight.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 8],
    }),
  };

  useEffect(() => {
    if (isGeneratingResponse) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 400,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );
      animation.start();
      return () => animation.stop();
    } else {
      pulseAnim.setValue(1);
      setGenerationType(null);
    }
  }, [isGeneratingResponse, pulseAnim]);

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
      {/* AI Reasoning Pill - Animated */}
      <Animated.View style={[styles.reasoningPillWrapper, reasoningAnimatedStyle]}>
        {parsedResponse?.reason && (
          <View style={styles.reasoningPill}>
            {/* Outline only - no fill */}
            <View style={styles.reasoningBorder} pointerEvents="none" />
            <View style={styles.reasoningIcon}>
              <Lightbulb color={colors.text.primary} size={18} />
            </View>
            <Text style={styles.reasoningText}>{parsedResponse.reason}</Text>
            <TouchableOpacity onPress={clearParsedResponse} style={styles.reasoningClose}>
              <X color={colors.text.secondary} size={16} />
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>

      {/* Reply Bar - Animated */}
      <Animated.View style={[styles.replyBarWrapper, replyAnimatedStyle]}>
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
      </Animated.View>

      {/* Input Row - Unified Bar + Separate Send */}
      <View style={styles.inputRow}>
        {/* Unified Input Bar - attach, text, AI */}
        <View style={styles.unifiedInputBar}>
          {/* Blur background layer */}
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="dark"
            blurAmount={25}
            reducedTransparencyFallbackColor="rgba(30, 35, 45, 0.9)"
          />
          {/* Dark overlay for deeper black */}
          <View style={styles.darkOverlay} pointerEvents="none" />
          {/* Border highlight overlay for liquid glass effect */}
          <View style={styles.glassHighlight} pointerEvents="none" />

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
            <Animated.View style={generationType === 'withoutIdea' ? { transform: [{ scale: pulseAnim }] } : undefined}>
              <Sparkles color={colors.accent.primary} size={20} />
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* Separate Send Button */}
        <View style={styles.sendPillContainer}>
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="dark"
            blurAmount={25}
            reducedTransparencyFallbackColor="rgba(30, 35, 45, 0.9)"
          />
          {/* Dark overlay for deeper black */}
          <View style={styles.darkOverlay} pointerEvents="none" />
          <View style={styles.glassHighlightRound} pointerEvents="none" />
          <TouchableOpacity
            style={[styles.sendPillContent, (!inputText.trim() || sending) && styles.pillDisabled]}
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
  // Unified input bar containing attach, text, and AI - RECESSED style
  unifiedInputBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    borderRadius: 22,
    overflow: 'hidden', // Required for BlurView borderRadius
    paddingHorizontal: 4,
    // No outer shadow - recessed elements don't cast shadows
  },
  // Dark overlay for deeper black on input elements
  darkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 22,
  },
  // Subtle visible border for definition
  glassHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
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
  // Send button container with blur - RECESSED style
  sendPillContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    // No outer shadow - recessed elements don't cast shadows
  },
  // Subtle visible border for send button
  glassHighlightRound: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  // Send button touchable content
  sendPillContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillDisabled: {
    opacity: 0.5,
  },
  aiButton: {
    // No background - orange icon only
  },
  // Wrapper for animated height
  replyBarWrapper: {
    overflow: 'hidden',
  },
  replyBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.transparent.inputBar,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
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
  // Wrapper for animated height
  reasoningPillWrapper: {
    overflow: 'hidden',
  },
  // AI Reasoning Pill styles - lightweight with subtle background
  reasoningPill: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    // Subtle dark background to prevent text bleed-through
    backgroundColor: 'rgba(10, 10, 15, 0.85)',
  },
  // Subtle outline border
  reasoningBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
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
