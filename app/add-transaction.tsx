import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';

import { Colors } from '@/constants/colors';
import { useFinanceStore, selectActiveUser } from '@/store/useFinanceStore';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/constants/categories';
import { TransactionType } from '@/store/types';

export default function AddTransactionModal() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const {
    addTransaction,
    updateTransaction,
    deleteTransaction,
    transactions,
    settings,
    currentMonth,
  } = useFinanceStore();
  const activeUser = useFinanceStore(selectActiveUser);

  const existing = id ? transactions.find((t) => t.id === id) : undefined;

  // ── Form state ────────────────────────────────────────────────────────────
  const [type, setType] = useState<TransactionType>(existing?.type ?? 'expense');
  const [amount, setAmount] = useState(existing ? String(existing.amount) : '');
  const [merchant, setMerchant] = useState(existing?.merchant ?? '');
  const [note, setNote] = useState(existing?.note ?? '');
  const [category, setCategory] = useState(existing?.category ?? 'other');
  const [date, setDate] = useState(existing?.date ?? format(new Date(), 'yyyy-MM-dd'));
  const [isShared, setIsShared] = useState(existing?.isShared ?? false);

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  // Reset category when type changes
  useEffect(() => {
    const validIds = categories.map((c) => c.id);
    if (!validIds.includes(category)) {
      setCategory(categories[0]?.id ?? 'other');
    }
  }, [type]);

  function handleSave() {
    const parsed = parseFloat(amount.replace(/,/g, ''));
    if (!parsed || parsed <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid amount greater than 0.');
      return;
    }
    if (!merchant.trim()) {
      Alert.alert('Missing merchant', 'Please enter a merchant or source name.');
      return;
    }

    const payload = {
      userId: activeUser.id,
      type,
      amount: parsed,
      category,
      merchant: merchant.trim(),
      note: note.trim() || undefined,
      date,
      isShared,
      splitRatio: isShared ? 0.5 : 1,
    };

    if (existing) {
      updateTransaction(existing.id, payload);
    } else {
      addTransaction(payload);
    }
    router.back();
  }

  function handleDelete() {
    Alert.alert('Delete transaction?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          if (existing) deleteTransaction(existing.id);
          router.back();
        },
      },
    ]);
  }

  const { currency } = settings;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <MaterialCommunityIcons name="close" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{existing ? 'Edit' : 'Add'} Transaction</Text>
          {existing ? (
            <TouchableOpacity onPress={handleDelete} hitSlop={8}>
              <MaterialCommunityIcons name="delete-outline" size={22} color={Colors.expense} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 24 }} />
          )}
        </View>

        <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
          {/* Type toggle */}
          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[styles.typeBtn, type === 'expense' && styles.typeBtnActive]}
              onPress={() => setType('expense')}
            >
              <MaterialCommunityIcons
                name="arrow-top-right"
                size={16}
                color={type === 'expense' ? '#000' : Colors.textSecondary}
              />
              <Text style={[styles.typeBtnText, type === 'expense' && styles.typeBtnTextActive]}>
                Expense
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeBtn, type === 'income' && styles.typeBtnActiveGreen]}
              onPress={() => setType('income')}
            >
              <MaterialCommunityIcons
                name="arrow-bottom-left"
                size={16}
                color={type === 'income' ? '#000' : Colors.textSecondary}
              />
              <Text style={[styles.typeBtnText, type === 'income' && styles.typeBtnTextActive]}>
                Income
              </Text>
            </TouchableOpacity>
          </View>

          {/* Amount */}
          <View style={styles.amountCard}>
            <Text style={styles.amountPrefix}>{currency}</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={Colors.textMuted}
              autoFocus={!existing}
            />
          </View>

          {/* Merchant */}
          <View style={styles.fieldCard}>
            <View style={styles.field}>
              <MaterialCommunityIcons name="store-outline" size={18} color={Colors.textSecondary} />
              <TextInput
                style={styles.fieldInput}
                value={merchant}
                onChangeText={setMerchant}
                placeholder={type === 'income' ? 'Source (e.g. Company, Client)' : 'Merchant / Payee'}
                placeholderTextColor={Colors.textMuted}
              />
            </View>
            <View style={[styles.field, styles.fieldLast]}>
              <MaterialCommunityIcons name="text-short" size={18} color={Colors.textSecondary} />
              <TextInput
                style={styles.fieldInput}
                value={note}
                onChangeText={setNote}
                placeholder="Note (optional)"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          </View>

          {/* Date */}
          <View style={styles.fieldCard}>
            <View style={[styles.field, styles.fieldLast]}>
              <MaterialCommunityIcons name="calendar-outline" size={18} color={Colors.textSecondary} />
              <TextInput
                style={styles.fieldInput}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.textMuted}
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>

          {/* Category picker */}
          <Text style={styles.sectionLabel}>Category</Text>
          <View style={styles.categoryGrid}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.catChip,
                  category === cat.id && { backgroundColor: `${cat.color}33`, borderColor: cat.color },
                ]}
                onPress={() => setCategory(cat.id)}
                activeOpacity={0.75}
              >
                <MaterialCommunityIcons
                  name={cat.icon as any}
                  size={18}
                  color={category === cat.id ? cat.color : Colors.textSecondary}
                />
                <Text
                  style={[
                    styles.catChipText,
                    category === cat.id && { color: cat.color },
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Shared toggle */}
          <TouchableOpacity
            style={[styles.sharedRow, isShared && styles.sharedRowActive]}
            onPress={() => setIsShared((v) => !v)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name={isShared ? 'account-multiple' : 'account-multiple-outline'}
              size={20}
              color={isShared ? Colors.accent : Colors.textSecondary}
            />
            <Text style={[styles.sharedText, isShared && { color: Colors.accent }]}>
              Split with household (50/50)
            </Text>
            <View
              style={[styles.sharedIndicator, isShared && styles.sharedIndicatorOn]}
            />
          </TouchableOpacity>

          {/* Save */}
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
            <Text style={styles.saveBtnText}>{existing ? 'Update' : 'Add'} Transaction</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  headerTitle: { color: Colors.text, fontSize: 17, fontWeight: '700' },
  form: { padding: 20, paddingBottom: 40, gap: 16 },
  typeRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  typeBtnActive: { backgroundColor: Colors.expense },
  typeBtnActiveGreen: { backgroundColor: Colors.income },
  typeBtnText: { color: Colors.textSecondary, fontWeight: '600', fontSize: 14 },
  typeBtnTextActive: { color: '#000', fontWeight: '700' },
  amountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  amountPrefix: { color: Colors.textSecondary, fontSize: 28, fontWeight: '300', marginRight: 8 },
  amountInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 36,
    fontWeight: '700',
  },
  fieldCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  fieldLast: { borderBottomWidth: 0 },
  fieldInput: { flex: 1, color: Colors.text, fontSize: 15 },
  sectionLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: -4,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catChipText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  sharedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sharedRowActive: {
    borderColor: Colors.accentDark,
    backgroundColor: Colors.accentMuted,
  },
  sharedText: { flex: 1, color: Colors.textSecondary, fontSize: 14, fontWeight: '500' },
  sharedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  sharedIndicatorOn: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  saveBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  saveBtnText: { color: '#000', fontWeight: '800', fontSize: 16 },
});
