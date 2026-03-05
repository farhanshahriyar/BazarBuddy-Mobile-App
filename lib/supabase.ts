import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://wcrwwulyhkkbuhmlzqzn.supabase.co';
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indjcnd3dWx5aGtrYnVobWx6cXpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzNzE3ODIsImV4cCI6MjA2MTk0Nzc4Mn0.BZRYh9hP7uw44bKEIiRFKOeoyFL0AIkThLzOfvdUmcY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
