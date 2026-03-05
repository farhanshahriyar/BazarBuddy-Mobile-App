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
import { User, Eye, EyeOff, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  async function handleResetPassword() {
    if (!password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in both password fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) throw error;
      
      Alert.alert('Success', 'Your password has been reset successfully!', [
        { text: 'OK', onPress: () => router.replace('/auth') }
      ]);
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
          <Text className="text-3xl font-bold text-white mb-2">New Password</Text>
          <Text className="text-gray-400 text-base mb-10">
            Create a strong password to secure your account.
          </Text>

          {/* Form Section */}
          <View className="w-full space-y-5">
            <View>
              <Text className="text-white font-medium mb-2 ml-1">New Password</Text>
              <View className="relative">
                <TextInput
                  className="bg-[#0a0a0a] h-14 rounded-xl px-4 pr-12 text-white border border-[#262626]"
                  placeholder="••••••••"
                  placeholderTextColor="#525252"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  className="absolute right-4 top-[14px]"
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={22} color="#525252" />
                  ) : (
                    <Eye size={22} color="#525252" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View>
              <Text className="text-white font-medium mb-2 ml-1">Confirm Password</Text>
              <TextInput
                className="bg-[#0a0a0a] h-14 rounded-xl px-4 text-white border border-[#262626]"
                placeholder="••••••••"
                placeholderTextColor="#525252"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              onPress={handleResetPassword}
              disabled={loading}
              className={`h-14 rounded-xl items-center justify-center bg-[#f97316] mt-4 ${loading ? 'opacity-70' : ''}`}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-lg">
                  Update Password
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.replace('/auth')}
              className="mt-8 flex-row items-center py-2"
            >
              <ArrowLeft size={20} color="#a3a3a3" />
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
