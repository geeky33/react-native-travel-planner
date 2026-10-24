import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { useUiState } from '../dom/uiHelper';

// Floating status box shown bottom-right
// (same look as the #dart-dom-status element in the web version).
export default function StatusToast() {
  const { status } = useUiState();

  if (!status) return null;

  return (
    <View pointerEvents="none" style={styles.wrapper}>
      <View style={styles.box}>
        <Text style={styles.text}>{status.message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    left: 20,
    alignItems: 'flex-end',
    zIndex: 99999,
    elevation: 99999,
  },
  box: {
    maxWidth: 360,
    paddingVertical: 12,
    paddingHorizontal: 18,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    ...Platform.select({
      android: { elevation: 8 },
      default: {
        shadowColor: '#000',
        shadowOpacity: 0.18,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 6 },
      },
    }),
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
  },
});
