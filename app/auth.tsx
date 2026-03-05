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
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  async function handleAuth() {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    if (!isLogin) {
      if (!fullName) {
        Alert.alert('Error', 'Please enter your full name');
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }
    }

    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });
        if (error) throw error;
        Alert.alert('Success', 'Check your email for the confirmation link!');
        setIsLogin(true); // Switch to login after successful signup
      }
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
        className="px-8"
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center py-12">
          {/* Logo Section */}
          <View className="flex-row items-center mb-10">
            <View className="w-10 h-10 bg-[#f97316] rounded-xl items-center justify-center mr-3">
              <User size={24} color="white" />
            </View>
            <Text className="text-2xl font-bold text-white">Bazar Buddy</Text>
          </View>
          
          <Text className="text-3xl font-bold text-white mb-2">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </Text>
          <Text className="text-gray-400 mb-10 text-base">
            {isLogin 
              ? 'Enter your credentials to access your account' 
              : 'Enter your information to create an account'}
          </Text>

          <View className="w-full space-y-5">
            {!isLogin && (
              <View>
                <Text className="text-white font-medium mb-2 ml-1">Full Name</Text>
                <TextInput
                  className="bg-[#0a0a0a] h-14 rounded-xl px-4 text-white border border-[#262626]"
                  placeholder="Md. Farhan Shahriyar"
                  placeholderTextColor="#525252"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>
            )}

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

            <View>
              <Text className="text-white font-medium mb-2 ml-1">Password</Text>
              <View className="relative">
                <TextInput
                  className="bg-[#0a0a0a] h-14 rounded-xl px-4 pr-12 text-white border border-[#262626]"
                  placeholder="******"
                  placeholderTextColor="#525252"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  className="absolute right-4 top-[14px] z-10"
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

            {!isLogin && (
              <View>
                <Text className="text-white font-medium mb-2 ml-1">Confirm Password</Text>
                <View className="relative">
                  <TextInput
                    className="bg-[#0a0a0a] h-14 rounded-xl px-4 pr-12 text-white border border-[#262626]"
                    placeholder="******"
                    placeholderTextColor="#525252"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    className="absolute right-4 top-[14px] z-10"
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={22} color="#525252" />
                    ) : (
                      <Eye size={22} color="#525252" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {isLogin && (
              <TouchableOpacity
                onPress={() => router.push('/forgot-password')}
                className="self-end py-1"
              >
                <Text className="text-[#f97316] text-sm font-medium">Forgot Password?</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleAuth}
              disabled={loading}
              className={`h-14 rounded-xl flex-row items-center justify-center bg-[#f97316] mt-4 ${loading ? 'opacity-70' : ''}`}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-lg">
                  {isLogin ? 'Login' : 'Register'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setIsLogin(!isLogin)}
              className="mt-6 py-2"
            >
              <Text className="text-white text-center text-base">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <Text className="text-[#f97316] font-bold">
                  {isLogin ? 'Sign Up' : 'Login'}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
