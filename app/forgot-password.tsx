import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { User, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleResetRequest() {
    if (!email) {
      Alert.alert('Required', 'Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: Platform.OS === 'web' ? window.location.origin + '/reset-password' : 'app://reset-password',
      });
      if (error) throw error;
      Alert.alert('Email Sent', 'If an account exists with this email, you will receive a password reset link.');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#0a0a0a]"
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }} 
        className="px-8 py-16"
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1">
          {/* Logo Section */}
          <View className="flex-row items-center mb-10">
            <View className="w-10 h-10 bg-[#f97316] rounded-xl items-center justify-center mr-3">
              <User size={24} color="white" />
            </View>
            <Text className="text-2xl font-bold text-white">Bazar Buddy</Text>
          </View>

          {/* Title Section */}
          <Text className="text-3xl font-bold text-white mb-2">Reset Password</Text>
          <Text className="text-gray-400 text-base mb-10">
            Enter your email and we'll send you a link to reset your password
          </Text>

          {/* Form Section */}
          <View className="w-full space-y-5">
            <View>
              <Text className="text-white font-medium mb-2 ml-1">Email</Text>
              <TextInput
                className="bg-[#0a0a0a] h-14 rounded-xl px-4 text-white border border-[#262626]"
                placeholder="me@example.com"
                placeholderTextColor="#525252"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <TouchableOpacity
              onPress={handleResetRequest}
              disabled={loading}
              className={`h-14 rounded-xl items-center justify-center bg-[#f97316] mt-4 ${loading ? 'opacity-70' : ''}`}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-lg">
                  Send Reset Link
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.back()}
              className="mt-8 flex-row items-center py-2"
            >
              <ArrowLeft size={20} color="#a3a3a3" className="mr-2" />
              <Text className="text-[#a3a3a3] text-lg font-medium ml-2">
                Back to Login
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
