import { supabase } from './supabase';

export type PersonPreferences = {
  interests: string[];
  style_preferences: Record<string, any>;
  price_range_preferences: Record<string, any>;
  categories: string[];
  brands: string[];
};

export type GiftAnalysis = {
  extracted_info: Record<string, any>;
  category: string;
  price_point: string;
};

export async function analyzePersonNotes(
  personId: string,
  name: string,
  relationship: string,
  notes: string,
  birthday?: string
): Promise<PersonPreferences | null> {
  if (!notes || notes.trim().length === 0) {
    return null;
  }

  try {
    const age = birthday ? calculateAge(birthday) : null;
    const prompt = buildAnalysisPrompt(name, relationship, notes, age);

    const analysis = await callAI(prompt);

    if (!analysis) {
      return getDefaultPreferences();
    }

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Not authenticated');

    await supabase
      .from('person_preferences')
      .upsert({
        person_id: personId,
        user_id: userData.user.id,
        interests: analysis.interests || [],
        style_preferences: analysis.style_preferences || {},
        price_range_preferences: analysis.price_range_preferences || {},
        categories: analysis.categories || [],
        brands: analysis.brands || [],
        last_analyzed_at: new Date().toISOString(),
        confidence_score: analysis.confidence_score || 0.6,
      });

    return analysis;
  } catch (error) {
    console.error('Error analyzing person notes:', error);
    return getDefaultPreferences();
  }
}

export async function analyzeGiftIdea(
  giftIdeaId: string,
  personId: string,
  title: string,
  description: string,
  url: string,
  price?: number
): Promise<void> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Not authenticated');

    let extractedInfo: Record<string, any> = {
      title,
      description,
      price,
    };

    let category = '';
    let pricePoint = '';

    if (url && url.trim().length > 0) {
      const urlAnalysis = await analyzeUrl(url, title, description);
      if (urlAnalysis) {
        extractedInfo = { ...extractedInfo, ...urlAnalysis };
        category = urlAnalysis.category || '';
        pricePoint = urlAnalysis.price_point || '';
      }
    }

    if (!category) {
      category = categorizeFromText(title, description);
    }

    if (!pricePoint && price) {
      pricePoint = getPricePoint(price);
    }

    await supabase.from('gift_analysis').insert({
      gift_idea_id: giftIdeaId,
      user_id: userData.user.id,
      extracted_info: extractedInfo,
      category,
      price_point: pricePoint,
      analyzed_at: new Date().toISOString(),
    });

    await updatePersonPreferences(personId, category, pricePoint, extractedInfo);
  } catch (error) {
    console.error('Error analyzing gift idea:', error);
  }
}

export async function getEnhancedSuggestions(
  personId: string,
  name: string,
  relationship: string,
  notes: string,
  birthday?: string,
  country?: string,
  currency?: string,
  city?: string
): Promise<any[]> {
  try {
    const { data: questionnaire } = await supabase
      .from('questionnaire_responses')
      .select('*')
      .eq('person_id', personId)
      .maybeSingle();

    if (!questionnaire) {
      console.log('No questionnaire found, cannot generate suggestions');
      return [];
    }

    const age = birthday ? calculateAge(birthday) : null;
    const ageRange = getAgeRange(age);
    const location = city && country ? `${city}, ${getCountryName(country)}` : getCountryName(country || 'US');

    const budgetMap: Record<string, string> = {
      'under_20': 'under_20',
      '20_50': '20_50',
      '50_100': '50_100',
      '100_250': '100_250',
      '250_plus': '250_plus',
    };

    const giftEngineInput = {
      mode: 'profile' as const,
      recipient_profile: {
        relationship: relationship || 'other',
        age_range: ageRange,
        gender: questionnaire.gender || 'unspecified',
        location: location,
        interests: questionnaire.interests || [],
        favorite_brands: questionnaire.favorite_brands || [],
      },
      gifting_context: {
        budget_range: budgetMap[questionnaire.price_range] || '50_100',
        gift_price_focus: questionnaire.gift_preference || 'mixed',
        occasion_type: questionnaire.occasion || 'birthday',
        occasion_date: questionnaire.occasion_date || '',
      },
      style_personality: {
        personality_traits: questionnaire.personality_traits || [],
        gift_format_preference: questionnaire.experience_vs_physical || 'both',
        surprise_vs_practical: questionnaire.surprise_vs_practical || 'either',
        wants_independent_shops: true,
        restrictions_notes: questionnaire.restrictions_notes || '',
      },
    };

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const response = await fetch(`${supabaseUrl}/functions/v1/gift-engine`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(giftEngineInput),
    });

    if (!response.ok) {
      throw new Error(`Gift engine error: ${response.status}`);
    }

    const result = await response.json();

    if (result.flow === 'profile' && result.gift_ideas) {
      return result.gift_ideas.map((idea: any) => ({
        title: idea.title,
        description: idea.description,
        estimatedPrice: formatPriceBand(idea.price_band, currency),
        reasoning: idea.why_it_fits,
        gift_type: idea.gift_type,
        links: idea.links || [],
      }));
    }

    return [];
  } catch (error) {
    console.error('Error getting enhanced suggestions:', error);
    return [];
  }
}

