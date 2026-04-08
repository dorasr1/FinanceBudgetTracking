import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { format, addMonths, subMonths, parseISO } from 'date-fns';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Colors } from '@/constants/colors';
import { useFinanceStore } from '@/store/useFinanceStore';
import { DonutChart, DonutSegment } from '@/components/DonutChart';
import { CategoryCard } from '@/components/CategoryCard';
import { MonthSelector } from '@/components/MonthSelector';
import { getCategoryDef } from '@/constants/categories';

export default function CategoriesScreen() {
  const router = useRouter();
  const { currentMonth, setCurrentMonth, getMonthlyStats, settings } = useFinanceStore();
  const { currency } = settings;

  const stats = getMonthlyStats(currentMonth);

  function handlePrevMonth() {
    const d = parseISO(`${currentMonth}-01`);
    setCurrentMonth(format(subMonths(d, 1), 'yyyy-MM'));
  }
  function handleNextMonth() {
    const d = parseISO(`${currentMonth}-01`);
    setCurrentMonth(format(addMonths(d, 1), 'yyyy-MM'));
  }

  const donutSegments: DonutSegment[] = stats.categoryStats.map((cs) => ({
    value: cs.spent,
    color: getCategoryDef(cs.categoryId).color,
  }));

  const hasData = stats.categoryStats.length > 0;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Categories</Text>
        <TouchableOpacity onPress={() => router.push('/settings')} hitSlop={8}>
          <MaterialCommunityIcons name="pencil-outline" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Month picker */}
        <View style={styles.monthRow}>
          <MonthSelector month={currentMonth} onPrev={handlePrevMonth} onNext={handleNextMonth} />
        </View>

        {/* Donut + summary */}
        <View style={styles.chartCard}>
          <DonutChart
            segments={
              hasData
                ? donutSegments
                : [{ value: 1, color: Colors.surfaceElevated }]
            }
            totalLabel={`${currency}${stats.totalExpense.toLocaleString()}`}
            subLabel="spent"
            size={200}
            strokeWidth={22}
          />

          {/* Totals below chart */}
          <View style={styles.totalsRow}>
            <View style={styles.totalItem}>
              <Text style={styles.totalLabel}>Total spent</Text>
              <Text style={[styles.totalValue, { color: Colors.expense }]}>
                -{currency}{stats.totalExpense.toLocaleString()}
              </Text>
            </View>
            <View style={styles.totalDivider} />
            <View style={styles.totalItem}>
              <Text style={styles.totalLabel}>Budget left</Text>
              <Text style={[
                styles.totalValue,
                { color: stats.budgetTotal > stats.totalExpense ? Colors.income : Colors.expense }
              ]}>
                {currency}{Math.max(stats.budgetTotal - stats.totalExpense, 0).toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Category list */}
        <View style={styles.listCard}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Breakdown</Text>
            {stats.budgetTotal === 0 && (
              <TouchableOpacity onPress={() => router.push('/settings')}>
                <Text style={styles.setBudgetLink}>Set budgets →</Text>
              </TouchableOpacity>
            )}
          </View>

          {hasData ? (
            stats.categoryStats.map((cs) => (
              <CategoryCard key={cs.categoryId} stat={cs} currencySymbol={currency} />
            ))
          ) : (
            <View style={styles.empty}>
              <MaterialCommunityIcons name="tag-off-outline" size={44} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No expenses this month</Text>
              <TouchableOpacity onPress={() => router.push('/add-transaction')}>
                <Text style={styles.emptyLink}>Add a transaction →</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
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
    paddingBottom: 8,
  },
  title: { color: Colors.text, fontSize: 22, fontWeight: '800' },
  content: { paddingBottom: 40 },
  monthRow: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  chartCard: {
    marginHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  totalsRow: {
    flexDirection: 'row',
    marginTop: 20,
    width: '100%',
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  totalItem: { flex: 1, alignItems: 'center' },
  totalDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  totalLabel: { color: Colors.textSecondary, fontSize: 12, marginBottom: 4 },
  totalValue: { fontSize: 16, fontWeight: '700' },
  listCard: {
    marginHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  listTitle: { color: Colors.text, fontSize: 16, fontWeight: '700' },
  setBudgetLink: { color: Colors.accent, fontSize: 13, fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyText: { color: Colors.textSecondary, fontSize: 15 },
  emptyLink: { color: Colors.accent, fontSize: 14, fontWeight: '600' },
});
