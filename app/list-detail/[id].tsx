import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, Alert, Platform, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Plus, Trash2, CheckCircle2, Circle, Edit3, Share2, FileText } from 'lucide-react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { supabase } from '../../lib/supabase';

export default function ListDetailScreen() {
  const { id } = useLocalSearchParams();
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
        .order('created_at', { ascending: true });

      if (itemsError) throw itemsError;
      setItems(itemsData || []);
    } catch (error) {
      console.error('Error fetching list details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListDetails();
  }, [id]);

  const toggleComplete = async (itemId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('grocery_items')
        .update({ is_completed: !currentStatus })
        .eq('id', itemId);

      if (error) throw error;
      setItems(items.map(item => item.id === itemId ? { ...item, is_completed: !currentStatus } : item));
    } catch (error) {
      console.error('Error toggling item:', error);
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('grocery_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      setItems(items.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const shareList = async () => {
    const itemsList = items.map(item => `${item.is_completed ? '✅' : '⬜'} ${item.name} - ${item.quantity} ${item.unit} (৳${item.estimated_price})`).join('\n');
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

  const confirmDeleteItem = (itemId: string, itemName: string) => {
    Alert.alert('Delete Item', `Remove "${itemName}" from this list?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteItem(itemId) },
    ]);
  };

  const totalSpent = items.reduce((acc, item) => acc + Number(item.estimated_price || 0), 0);
  const completedCount = items.filter(item => item.is_completed).length;

  const generatePDF = async () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>BazarBuddy Shopping List</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;700&display=swap');
            body {
              font-family: 'Hind Siliguri', sans-serif, 'Helvetica Neue', Helvetica, Arial;
              padding: 40px;
              color: #333;
              line-height: 1.6;
            }
            .header {
              border-bottom: 3px solid #FF6B00;
              padding-bottom: 20px;
              margin-bottom: 30px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .title {
              color: #FF6B00;
              margin: 0;
              font-size: 28px;
            }
            .meta {
              text-align: right;
              font-size: 14px;
              color: #666;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th {
              background-color: #f8f9fa;
              text-align: left;
              padding: 12px;
              border-bottom: 2px solid #dee2e6;
              color: #FF6B00;
            }
            td {
              padding: 12px;
              border-bottom: 1px solid #eee;
            }
            .completed {
              color: #999;
              text-decoration: line-through;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              display: flex;
              justify-content: space-between;
              font-weight: bold;
              font-size: 20px;
            }
            .branding {
              margin-top: 60px;
              text-align: center;
              color: #FF6B00;
              font-style: italic;
              font-size: 14px;
            }
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
              <p>Status: ${list?.status || 'Active'}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr class="${item.is_completed ? 'completed' : ''}">
                  <td>${item.name}</td>
                  <td>${item.quantity} ${item.unit}</td>
                  <td>৳ ${item.estimated_price}</td>
                  <td>${item.is_completed ? 'Purchased' : 'Pending'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <span>Total Estimated Cost</span>
            <span style="color: #FF6B00;">৳ ${totalSpent.toLocaleString()}</span>
          </div>

          <div class="branding">
            Generated with BazarBuddy App
          </div>
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
      if (Platform.OS === 'web') {
        alert('Error: Failed to generate PDF. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to generate PDF. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color="#FF6B00" size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
        {/* Custom Header */}
        <View className="px-4 py-4 flex-row items-center justify-between border-b border-border">
          <TouchableOpacity onPress={() => router.back()} className="bg-secondary p-2 rounded-full">
            <ArrowLeft color="#FF6B00" size={24} />
          </TouchableOpacity>
          <Text className="text-foreground text-xl font-bold">{list?.title || 'List Detail'}</Text>
          <View className="flex-row gap-2">
            <TouchableOpacity onPress={shareList} className="bg-secondary p-2 rounded-full">
              <Share2 color="#FF6B00" size={20} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={generatePDF}
              className="bg-secondary p-2 rounded-full"
            >
              <FileText color="#FF6B00" size={20} />
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-1 px-4 py-6">
          {/* List Info Summary */}
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

          {/* Add Item Trigger */}
          <TouchableOpacity 
            onPress={() => router.push({ pathname: '/add-item', params: { listId: id } })}
            className="bg-primary/10 border border-primary/30 border-dashed p-4 rounded-2xl flex-row items-center justify-center gap-2 mb-6"
          >
            <Plus color="#FF6B00" size={20} />
            <Text className="text-primary font-bold">Add New Item</Text>
          </TouchableOpacity>

          {/* Grocery Items List */}
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View className={`bg-card p-4 rounded-2xl border mb-3 flex-row items-center gap-3 ${item.is_completed ? 'border-border opacity-60' : 'border-border'}`}>
                <TouchableOpacity onPress={() => toggleComplete(item.id, item.is_completed)}>
                  {item.is_completed ? <CheckCircle2 color="#FF6B00" size={24} /> : <Circle color="#888" size={24} />}
                </TouchableOpacity>
                
                <View className="flex-1">
                  <Text className={`text-foreground font-bold ${item.is_completed ? 'line-through decoration-muted-foreground' : ''}`}>{item.name}</Text>
                  <Text className="text-muted-foreground text-xs">{item.quantity} {item.unit} • ৳ {item.estimated_price}</Text>
                </View>

                <View className="flex-row gap-2">
                  <TouchableOpacity 
                    onPress={() => Alert.alert('Edit Item', `Editing "${item.name}" is coming soon!`)}
                    className="bg-secondary/50 p-2 rounded-lg"
                  >
                    <Edit3 color="#FF6B00" size={16} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => confirmDeleteItem(item.id, item.name)} className="bg-red-500/10 p-2 rounded-lg">
                    <Trash2 color="#ef4444" size={16} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        </View>
    </SafeAreaView>
  );
}
