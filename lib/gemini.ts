import { supabase } from './supabase';

export async function suggestPriceWithGemini(itemName: string, unit: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke('generate-price', {
    body: { itemName, quantity: 1, unit },
  });

  if (error) throw new Error(error.message || 'Edge function unreachable');
  if (!data?.success) throw new Error(data?.error || 'Price generation failed');
  if (!data.price) throw new Error('No price returned from AI');

  return data.price.toString();
}

// No edge function available for pro tips — returns null so the default tip is used
export async function getDynamicProTipWithGemini(): Promise<string | null> {
  return null;
}
