import React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View, ViewProps } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/theme/ThemeProvider';

interface ScreenProps extends ViewProps {
  // Tab ekranlarında (home/diary/profile) alt boşluğu tab bar zaten yönetiyor — 'bottom' eklemek
  // gereksiz bir boşluk yaratır. Stack ekranlarında (login, onboarding, scan, ...) ise ekranın en
  // altındaki içerik/buton home indicator / gesture bar ile çakışabileceğinden 'bottom' gerekli.
  edges?: Edge[];
}

export function Screen({ style, children, edges = ['top'], ...rest }: ScreenProps) {
  const { colors, spacing } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={edges}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.flex, { padding: spacing.md }, style]} {...rest}>
          {children}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
});
