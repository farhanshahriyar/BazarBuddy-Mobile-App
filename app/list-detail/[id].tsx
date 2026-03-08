import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert, Platform, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { ArrowLeft, Plus, Trash2, CheckCircle2, Circle, Edit3, Share2, FileText, GripVertical } from 'lucide-react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { supabase } from '../../lib/supabase';

const ITEM_HEIGHT = 76;

// ─── Sortable Item ────────────────────────────────────────────────────────────
function SortableItem({
  item,
  index,
  totalItems,
  onMove,
  onToggleComplete,
  onConfirmDelete,
}: {
  item: any;
  index: number;
  totalItems: number;
  onMove: (from: number, to: number) => void;
  onToggleComplete: (id: string, status: boolean) => void;
  onConfirmDelete: (id: string, name: string) => void;
}) {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const elevation = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .activateAfterLongPress(350)
    .onBegin(() => {
      scale.value = withSpring(1.04);
      elevation.value = 1;
    })
    .onUpdate((e) => {
      translateY.value = e.translationY;
    })
    .onEnd((e) => {
      const newIndex = Math.max(
        0,
        Math.min(totalItems - 1, index + Math.round(e.translationY / ITEM_HEIGHT))
      );
      if (newIndex !== index) runOnJS(onMove)(index, newIndex);
      translateY.value = withSpring(0);
      scale.value = withSpring(1);
      elevation.value = 0;
    })
    .onFinalize(() => {
      translateY.value = withSpring(0);
      scale.value = withSpring(1);
      elevation.value = 0;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    zIndex: elevation.value ? 999 : 1,
    shadowColor: '#000',
    shadowOpacity: elevation.value ? 0.2 : 0,
    shadowRadius: elevation.value ? 8 : 0,
    shadowOffset: { width: 0, height: elevation.value ? 4 : 0 },
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[animatedStyle, { marginBottom: 12 }]}>
        <View
          className={`bg-card p-4 rounded-2xl border border-border flex-row items-center gap-3 ${
            item.is_completed ? 'opacity-60' : ''
          }`}
        >
          <TouchableOpacity
            onPress={() => onToggleComplete(item.id, item.is_completed)}
            className={`w-8 h-8 rounded-full items-center justify-center ${
              item.is_completed ? 'bg-primary' : 'bg-secondary border-2 border-muted-foreground/30'
            }`}
          >
            {item.is_completed && <CheckCircle2 color="black" size={20} />}
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text
              className={`text-foreground font-bold ${item.is_completed ? 'line-through' : ''}`}
            >
              {item.name}
            </Text>
            <Text className="text-muted-foreground text-xs">
              {item.quantity} {item.unit}
              {item.estimated_price ? ` • ৳ ${item.estimated_price}` : ''}
            </Text>
          </View>

          <View className="flex-row gap-2 items-center">
            <TouchableOpacity
              onPress={() => Alert.alert('Edit Item', `Editing "${item.name}" is coming soon!`)}
              className="bg-secondary/50 p-2 rounded-lg"
            >
              <Edit3 color="#FF6B00" size={16} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onConfirmDelete(item.id, item.name)}
              className="bg-red-500/10 p-2 rounded-lg"
            >
              <Trash2 color="#ef4444" size={16} />
            </TouchableOpacity>
            <View className="p-1">
              <GripVertical color="#444" size={20} />
            </View>
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ListDetailScreen() {
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const [list, setList] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchListDetails = async () => {
    try {
      const { data: listData, error: listError } = await supabase
        .from('grocery_lists')
        .select('*')
        .eq('id', id)
        .single();

      if (listError) throw listError;
      setList(listData);

      const { data: itemsData, error: itemsError } = await supabase
        .from('grocery_items')
        .select('*')
        .eq('list_id', id)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (itemsError) throw itemsError;
      setItems(itemsData || []);
    } catch (error) {
      console.error('Error fetching list details:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchListDetails();
    }, [id])
  );

  const toggleComplete = (itemId: string, currentStatus: boolean) => {
    setItems(prev =>
      prev.map(item => item.id === itemId ? { ...item, is_completed: !currentStatus } : item)
    );
  };

  const deleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase.from('grocery_items').delete().eq('id', itemId);
      if (error) throw error;
      setItems(items.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const confirmDeleteItem = (itemId: string, itemName: string) => {
    Alert.alert('Delete Item', `Remove "${itemName}" from this list?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteItem(itemId) },
    ]);
  };

  const moveItem = async (fromIndex: number, toIndex: number) => {
    const newItems = [...items];
    const [moved] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, moved);
    setItems(newItems);
    await Promise.all(
      newItems.map((item, i) =>
        supabase.from('grocery_items').update({ sort_order: i }).eq('id', item.id)
      )
    );
  };

  const shareList = async () => {
    const itemsList = items
      .map(item => `${item.is_completed ? '✅' : '⬜'} ${item.name} - ${item.quantity} ${item.unit}${item.estimated_price ? ` (৳${item.estimated_price})` : ''}`)
      .join('\n');
    const message = `📋 ${list?.title || 'Grocery List'}\n\n${itemsList || 'No items yet'}\n\nTotal: ৳${totalSpent.toLocaleString()}\n\nShared via BazarBuddy`;

    try {
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(message);
        alert('List copied to clipboard!');
      } else {
        await Share.share({ message });
      }
    } catch (error) {
      console.error('Error sharing list:', error);
    }
  };

  const generatePDF = async () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>BazarBuddy Shopping List</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; line-height: 1.6; }
            .header { border-bottom: 3px solid #FF6B00; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .title { color: #FF6B00; margin: 0; font-size: 28px; }
            .meta { text-align: right; font-size: 14px; color: #666; }
            table { width: 100%; border-collapse: collapse; }
            th { background-color: #f8f9fa; text-align: left; padding: 12px; border-bottom: 2px solid #dee2e6; color: #FF6B00; }
            td { padding: 12px; border-bottom: 1px solid #eee; }
            .completed { color: #999; text-decoration: line-through; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; display: flex; justify-content: space-between; font-weight: bold; font-size: 20px; }
            .branding { margin-top: 60px; text-align: center; color: #FF6B00; font-style: italic; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="title">${list?.title || 'Grocery List'}</h1>
              <p>BazarBuddy • Your Smart Shopping Assistant</p>
            </div>
            <div class="meta">
              <p>Generated: ${new Date().toLocaleDateString()}</p>
            </div>
          </div>
          <table>
            <thead>
              <tr><th>Item</th><th>Quantity</th><th>Price</th><th>Status</th></tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr class="${item.is_completed ? 'completed' : ''}">
                  <td>${item.name}</td>
                  <td>${item.quantity} ${item.unit}</td>
                  <td>${item.estimated_price ? `৳ ${item.estimated_price}` : '-'}</td>
                  <td>${item.is_completed ? 'Purchased' : 'Pending'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            <span>Total Estimated Cost</span>
            <span style="color:#FF6B00">৳ ${totalSpent.toLocaleString()}</span>
          </div>
          <div class="branding">Generated with BazarBuddy App</div>
        </body>
      </html>
    `;

    try {
      if (Platform.OS === 'web') {
        await Print.printAsync({ html: htmlContent });
      } else {
        const { uri } = await Print.printToFileAsync({ html: htmlContent });
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Failed to generate PDF. Please try again.');
    }
  };

  const totalSpent = items.reduce((acc, item) => acc + Number(item.estimated_price || 0), 0);
  const completedCount = items.filter(item => item.is_completed).length;

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color="#FF6B00" size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="px-4 py-4 flex-row items-center justify-between border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="bg-secondary p-2 rounded-full">
          <ArrowLeft color="#FF6B00" size={24} />
        </TouchableOpacity>
        <Text className="text-foreground text-xl font-bold">{list?.title || 'List Detail'}</Text>
        <View className="flex-row gap-2">
          <TouchableOpacity onPress={shareList} className="bg-secondary p-2 rounded-full">
            <Share2 color="#FF6B00" size={20} />
          </TouchableOpacity>
          <TouchableOpacity onPress={generatePDF} className="bg-secondary p-2 rounded-full">
            <FileText color="#FF6B00" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-1 px-4 py-6">
        {/* Summary */}
        <View className="bg-card p-5 rounded-3xl border border-border mb-6 flex-row justify-between items-center">
          <View>
            <Text className="text-muted-foreground text-xs font-medium">Total Spent</Text>
            <Text className="text-foreground text-3xl font-bold">৳ {totalSpent.toLocaleString()}</Text>
          </View>
          <View className="items-end">
            <Text className="text-muted-foreground text-xs font-medium">Progress</Text>
            <Text className="text-primary text-lg font-bold">{completedCount}/{items.length} items</Text>
          </View>
        </View>

        {/* Add Item */}
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/add-item', params: { listId: id } })}
          className="bg-primary/10 border border-primary/30 border-dashed p-4 rounded-2xl flex-row items-center justify-center gap-2 mb-6"
        >
          <Plus color="#FF6B00" size={20} />
          <Text className="text-primary font-bold">Add New Item</Text>
        </TouchableOpacity>

        {items.length > 0 && (
          <Text className="text-muted-foreground text-xs mb-3 text-center">
            Hold & drag <GripVertical color="#555" size={12} /> to reorder
          </Text>
        )}

        {/* Items */}
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <SortableItem
              item={item}
              index={index}
              totalItems={items.length}
              onMove={moveItem}
              onToggleComplete={toggleComplete}
              onConfirmDelete={confirmDeleteItem}
            />
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      </View>
    </SafeAreaView>
  );
}
