import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { Colors } from '@/constants/colors';
import { getCategoryDef } from '@/constants/categories';
import { Transaction } from '@/store/types';

interface Props {
  transaction: Transaction;
  currencySymbol: string;
  onPress?: () => void;
}

export function TransactionItem({ transaction, currencySymbol, onPress }: Props) {
  const cat = getCategoryDef(transaction.category);
  const isExpense = transaction.type === 'expense';
  const amountColor = isExpense ? Colors.text : Colors.income;
  const amountPrefix = isExpense ? '-' : '+';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75} style={styles.row}>
      {/* Icon bubble */}
      <View style={[styles.iconBubble, { backgroundColor: `${cat.color}22` }]}>
        <MaterialCommunityIcons name={cat.icon as any} size={20} color={cat.color} />
      </View>

      {/* Middle: merchant + note */}
      <View style={styles.middle}>
        <Text style={styles.merchant} numberOfLines={1}>{transaction.merchant}</Text>
        {transaction.note ? (
          <Text style={styles.note} numberOfLines={1}>{transaction.note}</Text>
        ) : null}
        {transaction.isShared && (
          <Text style={styles.shared}>Shared · {Math.round(transaction.splitRatio * 100)}%</Text>
        )}
      </View>

      {/* Right: amount + date */}
      <View style={styles.right}>
        <Text style={[styles.amount, { color: amountColor }]}>
          {amountPrefix}{currencySymbol}{transaction.amount.toLocaleString()}
        </Text>
        <Text style={styles.date}>
          {format(parseISO(transaction.date), 'd MMM')}
        </Text>
        {/* small outgoing arrow matching reference design */}
        <MaterialCommunityIcons
          name={isExpense ? 'arrow-top-right' : 'arrow-bottom-left'}
          size={12}
          color={isExpense ? Colors.textMuted : Colors.income}
          style={styles.arrow}
        />
      </View>
    </TouchableOpacity>
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
  merchant: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  note: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  shared: {
    color: Colors.accent,
    fontSize: 11,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
  },
  date: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  arrow: {
    marginTop: 2,
  },
});
