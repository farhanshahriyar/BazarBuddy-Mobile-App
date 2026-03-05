import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Calendar as CalendarIcon, ShoppingBag } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../lib/supabase';

export default function NewListModal() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [dateValue, setDateValue] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const formattedDate = dateValue.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });

  const onDateChange = (event: any, selectedDate?: Date) => {
    // Android closes the picker automatically on selection
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate) {
      setDateValue(selectedDate);
    }
  };

    const handleCreate = async () => {
      if (!title.trim() || loading) return;
      
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
          .from('grocery_lists')
          .insert([
            { 
              title: title.trim(), 
              month: dateValue.toLocaleString('default', { month: 'long' }),
              year: dateValue.getFullYear(),
              user_id: user.id
            }
          ])
          .select()
          .single();

        if (error) throw error;
        
        router.replace(`/list-detail/${data.id}`);
      } catch (error) {
        console.error('Error creating list:', error);
        alert('Failed to create list. Please try again.');
      } finally {
        setLoading(false);
      }
    };


  return (
    <SafeAreaView className="flex-1 bg-background">
        <View className="px-4 py-4 flex-row justify-between items-center border-b border-border">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <X color="white" size={24} />
          </TouchableOpacity>
          <Text className="text-foreground text-xl font-bold">New Grocery List</Text>
          <TouchableOpacity onPress={handleCreate} disabled={!title.trim() || loading} className="p-2">
            {loading ? (
              <ActivityIndicator color="#FF6B00" />
            ) : (
              <Text className={`font-bold text-lg ${title.trim() ? 'text-primary' : 'text-muted-foreground'}`}>Create</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-6">
          <View className="mb-8 items-center">
            <View className="bg-primary/20 p-6 rounded-full mb-4">
              <ShoppingBag color="#FF6B00" size={48} />
            </View>
            <Text className="text-muted-foreground text-center">Give your shopping list a name and date to stay organized.</Text>
          </View>

          <View className="space-y-6">
            <View>
              <Text className="text-muted-foreground font-medium mb-2">List Title</Text>
              <TextInput
                placeholder="e.g., Monthly Grocery, Birthday Party"
                placeholderTextColor="#888"
                value={title}
                onChangeText={setTitle}
                className="bg-card p-4 rounded-2xl border border-border text-foreground text-lg font-medium"
                autoFocus
              />
            </View>

            <View>
              <Text className="text-muted-foreground font-medium mb-2">Date</Text>
              {Platform.OS === 'web' ? (
                <View className="bg-card rounded-2xl border border-border flex-row items-center px-4 overflow-hidden">
                  <TextInput
                    // @ts-ignore
                    type="date"
                    value={dateValue.toISOString().split('T')[0]}
                    onChange={(e: any) => {
                      const newDate = new Date(e.target.value);
                      if (!isNaN(newDate.getTime())) {
                        setDateValue(newDate);
                      }
                    }}
                    className="flex-1 py-4 bg-transparent text-foreground text-lg font-medium outline-none"
                    style={{ 
                      // @ts-ignore
                      colorScheme: 'dark',
                    }}
                  />
                  <CalendarIcon color="#FF6B00" size={20} />
                </View>
              ) : (
                <>
                  <TouchableOpacity 
                    onPress={() => setShowDatePicker(true)}
                    className="bg-card p-4 rounded-2xl border border-border flex-row items-center justify-between"
                  >
                    <Text className="text-foreground text-lg font-medium">{formattedDate}</Text>
                    <CalendarIcon color="#FF6B00" size={20} />
                  </TouchableOpacity>

                  {showDatePicker && (
                    <DateTimePicker
                      value={dateValue}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={onDateChange}
                    />
                  )}
                  
                  {showDatePicker && Platform.OS === 'ios' && (
                    <TouchableOpacity 
                      onPress={() => setShowDatePicker(false)}
                      className="mt-2 items-end"
                    >
                      <Text className="text-primary font-bold">Done</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>

            <View className="mt-8">
              <Text className="text-muted-foreground text-sm font-medium mb-4">Quick Templates</Text>
              <View className="flex-row flex-wrap gap-2">
                {['Monthly Grocery', 'Weekend Bazar', 'Office Supplies', 'Event Planning'].map((template) => (
                  <TouchableOpacity 
                    key={template}
                    onPress={() => setTitle(template)}
                    className="bg-secondary px-4 py-2 rounded-full border border-border"
                  >
                    <Text className="text-foreground/80 font-medium">{template}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
    </SafeAreaView>
  );
}
