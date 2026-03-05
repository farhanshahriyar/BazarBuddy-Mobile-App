import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, TrendingUp, DollarSign, Calendar, ArrowRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';

const { width } = Dimensions.get('window');

const AnalyticsDashboard = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, weeklyAvg: 0 });
  const [chartData, setChartData] = useState<any[]>([]);

    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: items, error } = await supabase
          .from('grocery_items')
          .select('estimated_price, created_at, grocery_lists!inner(user_id)')
          .eq('grocery_lists.user_id', user.id);


      if (error) throw error;

      const total = items?.reduce((acc, item) => acc + Number(item.estimated_price || 0), 0) || 0;
      setStats({
        total,
        weeklyAvg: total / 4, // Simple mock for monthly average
      });

      // Simple mock for chart data based on real total
      const SPENDING_CHART = [
        { label: 'Jan', value: total * 0.8, height: 120 },
        { label: 'Feb', value: total, height: 180 },
        { label: 'Mar', value: total * 0.9, height: 140 },
        { label: 'Apr', value: total * 1.2, height: 210 },
        { label: 'May', value: total * 0.95, height: 160 },
        { label: 'Jun', value: total * 1.1, height: 190 },
      ];
      setChartData(SPENDING_CHART);

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color="#FF6B00" size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
        <View className="px-4 py-4 flex-row items-center border-b border-border">
          <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
            <ChevronLeft color="white" size={24} />
          </TouchableOpacity>
          <Text className="text-foreground text-xl font-bold">Expense Analytics</Text>
        </View>

        <ScrollView className="flex-1 px-4 py-6">

          <View className="bg-card p-6 rounded-3xl border border-border mb-8 shadow-2xl">
            <View className="flex-row items-center gap-3 mb-4">
              <View className="bg-primary/20 p-2 rounded-xl">
                <TrendingUp color="#FF6B00" size={24} />
              </View>
              <Text className="text-muted-foreground font-bold text-lg">Spending Trend</Text>
            </View>
          
            <View className="flex-row items-end justify-between h-56 pt-6 mb-4">
              {chartData.map((item, index) => (
                <View key={item.label} className="items-center">
                  <View 
                    className={`w-10 rounded-t-xl ${index === 3 ? 'bg-primary' : 'bg-secondary'}`}
                    style={{ height: item.height }}
                  />
                  <Text className="text-muted-foreground text-xs mt-3 font-medium">{item.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className="flex-row gap-4 mb-8">
            <View className="flex-1 bg-secondary/50 p-5 rounded-3xl border border-border">
              <DollarSign color="#FF6B00" size={24} className="mb-2" />
              <Text className="text-muted-foreground text-xs font-medium uppercase tracking-widest mb-1">Total Spent</Text>
              <Text className="text-foreground text-2xl font-bold">৳ {stats.total.toLocaleString()}</Text>
            </View>
            <View className="flex-1 bg-secondary/50 p-5 rounded-3xl border border-border">
              <Calendar color="#FF6B00" size={24} className="mb-2" />
              <Text className="text-muted-foreground text-xs font-medium uppercase tracking-widest mb-1">Weekly Avg</Text>
              <Text className="text-foreground text-2xl font-bold">৳ {stats.weeklyAvg.toLocaleString()}</Text>
            </View>
          </View>

          <Text className="text-foreground text-xl font-bold mb-4 ml-1">Categories Breakdown</Text>
          {[
            { label: 'Grocery', percent: 65, color: 'bg-primary', amount: `৳ ${(stats.total * 0.65).toLocaleString()}` },
            { label: 'Stationary', percent: 15, color: 'bg-blue-400', amount: `৳ ${(stats.total * 0.15).toLocaleString()}` },
            { label: 'Personal Care', percent: 12, color: 'bg-purple-400', amount: `৳ ${(stats.total * 0.12).toLocaleString()}` },
            { label: 'Others', percent: 8, color: 'bg-green-400', amount: `৳ ${(stats.total * 0.08).toLocaleString()}` },
          ].map((cat) => (
            <View key={cat.label} className="bg-card p-5 rounded-3xl border border-border mb-4">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-foreground font-bold text-lg">{cat.label}</Text>
                <Text className="text-primary font-bold">{cat.amount}</Text>
              </View>
              <View className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <View className={`h-full ${cat.color}`} style={{ width: `${cat.percent}%` }} />
              </View>
              <Text className="text-muted-foreground text-xs mt-2 font-medium">{cat.percent}% of total budget</Text>
            </View>
          ))}

          <TouchableOpacity className="mt-6 mb-12 bg-primary/10 border border-primary/30 p-5 rounded-3xl flex-row items-center justify-between">
            <View>
              <Text className="text-primary font-bold text-lg mb-1">Generate Full Report</Text>
              <Text className="text-muted-foreground text-xs">Monthly detailed PDF with insights</Text>
            </View>
            <ArrowRight color="#FF6B00" size={24} />
          </TouchableOpacity>
        </ScrollView>
    </SafeAreaView>
  );
};

export default AnalyticsDashboard;
