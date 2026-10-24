import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors } from '../theme';

// Simple app bar: title/leading content on the left, actions on the right.
export default function AppBar({ children, actions }) {
  return (
    <View style={styles.bar}>
      <View style={styles.title}>{children}</View>
      {actions ? <View style={styles.actions}>{actions}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 16,
    backgroundColor: colors.background,
  },
  title: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
  },
});
