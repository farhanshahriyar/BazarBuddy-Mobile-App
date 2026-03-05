import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Save, Sparkles, HelpCircle } from 'lucide-react-native';
import { supabase } from '../lib/supabase';

const UNIT_OPTIONS = ['kg', 'gram', 'liter', 'pcs', 'dozen', 'box'];

export default function AddItemScreen() {
  const router = useRouter();
  const { listId } = useLocalSearchParams();
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [price, setPrice] = useState('');
  const [isAiSuggesting, setIsAiSuggesting] = useState(false);
  const [aiPrice, setAiPrice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const suggestPrice = () => {
    if (!itemName) {
      Alert.alert('Please enter an item name first');
      return;
    }
    
    setIsAiSuggesting(true);
    setAiPrice(null);
    
    // Simulate AI Suggestion
    setTimeout(() => {
      // Simple mock logic for Bangladeshi context
      let suggested = '100';
      if (itemName.toLowerCase().includes('onion')) suggested = '90';
      else if (itemName.toLowerCase().includes('rice')) suggested = '70';
      else if (itemName.toLowerCase().includes('oil')) suggested = '180';
      else if (itemName.toLowerCase().includes('egg')) suggested = '12';
      
      setAiPrice(`৳ ${suggested}`);
      setIsAiSuggesting(false);
    }, 1200);
  };

  const useSuggestedPrice = () => {
    if (aiPrice) {
      setPrice(aiPrice.replace('৳ ', ''));
      setAiPrice(null);
    }
  };

  const saveItem = async () => {
    if (!itemName || !quantity || !price || !listId) {
      Alert.alert('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('grocery_items')
        .insert([
          {
            list_id: listId,
            name: itemName,
            quantity: Number(quantity),
            unit: unit,
            estimated_price: Number(price),
            is_completed: false
          }
        ]);

      if (error) throw error;
      router.back();
    } catch (error) {
      console.error('Error saving item:', error);
      Alert.alert('Error', 'Failed to save item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView className="px-4 py-4">
            <View className="flex-row items-center justify-between mb-8">
              <TouchableOpacity onPress={() => router.back()} className="bg-secondary p-2 rounded-full">
                <ArrowLeft color="#FF6B00" size={24} />
              </TouchableOpacity>
              <Text className="text-foreground text-xl font-bold">Add New Item</Text>
              <TouchableOpacity onPress={saveItem} disabled={loading} className="bg-primary p-2 rounded-full">
                {loading ? <ActivityIndicator color="black" size="small" /> : <Save color="black" size={24} />}
              </TouchableOpacity>
            </View>

            <View className="mb-6">
              <Text className="text-muted-foreground text-sm font-bold mb-2">ITEM NAME</Text>
              <TextInput
                placeholder="e.g. Onion (পেঁয়াজ)"
                placeholderTextColor="#888"
                value={itemName}
                onChangeText={setItemName}
                className="bg-card border border-border p-4 rounded-2xl text-foreground text-lg font-bold"
              />
            </View>

            <View className="flex-row gap-4 mb-6">
              <View className="flex-1">
                <Text className="text-muted-foreground text-sm font-bold mb-2">QUANTITY</Text>
                <TextInput
                  placeholder="2"
                  placeholderTextColor="#888"
                  keyboardType="numeric"
                  value={quantity}
                  onChangeText={setQuantity}
                  className="bg-card border border-border p-4 rounded-2xl text-foreground text-lg font-bold"
                />
              </View>
              <View className="flex-1">
                <Text className="text-muted-foreground text-sm font-bold mb-2">UNIT</Text>
                <View className="flex-row flex-wrap gap-2">
                  {UNIT_OPTIONS.slice(0, 3).map(u => (
                    <TouchableOpacity 
                      key={u} 
                      onPress={() => setUnit(u)}
                      className={`px-3 py-2 rounded-xl border ${unit === u ? 'bg-primary border-primary' : 'bg-secondary border-border'}`}
                    >
                      <Text className={`font-bold text-xs ${unit === u ? 'text-black' : 'text-foreground'}`}>{u}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-muted-foreground text-sm font-bold">ESTIMATED PRICE (PER UNIT)</Text>
                <TouchableOpacity 
                  onPress={suggestPrice}
                  disabled={isAiSuggesting}
                  className="flex-row items-center gap-1 bg-primary/20 px-3 py-1.5 rounded-full"
                >
                  <Sparkles color="#FF6B00" size={14} />
                  <Text className="text-primary text-xs font-bold">{isAiSuggesting ? 'Thinking...' : 'AI Suggest'}</Text>
                </TouchableOpacity>
              </View>
              
              <View className="relative">
                <Text className="absolute left-4 top-4 text-foreground text-lg font-bold">৳</Text>
                <TextInput
                  placeholder="0.00"
                  placeholderTextColor="#888"
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                  className="bg-card border border-border p-4 pl-10 rounded-2xl text-foreground text-lg font-bold"
                />
              </View>

              {aiPrice && (
                <TouchableOpacity 
                  onPress={useSuggestedPrice}
                  className="mt-3 bg-primary p-4 rounded-2xl flex-row items-center justify-between border border-primary"
                >
                  <View className="flex-row items-center gap-3">
                    <Sparkles color="black" size={20} />
                    <View>
                      <Text className="text-black font-bold">AI Suggests {aiPrice}</Text>
                      <Text className="text-black/60 text-xs">Based on current market in Bangladesh</Text>
                    </View>
                  </View>
                  <Text className="text-black font-bold underline">USE THIS</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Tips Section */}
            <View className="bg-secondary p-4 rounded-2xl border border-border mt-6">
              <View className="flex-row items-center gap-2 mb-2">
                <HelpCircle color="#888" size={16} />
                <Text className="text-muted-foreground text-sm font-bold">Pro Tip</Text>
              </View>
              <Text className="text-muted-foreground text-xs">
                Prices for onions and essential oils fluctuate daily in Bangladeshi markets. Use AI suggestions to plan your budget effectively.
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
