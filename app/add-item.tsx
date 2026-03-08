import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Sparkles, ShoppingCart, Pencil } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { suggestPriceWithGemini } from '../lib/gemini';

const UNIT_GROUPS = [
  { label: 'Weight',    units: ['kg', 'g', 'mg'] },
  { label: 'Volume',    units: ['L', 'mL'] },
  { label: 'Count',     units: ['pcs', 'dozen', 'pack', 'box', 'bag', 'bundle', 'roll'] },
  { label: 'Container', units: ['bottle', 'can', 'sachet', 'jar', 'carton'] },
];

export default function AddItemScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const listId = Array.isArray(params.listId) ? params.listId[0] : params.listId;

  const [itemName, setItemName]         = useState('');
  const [quantity, setQuantity]         = useState('');
  const [unit, setUnit]                 = useState('kg');
  const [price, setPrice]               = useState('');
  const [priceEnabled, setPriceEnabled] = useState(false);
  const [isAiSuggesting, setIsAiSuggesting] = useState(false);
  const [loading, setLoading]           = useState(false);

  const suggestPrice = async () => {
    if (!itemName.trim()) {
      Alert.alert('Item name required', 'Please enter an item name first.');
      return;
    }
    setIsAiSuggesting(true);
    try {
      const suggested = await suggestPriceWithGemini(itemName.trim(), unit);
      setPrice(suggested);
      setPriceEnabled(true);
    } catch (error: any) {
      console.error('AI suggestion error:', error);
      Alert.alert(
        'AI Suggestion Failed',
        error?.message?.includes('unreachable')
          ? 'The AI service is not deployed yet. Please enter price manually.'
          : 'Could not get a price estimate right now. Please enter manually.',
        [{ text: 'Enter Manually', onPress: () => setPriceEnabled(true) }, { text: 'Cancel' }]
      );
    } finally {
      setIsAiSuggesting(false);
    }
  };

  const saveItem = async () => {
    if (!itemName.trim()) {
      Alert.alert('Required', 'Please enter an item name.');
      return;
    }
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
      Alert.alert('Required', 'Please enter a valid quantity.');
      return;
    }
    if (!listId) {
      Alert.alert('Error', 'List not found. Please go back and try again.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('grocery_items').insert([
        {
          list_id: listId,
          name: itemName.trim(),
          quantity: Number(quantity),
          unit,
          estimated_price: price ? Number(price) : null,
        },
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
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4 border-b border-border">
          <TouchableOpacity onPress={() => router.back()} className="bg-secondary p-2 rounded-full">
            <ArrowLeft color="#FF6B00" size={22} />
          </TouchableOpacity>
          <Text className="text-foreground text-xl font-bold">Add New Item</Text>
          <TouchableOpacity
            onPress={saveItem}
            disabled={loading}
            className={`px-4 py-2 rounded-full ${loading ? 'bg-primary/50' : 'bg-primary'}`}
          >
            {loading ? (
              <ActivityIndicator color="black" size="small" />
            ) : (
              <Text className="text-black font-bold text-sm">Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1 px-4 py-5"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Item Name */}
          <View className="mb-5">
            <Text className="text-muted-foreground text-xs font-bold mb-2 tracking-widest">ITEM NAME</Text>
            <TextInput
              placeholder="e.g. Onion (পেঁয়াজ)"
              placeholderTextColor="#555"
              value={itemName}
              onChangeText={setItemName}
              className="bg-card border border-border px-4 py-4 rounded-2xl text-foreground text-base font-medium"
              autoFocus
            />
          </View>

          {/* Quantity */}
          <View className="mb-5">
            <Text className="text-muted-foreground text-xs font-bold mb-2 tracking-widest">QUANTITY</Text>
            <TextInput
              placeholder="e.g. 2"
              placeholderTextColor="#555"
              keyboardType="numeric"
              value={quantity}
              onChangeText={setQuantity}
              className="bg-card border border-border px-4 py-4 rounded-2xl text-foreground text-base font-medium"
            />
          </View>

          {/* Unit */}
          <View className="mb-5">
            <Text className="text-muted-foreground text-xs font-bold mb-3 tracking-widest">UNIT</Text>
            <View className="gap-3">
              {UNIT_GROUPS.map((group) => (
                <View key={group.label}>
                  <Text className="text-muted-foreground text-xs font-medium mb-2">{group.label}</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {group.units.map((u) => (
                      <TouchableOpacity
                        key={u}
                        onPress={() => setUnit(u)}
                        className={`px-4 py-2 rounded-xl border ${
                          unit === u ? 'bg-primary border-primary' : 'bg-card border-border'
                        }`}
                      >
                        <Text className={`text-sm font-bold ${unit === u ? 'text-black' : 'text-foreground'}`}>
                          {u}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Price */}
          <View className="mb-5">
            <View className="flex-row justify-between items-center mb-2">
              <View>
                <Text className="text-muted-foreground text-xs font-bold tracking-widest">
                  ESTIMATED PRICE <Text className="text-muted-foreground/50 font-normal normal-case tracking-normal">(optional)</Text>
                </Text>
              </View>
              <TouchableOpacity
                onPress={suggestPrice}
                disabled={isAiSuggesting}
                className="flex-row items-center gap-1 bg-primary/20 px-3 py-1.5 rounded-full"
              >
                {isAiSuggesting ? (
                  <ActivityIndicator color="#FF6B00" size="small" />
                ) : (
                  <Sparkles color="#FF6B00" size={13} />
                )}
                <Text className="text-primary text-xs font-bold">
                  {isAiSuggesting ? 'Thinking...' : 'AI Suggest'}
                </Text>
              </TouchableOpacity>
            </View>

            <View className={`flex-row items-center border rounded-2xl px-4 ${priceEnabled ? 'bg-card border-border' : 'bg-secondary/50 border-border/50'}`}>
              <Text className={`font-bold text-base mr-1 ${priceEnabled ? 'text-muted-foreground' : 'text-muted-foreground/40'}`}>৳</Text>
              <TextInput
                placeholder={priceEnabled ? '0.00' : 'Use AI Suggest or enter manually'}
                placeholderTextColor={priceEnabled ? '#555' : '#333'}
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
                editable={priceEnabled}
                className="flex-1 py-4 text-foreground text-base font-medium"
              />
            </View>

            {!priceEnabled ? (
              <TouchableOpacity
                onPress={() => setPriceEnabled(true)}
                className="flex-row items-center gap-1 mt-2"
              >
                <Pencil color="#888" size={12} />
                <Text className="text-muted-foreground text-xs">Enter price manually</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => { setPriceEnabled(false); setPrice(''); }}
                className="flex-row items-center gap-1 mt-2"
              >
                <Text className="text-muted-foreground text-xs">✕ Cancel manual entry</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Save Button */}
          <TouchableOpacity
            onPress={saveItem}
            disabled={loading}
            className={`mt-2 mb-10 py-4 rounded-2xl flex-row items-center justify-center gap-2 ${
              loading ? 'bg-primary/50' : 'bg-primary'
            }`}
          >
            {loading ? (
              <ActivityIndicator color="black" />
            ) : (
              <>
                <ShoppingCart color="black" size={20} />
                <Text className="text-black font-bold text-base">Add to List</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