function getAgeRange(age: number | null): string {
  if (!age) return '26_35';
  if (age < 18) return 'under_18';
  if (age <= 25) return '18_25';
  if (age <= 35) return '26_35';
  if (age <= 45) return '36_45';
  if (age <= 60) return '46_60';
  return '60_plus';
}

function formatPriceBand(priceBand: string, currency?: string): string {
  const symbol = getCurrencySymbol(currency || 'GBP');
  const ranges: Record<string, string> = {
    'under_20': `Under ${symbol}20`,
    '20_50': `${symbol}20-50`,
    '50_100': `${symbol}50-100`,
    '100_250': `${symbol}100-250`,
    '250_plus': `${symbol}250+`,
  };
  return ranges[priceBand] || `${symbol}50-100`;
}

async function updatePersonPreferences(
  personId: string,
  category: string,
  pricePoint: string,
  extractedInfo: Record<string, any>
): Promise<void> {
  try {
    const { data: existing } = await supabase
      .from('person_preferences')
      .select('*')
      .eq('person_id', personId)
      .maybeSingle();

    if (!existing) {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      await supabase.from('person_preferences').insert({
        person_id: personId,
        user_id: userData.user.id,
        categories: category ? [category] : [],
        price_range_preferences: pricePoint ? { preferred: [pricePoint] } : {},
        interests: [],
        style_preferences: {},
        brands: [],
      });
      return;
    }

    const categories = Array.isArray(existing.categories) ? existing.categories : [];
    if (category && !categories.includes(category)) {
      categories.push(category);
    }

    const priceRanges = existing.price_range_preferences || {};
    if (pricePoint) {
      priceRanges.preferred = priceRanges.preferred || [];
      if (!priceRanges.preferred.includes(pricePoint)) {
        priceRanges.preferred.push(pricePoint);
      }
    }

    if (extractedInfo.brand) {
      const brands = Array.isArray(existing.brands) ? existing.brands : [];
      if (!brands.includes(extractedInfo.brand)) {
        brands.push(extractedInfo.brand);
      }
      existing.brands = brands;
    }

    await supabase
      .from('person_preferences')
      .update({
        categories,
        price_range_preferences: priceRanges,
        brands: existing.brands,
        last_analyzed_at: new Date().toISOString(),
      })
      .eq('person_id', personId);
  } catch (error) {
    console.error('Error updating person preferences:', error);
  }
}

async function analyzeUrl(
  url: string,
  title: string,
  description: string
): Promise<Record<string, any> | null> {
  try {
    const prompt = `Analyze this product URL and information to extract key details:
URL: ${url}
Title: ${title}
Description: ${description}

Extract and return JSON with:
- category (single category like "Electronics", "Fashion", "Home", "Books", etc.)
- price_point ("budget", "mid-range", "premium", "luxury")
- brand (if identifiable)
- style (if applicable)
- keywords (array of relevant keywords)

Return ONLY valid JSON, no other text.`;

    const result = await callAI(prompt);
    return result;
  } catch (error) {
    console.error('Error analyzing URL:', error);
    return null;
  }
}

