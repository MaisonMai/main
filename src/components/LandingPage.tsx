import { useState } from 'react';
import { Gift, Sparkles, Check, ArrowRight, Search, Heart, Clock, TrendingUp, Users, ShoppingBag } from 'lucide-react';
import { ContactForm } from './ContactForm';
import { BecomePartnerForm } from './BecomePartnerForm';
import { GiftFinderQuestionnaire } from './GiftFinderQuestionnaire';
import { GiftPreviewResults } from './GiftPreviewResults';

interface LandingPageProps {
  onGetStarted: () => void;
  onNavigate: (view: 'privacy' | 'terms' | 'vendors' | 'about' | 'blog') => void;
}

export function LandingPage({ onGetStarted, onNavigate }: LandingPageProps) {
  const [showContactForm, setShowContactForm] = useState(false);
  const [showPartnerForm, setShowPartnerForm] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleQuestionnaireComplete = (data: any) => {
    setRecipientName(data.recipient_name);
    setShowQuestionnaire(false);
    setShowPreview(true);
  };

  const handleShopSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onGetStarted();
    }
  };

  const giftExamples = [
    {
      title: 'Gifts for Sisters',
      image: 'https://images.pexels.com/photos/6347888/pexels-photo-6347888.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Thoughtful ideas for your sister',
    },
    {
      title: 'Gifts for New Dads',
      image: 'https://images.pexels.com/photos/1296154/pexels-photo-1296154.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Perfect for first-time fathers',
    },
    {
      title: 'Gifts for Art Lovers',
      image: 'https://images.pexels.com/photos/1559117/pexels-photo-1559117.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Creative gifts for artists',
    },
    {
      title: 'Gifts for Foodies',
      image: 'https://images.pexels.com/photos/1893555/pexels-photo-1893555.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Delicious gifts for food enthusiasts',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 bg-white border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-serif italic text-gray-900">MaisonMai</span>
            </div>
            <div className="flex items-center gap-8">
              <button
                onClick={() => onNavigate('about')}
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                Our Story
              </button>
              <button
                onClick={() => onNavigate('vendors')}
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                Partners
              </button>
              <button
                onClick={onGetStarted}
                className="bg-primary-600 text-white px-6 py-2.5 rounded-full font-medium hover:bg-primary-700 transition-all"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </nav>

      <section className="bg-gradient-to-b from-primary-50 to-white pt-12 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-white text-gray-800 px-4 py-2 rounded-full text-sm font-semibold mb-6 shadow-sm">
              <Sparkles className="w-4 h-4 text-primary-600" />
              <span>AI-Powered Gift Discovery</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Find the Perfect Gift<br />in 30 Seconds
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Tell us who you're shopping for and we'll find thoughtful, personalized gift ideas you won't find anywhere else
            </p>

            <button
              onClick={() => setShowQuestionnaire(true)}
              className="group bg-primary-600 text-white px-8 py-5 rounded-full font-semibold text-lg hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-3"
            >
              <Sparkles className="w-6 h-6" />
              Get Gift Suggestions Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-sm text-gray-500 mt-3">Free. No credit card required.</p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How it works
            </h2>
            <p className="text-lg text-gray-600">Three simple steps to thoughtful gifting</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary-600" />
              </div>
              <div className="bg-primary-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Tell us about them
              </h3>
              <p className="text-gray-600">
                Answer a few quick questions about who you're shopping for and what they love
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary-600" />
              </div>
              <div className="bg-primary-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Get AI-powered suggestions
              </h3>
              <p className="text-gray-600">
                Our AI analyzes their interests and finds perfect gift matches from unique shops
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-primary-600" />
              </div>
              <div className="bg-primary-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Save and set reminders
              </h3>
              <p className="text-gray-600">
                Keep track of gift ideas and get notified before birthdays and special occasions
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-primary-200 text-gray-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <ShoppingBag className="w-4 h-4" />
              <span>Discover Unique Shops</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Find unique gifts from local shops you've never heard of
            </h2>
            <p className="text-lg text-gray-600">
              Search through 500+ curated independent gift shops and artisan makers
            </p>
          </div>

          <form onSubmit={handleShopSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for shops by category, style, or product..."
                className="w-full pl-12 pr-4 py-5 border-2 border-gray-300 rounded-full text-lg focus:border-primary-600 focus:ring-4 focus:ring-primary-100 transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-primary-700 transition-all"
              >
                Search
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-3 text-center">
              Try: "sustainable fashion", "handmade jewelry", "personalized gifts"
            </p>
          </form>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Or explore by category
            </h2>
            <p className="text-lg text-gray-600">
              Get inspired with gift ideas for every person in your life
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {giftExamples.map((example, idx) => (
              <button
                key={idx}
                onClick={() => setShowQuestionnaire(true)}
                className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary-200 transition-all duration-300"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={example.image}
                    alt={example.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{example.title}</h3>
                  <p className="text-sm text-gray-600">{example.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">
              Everything you need for thoughtful gifting
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <Check className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Never forget another birthday
                </h3>
                <p className="text-gray-600">
                  Set automatic reminders for birthdays, anniversaries, and special occasions
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <Check className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Get personalized gift ideas in seconds
                </h3>
                <p className="text-gray-600">
                  AI-powered suggestions based on interests, personality, and budget
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <Check className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Discover unique local shops you would never find on Google
                </h3>
                <p className="text-gray-600">
                  Curated collection of independent makers and artisan gift shops
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <Check className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Save gift ideas all year round
                </h3>
                <p className="text-gray-600">
                  Build a personal gift vault and never scramble for ideas at the last minute
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">
              Why people love Maison Mai
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <TrendingUp className="w-10 h-10 text-primary-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Loved by thoughtful partners across the UK
              </h3>
              <p className="text-gray-600">
                Join thousands who never miss an important moment
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <ShoppingBag className="w-10 h-10 text-primary-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                With over 500 curated gift shops
              </h3>
              <p className="text-gray-600">
                Discover unique local businesses you won't find on Google
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <Clock className="w-10 h-10 text-primary-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                This tool saves you hours of browsing
              </h3>
              <p className="text-gray-600">
                Get personalized gift ideas in seconds, not hours
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl overflow-hidden shadow-2xl">
          <div className="px-8 py-16 sm:px-16 text-center">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-white">
              Ready to find the perfect gift?
            </h2>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              Join thousands of thoughtful gift-givers who never miss a special moment
            </p>
            <button
              onClick={() => setShowQuestionnaire(true)}
              className="group bg-white text-primary-600 px-8 py-5 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-3"
            >
              <Sparkles className="w-6 h-6" />
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-white/80 text-sm mt-4">No credit card required. Start in 30 seconds.</p>
          </div>
        </div>
      </section>

      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-serif italic text-gray-900">MaisonMai</span>
                </div>
                <span className="text-gray-600 hidden sm:inline">The Home of Thoughtful Gifting</span>
              </div>
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                <button
                  onClick={() => onNavigate('about')}
                  className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                >
                  About
                </button>
                <button
                  onClick={() => onNavigate('blog')}
                  className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                >
                  Blog
                </button>
                <button
                  onClick={() => onNavigate('vendors')}
                  className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                >
                  Partners
                </button>
                <button
                  onClick={() => setShowPartnerForm(true)}
                  className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                >
                  Become a Partner
                </button>
                <button
                  onClick={() => setShowContactForm(true)}
                  className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                >
                  Contact
                </button>
                <button
                  onClick={() => onNavigate('privacy')}
                  className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                >
                  Privacy
                </button>
                <button
                  onClick={() => onNavigate('terms')}
                  className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                >
                  Terms
                </button>
              </div>
            </div>
            <div className="text-center md:text-left">
              <p className="text-gray-500 text-sm">
                © 2025 Maison Mai by Virtual Speed Date Ltd. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {showContactForm && <ContactForm onClose={() => setShowContactForm(false)} />}
      {showPartnerForm && <BecomePartnerForm onClose={() => setShowPartnerForm(false)} />}
      {showQuestionnaire && (
        <GiftFinderQuestionnaire
          onClose={() => setShowQuestionnaire(false)}
          onComplete={handleQuestionnaireComplete}
        />
      )}
      {showPreview && (
        <GiftPreviewResults
          recipientName={recipientName}
          onSignUp={onGetStarted}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
