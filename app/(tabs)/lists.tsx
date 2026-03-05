import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Search, Calendar, ChevronRight, ShoppingCart } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { supabase } from '../../lib/supabase';

export default function ListsScreen() {
  const router = useRouter();
  const [lists, setLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

    const fetchLists = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('grocery_lists')
          .select(`
            *,
            grocery_items(id, estimated_price)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });


      if (error) throw error;
      setLists(data || []);
    } catch (error) {
      console.error('Error fetching lists:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLists();
  };

  const filteredLists = lists.filter(list => 
    list.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateTotal = (items: any[]) => {
    const total = items?.reduce((acc, item) => acc + Number(item.estimated_price || 0), 0) || 0;
    return `৳ ${total.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-secondary text-muted-foreground';
      case 'in_progress': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-primary/20 text-primary';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScreenWrapper>
        <View className="flex-1 px-4 py-6">
            <View className="flex-row justify-between items-end mb-6">
              <View>
                <Text className="text-muted-foreground text-sm font-medium">Manage your</Text>
                <Text className="text-foreground text-3xl font-bold">Grocery Lists</Text>
              </View>
              <TouchableOpacity 
                onPress={() => router.push('/new-list')}
                className="bg-primary p-3 rounded-full shadow-lg"
              >
                <Plus color="black" size={24} />
              </TouchableOpacity>
            </View>

          {/* Search Bar */}
          <View className="bg-secondary p-3 rounded-2xl flex-row items-center gap-3 border border-border mb-6">
            <Search color="#888" size={20} />
            <TextInput
              placeholder="Search lists..."
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 text-foreground font-medium outline-none"
            />
          </View>

          {/* Lists Container */}
          {loading ? (
            <ActivityIndicator color="#FF6B00" size="large" className="mt-10" />
          ) : filteredLists.length === 0 ? (
            <View className="flex-1 items-center justify-center py-20">
              <ShoppingCart color="#444" size={64} className="mb-4" />
              <Text className="text-muted-foreground text-lg">No grocery lists found</Text>
              <TouchableOpacity 
                onPress={() => router.push('/new-list')}
                className="mt-4"
              >
                <Text className="text-primary font-bold">Create one now</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={filteredLists}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 100 }}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B00" />
              }
              renderItem={({ item }) => (
                <TouchableOpacity 
                  onPress={() => router.push(`/list-detail/${item.id}`)}
                  className="bg-card p-5 rounded-3xl border border-border mb-4 flex-row items-center gap-4"
                >
                  <View className="bg-secondary p-3 rounded-2xl">
                    <ShoppingCart color={item.status === 'completed' ? '#888' : '#FF6B00'} size={24} />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row justify-between items-center mb-1">
                      <Text className="text-foreground font-bold text-lg">{item.title}</Text>
                      <Text className={`text-xs px-2 py-1 rounded-full font-bold ${getStatusColor(item.status)}`}>
                        {item.status.toUpperCase()}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-4">
                        <View className="flex-row items-center gap-1">
                          <Calendar color="#888" size={14} />
                          <Text className="text-muted-foreground text-xs">
                            {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </Text>
                        </View>

                      <Text className="text-primary font-bold">{calculateTotal(item.grocery_items)}</Text>
                    </View>
                  </View>
                  <ChevronRight color="#888" size={20} />
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </ScreenWrapper>
    </SafeAreaView>
  );
}