function categorizeFromText(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase();

  const categoryKeywords: Record<string, string[]> = {
    Electronics: ['phone', 'laptop', 'headphone', 'tablet', 'camera', 'tech', 'electronic', 'gadget'],
    Fashion: ['clothing', 'shirt', 'pants', 'dress', 'shoes', 'fashion', 'wear', 'accessory'],
    Home: ['home', 'kitchen', 'decor', 'furniture', 'bedding', 'blanket'],
    Beauty: ['beauty', 'makeup', 'skincare', 'cosmetic', 'perfume'],
    Books: ['book', 'novel', 'reading', 'author'],
    Sports: ['sport', 'fitness', 'exercise', 'gym', 'athletic'],
    Food: ['food', 'snack', 'gourmet', 'chocolate', 'coffee', 'tea'],
    Entertainment: ['game', 'movie', 'music', 'concert', 'ticket'],
  };

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((keyword) => text.includes(keyword))) {
      return category;
    }
  }

  return 'Other';
}

function getPricePoint(price: number): string {
  if (price < 25) return 'budget';
  if (price < 75) return 'mid-range';
  if (price < 200) return 'premium';
  return 'luxury';
}

function calculateAge(birthday: string): number {
  const today = new Date();
  const birthDate = new Date(birthday);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function buildAnalysisPrompt(
  name: string,
  relationship: string,
  notes: string,
  age: number | null
): string {
  return `Analyze these notes about ${name}${relationship ? ` (my ${relationship})` : ''}${age ? ` who is ${age} years old` : ''} to extract gift preferences:

Notes: ${notes}

Extract and return JSON with:
- interests (array of hobbies/interests)
- style_preferences (object with style descriptors)
- price_range_preferences (object with min/max or typical ranges)
- categories (array of product categories they might like)
- brands (array of any mentioned brands)
- confidence_score (0-1, how confident you are in this analysis)

Return ONLY valid JSON, no other text.`;
}

function buildEnhancedSuggestionsPrompt(
  name: string,
  relationship: string,
  notes: string,
  age: number | null,
  preferences: any,
  giftIdeas: any[],
  analyses: any[],
  country?: string,
  currency?: string,
  city?: string,
  questionnaire?: any
): string {
  const countryName = getCountryName(country || 'US');
  const currencySymbol = getCurrencySymbol(currency || 'USD');
  const locationText = city ? `${city}, ${countryName}` : countryName;

  let prompt = `Generate 5 highly personalized gift suggestions for ${name}${relationship ? ` (my ${relationship})` : ''}${age ? ` who is ${age} years old` : ''}.

REQUIREMENTS:
- All suggestions must be available to purchase in ${locationText}
- All prices must be in ${currency || 'USD'} (${currencySymbol})
- Focus on specific, purchasable products that match their interests and preferences
- Provide realistic gift ideas that can be found in stores or online retailers in ${countryName}

`;

  if (notes) {
    prompt += `About them: ${notes}\n\n`;
  }

  if (questionnaire) {
    prompt += `DETAILED PERSONALIZATION PROFILE:\n`;
    if (questionnaire.age_range) {
      prompt += `- Age Range: ${questionnaire.age_range}\n`;
    }
    if (questionnaire.gender) {
      prompt += `- Gender: ${questionnaire.gender}\n`;
    }
    if (questionnaire.interests?.length > 0) {
      prompt += `- Core Interests: ${questionnaire.interests.join(', ')}\n`;
    }
    if (questionnaire.favorite_brands?.length > 0) {
      prompt += `- Favorite Brands: ${questionnaire.favorite_brands.join(', ')}\n`;
    }
    if (questionnaire.price_range) {
      prompt += `- Budget: ${questionnaire.price_range}\n`;
    }
    if (questionnaire.gift_preference) {
      prompt += `- Gift Style Preference: ${questionnaire.gift_preference}\n`;
    }
    if (questionnaire.occasion) {
      prompt += `- Occasion: ${questionnaire.occasion}\n`;
    }
    if (questionnaire.personality_traits?.length > 0) {
      prompt += `- Personality: ${questionnaire.personality_traits.join(', ')}\n`;
    }
    if (questionnaire.experience_vs_physical) {
      prompt += `- Type Preference: ${questionnaire.experience_vs_physical}\n`;
    }
    if (questionnaire.surprise_vs_practical) {
      prompt += `- Gift Approach: ${questionnaire.surprise_vs_practical}\n`;
    }
    if (questionnaire.restrictions_notes) {
      prompt += `- Important Notes/Restrictions: ${questionnaire.restrictions_notes}\n`;
    }
    prompt += `\n`;
  }

  if (preferences) {
    prompt += `Known preferences from past gifts:\n`;
    if (preferences.interests?.length > 0) {
      prompt += `- Interests: ${preferences.interests.join(', ')}\n`;
    }
    if (preferences.categories?.length > 0) {
      prompt += `- Liked categories: ${preferences.categories.join(', ')}\n`;
    }
    if (preferences.brands?.length > 0) {
      prompt += `- Brands: ${preferences.brands.join(', ')}\n`;
    }
    prompt += `\n`;
  }

  if (giftIdeas && giftIdeas.length > 0) {
    prompt += `Previous gift ideas (use this to understand their taste):\n`;
    giftIdeas.slice(0, 5).forEach((idea) => {
      prompt += `- ${idea.title}`;
      if (idea.description) prompt += `: ${idea.description}`;
      prompt += `\n`;
    });
    prompt += `\n`;
  }

  prompt += `Generate suggestions that:
1. Build on their known interests and preferences
2. Are different from previous gift ideas
3. Match their style and price preferences
4. Are readily available to purchase in ${locationText}
5. Include specific product names and brands when possible
6. Consider local availability and exclusive items in ${city || countryName}

Return JSON array with this exact structure:
[{
  "title": "Specific product name with brand",
  "description": "Detailed description of the product and why it's a great gift",
  "estimatedPrice": "${currencySymbol}XX-XX",
  "reasoning": "Why this matches their preferences based on the profile provided"
}]

IMPORTANT:
- Be specific with product names (e.g., "Apple AirPods Pro (2nd Generation)" not just "Wireless Earbuds")
- Include brand names where relevant
- Provide realistic price ranges in ${currency || 'USD'}
- Focus on products that genuinely match the person's interests and preferences
- Ensure all suggestions are thoughtful and personalized`;

  return prompt;
}

async function callAI(prompt: string): Promise<any> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey || apiKey.trim().length === 0) {
    console.log('OpenAI API key not configured, using fallback');
    return null;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that analyzes gift preferences and provides personalized gift suggestions. Focus on specific product recommendations with brand names and detailed descriptions. Always respond with valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error('AI API request failed');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    const jsonMatch = content.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return null;
  } catch (error) {
    console.error('AI call error:', error);
    return null;
  }
}

