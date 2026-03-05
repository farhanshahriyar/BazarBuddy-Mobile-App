import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, ShoppingBag, Calendar, ArrowRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { supabase } from '../../lib/supabase';

export default function DashboardScreen() {
  const router = useRouter();
    const [recentLists, setRecentLists] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({ total: 0, count: 0 });
    const [userName, setUserName] = useState('BazarBuddy');
  
      const fetchData = async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'BazarBuddy');


        const { data: lists, error } = await supabase
          .from('grocery_lists')
          .select(`
            *,
            grocery_items(id, estimated_price)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);


      if (error) throw error;
      setRecentLists(lists || []);

      // Calculate simple stats
      let totalSpent = 0;
      lists?.forEach(list => {
        list.grocery_items?.forEach((item: any) => {
          totalSpent += Number(item.estimated_price || 0);
        });
      });
      setStats({ total: totalSpent, count: lists?.length || 0 });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScreenWrapper>
        <ScrollView 
          className="px-4 py-6"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B00" />
          }
        >
            <View className="mb-8">
              <Text className="text-muted-foreground text-sm font-medium">Welcome back, {userName}!</Text>
              <Text className="text-foreground text-3xl font-bold">BazarBuddy</Text>
            </View>


          {/* Expense Overview Card */}
          <View className="bg-card p-6 rounded-3xl border border-border mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-muted-foreground font-medium">Monthly Spending</Text>
              <View className="bg-primary/20 px-3 py-1 rounded-full">
                <Text className="text-primary text-xs font-bold">+0.0%</Text>
              </View>
            </View>
            <Text className="text-foreground text-4xl font-bold mb-2">৳ {stats.total.toLocaleString()}</Text>
            <Text className="text-muted-foreground text-xs italic">Estimated for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</Text>
          </View>

          {/* Quick Actions */}
          <View className="flex-row gap-4 mb-8">
            <TouchableOpacity 
              onPress={() => router.push('/new-list')}
              className="flex-1 bg-primary p-4 rounded-2xl items-center justify-center"
            >
              <ShoppingBag color="black" size={24} />
              <Text className="text-black font-bold mt-2">New List</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => router.push('/analytics')}
              className="flex-1 bg-secondary p-4 rounded-2xl items-center justify-center border border-border"
            >
              <TrendingUp color="white" size={24} />
              <Text className="text-foreground font-bold mt-2">Analytics</Text>
            </TouchableOpacity>
          </View>

          {/* Recent Activity */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-foreground text-xl font-bold">Recent Lists</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/lists')}>
                <Text className="text-primary font-medium">View All</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <ActivityIndicator color="#FF6B00" className="py-8" />
            ) : recentLists.length === 0 ? (
              <View className="bg-card p-8 rounded-2xl border border-border items-center">
                <Text className="text-muted-foreground">No lists yet. Create your first one!</Text>
              </View>
            ) : (
              recentLists.map((list) => (
                <TouchableOpacity 
                  key={list.id} 
                  onPress={() => router.push(`/list-detail/${list.id}`)}
                  className="bg-card p-4 rounded-2xl border border-border mb-3 flex-row items-center justify-between"
                >
                  <View className="flex-row items-center gap-3">
                    <View className="bg-secondary p-2 rounded-xl">
                      <Calendar color="white" size={20} />
                    </View>
                    <View>
                      <Text className="text-foreground font-bold">{list.title}</Text>
                      <Text className="text-muted-foreground text-xs">
                        {new Date(list.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {list.grocery_items?.length || 0} items
                      </Text>
                    </View>
                  </View>
                  <ArrowRight color="#888" size={20} />
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* AI Insight */}
          <View className="bg-primary/10 p-4 rounded-2xl border border-primary/20 border-dashed mb-10">
            <Text className="text-primary font-bold mb-1">💡 BazarBuddy Suggestion</Text>
            <Text className="text-foreground/80 text-sm">Prices for "Onion" and "Rice" are expected to rise next week in local markets. Consider buying now!</Text>
          </View>
        </ScrollView>
      </ScreenWrapper>
    </SafeAreaView>
  );
}

