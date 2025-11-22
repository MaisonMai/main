import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAdmin } from '../contexts/AdminContext';
import { usePartner } from '../contexts/PartnerContext';
import { LogOut, User, MessageSquare, Inbox, Shield, Store, Gift, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { ContactForm } from './ContactForm';
import { ContactSubmissions } from './ContactSubmissions';
import { supabase } from '../lib/supabase';

type ExpandedSections = {
  account: boolean;
  profile: boolean;
  support: boolean;
  about: boolean;
};

export function SettingsView() {
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const { isPartner } = usePartner();
  const [showContactForm, setShowContactForm] = useState(false);
  const [showSubmissions, setShowSubmissions] = useState(false);

  const [expanded, setExpanded] = useState<ExpandedSections>({
    account: true,
    profile: false,
    support: false,
    about: false,
  });

  const [userProfile, setUserProfile] = useState({
    interests: [] as string[],
    favoriteCategories: [] as string[],
    priceRange: '',
    shoppingFrequency: '',
    notes: '',
  });

  const [profileData, setProfileData] = useState<any>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('full_name, country, city, user_interests, user_preferences')
      .eq('id', user.id)
      .maybeSingle();

    if (data) {
      setProfileData(data);
      if (data.user_interests || data.user_preferences) {
        setUserProfile({
          interests: data.user_interests || [],
          favoriteCategories: data.user_preferences?.categories || [],
          priceRange: data.user_preferences?.priceRange || '',
          shoppingFrequency: data.user_preferences?.frequency || '',
          notes: data.user_preferences?.notes || '',
        });
      }
    }
  };

  const toggleSection = (section: keyof ExpandedSections) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          user_interests: userProfile.interests,
          user_preferences: {
            categories: userProfile.favoriteCategories,
            priceRange: userProfile.priceRange,
            frequency: userProfile.shoppingFrequency,
            notes: userProfile.notes,
          },
        })
        .eq('id', user.id);

      if (error) throw error;
      alert('Profile updated successfully!');
      loadUserProfile();
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const addInterest = (interest: string) => {
    if (interest && !userProfile.interests.includes(interest)) {
      setUserProfile(prev => ({
        ...prev,
        interests: [...prev.interests, interest],
      }));
    }
  };

  const removeInterest = (interest: string) => {
    setUserProfile(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest),
    }));
  };

  const toggleCategory = (category: string) => {
    setUserProfile(prev => ({
      ...prev,
      favoriteCategories: prev.favoriteCategories.includes(category)
        ? prev.favoriteCategories.filter(c => c !== category)
        : [...prev.favoriteCategories, category],
    }));
  };

  const categories = [
    'Fashion & Accessories',
    'Beauty & Wellness',
    'Home & Living',
    'Tech & Gadgets',
    'Books & Media',
    'Food & Drink',
    'Sports & Outdoors',
    'Art & Crafts',
    'Experiences',
    'Jewelry',
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Settings</h2>
        <p className="text-gray-500">Manage your account and preferences</p>
      </div>

      {isAdmin && (
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl border border-gray-700 p-6 mb-4 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white/10 p-2 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Admin Access</h3>
          </div>
          <p className="text-gray-200 mb-4">
            You have administrator privileges. Access the admin dashboard to manage the platform.
          </p>
          <a
            href="/admin"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-md hover:shadow-lg"
          >
            <Shield className="w-5 h-5" />
            Open Admin Dashboard
          </a>
        </div>
      )}

      {isPartner && (
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl border border-primary-500 p-6 mb-4 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white/10 p-2 rounded-lg">
              <Store className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Partner Dashboard</h3>
          </div>
          <p className="text-primary-100 mb-4">
            Manage your partner profile and products. Add new items and track performance.
          </p>
          <a
            href="/partner"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary-700 rounded-xl font-semibold hover:bg-primary-50 transition-all shadow-md hover:shadow-lg"
          >
            <Store className="w-5 h-5" />
            Open Partner Dashboard
          </a>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 mb-4 overflow-hidden">
        <button
          onClick={() => toggleSection('account')}
          className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>
          </div>
          {expanded.account ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {expanded.account && (
          <div className="px-6 pb-6 border-t border-gray-100">
            <div className="flex items-center gap-4 mb-6 mt-4">
              <div className="w-16 h-16 bg-hinted-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-lg font-semibold text-gray-900">{user?.email}</p>
                {profileData?.full_name && (
                  <>
                    <p className="text-sm text-gray-500 mt-2">Name</p>
                    <p className="text-gray-900">{profileData.full_name}</p>
                  </>
                )}
                {profileData?.country && (
                  <>
                    <p className="text-sm text-gray-500 mt-2">Location</p>
                    <p className="text-gray-900">
                      {profileData.city ? `${profileData.city}, ` : ''}{profileData.country}
                    </p>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 mb-4 overflow-hidden">
        <button
          onClick={() => toggleSection('profile')}
          className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-primary-600" />
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-900">Your Gift Profile</h3>
              <p className="text-sm text-gray-500">Get personalized offers and recommendations</p>
            </div>
          </div>
          {expanded.profile ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {expanded.profile && (
          <div className="px-6 pb-6 border-t border-gray-100">
            <div className="mt-4 space-y-6">
              <div className="bg-gradient-to-r from-primary-50 to-orange-50 rounded-xl p-4 border border-primary-200">
                <div className="flex items-start gap-2 mb-2">
                  <Gift className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">When You Give, You Get</h4>
                    <p className="text-sm text-gray-600">
                      Share your preferences to receive exclusive offers tailored just for you. We believe in rewarding thoughtful givers!
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Interests
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {userProfile.interests.map((interest) => (
                    <span
                      key={interest}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                    >
                      {interest}
                      <button
                        onClick={() => removeInterest(interest)}
                        className="hover:text-primary-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Add an interest (press Enter)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addInterest(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Favorite Gift Categories
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => toggleCategory(category)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        userProfile.favoriteCategories.includes(category)
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Typical Gift Budget
                </label>
                <select
                  value={userProfile.priceRange}
                  onChange={(e) => setUserProfile(prev => ({ ...prev, priceRange: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select a range</option>
                  <option value="under-25">Under $25</option>
                  <option value="25-50">$25 - $50</option>
                  <option value="50-100">$50 - $100</option>
                  <option value="100-200">$100 - $200</option>
                  <option value="over-200">Over $200</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How often do you buy gifts?
                </label>
                <select
                  value={userProfile.shoppingFrequency}
                  onChange={(e) => setUserProfile(prev => ({ ...prev, shoppingFrequency: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select frequency</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Every few months</option>
                  <option value="seasonal">Seasonally</option>
                  <option value="yearly">Once or twice a year</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={userProfile.notes}
                  onChange={(e) => setUserProfile(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Tell us more about your gift-giving preferences..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all disabled:opacity-50"
              >
                {savingProfile ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 mb-4 overflow-hidden">
        <button
          onClick={() => toggleSection('support')}
          className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Support</h3>
          </div>
          {expanded.support ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {expanded.support && (
          <div className="px-6 pb-6 border-t border-gray-100">
            <p className="text-gray-600 mb-4 mt-4">
              Have questions or feedback? We'd love to hear from you!
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowContactForm(true)}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-all shadow-md hover:shadow-lg"
              >
                <MessageSquare className="w-5 h-5" />
                Contact Us
              </button>
              <button
                onClick={() => setShowSubmissions(true)}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                <Inbox className="w-5 h-5" />
                My Submissions
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <button
          onClick={() => toggleSection('about')}
          className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Gift className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">About Maison Mai</h3>
          </div>
          {expanded.about ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {expanded.about && (
          <div className="px-6 pb-6 border-t border-gray-100">
            <p className="text-gray-600 mb-4 mt-4">
              The Home of Thoughtful Gifting. Maison Mai helps you remember special dates and keep
              track of gift ideas for the people who matter most.
            </p>
            <p className="text-sm text-gray-500">Version 1.0.0</p>
          </div>
        )}
      </div>

      {showContactForm && <ContactForm onClose={() => setShowContactForm(false)} />}
      {showSubmissions && <ContactSubmissions onClose={() => setShowSubmissions(false)} />}
    </div>
  );
}
