import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") || "";
const TAVILY_API_KEY = "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";
const EXA_API_KEY = "18a08bcb-228c-4923-836b-96bae12ef613";

interface RecipientProfile {
  relationship: string;
  age_range: string;
  gender: string;
  location: string;
  interests: string[];
  favorite_brands?: string[];
}

interface GiftingContext {
  budget_range: string;
  gift_price_focus: string;
  occasion_type: string;
  occasion_date?: string;
}

interface StylePersonality {
  personality_traits: string[];
  gift_format_preference: string;
  surprise_vs_practical: string;
  wants_independent_shops: boolean;
  restrictions_notes?: string;
}

interface GiftEngineInput {
  mode: "profile" | "search";
  recipient_profile?: RecipientProfile;
  gifting_context?: GiftingContext;
  style_personality?: StylePersonality;
  search_query?: string;
}

interface GiftIdea {
  title: string;
  description: string;
  why_it_fits: string;
  gift_type: "experience" | "physical" | "mixed";
  price_band: string;
  search_query_for_web: string;
}

interface GiftLink {
  url: string;
  title: string;
  snippet: string;
  source_domain: string;
}

async function callOpenAI(prompt: string): Promise<string> {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a thoughtful gift suggestion expert. Always respond with valid JSON only."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI error:", error);
    throw error;
  }
}

async function searchTavily(query: string, maxResults = 3): Promise<any[]> {
  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query: query,
        search_depth: "basic",
        max_results: maxResults,
        include_answer: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.status}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Tavily error:", error);
    return [];
  }
}

async function searchExa(query: string, numResults = 10): Promise<any[]> {
  try {
    const response = await fetch("https://api.exa.ai/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": EXA_API_KEY,
      },
      body: JSON.stringify({
        query: query,
        numResults: numResults,
        useAutoprompt: true,
        type: "auto",
      }),
    });

    if (!response.ok) {
      throw new Error(`Exa API error: ${response.status}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Exa error:", error);
    return [];
  }
}

async function handleProfileFlow(input: GiftEngineInput): Promise<any> {
  const { recipient_profile, gifting_context, style_personality } = input;

  const prompt = `Generate 5 distinct, thoughtful gift ideas based on this profile:

Recipient Profile:
${JSON.stringify(recipient_profile, null, 2)}

Gifting Context:
${JSON.stringify(gifting_context, null, 2)}

Style & Personality:
${JSON.stringify(style_personality, null, 2)}

For each gift idea, provide:
1. title: short gift name
2. description: one or two sentences explaining the idea
3. why_it_fits: short explanation based on the profile
4. gift_type: "experience" or "physical" or "mixed"
5. price_band: one of "under_20", "20_50", "50_100", "100_250", "250_plus"
6. search_query_for_web: a concrete search string to find this gift online

Ensure ideas match the budget_range (${gifting_context?.budget_range}) and gift_price_focus (${gifting_context?.gift_price_focus}).
${style_personality?.wants_independent_shops ? "Prioritize independent shops and small businesses." : ""}

Respond with ONLY a JSON array of 5 gift idea objects. No additional text.`;

  const openaiResponse = await callOpenAI(prompt);
  
  let giftIdeas: GiftIdea[];
  try {
    giftIdeas = JSON.parse(openaiResponse);
  } catch (e) {
    const match = openaiResponse.match(/\[.*\]/s);
    if (match) {
      giftIdeas = JSON.parse(match[0]);
    } else {
      throw new Error("Failed to parse OpenAI response");
    }
  }

  const enrichedIdeas = [];
  
  for (const idea of giftIdeas) {
    let searchQuery = idea.search_query_for_web;
    
    if (style_personality?.wants_independent_shops) {
      searchQuery += " independent gift shop UK";
    }

    const tavilyResults = await searchTavily(searchQuery, 3);
    
    const links: GiftLink[] = tavilyResults.slice(0, 3).map((result: any) => ({
      url: result.url || "",
      title: result.title || "",
      snippet: result.content || result.snippet || "",
      source_domain: new URL(result.url || "https://example.com").hostname,
    }));

    enrichedIdeas.push({
      ...idea,
      links,
    });
  }

  return {
    flow: "profile",
    gift_ideas: enrichedIdeas,
  };
}

async function handleSearchFlow(input: GiftEngineInput): Promise<any> {
  const { search_query } = input;

  if (!search_query) {
    return {
      flow: "search",
      search_query: "",
      shops: [],
      message: "No search query provided.",
    };
  }

  const exaResults = await searchExa(search_query, 10);

  if (exaResults.length === 0) {
    return {
      flow: "search",
      search_query,
      shops: [],
      message: "No clearly relevant shops were found for this query. Try a slightly broader search.",
    };
  }

  const shops = exaResults.map((result: any) => {
    const snippet = result.text || result.snippet || result.description || "";
    const relevance = `Found via search for: ${search_query}`;
    
    return {
      url: result.url || "",
      title: result.title || "",
      snippet: snippet.substring(0, 200) + (snippet.length > 200 ? "..." : ""),
      why_this_is_relevant: relevance,
    };
  });

  return {
    flow: "search",
    search_query,
    shops,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const input: GiftEngineInput = await req.json();

    if (!input.mode) {
      return new Response(
        JSON.stringify({ error: "Missing 'mode' field. Must be 'profile' or 'search'." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let result;

    if (input.mode === "profile") {
      result = await handleProfileFlow(input);
    } else if (input.mode === "search") {
      result = await handleSearchFlow(input);
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid mode. Must be 'profile' or 'search'." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Gift engine error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
