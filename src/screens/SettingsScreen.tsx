import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  Animated,
  Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { CarbonFiberTexture } from '../components/ui/NoiseTexture';
import { BlurView } from '@react-native-community/blur';
import { ChevronLeft, Sparkles } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
// import { useAuth } from '../context/AuthContext';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { colors } from '../theme';
import { getMatrixClient } from '../matrixClient';
import { getCreditsRemaining } from '../services/aiService';
import { useChatWithFounder } from '../hooks/useChatWithFounder';

type SettingsScreenProps = {
  onBack: () => void;
  onSelectRoom: (roomId: string) => void;
};

export function SettingsScreen({ onBack, onSelectRoom }: SettingsScreenProps) {
  const insets = useSafeAreaInsets();
  // const { logout } = useAuth();
  const mx = getMatrixClient();
  const { handleChatWithFounder, founderAvatar } =
    useChatWithFounder(onSelectRoom);

  const [creditsInfo, setCreditsInfo] = useState<{
    remaining: number;
    total: number;
  } | null>(null);

  // Waving hand animation
  const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const waveSequence = Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 150,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim, {
          toValue: -1,
          duration: 150,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 150,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim, {
          toValue: 0,
          duration: 150,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.delay(2000), // Pause between waves
      ]),
    );
    waveSequence.start();
    return () => waveSequence.stop();
  }, [waveAnim]);

  const waveRotation = waveAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-20deg', '0deg', '20deg'],
  });

  useEffect(() => {
    const fetchCredits = async () => {
      const userId = mx?.getUserId();
      if (userId) {
        const info = await getCreditsRemaining(userId);
        setCreditsInfo({
          remaining: info.creditsRemaining,
          total: info.totalCredits,
        });
      }
    };
    fetchCredits();
  }, [mx]);

  return (
    <View style={styles.container}>
      {/* Solid black background */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#000000' }]} />
      {/* Carbon fiber weave texture */}
      <CarbonFiberTexture opacity={0.6} scale={0.5} />

      {/* Header - flat title + liquid glass back pill */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        {/* Back pill - liquid glass */}
        <View style={styles.backPill}>
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="dark"
            blurAmount={20}
            reducedTransparencyFallbackColor="rgba(40, 40, 50, 0.9)"
          />
          <View style={styles.pillGlassHighlight} pointerEvents="none" />
          <TouchableOpacity
            onPress={onBack}
            style={styles.pillButton}
            activeOpacity={0.7}
          >
            <ChevronLeft color={colors.text.primary} size={24} />
          </TouchableOpacity>
        </View>

        {/* Flat title */}
        <Text style={styles.headerTitle}>Settings</Text>

        {/* Spacer for balance */}
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Credits Section */}
        <View style={styles.creditsSection}>
          {/* Credits Row */}
          <View style={styles.creditsRow}>
            <Text style={styles.creditsLabel}>Credits</Text>
            <Text style={styles.creditsValue}>
              {creditsInfo !== null ? `${creditsInfo.remaining} left` : '—'}
            </Text>
          </View>

          {/* Credits count */}
          <Text style={styles.creditsCount}>
            {creditsInfo !== null
              ? `${creditsInfo.total - creditsInfo.remaining} / ${creditsInfo.total} credits`
              : '— / — credits'}
          </Text>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width:
                    creditsInfo !== null
                      ? `${((creditsInfo.total - creditsInfo.remaining) / creditsInfo.total) * 100}%`
                      : '0%',
                },
              ]}
            />
          </View>

          {/* Upgrade Button */}
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => {
              ReactNativeHapticFeedback.trigger('impactLight', {
                enableVibrateFallback: true,
                ignoreAndroidSystemSettings: false,
              });
              Alert.alert('Coming Soon', 'Premium upgrade will be available soon!');
            }}
            activeOpacity={0.7}
          >
            <Sparkles color={colors.accent.primary} size={18} />
            <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
          </TouchableOpacity>
        </View>

        {/* Contact Team - Speech bubble + Avatar */}
        <TouchableOpacity
          style={styles.contactTeamContainer}
          onPress={() => {
            ReactNativeHapticFeedback.trigger('impactLight', {
              enableVibrateFallback: true,
              ignoreAndroidSystemSettings: false,
            });
            handleChatWithFounder();
          }}
          activeOpacity={0.8}
        >
          {/* Speech Bubble with tail - single SVG unit */}
          <View style={styles.speechBubbleContainer}>
            {/* SVG bubble + tail as one path */}
            <Svg
              width={200}
              height={70}
              viewBox="0 0 200 70"
              style={styles.bubbleSvg}
            >
              {/* Single path: rounded rect + curved tail */}
              <Path
                d="M20 0
                   H180
                   Q200 0 200 20
                   V40
                   Q200 60 180 60
                   H112
                   L108 68
                   Q106 70 104 68
                   L100 60
                   H20
                   Q0 60 0 40
                   V20
                   Q0 0 20 0
                   Z"
                fill="rgba(255, 255, 255, 0.08)"
                stroke="rgba(255, 255, 255, 0.15)"
                strokeWidth={1}
              />
            </Svg>
            {/* Text content positioned over the SVG */}
            <View style={styles.speechBubbleContent}>
              <Text style={styles.speechBubbleText}>Chat với team</Text>
              <Animated.Text
                style={[
                  styles.wavingEmoji,
                  { transform: [{ rotate: waveRotation }] },
                ]}
              >
                👋
              </Animated.Text>
            </View>
          </View>

          {/* Founder Avatar */}
          <Image source={founderAvatar} style={styles.founderAvatar} />
        </TouchableOpacity>

        {/* Logout Button */}
        {/* <TouchableOpacity
          style={styles.logoutButton}
          onPress={logout}
          activeOpacity={0.7}
        >
          <LogOut color={colors.status.error} size={20} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backPill: {
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
  pillButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillGlassHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 22,
    borderWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.25)',
    borderLeftColor: 'rgba(255, 255, 255, 0.15)',
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    borderRightColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
  },
  headerSpacer: {
    width: 44,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  // Credits Section
  creditsSection: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 24,
    // Visible border like screenshot
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  creditsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  creditsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  creditsValue: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  creditsCount: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderRadius: 8,
    paddingVertical: 12,
  },
  upgradeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3B82F6',
  },
  // Contact Team - Fun speech bubble design
  contactTeamContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  speechBubbleContainer: {
    width: 200,
    height: 70,
    marginBottom: 8,
  },
  bubbleSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  speechBubbleContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60, // Height of bubble without tail
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  speechBubbleText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    letterSpacing: 0.2,
  },
  wavingEmoji: {
    fontSize: 24,
  },
  founderAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.transparent.white05,
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: colors.status.error,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.status.error,
  },
});
