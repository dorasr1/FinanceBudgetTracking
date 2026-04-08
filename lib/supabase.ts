/**
 * Supabase client — optional cloud sync between the 2 household users.
 *
 * SETUP (skip if staying fully local):
 * 1. Create a free project at https://supabase.com
 * 2. Copy your Project URL and anon key into app.json → extra
 * 3. Run the SQL in db/schema.sql to create the tables
 * 4. Import `supabase` here and call `syncToCloud()` after mutations
 *
 * The app works 100% offline without this — data lives in AsyncStorage.
 */

import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl: string = Constants.expoConfig?.extra?.supabaseUrl ?? '';
const supabaseAnonKey: string = Constants.expoConfig?.extra?.supabaseAnonKey ?? '';

export const isSupabaseConfigured =
  supabaseUrl.startsWith('https://') && supabaseAnonKey.length > 0;

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ─── SQL schema (paste into Supabase SQL editor) ──────────────────────────────
//
// create table households (
//   id uuid primary key default gen_random_uuid(),
//   name text not null,
//   invite_code text unique not null
// );
//
// create table transactions (
//   id text primary key,
//   household_id uuid references households(id),
//   user_id text not null,
//   type text not null,
//   amount numeric not null,
//   category text not null,
//   merchant text not null,
//   note text,
//   date text not null,
//   is_shared boolean default false,
//   split_ratio numeric default 1,
//   created_at timestamptz default now()
// );
//
// create table bills (
//   id text primary key,
//   household_id uuid references households(id),
//   name text not null,
//   amount numeric not null,
//   due_date text not null,
//   status text not null,
//   is_recurring boolean default false,
//   frequency text default 'monthly',
//   category text not null,
//   auto_debit boolean default false,
//   linked_account_last4 text,
//   created_at timestamptz default now()
// );
//
// create table budgets (
//   id text primary key,
//   household_id uuid references households(id),
//   month text not null,
//   total_budget numeric not null,
//   income numeric default 0,
//   categories jsonb default '[]',
//   unique(household_id, month)
// );
