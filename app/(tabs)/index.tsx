import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { format, addMonths, subMonths, parseISO } from 'date-fns';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Colors } from '@/constants/colors';
import { useFinanceStore, selectActiveUser, selectOtherUser } from '@/store/useFinanceStore';
import { DonutChart, DonutSegment } from '@/components/DonutChart';
import { TransactionItem } from '@/components/TransactionItem';
import { MonthSelector } from '@/components/MonthSelector';
import { HeaderBar } from '@/components/HeaderBar';
import { getCategoryDef } from '@/constants/categories';

export default function DashboardScreen() {
  const router = useRouter();
  const {
    currentMonth,
    setCurrentMonth,
    setActiveUser,
    getMonthlyStats,
    getMonthTransactions,
    settings,
  } = useFinanceStore();

  const activeUser = useFinanceStore(selectActiveUser);
  const otherUser = useFinanceStore(selectOtherUser);
  const { currency, hideIncome } = settings;

  const [incomeVisible, setIncomeVisible] = useState(!hideIncome);

  const stats = getMonthlyStats(currentMonth);
  const allTxs = getMonthTransactions(currentMonth);
  const recentTxs = allTxs.slice(0, 5);

  // Donut chart: budget progress (single arc showing % of budget spent)
  const budgetPct =
    stats.budgetTotal > 0
      ? Math.min((stats.totalExpense / stats.budgetTotal) * 100, 100)
      : 0;

  // Multi-segment donut for category breakdown
  const donutSegments: DonutSegment[] = stats.categoryStats.slice(0, 5).map((cs) => ({
    value: cs.spent,
    color: getCategoryDef(cs.categoryId).color,
    label: cs.categoryId,
  }));

  function handlePrevMonth() {
    const d = parseISO(`${currentMonth}-01`);
    setCurrentMonth(format(subMonths(d, 1), 'yyyy-MM'));
  }

  function handleNextMonth() {
    const d = parseISO(`${currentMonth}-01`);
    setCurrentMonth(format(addMonths(d, 1), 'yyyy-MM'));
  }

  function handleSwitchUser() {
    setActiveUser(otherUser.id);
  }

  const formattedExpense = `${currency}${stats.totalExpense.toLocaleString()}`;
  const formattedIncome = incomeVisible
    ? `${currency}${stats.totalIncome.toLocaleString()}`
    : `${currency}••••`;
  const safePerDay =
    stats.safeToSpendPerDay > 0
      ? `${currency}${Math.round(stats.safeToSpendPerDay).toLocaleString()}/day`
      : '—';

  return (
    <SafeAreaView style={styles.safe}>
      <HeaderBar
        activeUser={activeUser}
        otherUser={otherUser}
        onSwitchUser={handleSwitchUser}
        onSearch={() => router.push('/transactions')}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Month selector */}
        <View style={styles.monthRow}>
          <MonthSelector
            month={currentMonth}
            onPrev={handlePrevMonth}
            onNext={handleNextMonth}
            suffix="▾"
          />
          <TouchableOpacity hitSlop={8}>
            <MaterialCommunityIcons name="filter-outline" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* ── Main Chart Card ── */}
        <View style={styles.chartCard}>
          <View style={styles.chartRow}>
            {/* Donut */}
            <DonutChart
              segments={donutSegments.length > 0 ? donutSegments : [{ value: 1, color: Colors.surfaceHigh }]}
              totalLabel={formattedExpense}
              subLabel={budgetPct > 0 ? `${Math.round(budgetPct)}%` : undefined}
              size={190}
              strokeWidth={20}
            />

            {/* Category legend */}
            <View style={styles.legend}>
              {stats.categoryStats.slice(0, 5).map((cs) => {
                const cat = getCategoryDef(cs.categoryId);
                return (
                  <View key={cs.categoryId} style={styles.legendRow}>
                    <View style={[styles.legendDot, { backgroundColor: cat.color }]} />
                    <Text style={styles.legendPct}>{Math.round(cs.percentage)}%</Text>
                  </View>
                );
              })}
              {stats.categoryStats.length === 0 && (
                <Text style={styles.emptyLegend}>No data</Text>
              )}
            </View>
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <Pressable style={styles.statItem} onPress={() => setIncomeVisible((v) => !v)}>
              <Text style={styles.statLabel}>Income</Text>
              <View style={styles.statValueRow}>
                <Text style={styles.statValue}>{formattedIncome}</Text>
                <MaterialCommunityIcons
                  name={incomeVisible ? 'eye-outline' : 'eye-off-outline'}
                  size={14}
                  color={Colors.textSecondary}
                  style={{ marginLeft: 4 }}
                />
              </View>
            </Pressable>

            <View style={styles.statDivider} />

            <Pressable style={styles.statItem} onPress={() => router.push('/settings')}>
              <Text style={styles.statLabel}>Budget</Text>
              <View style={styles.statValueRow}>
                <Text style={styles.statValue}>
                  {stats.budgetTotal > 0 ? `${currency}${stats.budgetTotal.toLocaleString()}` : 'Set →'}
                </Text>
              </View>
            </Pressable>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Safe to spend</Text>
              <Text style={[styles.statValue, { color: Colors.accent }]}>{safePerDay}</Text>
            </View>
          </View>
        </View>

        {/* ── View Tabs: Trends / Categories ── */}
        <View style={styles.viewTabsRow}>
          <TouchableOpacity
            style={[styles.viewTab, styles.viewTabActive]}
            onPress={() => router.push('/transactions')}
          >
            <MaterialCommunityIcons name="chart-bar" size={14} color={Colors.accent} />
            <Text style={[styles.viewTabText, { color: Colors.accent }]}>  Trends</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.viewTab}
            onPress={() => router.push('/categories')}
          >
            <MaterialCommunityIcons name="tag-multiple" size={14} color={Colors.textSecondary} />
            <Text style={[styles.viewTabText, { color: Colors.textSecondary }]}>  Categories</Text>
          </TouchableOpacity>
        </View>

        {/* ── Recent transactions ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent transactions</Text>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => router.push('/add-transaction')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="plus" size={16} color="#000" />
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>
          </View>

          {recentTxs.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="receipt" size={40} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No transactions this month</Text>
              <Text style={styles.emptySubText}>Tap Add to record your first one</Text>
            </View>
          ) : (
            recentTxs.map((tx) => (
              <TransactionItem
                key={tx.id}
                transaction={tx}
                currencySymbol={currency}
                onPress={() => router.push({ pathname: '/add-transaction', params: { id: tx.id } })}
              />
            ))
          )}

          {allTxs.length > 5 && (
            <TouchableOpacity
              style={styles.seeAll}
              onPress={() => router.push('/transactions')}
            >
              <Text style={styles.seeAllText}>See all {allTxs.length} transactions →</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 32,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  chartCard: {
    marginHorizontal: 16,
    marginTop: 4,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  legend: {
    flex: 1,
    paddingLeft: 16,
    justifyContent: 'center',
    gap: 10,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendPct: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  emptyLegend: {
    color: Colors.textMuted,
    fontSize: 13,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  statLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginBottom: 4,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statValue: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  viewTabsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  viewTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  viewTabActive: {
    borderColor: Colors.accentDark,
    backgroundColor: Colors.accentMuted,
  },
  viewTabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  addBtnText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 13,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  emptySubText: {
    color: Colors.textMuted,
    fontSize: 13,
  },
  seeAll: {
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  seeAllText: {
    color: Colors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
});
