import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format, parseISO, differenceInDays, startOfDay } from 'date-fns';
import { Colors } from '@/constants/colors';
import { getCategoryDef } from '@/constants/categories';
import { Bill } from '@/store/types';

interface Props {
  bill: Bill;
  currencySymbol: string;
  onPayNow?: () => void;
  onMarkPaid?: () => void;
}

export function BillCard({ bill, currencySymbol, onPayNow, onMarkPaid }: Props) {
  const cat = getCategoryDef(bill.category);
  const today = startOfDay(new Date());
  const due = startOfDay(parseISO(bill.dueDate));
  const daysUntil = differenceInDays(due, today);

  let statusLabel = '';
  let statusColor = Colors.textSecondary;
  let showAutoDebit = false;

  if (bill.status === 'paid') {
    statusLabel = 'PAID';
    statusColor = Colors.income;
  } else if (daysUntil < 0) {
    statusLabel = 'OVERDUE';
    statusColor = Colors.expense;
  } else if (daysUntil === 0) {
    statusLabel = 'DUE TODAY';
    statusColor = Colors.warning;
  } else if (bill.autoDebit && daysUntil <= 3) {
    statusLabel = `AUTO DEBIT IN ${daysUntil} DAY${daysUntil === 1 ? '' : 'S'}`;
    statusColor = Colors.accent;
    showAutoDebit = true;
  } else {
    statusLabel = `DUE ${format(due, 'dd MMM')}`;
    statusColor = Colors.textSecondary;
  }

  const isPaid = bill.status === 'paid';

  return (
    <View style={[styles.card, isPaid && styles.cardPaid]}>
      {/* Status banner */}
      <Text style={[styles.statusLabel, { color: statusColor }]}>{statusLabel}</Text>

      <View style={styles.body}>
        {/* Icon + name */}
        <View style={styles.left}>
          <View style={[styles.iconBubble, { backgroundColor: `${cat.color}22` }]}>
            <MaterialCommunityIcons name={cat.icon as any} size={22} color={cat.color} />
          </View>
          <View style={styles.nameCol}>
            <Text style={styles.name}>{bill.name}</Text>
            {bill.linkedAccountLast4 && (
              <Text style={styles.account}>xx{bill.linkedAccountLast4}</Text>
            )}
          </View>
        </View>

        {/* Amount + actions */}
        <View style={styles.right}>
          <Text style={styles.amount}>
            {currencySymbol} {bill.amount.toLocaleString()}
          </Text>

          {!isPaid && (
            <View style={styles.actions}>
              {showAutoDebit || daysUntil >= 0 ? (
                onPayNow && (
                  <TouchableOpacity style={styles.payBtn} onPress={onPayNow} activeOpacity={0.8}>
                    <Text style={styles.payBtnText}>Pay now →</Text>
                  </TouchableOpacity>
                )
              ) : null}
              {!showAutoDebit && onMarkPaid && (
                <TouchableOpacity style={styles.markBtn} onPress={onMarkPaid} activeOpacity={0.8}>
                  <Text style={styles.markBtnText}>Mark as paid</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardPaid: {
    opacity: 0.55,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBubble: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  nameCol: {
    flex: 1,
  },
  name: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  account: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  amount: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  payBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  payBtnText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 13,
  },
  markBtn: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  markBtnText: {
    color: Colors.text,
    fontWeight: '600',
    fontSize: 13,
  },
});
