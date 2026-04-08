import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { getCategoryDef } from '@/constants/categories';
import { CategoryStat } from '@/store/types';

interface Props {
  stat: CategoryStat;
  currencySymbol: string;
}

const RING_SIZE = 44;
const STROKE = 4;

export function CategoryCard({ stat, currencySymbol }: Props) {
  const cat = getCategoryDef(stat.categoryId);
  const r = (RING_SIZE - STROKE) / 2;
  const circumference = 2 * Math.PI * r;
  const budgetPct = stat.budget > 0 ? Math.min(stat.spent / stat.budget, 1) : 0;
  const overBudget = stat.budget > 0 && stat.spent > stat.budget;
  const ringColor = overBudget ? Colors.expense : cat.color;

  // dash for spent arc
  const spentDash = budgetPct * circumference;
  const startOffset = circumference * 0.25; // start from top

  return (
    <View style={styles.row}>
      {/* Category icon */}
      <View style={[styles.iconBubble, { backgroundColor: `${cat.color}22` }]}>
        <MaterialCommunityIcons name={cat.icon as any} size={20} color={cat.color} />
      </View>

      {/* Label + budget line */}
      <View style={styles.middle}>
        <Text style={styles.label}>{cat.label}</Text>
        {stat.budget > 0 && (
          <Text style={styles.budgetLine}>
            Budget: {currencySymbol}{stat.budget.toLocaleString()}
          </Text>
        )}
      </View>

      {/* Amount */}
      <View style={styles.amountCol}>
        <Text style={[styles.amount, overBudget && styles.overBudget]}>
          {currencySymbol}{stat.spent.toLocaleString()}
        </Text>
      </View>

      {/* Progress ring */}
      <Svg width={RING_SIZE} height={RING_SIZE}>
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={r}
          fill="none"
          stroke={Colors.surfaceElevated}
          strokeWidth={STROKE}
        />
        {stat.budget > 0 && (
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={r}
            fill="none"
            stroke={ringColor}
            strokeWidth={STROKE}
            strokeDasharray={`${spentDash} ${circumference}`}
            strokeDashoffset={startOffset}
            strokeLinecap="round"
          />
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  iconBubble: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  middle: {
    flex: 1,
  },
  label: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  budgetLine: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  amountCol: {
    marginRight: 12,
    alignItems: 'flex-end',
  },
  amount: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  overBudget: {
    color: Colors.expense,
  },
});
