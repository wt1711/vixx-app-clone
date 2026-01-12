import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Easing,
  Keyboard,
  Image,
} from 'react-native';
import { Send, ImageIcon, X } from 'lucide-react-native';
// import { Camera } from 'lucide-react-native';
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
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [generationType, setGenerationType] = useState<'withIdea' | 'withoutIdea' | null>(null);
  const mx = getMatrixClient();
  const {
    pickAndSendImage,
    isUploading,
    // takeAndSendPhoto
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

  // Reasoning pill animation
  const reasoningAnim = useRef(new Animated.Value(0)).current;

  // Animate reasoning pill in/out
  useEffect(() => {
    if (parsedResponse?.reason) {
      Animated.spring(reasoningAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 10,
      }).start();
    } else {
      reasoningAnim.setValue(0);
    }
  }, [parsedResponse?.reason, reasoningAnim]);

  const reasoningAnimStyle = useMemo(() => ({
    opacity: reasoningAnim,
    transform: [
      {
        translateY: reasoningAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }),
      },
    ],
  }), [reasoningAnim]);

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

  // Track keyboard visibility
  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Use context's inputValue as the text input
  const inputText = inputValue;
  const setInputText = setInputValue;

  // Track the last AI-generated message to detect user edits
  const lastAIMessageRef = useRef<string | null>(null);

  // Update ref when AI generates a new response
  useEffect(() => {
    if (parsedResponse?.message) {
      lastAIMessageRef.current = parsedResponse.message.trim();
    }
  }, [parsedResponse?.message]);

  // Handle text changes - clear reasoning when user manually edits
  const handleTextChange = useCallback((text: string) => {
    // If user is editing (text differs from AI-generated message), clear reasoning
    if (parsedResponse && lastAIMessageRef.current !== null) {
      const trimmedText = text.trim();
      // Clear if user has modified the AI-generated text
      if (trimmedText !== lastAIMessageRef.current) {
        clearParsedResponse();
        lastAIMessageRef.current = null;
      }
    }
    setInputText(text);
  }, [parsedResponse, clearParsedResponse, setInputText]);

  const handleGenerateWithIdea = useCallback(() => {
    const idea = inputText.trim();
    setGenerationType('withIdea');
    generateInitialResponse(idea);
  }, [inputText, generateInitialResponse]);

  const handleGenerateWithoutIdea = useCallback(() => {
    setGenerationType('withoutIdea');
    generateInitialResponse();
  }, [generateInitialResponse]);

  const handleSend = useCallback(async () => {
    if (!inputText.trim() || !mx || sending) return;

    const text = inputText.trim();
    setInputText('');
    setSending(true);

    // Clear parsed response when sending
    clearParsedResponse();

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
  }, [inputText, mx, room, sending, setInputText, replyingTo, clearReply, clearParsedResponse]);

  return (
    <View style={styles.container}>
      {/* Reply Bar */}
      {replyingTo && (
        <View style={styles.replyBar}>
          <View style={styles.replyBarContent}>
            <View style={styles.replyBarIndicator} />
            <View style={styles.replyBarTextContainer}>
              <Text style={styles.replyBarLabel}>
                Replying to
                {/* {replyingTo.senderName} */}
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
      {/* AI Reasoning - Light/Transparent Style */}
      {parsedResponse?.reason && (
        <Animated.View style={[styles.reasoningLight, reasoningAnimStyle]}>
          <Text style={styles.reasoningEmoji}>💡</Text>
          <Text style={styles.reasoningText} numberOfLines={2}>
            {parsedResponse.reason}
          </Text>
          <TouchableOpacity
            onPress={clearParsedResponse}
            style={styles.reasoningClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X color={colors.text.tertiary} size={14} />
          </TouchableOpacity>
        </Animated.View>
      )}
      {/* Input Bar - Separate Pills */}
      <View style={styles.inputRow}>
        {/* Left Pill - Attachment or Use Idea */}
        {inputText.trim() && isKeyboardVisible ? (
          <TouchableOpacity
            style={[styles.circularPill, isGeneratingResponse && styles.pillDisabled]}
            onPress={handleGenerateWithIdea}
            disabled={isGeneratingResponse}
          >
            <Animated.View style={generationType === 'withIdea' ? { transform: [{ rotate: spin }] } : undefined}>
              <Text style={styles.useIdeaIcon}>✍️</Text>
            </Animated.View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.circularPill, isUploading && styles.pillDisabled]}
            onPress={pickAndSendImage}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator size="small" color={colors.text.white} />
            ) : (
              <ImageIcon color={colors.text.white} size={22} />
            )}
          </TouchableOpacity>
        )}

        {/* Center Pill - Text Input + Send Button */}
        <View style={styles.inputPill}>
          <TextInput
            style={styles.input}
            placeholder="Abcxyz"
            placeholderTextColor={colors.text.placeholder}
            value={inputText}
            onChangeText={handleTextChange}
            multiline
            maxLength={5000}
            onSubmitEditing={handleSend}
            editable={!sending && !isUploading}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || sending) && styles.pillDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color={colors.accent.primary} />
            ) : (
              <Send
                color={inputText.trim() ? colors.text.white : colors.text.tertiary}
                size={20}
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Right Pill - VIXX AI Button */}
        <TouchableOpacity
          style={[styles.circularPill, isGeneratingResponse && styles.pillDisabled]}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: 'transparent',
  },
  reasoningLight: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 6,
    backgroundColor: 'rgba(28, 32, 38, 0.85)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.transparent.white15,
  },
  reasoningEmoji: {
    fontSize: 14,
    marginRight: 8,
  },
  reasoningText: {
    flex: 1,
    fontSize: 12,
    color: colors.text.primary,
    lineHeight: 16,
  },
  reasoningClose: {
    padding: 4,
    marginLeft: 6,
  },
  // Row container for separate pills
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  // Circular pill (attachment, AI, send buttons)
  circularPill: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.liquidGlass.background,
    borderWidth: 1,
    borderColor: colors.liquidGlass.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillDisabled: {
    opacity: 0.5,
  },
  // Center text input pill
  inputPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    borderRadius: 22,
    backgroundColor: colors.liquidGlass.background,
    borderWidth: 1,
    borderColor: colors.liquidGlass.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    paddingLeft: 16,
    paddingRight: 6,
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text.input,
    borderWidth: 0,
    maxHeight: 100,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  vixxLogo: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.text.white,
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
  useIdeaIcon: {
    fontSize: 22,
  },
});
