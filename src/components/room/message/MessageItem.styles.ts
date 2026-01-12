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
    overflow: 'hidden',
    shadowColor: colors.background.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 20,
    elevation: 6,
  },
  messageBubbleOwn: {
    backgroundColor: colors.message.own,
    borderRadius: 20,
    // Slightly sharper bottom-right for own messages
    borderBottomRightRadius: 6,
  },
  messageBubbleOther: {
    backgroundColor: colors.message.other,
    // Notched corner: sharp bottom-left, rounded elsewhere
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.message.otherBorder,
    shadowColor: colors.shadow.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 4,
  },
  messageBubbleContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
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
});
