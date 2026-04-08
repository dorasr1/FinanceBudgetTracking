import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format, addMonths } from 'date-fns';

import { Colors } from '@/constants/colors';
import { useFinanceStore } from '@/store/useFinanceStore';
import { EXPENSE_CATEGORIES } from '@/constants/categories';
import { BillFrequency } from '@/store/types';

const FREQUENCIES: { value: BillFrequency; label: string }[] = [
  { value: 'once',      label: 'One-time' },
  { value: 'monthly',  label: 'Monthly' },
  { value: 'quarterly',label: 'Quarterly' },
  { value: 'yearly',   label: 'Yearly' },
];

export default function AddBillModal() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { addBill, updateBill, deleteBill, bills, settings } = useFinanceStore();

  const existing = id ? bills.find((b) => b.id === id) : undefined;

  const [name, setName] = useState(existing?.name ?? '');
  const [amount, setAmount] = useState(existing ? String(existing.amount) : '');
  const [dueDate, setDueDate] = useState(
    existing?.dueDate ?? format(addMonths(new Date(), 0), 'yyyy-MM-dd')
  );
  const [category, setCategory] = useState(existing?.category ?? 'utilities');
  const [isRecurring, setIsRecurring] = useState(existing?.isRecurring ?? true);
  const [frequency, setFrequency] = useState<BillFrequency>(existing?.frequency ?? 'monthly');
  const [autoDebit, setAutoDebit] = useState(existing?.autoDebit ?? false);
  const [linkedAccount, setLinkedAccount] = useState(existing?.linkedAccountLast4 ?? '');

  const { currency } = settings;

  function handleSave() {
    const parsed = parseFloat(amount.replace(/,/g, ''));
    if (!parsed || parsed <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid amount greater than 0.');
      return;
    }
    if (!name.trim()) {
      Alert.alert('Missing name', 'Please enter a bill name.');
      return;
    }

    const payload = {
      name: name.trim(),
      amount: parsed,
      dueDate,
      status: 'pending' as const,
      isRecurring,
      frequency: isRecurring ? frequency : 'once' as BillFrequency,
      category,
      autoDebit,
      linkedAccountLast4: linkedAccount.trim() || undefined,
    };

    if (existing) {
      updateBill(existing.id, payload);
    } else {
      addBill(payload);
    }
    router.back();
  }

  function handleDelete() {
    Alert.alert('Delete bill?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          if (existing) deleteBill(existing.id);
          router.back();
        },
      },
    ]);
  }

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
          <Text style={styles.headerTitle}>{existing ? 'Edit' : 'Add'} Bill</Text>
          {existing ? (
            <TouchableOpacity onPress={handleDelete} hitSlop={8}>
              <MaterialCommunityIcons name="delete-outline" size={22} color={Colors.expense} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 24 }} />
          )}
        </View>

        <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
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

          {/* Name + date + account */}
          <View style={styles.fieldCard}>
            <View style={styles.field}>
              <MaterialCommunityIcons name="text-short" size={18} color={Colors.textSecondary} />
              <TextInput
                style={styles.fieldInput}
                value={name}
                onChangeText={setName}
                placeholder="Bill name (e.g. Electricity bill)"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
            <View style={styles.field}>
              <MaterialCommunityIcons name="calendar-outline" size={18} color={Colors.textSecondary} />
              <TextInput
                style={styles.fieldInput}
                value={dueDate}
                onChangeText={setDueDate}
                placeholder="Due date (YYYY-MM-DD)"
                placeholderTextColor={Colors.textMuted}
                keyboardType="numbers-and-punctuation"
              />
            </View>
            <View style={[styles.field, styles.fieldLast]}>
              <MaterialCommunityIcons name="credit-card-outline" size={18} color={Colors.textSecondary} />
              <TextInput
                style={styles.fieldInput}
                value={linkedAccount}
                onChangeText={setLinkedAccount}
                placeholder="Linked card last 4 digits (optional)"
                placeholderTextColor={Colors.textMuted}
                keyboardType="numeric"
                maxLength={4}
              />
            </View>
          </View>

          {/* Category picker */}
          <Text style={styles.sectionLabel}>Category</Text>
          <View style={styles.categoryGrid}>
            {EXPENSE_CATEGORIES.map((cat) => (
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
                  size={16}
                  color={category === cat.id ? cat.color : Colors.textSecondary}
                />
                <Text style={[styles.catChipText, category === cat.id && { color: cat.color }]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Recurring toggle */}
          <View style={styles.fieldCard}>
            <View style={styles.field}>
              <MaterialCommunityIcons name="repeat" size={18} color={Colors.textSecondary} />
              <Text style={styles.toggleLabel}>Recurring bill</Text>
              <Switch
                value={isRecurring}
                onValueChange={setIsRecurring}
                trackColor={{ false: Colors.surfaceElevated, true: Colors.accentDark }}
                thumbColor={isRecurring ? Colors.accent : Colors.textSecondary}
              />
            </View>

            {isRecurring && (
              <View style={[styles.field, styles.fieldLast]}>
                <MaterialCommunityIcons name="calendar-refresh" size={18} color={Colors.textSecondary} />
                <View style={styles.freqRow}>
                  {FREQUENCIES.filter((f) => f.value !== 'once').map((f) => (
                    <TouchableOpacity
                      key={f.value}
                      style={[styles.freqChip, frequency === f.value && styles.freqChipActive]}
                      onPress={() => setFrequency(f.value)}
                    >
                      <Text style={[styles.freqText, frequency === f.value && styles.freqTextActive]}>
                        {f.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Auto debit */}
            <View style={[styles.field, !isRecurring && styles.fieldLast]}>
              <MaterialCommunityIcons name="bank-transfer" size={18} color={Colors.textSecondary} />
              <Text style={styles.toggleLabel}>Auto debit</Text>
              <Switch
                value={autoDebit}
                onValueChange={setAutoDebit}
                trackColor={{ false: Colors.surfaceElevated, true: Colors.accentDark }}
                thumbColor={autoDebit ? Colors.accent : Colors.textSecondary}
              />
            </View>
          </View>

          {/* Save */}
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
            <Text style={styles.saveBtnText}>{existing ? 'Update' : 'Add'} Bill</Text>
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
  amountInput: { flex: 1, color: Colors.text, fontSize: 36, fontWeight: '700' },
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
  toggleLabel: { flex: 1, color: Colors.text, fontSize: 15 },
  freqRow: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  freqChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  freqChipActive: { backgroundColor: Colors.accentMuted, borderColor: Colors.accentDark },
  freqText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },
  freqTextActive: { color: Colors.accent },
  sectionLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: -4,
  },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
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
  saveBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  saveBtnText: { color: '#000', fontWeight: '800', fontSize: 16 },
});
