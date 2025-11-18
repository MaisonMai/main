import { useState, useEffect } from 'react';
import { Person, supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { X, Check, Sparkles } from 'lucide-react';

type PersonQuestionnaireProps = {
  person: Person;
  onClose: () => void;
  onComplete: () => void;
};

type QuestionnaireData = {
  age_range: string;
  gender: string;
  interests: string[];
  favorite_brands: string[];
  price_range: string;
  gift_preference: string;
  occasion: string;
  occasion_date: string;
  personality_traits: string[];
  experience_vs_physical: string;
  surprise_vs_practical: string;
  restrictions_notes: string;
  remember_preferences: boolean;
  auto_generate_gifts: boolean;
};

export function PersonQuestionnaire({ person, onClose, onComplete }: PersonQuestionnaireProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentSection, setCurrentSection] = useState(1);
  const [completed, setCompleted] = useState(false);
  const [formData, setFormData] = useState<QuestionnaireData>({
    age_range: '',
    gender: '',
    interests: [],
    favorite_brands: [],
    price_range: '',
    gift_preference: '',
    occasion: '',
    occasion_date: '',
    personality_traits: [],
    experience_vs_physical: '',
    surprise_vs_practical: '',
    restrictions_notes: '',
    remember_preferences: true,
    auto_generate_gifts: true,
  });

  useEffect(() => {
    loadExistingResponse();
  }, [person.id]);

  const loadExistingResponse = async () => {
    const { data } = await supabase
      .from('questionnaire_responses')
      .select('*')
      .eq('person_id', person.id)
      .maybeSingle();

    if (data) {
      setFormData({
        age_range: data.age_range || '',
        gender: data.gender || '',
        interests: data.interests || [],
        favorite_brands: data.favorite_brands || [],
        price_range: data.price_range || '',
        gift_preference: data.gift_preference || '',
        occasion: data.occasion || '',
        occasion_date: data.occasion_date || '',
        personality_traits: data.personality_traits || [],
        experience_vs_physical: data.experience_vs_physical || '',
        surprise_vs_practical: data.surprise_vs_practical || '',
        restrictions_notes: data.restrictions_notes || '',
        remember_preferences: data.remember_preferences ?? true,
        auto_generate_gifts: data.auto_generate_gifts ?? true,
      });
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: existing, error: checkError } = await supabase
        .from('questionnaire_responses')
        .select('id')
        .eq('person_id', person.id)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing questionnaire:', checkError);
        alert('Failed to check existing questionnaire: ' + checkError.message);
        setLoading(false);
        return;
      }

      let saveError;
      if (existing) {
        const { error } = await supabase
          .from('questionnaire_responses')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
            completed_at: new Date().toISOString(),
          })
          .eq('person_id', person.id);
        saveError = error;
      } else {
        const { error } = await supabase
          .from('questionnaire_responses')
          .insert({
            person_id: person.id,
            user_id: user.id,
            ...formData,
            completed_at: new Date().toISOString(),
          });
        saveError = error;
      }

      if (saveError) {
        console.error('Error saving questionnaire:', saveError);
        alert('Failed to save questionnaire: ' + saveError.message);
        setLoading(false);
        return;
      }

      setCompleted(true);
      setTimeout(() => {
        onComplete();
      }, 3000);
    } catch (error) {
      console.error('Error saving questionnaire:', error);
      alert('An unexpected error occurred while saving the questionnaire.');
      setLoading(false);
    }
  };

  const toggleArrayValue = (field: keyof QuestionnaireData, value: string) => {
    const currentArray = formData[field] as string[];
    if (currentArray.includes(value)) {
      setFormData({
        ...formData,
        [field]: currentArray.filter((v) => v !== value),
      });
    } else {
      setFormData({
        ...formData,
        [field]: [...currentArray, value],
      });
    }
  };

  const addBrand = (brand: string) => {
    if (brand.trim() && !formData.favorite_brands.includes(brand.trim())) {
      setFormData({
        ...formData,
        favorite_brands: [...formData.favorite_brands, brand.trim()],
      });
    }
  };

  const removeBrand = (brand: string) => {
    setFormData({
      ...formData,
      favorite_brands: formData.favorite_brands.filter((b) => b !== brand),
    });
  };

  const isSection1Complete = true;
  const isSection2Complete = true;
  const isSection3Complete = true;
  const isSection4Complete = true;

  if (completed) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Questionnaire Complete!</h3>
          <p className="text-gray-600 mb-4">
            Thank you for providing detailed information about {person.name}.
          </p>
          <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-primary-600 animate-pulse" />
              <span className="font-semibold text-primary-900">Analyzing preferences...</span>
            </div>
            <p className="text-sm text-primary-700">
              Our AI is processing your answers to generate personalized gift suggestions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex-1 pr-2">
            <h2 className="text-base sm:text-xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 flex-shrink-0" />
              <span className="truncate">Personalize for {person.name}</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 hidden sm:block">
              Help us find the perfect gifts by answering a few questions
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex gap-2 mb-8">
            {[1, 2, 3, 4, 5].map((section) => (
              <button
                key={section}
                onClick={() => setCurrentSection(section)}
                className={`flex-1 h-2 rounded-full transition-all ${
                  currentSection === section
                    ? 'bg-primary-500'
                    : currentSection > section
                    ? 'bg-primary-500'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {currentSection === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">About {person.name}</h3>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Age Range
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Under 18', '18-25', '26-35', '36-45', '46-60', '60+'].map((range) => (
                    <button
                      key={range}
                      onClick={() => setFormData({ ...formData, age_range: range })}
                      className={`px-4 py-2 rounded-lg border transition-all ${
                        formData.age_range === range
                          ? 'border-blue-600 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Gender (if relevant)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Male', 'Female', 'Non-binary', 'Prefer not to say'].map((gender) => (
                    <button
                      key={gender}
                      onClick={() => setFormData({ ...formData, gender })}
                      className={`px-4 py-2 rounded-lg border transition-all ${
                        formData.gender === gender
                          ? 'border-blue-600 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {gender}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Interests & Hobbies (select all that apply)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    'Fashion',
                    'Tech & Gadgets',
                    'Home & Decor',
                    'Beauty & Self-care',
                    'Sports & Fitness',
                    'Food & Drink',
                    'Books & Learning',
                    'Travel & Adventure',
                    'Games & Entertainment',
                    'Art & Creativity',
                  ].map((interest) => (
                    <button
                      key={interest}
                      onClick={() => toggleArrayValue('interests', interest)}
                      className={`px-4 py-2 rounded-lg border transition-all text-left ${
                        formData.interests.includes(interest)
                          ? 'border-blue-600 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Favorite Brands (optional)
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.favorite_brands.map((brand) => (
                    <span
                      key={brand}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary-200 text-primary-700 rounded-full text-sm"
                    >
                      {brand}
                      <button
                        onClick={() => removeBrand(brand)}
                        className="hover:text-blue-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Type brand name and press Enter"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addBrand(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>
            </div>
          )}

          {currentSection === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Budget & Preferences</h3>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ideal Price Range per Gift
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Under £20', '£20-£50', '£50-£100', '£100-£250', '£250+'].map((range) => (
                    <button
                      key={range}
                      onClick={() => setFormData({ ...formData, price_range: range })}
                      className={`px-4 py-2 rounded-lg border transition-all ${
                        formData.price_range === range
                          ? 'border-blue-600 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Gift Preference
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Budget-friendly ideas', 'Mid-range gifts', 'Premium/luxury options', 'A mix of all'].map((pref) => (
                    <button
                      key={pref}
                      onClick={() => setFormData({ ...formData, gift_preference: pref })}
                      className={`px-4 py-2 rounded-lg border transition-all ${
                        formData.gift_preference === pref
                          ? 'border-blue-600 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {pref}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentSection === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Occasion Context</h3>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  What's the occasion?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Birthday', 'Anniversary', 'Christmas', 'Wedding', 'Graduation', 'Thank You', 'Just Because', 'Other'].map((occ) => (
                    <button
                      key={occ}
                      onClick={() => setFormData({ ...formData, occasion: occ })}
                      className={`px-4 py-2 rounded-lg border transition-all ${
                        formData.occasion === occ
                          ? 'border-blue-600 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {occ}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  When is the occasion?
                </label>
                <input
                  type="date"
                  value={formData.occasion_date}
                  onChange={(e) => setFormData({ ...formData, occasion_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {currentSection === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Style & Personality</h3>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Personality Traits (choose up to 3)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Creative',
                    'Practical',
                    'Trendy',
                    'Sentimental',
                    'Adventurous',
                    'Funny / Playful',
                    'Minimalist',
                    'Luxury lover',
                  ].map((trait) => (
                    <button
                      key={trait}
                      onClick={() => {
                        if (formData.personality_traits.includes(trait)) {
                          toggleArrayValue('personality_traits', trait);
                        } else if (formData.personality_traits.length < 3) {
                          toggleArrayValue('personality_traits', trait);
                        }
                      }}
                      disabled={
                        !formData.personality_traits.includes(trait) &&
                        formData.personality_traits.length >= 3
                      }
                      className={`px-4 py-2 rounded-lg border transition-all ${
                        formData.personality_traits.includes(trait)
                          ? 'border-blue-600 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed'
                      }`}
                    >
                      {trait}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {formData.personality_traits.length}/3 selected
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Prefer experiences or physical gifts?
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    'Experiences (e.g., spa day, concert, travel)',
                    'Physical gifts (e.g., fashion, gadgets, books)',
                    'Both',
                  ].map((pref) => (
                    <button
                      key={pref}
                      onClick={() => setFormData({ ...formData, experience_vs_physical: pref })}
                      className={`px-4 py-2 rounded-lg border transition-all text-left ${
                        formData.experience_vs_physical === pref
                          ? 'border-blue-600 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {pref}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Surprises or practical gifts?
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    'Surprises — something unexpected',
                    'Practical — something useful',
                    'Either',
                  ].map((pref) => (
                    <button
                      key={pref}
                      onClick={() => setFormData({ ...formData, surprise_vs_practical: pref })}
                      className={`px-4 py-2 rounded-lg border transition-all text-left ${
                        formData.surprise_vs_practical === pref
                          ? 'border-blue-600 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {pref}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentSection === 5 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Final Details</h3>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Any restrictions or notes?
                </label>
                <textarea
                  value={formData.restrictions_notes}
                  onChange={(e) => setFormData({ ...formData, restrictions_notes: e.target.value })}
                  placeholder="e.g., vegan, allergies, no alcohol, size preferences, shipping limits"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={4}
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={formData.remember_preferences}
                    onChange={(e) =>
                      setFormData({ ...formData, remember_preferences: e.target.checked })
                    }
                    className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">
                    Remember these preferences for future gift suggestions
                  </span>
                </label>

                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={formData.auto_generate_gifts}
                    onChange={(e) =>
                      setFormData({ ...formData, auto_generate_gifts: e.target.checked })
                    }
                    className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">
                    Automatically generate AI gift suggestions based on these answers
                  </span>
                </label>
              </div>

              <div className="bg-primary-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Ready to generate perfect gifts!</h4>
                    <p className="text-sm text-primary-700">
                      Based on your answers, we'll create personalized gift suggestions that match {person.name}'s
                      style, interests, and your budget.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <button
            onClick={() => setCurrentSection(Math.max(1, currentSection - 1))}
            disabled={currentSection === 1}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>

          <div className="text-sm text-gray-600">
            Section {currentSection} of 5
          </div>

          {currentSection < 5 ? (
            <button
              onClick={() => setCurrentSection(currentSection + 1)}
              className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              {loading ? 'Saving...' : 'Complete'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
