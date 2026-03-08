// @ts-ignore
import "https://deno.land/x/xhr@0.1.0/mod.ts";
// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// @ts-ignore
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// @ts-ignore
serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { itemName, quantity, unit } = await req.json();
    console.log(`Generating price for: ${itemName}, quantity: ${quantity}, unit: ${unit}`);

    // Check if API key is configured
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not configured in Supabase secrets');
    }

    // Detect if the item name is in Bangla
    const isBangla = /[\u0980-\u09FF]/.test(itemName);

    let prompt;
    if (isBangla) {
      prompt = `বাংলাদেশে ${quantity} ${unit} "${itemName}" এর একটি যুক্তিসঙ্গত বাজার মূল্য অনুমান করুন।

      মূল্য অনুমানের সময় নিচের জনপ্রিয় গ্রোসারি প্ল্যাটফর্মগুলোর সাধারণ দাম বিবেচনা করুন:
      - চালডাল (Chaldal)
      - স্বপ্ন (Shwapno)
      - মীনা বাজার
      - স্থানীয় কাঁচাবাজার

      প্রদত্ত পরিমাণ ও একক অনুযায়ী মূল্য সমন্বয় করুন।
      যদি একাধিক সম্ভাব্য মূল্য থাকে, তবে গড় মূল্য নির্ধারণ করুন।

      শুধু একটি সংখ্যা দিন (বাংলাদেশি টাকা – BDT)।
      কোনো ব্যাখ্যা, লেখা, চিহ্ন বা দোকানের নাম লিখবেন না।
      উদাহরণ: 140`;
    } else {
      prompt = `Estimate the price of ${quantity} ${unit} of "${itemName}" in Bangladesh.

      While estimating, internally consider prices commonly listed on popular Bangladeshi grocery platforms such as:
      - Chaldal
      - Shwapno
      - Meena Bazar
      - Local wet markets (kacha bazar)

      Normalize the price based on the given quantity and unit.
      If multiple prices are likely, calculate a reasonable average.

      Return ONLY a single numeric value in Bangladeshi Taka (BDT).
      Do not include text, symbols, explanations, or shop names.
      Example response: 140`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that provides average market prices for grocery items in Bangladesh. Respond with only the numeric price value in Bangladeshi Taka (BDT) without any text, currency symbols or explanations.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
      }),
    });

    const data = await response.json();
    console.log("OpenAI response:", JSON.stringify(data));

    // Check for API errors
    if (data.error) {
      throw new Error(`OpenAI API Error: ${data.error.message || JSON.stringify(data.error)}`);
    }

    // Validate response structure
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response structure from OpenAI');
    }

    // Parse the generated price, handling various possible formats
    const priceText = data.choices[0].message.content.trim();
    const priceMatch = priceText.replace(/,/g, '').match(/(\d+(\.\d+)?)/);
    const price = priceMatch ? parseFloat(priceMatch[0]) : null;

    if (price === null || isNaN(price)) {
      throw new Error(`Failed to parse price from response: ${priceText}`);
    }

    // Round the price (user no longer wants the +50 BDT buffer)
    const adjustedPrice = Math.round(price);

    return new Response(JSON.stringify({ success: true, price: adjustedPrice }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error generating price:', error.message);
    // Return 200 with success: false so the frontend gets the detailed error
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});