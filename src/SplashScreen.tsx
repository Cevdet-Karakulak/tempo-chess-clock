import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const splashIcon = require('../assets/splash-icon.png');

interface SplashScreenProps {
  onFinish?: () => void;
  language?: 'tr' | 'en';
}

export function SplashScreen({ onFinish, language = 'tr' }: SplashScreenProps) {
  const [visible, setVisible] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const contentFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Entrance animation: smooth fade in & gentle scale up
    Animated.parallel([
      Animated.timing(contentFade, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Stay on screen, then exit smoothly
    const timer = setTimeout(() => {
      dismiss();
    }, 1300);

    return () => clearTimeout(timer);
  }, []);

  function dismiss() {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 350,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      onFinish?.();
    });
  }

  if (!visible) return null;

  const isEn = language === 'en';

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        styles.container,
        { opacity: fadeAnim },
      ]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <Pressable style={styles.pressable} onPress={dismiss}>
        <View style={styles.glow} />

        <Animated.View
          style={[
            styles.content,
            {
              opacity: contentFade,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Logo Icon */}
          <View style={styles.iconWrapper}>
            <Image
              source={splashIcon}
              style={styles.icon}
              resizeMode="contain"
            />
          </View>

          {/* Typography */}
          <View style={styles.branding}>
            <View style={styles.wordmarkRow}>
              <Text style={styles.wordmark}>tempo</Text>
              <View style={styles.limeDot} />
            </View>

            <Text style={styles.subtitle}>
              {isEn ? 'CHESS CLOCK' : 'SATRANÇ SAATİ'}
            </Text>

            <View style={styles.accentBar} />

            <Text style={styles.tagline}>
              {isEn ? 'PRECISION TIME CONTROL' : 'HASSAS ZAMAN KONTROLÜ'}
            </Text>
          </View>
        </Animated.View>

        {/* Footer */}
        <Animated.View style={[styles.footer, { opacity: contentFade }]}>
          <Text style={styles.corpName}>FLOPPATECH CORP</Text>
          <Text style={styles.corpSub}>PRECISION CHESS ENGINE · v1.0.3</Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0A0E12',
    zIndex: 99999,
    elevation: 99999,
  },
  pressable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  glow: {
    position: 'absolute',
    top: '38%',
    left: '50%',
    width: 320,
    height: 320,
    marginLeft: -160,
    marginTop: -160,
    borderRadius: 160,
    backgroundColor: '#84E3470D',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 220,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  icon: {
    width: '100%',
    height: '100%',
  },
  branding: {
    alignItems: 'center',
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  wordmark: {
    fontSize: 64,
    fontWeight: '900',
    letterSpacing: -2,
    color: '#F8FAFC',
    includeFontPadding: false,
  },
  limeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#84E347',
    marginLeft: 4,
    marginBottom: 10,
    shadowColor: '#84E347',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 6,
    color: '#94A3B8',
    marginTop: 8,
    marginLeft: 6,
  },
  accentBar: {
    width: 48,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#84E347',
    marginTop: 14,
  },
  tagline: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 3,
    color: '#64748B',
    marginTop: 14,
  },
  footer: {
    alignItems: 'center',
    gap: 4,
  },
  corpName: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 4,
    color: '#64748B',
  },
  corpSub: {
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 2,
    color: '#475569',
  },
});
