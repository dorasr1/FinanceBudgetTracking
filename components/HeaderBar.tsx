import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { User } from '@/store/types';

interface Props {
  activeUser: User;
  otherUser: User;
  onSwitchUser: () => void;
  onSearch?: () => void;
  title?: string;          // override greeting with a static title
}

export function HeaderBar({ activeUser, otherUser, onSwitchUser, onSearch, title }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {/* Logo / bar chart icon matching reference */}
        <View style={styles.logoWrap}>
          <MaterialCommunityIcons name="chart-bar" size={20} color={Colors.accent} />
        </View>
        <View>
          <Text style={styles.greeting}>
            {title ?? `Hi ${activeUser.name}`}
          </Text>
          <Text style={styles.sub}>Household budget</Text>
        </View>
      </View>

      <View style={styles.right}>
        {/* Other user avatar — tap to switch */}
        <TouchableOpacity onPress={onSwitchUser} style={styles.avatarBtn} activeOpacity={0.8}>
          <View style={[styles.avatar, { backgroundColor: otherUser.avatarColor }]}>
            <Text style={styles.avatarText}>{otherUser.name[0].toUpperCase()}</Text>
          </View>
          <View style={[styles.avatarSmall, { backgroundColor: activeUser.avatarColor }]}>
            <Text style={styles.avatarSmallText}>{activeUser.name[0].toUpperCase()}</Text>
          </View>
        </TouchableOpacity>

        {onSearch && (
          <TouchableOpacity onPress={onSearch} hitSlop={8} style={styles.searchBtn}>
            <MaterialCommunityIcons name="magnify" size={22} color={Colors.text} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  sub: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarBtn: {
    width: 44,
    height: 28,
    position: 'relative',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: 0,
  },
  avatarText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '700',
  },
  avatarSmall: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    top: 3,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  avatarSmallText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '700',
  },
  searchBtn: {
    padding: 4,
  },
});
