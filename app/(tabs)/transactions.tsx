import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { format, parseISO, addMonths, subMonths } from 'date-fns';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Colors } from '@/constants/colors';
import { useFinanceStore, selectActiveUser } from '@/store/useFinanceStore';
import { TransactionItem } from '@/components/TransactionItem';
import { MonthSelector } from '@/components/MonthSelector';
import { Transaction } from '@/store/types';

type FilterType = 'all' | 'income' | 'expense';

export default function TransactionsScreen() {
  const router = useRouter();
  const { currentMonth, setCurrentMonth, getMonthTransactions, settings } = useFinanceStore();
  const { currency } = settings;

  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);

  const allTxs = getMonthTransactions(currentMonth);

  const filtered = useMemo(() => {
    let list = allTxs;
    if (filter !== 'all') list = list.filter((t) => t.type === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) => t.merchant.toLowerCase().includes(q) || (t.note ?? '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [allTxs, filter, search]);

  // Group by date
  const grouped = useMemo(() => {
    const map: Record<string, Transaction[]> = {};
    for (const tx of filtered) {
      const day = tx.date;
      if (!map[day]) map[day] = [];
      map[day].push(tx);
    }
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a));
  }, [filtered]);

  function handlePrevMonth() {
    const d = parseISO(`${currentMonth}-01`);
    setCurrentMonth(format(subMonths(d, 1), 'yyyy-MM'));
  }
  function handleNextMonth() {
    const d = parseISO(`${currentMonth}-01`);
    setCurrentMonth(format(addMonths(d, 1), 'yyyy-MM'));
  }

  const totalIncome = allTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = allTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        {searching ? (
          <View style={styles.searchBar}>
            <MaterialCommunityIcons name="magnify" size={18} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search transactions…"
              placeholderTextColor={Colors.textMuted}
              value={search}
              onChangeText={setSearch}
              autoFocus
            />
            <TouchableOpacity onPress={() => { setSearch(''); setSearching(false); }}>
              <MaterialCommunityIcons name="close" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <MonthSelector month={currentMonth} onPrev={handlePrevMonth} onNext={handleNextMonth} />
            <TouchableOpacity onPress={() => setSearching(true)} hitSlop={8}>
              <MaterialCommunityIcons name="magnify" size={22} color={Colors.text} />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Summary strip */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Income</Text>
          <Text style={[styles.summaryValue, { color: Colors.income }]}>
            +{currency}{totalIncome.toLocaleString()}
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Expenses</Text>
          <Text style={[styles.summaryValue, { color: Colors.expense }]}>
            -{currency}{totalExpense.toLocaleString()}
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Balance</Text>
          <Text style={[styles.summaryValue, { color: totalIncome - totalExpense >= 0 ? Colors.income : Colors.expense }]}>
            {totalIncome - totalExpense >= 0 ? '+' : ''}{currency}{(totalIncome - totalExpense).toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Filter pills */}
      <View style={styles.filterRow}>
        {(['all', 'income', 'expense'] as FilterType[]).map((f) => (
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

      {/* Transaction list */}
      <FlatList
        data={grouped}
        keyExtractor={([date]) => date}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="receipt" size={44} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No transactions found</Text>
          </View>
        }
        renderItem={({ item: [date, txs] }) => (
          <View style={styles.group}>
            <Text style={styles.groupDate}>
              {format(parseISO(date), 'EEEE, d MMM')}
            </Text>
            {txs.map((tx) => (
              <TransactionItem
                key={tx.id}
                transaction={tx}
                currencySymbol={currency}
                onPress={() =>
                  router.push({ pathname: '/add-transaction', params: { id: tx.id } })
                }
              />
            ))}
          </View>
        )}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/add-transaction')}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginVertical: 2,
  },
  summaryLabel: { color: Colors.textSecondary, fontSize: 11, marginBottom: 3 },
  summaryValue: { fontSize: 14, fontWeight: '700' },
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
  group: { marginBottom: 16 },
  groupDate: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { color: Colors.textSecondary, fontSize: 15 },
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
