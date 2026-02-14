import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../theme';

export function Disclaimer() {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>!</Text>
      <Text style={styles.text}>
        Prototype only. Not financial advice.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff8e1',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffecb3',
    padding: SPACING.sm,
    marginVertical: SPACING.sm,
  },
  icon: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.warning,
    marginRight: SPACING.sm,
    width: 22,
    height: 22,
    textAlign: 'center',
    lineHeight: 22,
    borderRadius: 11,
    backgroundColor: '#fff3cd',
    overflow: 'hidden',
  },
  text: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: '#856404',
    fontStyle: 'italic',
  },
});
