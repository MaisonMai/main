import { useState, useEffect } from 'react';
import { Person, supabase } from '../lib/supabase';
import { getEnhancedSuggestions } from '../lib/aiService';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, Plus, Loader2, Brain, ExternalLink, Check, RefreshCw } from 'lucide-react';

type AiGiftSuggestionsProps = {
  person: Person;
  onGiftAdded: () => void;
};

type SuggestedGift = {
  title: string;
  description: string;
  estimatedPrice: string;
  reasoning?: string;
};

export function AiGiftSuggestions({ person, onGiftAdded }: AiGiftSuggestionsProps) {
  const [forceRefresh, setForceRefresh] = useState(0);
  const { user, userCountry, userCurrency } = useAuth();
  const [suggestions, setSuggestions] = useState<SuggestedGift[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingIndex, setAddingIndex] = useState<number | null>(null);
  const [addedIndices, setAddedIndices] = useState<Set<number>>(new Set());
  const [hasPreferences, setHasPreferences] = useState(false);
  const [hasQuestionnaire, setHasQuestionnaire] = useState(false);
  const [userCity, setUserCity] = useState<string | null>(null);

  useEffect(() => {
    checkForPreferences();
    checkForQuestionnaire();
    loadUserCity();
  }, [person.id, user]);

  const loadUserCity = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('city')
      .eq('id', user.id)
      .maybeSingle();

    if (data?.city) {
      setUserCity(data.city);
    }
  };

  const checkForPreferences = async () => {
    const { data } = await supabase
      .from('person_preferences')
      .select('*')
      .eq('person_id', person.id)
      .maybeSingle();

    setHasPreferences(!!data);
  };

  const checkForQuestionnaire = async () => {
    const { data, error } = await supabase
      .from('questionnaire_responses')
      .select('id')
      .eq('person_id', person.id)
      .maybeSingle();

    if (error) {
      console.error('Error checking questionnaire:', error);
    }
    setHasQuestionnaire(!!data);
  };

  const generateSuggestions = async () => {
    setLoading(true);
    setSuggestions([]);
    setAddedIndices(new Set());

    const { data: questionnaireData } = await supabase
      .from('questionnaire_responses')
      .select('id')
      .eq('person_id', person.id)
      .maybeSingle();

    if (!questionnaireData) {
      alert('Please complete the personalization questionnaire first to get AI-powered gift suggestions!');
      setLoading(false);
      return;
    }

    try {
      const enhancedSuggestions = await getEnhancedSuggestions(
        person.id,
        person.name,
        person.relationship,
        person.notes,
        person.birthday || undefined,
        userCountry || undefined,
        userCurrency || undefined,
        userCity || undefined
      );

      if (enhancedSuggestions && enhancedSuggestions.length > 0) {
        setSuggestions(enhancedSuggestions);
      } else {
        setSuggestions(getDefaultSuggestions());
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      setSuggestions(getDefaultSuggestions());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultSuggestions = (): SuggestedGift[] => {
    return [
      {
        title: 'Personalized Photo Album',
        description: 'A custom photo album with memories you\'ve shared together',
        estimatedPrice: '25-50',
      },
      {
        title: 'Experience Gift Card',
        description: 'A gift card for an activity or restaurant they enjoy',
        estimatedPrice: '50-100',
      },
      {
        title: 'Subscription Box',
        description: 'A monthly subscription tailored to their interests',
        estimatedPrice: '20-40',
      },
      {
        title: 'Quality Headphones',
        description: 'Wireless headphones for music or podcasts',
        estimatedPrice: '80-150',
      },
      {
        title: 'Cozy Throw Blanket',
        description: 'A soft, luxurious blanket for relaxation',
        estimatedPrice: '30-60',
      },
    ];
  };


  const addGiftIdea = async (suggestion: SuggestedGift, index: number) => {
    setAddingIndex(index);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(suggestion.title + ' buy online')}&tbm=shop`;

      const { error } = await supabase.from('gift_ideas').insert([
        {
          person_id: person.id,
          user_id: userData.user.id,
          title: suggestion.title,
          description: suggestion.description,
          url: searchUrl,
          price: null,
          priority: 'medium',
          is_purchased: false,
        },
      ]);

      if (error) throw error;

      setAddedIndices(prev => new Set(prev).add(index));
      onGiftAdded();
    } catch (error) {
      console.error('Error adding gift idea:', error);
      alert('Failed to add gift idea');
    } finally {
      setAddingIndex(null);
    }
  };

  return (
    <div className="mb-6">
      <div className="bg-gradient-to-r from-hinted-50 to-orange-50 rounded-2xl border border-hinted-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">AI Gift Suggestions</h3>
            {hasPreferences && (
              <span className="flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                <Brain className="w-3 h-3" />
                Learning enabled
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {suggestions.length > 0 && !loading && (
              <button
                onClick={generateSuggestions}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-hinted-300 text-primary-700 rounded-xl font-semibold hover:bg-primary-50 transition-all disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            )}
            {suggestions.length === 0 && (
              <button
                onClick={generateSuggestions}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-500 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Get Ideas
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {suggestions.length === 0 && !loading && (
          <div className="text-center py-4">
            {hasQuestionnaire ? (
              <div className="bg-white rounded-xl p-6 border-2 border-primary-200">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Check className="w-6 h-6 text-primary-600" />
                  <h4 className="text-lg font-semibold text-gray-900">Questionnaire Completed!</h4>
                </div>
                <p className="text-gray-700 mb-3">
                  Great! We have all the information we need to create personalized gift suggestions.
                </p>
                <p className="text-primary-700 font-semibold">
                  Click "Get Ideas" above to see AI-powered recommendations based on your answers.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-6 border-2 border-yellow-200">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Brain className="w-6 h-6 text-yellow-600" />
                  <h4 className="text-lg font-semibold text-gray-900">Complete the Questionnaire First</h4>
                </div>
                <p className="text-gray-700 mb-3">
                  To get personalized AI gift suggestions, please complete the personalization questionnaire above.
                </p>
                <p className="text-yellow-700 font-semibold">
                  The questionnaire helps us understand {person.name}'s preferences better!
                </p>
              </div>
            )}
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block w-8 h-8 border-4 border-hinted-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-gray-600">Generating personalized suggestions...</p>
          </div>
        )}

        {suggestions.length > 0 && !loading && (
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-4 border border-hinted-100 hover:border-hinted-300 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{suggestion.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                    <p className="text-sm text-primary-600 font-semibold">
                      {suggestion.estimatedPrice}
                    </p>
                    {suggestion.reasoning && (
                      <p className="text-xs text-gray-500 mt-2 italic">
                        {suggestion.reasoning}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => addGiftIdea(suggestion, index)}
                    disabled={addingIndex === index || addedIndices.has(index)}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all flex-shrink-0 ${
                      addedIndices.has(index)
                        ? 'bg-green-100 text-green-700 cursor-default'
                        : 'bg-hinted-100 text-primary-700 hover:bg-hinted-200 disabled:opacity-50'
                    }`}
                  >
                    {addingIndex === index ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : addedIndices.has(index) ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Added</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Add</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