function getDefaultPreferences(): PersonPreferences {
  return {
    interests: [],
    style_preferences: {},
    price_range_preferences: {},
    categories: [],
    brands: [],
  };
}

function getCountryName(countryCode: string): string {
  const countryNames: Record<string, string> = {
    US: 'United States',
    GB: 'United Kingdom',
    CA: 'Canada',
    AU: 'Australia',
    DE: 'Germany',
    FR: 'France',
    IT: 'Italy',
    ES: 'Spain',
    NL: 'Netherlands',
    BE: 'Belgium',
    SE: 'Sweden',
    NO: 'Norway',
    DK: 'Denmark',
    FI: 'Finland',
    CH: 'Switzerland',
    AT: 'Austria',
    IE: 'Ireland',
    NZ: 'New Zealand',
    SG: 'Singapore',
    JP: 'Japan',
    KR: 'South Korea',
    IN: 'India',
    BR: 'Brazil',
    MX: 'Mexico',
    AR: 'Argentina',
    CL: 'Chile',
    ZA: 'South Africa',
    AE: 'United Arab Emirates',
    SA: 'Saudi Arabia',
  };
  return countryNames[countryCode] || 'United States';
}

function getCurrencySymbol(currencyCode: string): string {
  const currencySymbols: Record<string, string> = {
    USD: '$',
    GBP: '£',
    EUR: '€',
    CAD: 'CA$',
    AUD: 'A$',
    NZD: 'NZ$',
    JPY: '¥',
    KRW: '₩',
    INR: '₹',
    SGD: 'S$',
    BRL: 'R$',
    MXN: 'MX$',
    ARS: 'AR$',
    CLP: 'CL$',
    ZAR: 'R',
    AED: 'د.إ',
    SAR: '﷼',
    CHF: 'CHF',
    NOK: 'kr',
    SEK: 'kr',
    DKK: 'kr',
  };
  return currencySymbols[currencyCode] || '$';
}
