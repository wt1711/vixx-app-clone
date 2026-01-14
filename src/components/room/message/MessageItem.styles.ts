import { StyleSheet } from 'react-native';
import { colors } from '../../../theme';

export const styles = StyleSheet.create({
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 18,
    alignItems: 'flex-end',
  },
  messageOwn: {
    justifyContent: 'flex-end',
  },
  messageOther: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginRight: 8,
  },
  messageBubbleWrapper: {
    maxWidth: '75%',
  },
  messageBubble: {
    // Note: removed overflow: 'hidden' to prevent shadow clipping issues
  },
  messageBubbleOwn: {
    backgroundColor: colors.message.own,
    borderRadius: 20,
    // Slightly sharper bottom-right for own messages
    borderBottomRightRadius: 6,
    // Subtle glow to lift off carbon fibre background
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  messageBubbleOther: {
    backgroundColor: colors.message.other,
    // Notched corner: sharp bottom-left, rounded elsewhere
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 4,
  },
  messageBubbleContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    overflow: 'hidden',
  },
  messageBubbleContentImage: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  timestampRow: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  timestampText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.transparent.white50,
    textAlign: 'center',
  },
  imageContainer: {},
  messageImage: {
    backgroundColor: colors.transparent.white10,
  },
  messageImageOwn: {
    borderRadius: 20,
    borderBottomRightRadius: 6,
  },
  messageImageOther: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 4,
  },
  messageImageWithRatio: {
    maxWidth: 250,
    maxHeight: 300,
    width: '100%',
  },
  messageImageDefault: {
    width: 250,
    height: 200,
  },
  imageCaption: {
    marginTop: 8,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  messageTextOwn: {
    color: colors.text.messageOwn,
  },
  messageTextOther: {
    color: colors.text.messageOther,
  },
  linkText: {
    textDecorationLine: 'underline',
  },
  replyPreviewContainer: {
    marginBottom: 4,
    maxWidth: '75%',
  },
  replyPreviewOwn: {
    alignSelf: 'flex-end',
  },
  replyPreviewOther: {
    alignSelf: 'flex-start',
  },
  glassBorder: {
    ...StyleSheet.absoluteFillObject,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',    // subtle white top highlight
    borderLeftColor: 'rgba(255, 255, 255, 0.05)',   // subtle white left
    borderBottomColor: 'rgba(255, 255, 255, 0.12)', // white catchlight bottom
    borderRightColor: 'rgba(255, 255, 255, 0.08)',  // white catchlight right
  },
  stealthBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    borderBottomRightRadius: 6,
    borderWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',   // subtle white top
    borderLeftColor: 'rgba(255, 255, 255, 0.05)', // subtle white left
    borderBottomColor: 'rgba(255, 255, 255, 0.12)', // white catchlight bottom
    borderRightColor: 'rgba(255, 255, 255, 0.08)', // white catchlight right
  },
  // System message styles (welcome message, etc.)
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: 24,
    paddingHorizontal: 16,
  },
  systemMessageBubble: {
    backgroundColor: colors.background.elevated,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    maxWidth: '90%',
    overflow: 'hidden',
  },
  systemMessageBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  systemMessageText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  wavingHand: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 12,
  },
});
