// client/lib/gemini.ts

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

async function callGemini(prompt: string): Promise<string | null> {
  if (!API_KEY) {
    console.error('EXPO_PUBLIC_GEMINI_API_KEY is not set in .env.local');
    return null;
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
  } catch (error) {
    console.error('Gemini fetch error:', error);
    return null;
  }
}

export async function suggestPriceWithGemini(itemName: string, unit: string): Promise<string | null> {
  const prompt = `What is the current average estimated retail price of 1 ${unit} of "${itemName}" in ordinary local markets in Bangladesh? Return ONLY a number in BDT. No currency symbols, no text, no ranges. Just the whole number. Example: 80`;
  const result = await callGemini(prompt);
  
  if (result) {
    // Clean up just in case it returns something like "80 BDT" or "৳80"
    const parsed = parseInt(result.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(parsed)) {
      return parsed.toString();
    }
  }
  return null;
}

export async function getDynamicProTipWithGemini(): Promise<string | null> {
  const prompt = `Give me a single short, helpful tip (max 2 sentences) about buying groceries, smart shopping, or current food market prices specifically focused on Bangladesh. Do not use quotes or introductory phrasing. Make it actionable.`;
  return await callGemini(prompt);
}
