import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AssetAllocation } from '../types';
import { COLORS, SPACING, FONT_SIZES } from '../theme';

interface Props {
  allocations: AssetAllocation[];
}

export function AllocationTable({ allocations }: Props) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.row, styles.headerRow]}>
        <Text style={[styles.cell, styles.headerCell, styles.assetCell]}>
          Asset Class
        </Text>
        <Text style={[styles.cell, styles.headerCell, styles.targetCell]}>
          Target %
        </Text>
        <Text style={[styles.cell, styles.headerCell, styles.rangeCell]}>
          Range
        </Text>
      </View>

      {/* Data rows */}
      {allocations.map((item, index) => (
        <View
          key={item.assetClass}
          style={[styles.row, index % 2 === 0 ? styles.evenRow : styles.oddRow]}
        >
          <Text style={[styles.cell, styles.assetCell]}>{item.assetClass}</Text>
          <Text style={[styles.cell, styles.targetCell]}>{item.targetPct}%</Text>
          <Text style={[styles.cell, styles.rangeCell]}>{item.range}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: SPACING.sm,
  },
  headerRow: {
    backgroundColor: COLORS.primary,
  },
  evenRow: {
    backgroundColor: COLORS.surface,
  },
  oddRow: {
    backgroundColor: '#f8f9fa',
  },
  cell: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  headerCell: {
    fontWeight: '600',
    color: '#ffffff',
    fontSize: FONT_SIZES.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  assetCell: {
    flex: 2,
  },
  targetCell: {
    flex: 1,
    textAlign: 'center',
  },
  rangeCell: {
    flex: 1,
    textAlign: 'right',
  },
});
