import { useState } from 'react';
import { X, Sparkles, ArrowRight, User } from 'lucide-react';

type GiftFinderQuestionnaireProps = {
  onClose: () => void;
  onComplete: (data: QuestionnaireData) => void;
};

type QuestionnaireData = {
  recipient_name: string;
  relationship: string;
  age_range: string;
  gender: string;
  occupation: string;
  location: string;
  interests: string[];
  favorite_brands: string[];
  price_range: string;
  occasion: string;
  personality_traits: string[];
  experience_vs_physical: string;
  surprise_vs_practical: string;
  restrictions_notes: string;
};

export function GiftFinderQuestionnaire({ onClose, onComplete }: GiftFinderQuestionnaireProps) {
  const [currentSection, setCurrentSection] = useState(1);
  const [formData, setFormData] = useState<QuestionnaireData>({
    recipient_name: '',
    relationship: '',
    age_range: '',
    gender: '',
    occupation: '',
    location: '',
    interests: [],
    favorite_brands: [],
    price_range: '',
    occasion: '',
    personality_traits: [],
    experience_vs_physical: '',
    surprise_vs_practical: '',
    restrictions_notes: '',
  });

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

  const handleComplete = () => {
    localStorage.setItem('pendingQuestionnaire', JSON.stringify(formData));
    onComplete(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full my-8 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex-1 pr-2">
            <h2 className="text-base sm:text-xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 flex-shrink-0" />
              <span>Find the Perfect Gift in 30 Seconds</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 hidden sm:block">
              Answer a few quick questions to get personalised gift ideas
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex gap-2 mb-8">
            {[1, 2, 3, 4, 5].map((section) => (
              <div
                key={section}
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
              <h3 className="text-lg font-semibold text-gray-900">Who are you shopping for?</h3>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Their Name
                </label>
                <input
                  type="text"
                  value={formData.recipient_name}
                  onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
                  placeholder="e.g., Sarah, John, Mom"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Relationship
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Partner', 'Mother', 'Father', 'Sister', 'Brother', 'Friend', 'Colleague', 'Other'].map((rel) => (
                    <button
                      key={rel}
                      onClick={() => setFormData({ ...formData, relationship: rel })}
                      className={`px-4 py-2 rounded-lg border transition-all ${
                        formData.relationship === rel
                          ? 'border-primary-600 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {rel}
                    </button>
                  ))}
                </div>
              </div>

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
                          ? 'border-primary-600 bg-primary-50 text-primary-700'
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
                          ? 'border-primary-600 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {gender}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentSection === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Tell us more about them</h3>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Occupation (optional)
                </label>
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  placeholder="e.g., Teacher, Engineer, Student"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., London, Manchester, Edinburgh"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Helps us recommend local experiences and services
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Interests & Hobbies (select all that apply)
                </label>
                <div className="grid grid-cols-2 gap-2">
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
                          ? 'border-primary-600 bg-primary-50 text-primary-700'
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
                        className="hover:text-primary-900"
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

          {currentSection === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Budget & Occasion</h3>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ideal Price Range per Gift
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Under £20', '£20-£50', '£50-£100', '£100-£200', '£200+'].map((range) => (
                    <button
                      key={range}
                      onClick={() => setFormData({ ...formData, price_range: range })}
                      className={`px-4 py-2 rounded-lg border transition-all ${
                        formData.price_range === range
                          ? 'border-primary-600 bg-primary-50 text-primary-700'
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
                  What's the occasion?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Birthday', 'Anniversary', 'Christmas', 'Holiday Season', 'Wedding', 'Graduation', 'Thank You', 'Just Because', 'Other'].map((occ) => (
                    <button
                      key={occ}
                      onClick={() => setFormData({ ...formData, occasion: occ })}
                      className={`px-4 py-2 rounded-lg border transition-all ${
                        formData.occasion === occ
                          ? 'border-primary-600 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {occ}
                    </button>
                  ))}
                </div>
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
                          ? 'border-primary-600 bg-primary-50 text-primary-700'
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
                          ? 'border-primary-600 bg-primary-50 text-primary-700'
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
                          ? 'border-primary-600 bg-primary-50 text-primary-700'
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
                  placeholder="e.g., vegan, allergies, no alcohol, size preferences"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={4}
                />
              </div>

              <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-primary-900 mb-1">Almost there!</h4>
                    <p className="text-sm text-primary-700">
                      We'll generate personalised gift suggestions based on your answers. Create a free account to see the results!
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
            {currentSection} of 5
          </div>

          {currentSection < 5 ? (
            <button
              onClick={() => setCurrentSection(currentSection + 1)}
              className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={!formData.recipient_name || !formData.relationship}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              See Results
              <Sparkles className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
