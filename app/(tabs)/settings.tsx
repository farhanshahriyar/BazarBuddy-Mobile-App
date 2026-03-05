import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Bell, Globe, Shield, Moon, LogOut, ChevronRight, MessageSquare, History, X } from 'lucide-react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserEmail(user.email ?? 'User');
        setFullName(user.user_metadata?.full_name ?? null);
      }
    });
  }, []);

  const handleSignOut = async () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Sign Out", 
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase.auth.signOut();
            if (error) {
              Alert.alert("Error", error.message);
            }
          }
        }
      ]
    );
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'bn' : 'en');
  };

  const handleFeedback = () => {
    setShowFeedbackModal(true);
  };

  const submitFeedback = async () => {
    if (!feedbackText.trim() || submitting) return;
    
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('feedback')
        .insert([{ content: feedbackText.trim(), type: 'feature_request' }]);

      if (error) throw error;
      
      Alert.alert("Success", "Thank you for your feedback!");
      setFeedbackText('');
      setShowFeedbackModal(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert("Error", "Failed to send feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangelog = () => {
    Alert.alert("Changelog", "v1.0.0: Initial Release\n- Real-time Expense Tracking\n- AI Price Suggestions\n- PDF Export Support");
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScreenWrapper>
        <ScrollView className="px-4 py-6">
            <View className="mb-8 items-center">
                <View className="bg-primary/20 w-24 h-24 rounded-full items-center justify-center border-2 border-primary mb-3">
                  <User color="#FF6B00" size={48} />
                </View>
                <Text className="text-foreground text-2xl font-bold">{fullName || userEmail?.split('@')[0] || 'User'}</Text>
                <Text className="text-muted-foreground">{userEmail || 'Loading...'}</Text>

            </View>


          {/* Feedback Section (Conditional) */}
          {showFeedbackModal && (
            <View className="bg-card p-6 rounded-3xl border border-primary mb-8">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-foreground font-bold text-lg">Send Feedback</Text>
                <TouchableOpacity onPress={() => setShowFeedbackModal(false)}>
                  <X color="#888" size={20} />
                </TouchableOpacity>
              </View>
              <TextInput
                placeholder="Suggest a feature or report a bug..."
                placeholderTextColor="#888"
                multiline
                numberOfLines={4}
                value={feedbackText}
                onChangeText={setFeedbackText}
                className="bg-secondary p-4 rounded-2xl text-foreground mb-4 h-32 text-left align-top"
              />
              <TouchableOpacity 
                onPress={submitFeedback}
                disabled={submitting}
                className="bg-primary p-4 rounded-2xl items-center"
              >
                <Text className="text-black font-bold">{submitting ? 'Sending...' : 'Submit Feedback'}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Settings Group: App */}
          <View className="mb-8">
            <Text className="text-muted-foreground text-xs font-bold uppercase mb-4 px-2">Application Settings</Text>
            
            <View className="bg-card rounded-3xl border border-border overflow-hidden">
              <View className="p-4 flex-row items-center justify-between border-b border-border">
                <View className="flex-row items-center gap-3">
                  <Globe color="#FF6B00" size={20} />
                  <Text className="text-foreground font-medium">Language</Text>
                </View>
                <TouchableOpacity onPress={toggleLanguage} className="bg-secondary px-3 py-1 rounded-full border border-border">
                  <Text className="text-foreground font-bold">{language === 'en' ? 'English' : 'বাংলা'}</Text>
                </TouchableOpacity>
              </View>

              <View className="p-4 flex-row items-center justify-between border-b border-border">
                <View className="flex-row items-center gap-3">
                  <Bell color="#FF6B00" size={20} />
                  <Text className="text-foreground font-medium">Notifications</Text>
                </View>
                <Switch 
                  value={isNotificationsEnabled} 
                  onValueChange={setIsNotificationsEnabled}
                  trackColor={{ false: '#222', true: '#FF6B00' }}
                  thumbColor="#fff"
                />
              </View>

              <View className="p-4 flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <Moon color="#FF6B00" size={20} />
                  <Text className="text-foreground font-medium">Dark Mode</Text>
                </View>
                <Switch 
                  value={isDarkMode} 
                  onValueChange={setIsDarkMode}
                  trackColor={{ false: '#222', true: '#FF6B00' }}
                  thumbColor="#fff"
                />
              </View>
            </View>
          </View>

          {/* Settings Group: Support */}
          <View className="mb-8">
            <Text className="text-muted-foreground text-xs font-bold uppercase mb-4 px-2">Support & Community</Text>
            <View className="bg-card rounded-3xl border border-border overflow-hidden">
              <TouchableOpacity onPress={handleFeedback} className="p-4 flex-row items-center justify-between border-b border-border">
                <View className="flex-row items-center gap-3">
                  <MessageSquare color="#FF6B00" size={20} />
                  <Text className="text-foreground font-medium">Send Feedback</Text>
                </View>
                <ChevronRight color="#888" size={20} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleChangelog} className="p-4 flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <History color="#FF6B00" size={20} />
                  <Text className="text-foreground font-medium">Premium Changelog</Text>
                </View>
                <ChevronRight color="#888" size={20} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Settings Group: Account */}
          <View className="mb-8">
            <Text className="text-muted-foreground text-xs font-bold uppercase mb-4 px-2">Security & Privacy</Text>
            <View className="bg-card rounded-3xl border border-border overflow-hidden">
              <TouchableOpacity className="p-4 flex-row items-center justify-between border-b border-border">
                <View className="flex-row items-center gap-3">
                  <Shield color="#FF6B00" size={20} />
                  <Text className="text-foreground font-medium">Account Security</Text>
                </View>
                <ChevronRight color="#888" size={20} />
              </TouchableOpacity>
                <TouchableOpacity onPress={handleSignOut} className="p-4 flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3">
                    <LogOut color="#FF6B00" size={20} />
                    <Text className="text-red-500 font-medium">Sign Out</Text>
                  </View>
                  <ChevronRight color="#888" size={20} />
                </TouchableOpacity>

            </View>
          </View>

          <View className="mb-10 items-center">
            <Text className="text-muted-foreground text-xs italic">BazarBuddy v1.0.0 (Alpha)</Text>
            <Text className="text-muted-foreground text-[10px] mt-1">© 2026 Bangladesh Groceries Inc.</Text>
          </View>
        </ScrollView>
      </ScreenWrapper>
    </SafeAreaView>
  );
}

