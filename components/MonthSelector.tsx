import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format, addMonths, subMonths, parseISO } from 'date-fns';
import { Colors } from '@/constants/colors';

interface Props {
  month: string;           // "YYYY-MM"
  onPrev: () => void;
  onNext: () => void;
  suffix?: string;         // e.g. "▼" for dropdown feel
}

export function MonthSelector({ month, onPrev, onNext, suffix }: Props) {
  // Parse "YYYY-MM" as first day of month
  const date = parseISO(`${month}-01`);
  const label = format(date, 'MMMM yyyy');

  const isCurrentMonth =
    month === format(new Date(), 'yyyy-MM');

  return (
    <View style={styles.row}>
      <TouchableOpacity onPress={onPrev} hitSlop={12} style={styles.arrow}>
        <MaterialCommunityIcons name="chevron-left" size={22} color={Colors.textSecondary} />
      </TouchableOpacity>

      <View style={styles.labelWrap}>
        <Text style={styles.label}>{label}</Text>
        {suffix ? <Text style={styles.suffix}> {suffix}</Text> : null}
      </View>

      <TouchableOpacity
        onPress={onNext}
        hitSlop={12}
        style={[styles.arrow, isCurrentMonth && styles.disabled]}
        disabled={isCurrentMonth}
      >
        <MaterialCommunityIcons
          name="chevron-right"
          size={22}
          color={isCurrentMonth ? Colors.textMuted : Colors.textSecondary}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrow: {
    padding: 4,
  },
  disabled: {
    opacity: 0.4,
  },
  labelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  label: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  suffix: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
});
