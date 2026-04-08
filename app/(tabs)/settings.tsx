import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';

import { Colors } from '@/constants/colors';
import { useFinanceStore, selectActiveUser } from '@/store/useFinanceStore';
import { EXPENSE_CATEGORIES } from '@/constants/categories';
import { CurrencySymbol } from '@/store/types';

const CURRENCIES: { symbol: CurrencySymbol; code: string; label: string }[] = [
  { symbol: '$',  code: 'USD', label: 'US Dollar' },
  { symbol: '€',  code: 'EUR', label: 'Euro' },
  { symbol: '£',  code: 'GBP', label: 'British Pound' },
  { symbol: '₹',  code: 'INR', label: 'Indian Rupee' },
  { symbol: '¥',  code: 'JPY', label: 'Japanese Yen' },
  { symbol: 'A$', code: 'AUD', label: 'Australian Dollar' },
  { symbol: 'C$', code: 'CAD', label: 'Canadian Dollar' },
];

export default function SettingsScreen() {
  const {
    currentMonth,
    budgets,
    setBudget,
    settings,
    updateSettings,
    users,
    updateUser,
    transactions,
    deleteTransaction,
  } = useFinanceStore();

  const activeUser = useFinanceStore(selectActiveUser);

  const budget = budgets[currentMonth];
  const [totalBudget, setTotalBudget] = useState(String(budget?.totalBudget ?? ''));
  const [income, setIncome] = useState(String(budget?.income ?? ''));
  const [catBudgets, setCatBudgets] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const cb of budget?.categories ?? []) {
      map[cb.categoryId] = String(cb.budget);
    }
    return map;
  });

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(activeUser.name);

  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  function saveBudget() {
    const categories = EXPENSE_CATEGORIES
      .map((c) => ({ categoryId: c.id, budget: parseFloat(catBudgets[c.id] ?? '0') || 0 }))
      .filter((c) => c.budget > 0);
    setBudget(currentMonth, parseFloat(totalBudget) || 0, parseFloat(income) || 0, categories);
    Alert.alert('Saved', `Budget for ${format(new Date(currentMonth + '-01'), 'MMMM yyyy')} updated.`);
  }

  function handleClearData() {
    Alert.alert(
      'Clear all data?',
      'This will permanently delete all transactions, bills, and budgets.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            transactions.forEach((t) => deleteTransaction(t.id));
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Settings</Text>

        {/* ── Profile ── */}
        <Text style={styles.sectionTitle}>Profile</Text>
        <View style={styles.card}>
          <View style={styles.profileRow}>
            <View style={[styles.avatar, { backgroundColor: activeUser.avatarColor }]}>
              <Text style={styles.avatarText}>{activeUser.name[0].toUpperCase()}</Text>
            </View>
            {editingName ? (
              <TextInput
                style={styles.nameInput}
                value={nameInput}
                onChangeText={setNameInput}
                autoFocus
                onBlur={() => {
                  updateUser(activeUser.id, { name: nameInput.trim() || activeUser.name });
                  setEditingName(false);
                }}
              />
            ) : (
              <TouchableOpacity onPress={() => setEditingName(true)} style={styles.nameTap}>
                <Text style={styles.nameText}>{activeUser.name}</Text>
                <MaterialCommunityIcons name="pencil-outline" size={16} color={Colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Other household member */}
          {users.filter((u) => u.id !== activeUser.id).map((u) => (
            <View key={u.id} style={styles.memberRow}>
              <View style={[styles.avatarSmall, { backgroundColor: u.avatarColor }]}>
                <Text style={styles.avatarSmallText}>{u.name[0].toUpperCase()}</Text>
              </View>
              <Text style={styles.memberName}>{u.name}</Text>
              <Text style={styles.memberTag}>Household member</Text>
            </View>
          ))}
        </View>

        {/* ── Budget for current month ── */}
        <Text style={styles.sectionTitle}>
          Budget — {format(new Date(currentMonth + '-01'), 'MMMM yyyy')}
        </Text>
        <View style={styles.card}>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Monthly income</Text>
            <View style={styles.inputWrap}>
              <Text style={styles.inputPrefix}>{settings.currency}</Text>
              <TextInput
                style={styles.input}
                value={income}
                onChangeText={setIncome}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          </View>

          <View style={[styles.inputRow, styles.inputRowLast]}>
            <Text style={styles.inputLabel}>Total budget</Text>
            <View style={styles.inputWrap}>
              <Text style={styles.inputPrefix}>{settings.currency}</Text>
              <TextInput
                style={styles.input}
                value={totalBudget}
                onChangeText={setTotalBudget}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          </View>

          <Text style={styles.subHeading}>Category budgets (optional)</Text>
          {EXPENSE_CATEGORIES.map((cat) => (
            <View key={cat.id} style={styles.catRow}>
              <View style={[styles.catDot, { backgroundColor: cat.color }]} />
              <Text style={styles.catLabel}>{cat.label}</Text>
              <View style={styles.inputWrap}>
                <Text style={styles.inputPrefix}>{settings.currency}</Text>
                <TextInput
                  style={[styles.input, styles.catInput]}
                  value={catBudgets[cat.id] ?? ''}
                  onChangeText={(v) => setCatBudgets((p) => ({ ...p, [cat.id]: v }))}
                  keyboardType="numeric"
                  placeholder="—"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.saveBtn} onPress={saveBudget} activeOpacity={0.8}>
            <Text style={styles.saveBtnText}>Save Budget</Text>
          </TouchableOpacity>
        </View>

        {/* ── Preferences ── */}
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.card}>
          {/* Currency picker */}
          <TouchableOpacity
            style={styles.prefRow}
            onPress={() => setShowCurrencyPicker((v) => !v)}
          >
            <Text style={styles.prefLabel}>Currency</Text>
            <View style={styles.prefRight}>
              <Text style={styles.prefValue}>{settings.currency} ({settings.currencyCode})</Text>
              <MaterialCommunityIcons
                name={showCurrencyPicker ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={Colors.textSecondary}
              />
            </View>
          </TouchableOpacity>

          {showCurrencyPicker && (
            <View style={styles.currencyList}>
              {CURRENCIES.map((c) => (
                <TouchableOpacity
                  key={c.code}
                  style={[
                    styles.currencyItem,
                    settings.currencyCode === c.code && styles.currencyItemActive,
                  ]}
                  onPress={() => {
                    updateSettings({ currency: c.symbol, currencyCode: c.code });
                    setShowCurrencyPicker(false);
                  }}
                >
                  <Text style={styles.currencySymbol}>{c.symbol}</Text>
                  <Text style={styles.currencyLabel}>{c.label}</Text>
                  {settings.currencyCode === c.code && (
                    <MaterialCommunityIcons name="check" size={16} color={Colors.accent} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Hide income toggle */}
          <View style={[styles.prefRow, styles.prefRowLast]}>
            <Text style={styles.prefLabel}>Hide income on dashboard</Text>
            <Switch
              value={settings.hideIncome}
              onValueChange={(v) => updateSettings({ hideIncome: v })}
              trackColor={{ false: Colors.surfaceElevated, true: Colors.accentDark }}
              thumbColor={settings.hideIncome ? Colors.accent : Colors.textSecondary}
            />
          </View>
        </View>

        {/* ── Danger zone ── */}
        <Text style={styles.sectionTitle}>Data</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.dangerRow} onPress={handleClearData}>
            <MaterialCommunityIcons name="delete-outline" size={18} color={Colors.expense} />
            <Text style={styles.dangerText}>Clear all transactions</Text>
          </TouchableOpacity>
        </View>

        {/* Version */}
        <Text style={styles.versionText}>BudgetTracker v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingBottom: 60 },
  pageTitle: { color: Colors.text, fontSize: 28, fontWeight: '800', marginBottom: 20 },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 20,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#000', fontSize: 18, fontWeight: '700' },
  nameTap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nameText: { color: Colors.text, fontSize: 17, fontWeight: '700' },
  nameInput: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: '700',
    borderBottomWidth: 1,
    borderBottomColor: Colors.accent,
    paddingBottom: 2,
    minWidth: 120,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSmallText: { color: '#000', fontSize: 13, fontWeight: '700' },
  memberName: { color: Colors.text, fontSize: 15, fontWeight: '600', flex: 1 },
  memberTag: { color: Colors.textSecondary, fontSize: 12 },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  inputRowLast: { borderBottomWidth: 0 },
  inputLabel: { color: Colors.text, fontSize: 15 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  inputPrefix: { color: Colors.textSecondary, fontSize: 15, marginRight: 4 },
  input: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
    minWidth: 80,
    textAlign: 'right',
  },
  subHeading: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    gap: 10,
  },
  catDot: { width: 10, height: 10, borderRadius: 5 },
  catLabel: { color: Colors.text, fontSize: 14, flex: 1 },
  catInput: { minWidth: 60 },
  saveBtn: {
    marginTop: 16,
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveBtnText: { color: '#000', fontWeight: '700', fontSize: 15 },
  prefRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  prefRowLast: { borderBottomWidth: 0 },
  prefLabel: { color: Colors.text, fontSize: 15 },
  prefRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  prefValue: { color: Colors.textSecondary, fontSize: 14 },
  currencyList: {
    marginTop: 4,
    marginBottom: 8,
    gap: 2,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  currencyItemActive: { backgroundColor: Colors.accentMuted },
  currencySymbol: { color: Colors.text, fontSize: 16, fontWeight: '700', width: 24, textAlign: 'center' },
  currencyLabel: { color: Colors.text, fontSize: 14, flex: 1 },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  dangerText: { color: Colors.expense, fontSize: 15, fontWeight: '600' },
  versionText: {
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 32,
  },
});
