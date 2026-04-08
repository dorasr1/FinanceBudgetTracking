import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { differenceInDays, startOfDay, parseISO, format } from 'date-fns';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Colors } from '@/constants/colors';
import { useFinanceStore } from '@/store/useFinanceStore';
import { BillCard } from '@/components/BillCard';
import { Bill } from '@/store/types';

type BillFilter = 'all' | 'pending' | 'paid';

export default function BillsScreen() {
  const router = useRouter();
  const { bills, markBillPaid, settings, addTransaction, activeUserId } = useFinanceStore();
  const { currency } = settings;

  const [filter, setFilter] = React.useState<BillFilter>('pending');

  const today = startOfDay(new Date());

  const enriched = useMemo(
    () =>
      bills.map((b) => {
        const due = startOfDay(parseISO(b.dueDate));
        const days = differenceInDays(due, today);
        let status = b.status;
        if (status !== 'paid' && days < 0) status = 'overdue';
        return { ...b, status };
      }),
    [bills]
  );

  const filtered = useMemo(() => {
    if (filter === 'all') return enriched;
    if (filter === 'paid') return enriched.filter((b) => b.status === 'paid');
    return enriched.filter((b) => b.status !== 'paid');
  }, [enriched, filter]);

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    [filtered]
  );

  const totalPending = enriched
    .filter((b) => b.status !== 'paid')
    .reduce((s, b) => s + b.amount, 0);

  function handlePayNow(bill: Bill) {
    // Mark paid + auto-add expense transaction
    markBillPaid(bill.id);
    addTransaction({
      userId: activeUserId,
      type: 'expense',
      amount: bill.amount,
      category: bill.category,
      merchant: bill.name,
      note: 'Bill payment',
      date: format(today, 'yyyy-MM-dd'),
      isShared: false,
      splitRatio: 1,
    });
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Bills & Reminders</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/add-bill')}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="plus" size={18} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Summary banner */}
      {totalPending > 0 && (
        <View style={styles.pendingBanner}>
          <MaterialCommunityIcons name="bell-ring" size={18} color={Colors.warning} />
          <Text style={styles.pendingText}>
            {currency}{totalPending.toLocaleString()} due in upcoming bills
          </Text>
        </View>
      )}

      {/* Filter pills */}
      <View style={styles.filterRow}>
        {(['pending', 'all', 'paid'] as BillFilter[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterPill, filter === f && styles.filterPillActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bills list */}
      <FlatList
        data={sorted}
        keyExtractor={(b) => b.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="bell-off-outline" size={44} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No bills here</Text>
            <TouchableOpacity onPress={() => router.push('/add-bill')}>
              <Text style={styles.emptyLink}>Add a bill →</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <BillCard
            bill={item}
            currencySymbol={currency}
            onPayNow={() => handlePayNow(item)}
            onMarkPaid={() => markBillPaid(item.id)}
          />
        )}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/add-bill')}
        activeOpacity={0.85}
      >
        <MaterialCommunityIcons name="plus" size={26} color="#000" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
  },
  title: { color: Colors.text, fontSize: 22, fontWeight: '800' },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: 'rgba(255,165,2,0.12)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,165,2,0.3)',
  },
  pendingText: { color: Colors.warning, fontSize: 13, fontWeight: '600' },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterPillActive: {
    backgroundColor: Colors.accentMuted,
    borderColor: Colors.accentDark,
  },
  filterText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  filterTextActive: { color: Colors.accent },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { color: Colors.textSecondary, fontSize: 15 },
  emptyLink: { color: Colors.accent, fontSize: 14, fontWeight: '600' },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});
