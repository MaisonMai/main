import { useState } from 'react';
import { Gift, Heart, Bell, Sparkles, Calendar, Users, ArrowRight, Check, ShoppingBag, Bookmark, Lightbulb } from 'lucide-react';
import { ContactForm } from './ContactForm';
import { BecomePartnerForm } from './BecomePartnerForm';

interface LandingPageProps {
  onGetStarted: () => void;
  onNavigate: (view: 'privacy' | 'terms' | 'vendors' | 'about' | 'blog') => void;
}

export function LandingPage({ onGetStarted, onNavigate }: LandingPageProps) {
  const [showContactForm, setShowContactForm] = useState(false);
  const [showPartnerForm, setShowPartnerForm] = useState(false);

  const features = [
    {
      icon: Users,
      title: 'Keep Your Circle Close',
      description: 'Stay connected with the people who matter. Record birthdays, anniversaries, and little details that make your loved ones unique.',
    },
    {
      icon: Bookmark,
      title: 'Collect Gift Ideas',
      description: 'Save thoughtful ideas as you come across them. Look back when it\'s time to give and choose something that feels just right.',
    },
    {
      icon: Lightbulb,
      title: 'Smart Suggestions',
      description: 'Discover AI-powered recommendations inspired by each person\'s interests, tastes, and past gifts.',
    },
    {
      icon: Bell,
      title: 'Gentle Reminders',
      description: 'Get a friendly nudge before every special occasion, so you\'re always ready to celebrate.',
    },
    {
      icon: Calendar,
      title: 'Plan Ahead',
      description: 'View upcoming dates and holidays at a glance with an easy-to-use calendar.',
    },
    {
      icon: Heart,
      title: 'Give with Heart',
      description: 'Remember their favourite things, from perfume to hobbies, and find ways to make each gift personal and memorable.',
    },
  ];

  const benefits = [
    'Remember every important date',
    'Strengthen your relationships',
    'Find inspiration for every occasion',
    'Save time while giving more meaning',
    'Create memories that last',
  ];

  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 bg-white border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-gray-900 p-2 rounded-lg">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Maison Mai</span>
            </div>
            <button
              onClick={onGetStarted}
              className="bg-primary-500 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-primary-600 transition-all shadow-sm hover:shadow-md"
            >
              Sign In
            </button>
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-12 sm:pb-20">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 bg-primary-200 text-gray-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-6">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>The Home of Thoughtful Gifting</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
              Never miss a moment to be thoughtful
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed">
              Celebrate the people who matter most.
              Maison Mai helps you remember special moments, understand what makes your loved ones smile, and discover gift ideas that truly come from the heart.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                onClick={onGetStarted}
                className="group bg-primary-500 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-primary-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-gray-700 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all"
              >
                Learn More
              </button>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {benefits.slice(0, 3).map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary-600 flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="relative">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.pexels.com/photos/6173351/pexels-photo-6173351.jpeg?auto=compress&cs=tinysrgb&w=1200"
                  alt="People celebrating and exchanging gifts"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 hidden sm:block">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-200 rounded-full flex items-center justify-center">
                    <Heart className="w-6 h-6 text-primary-700" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Sarah's Birthday</p>
                    <p className="text-xs text-gray-600">3 days away</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-primary-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Thoughtful giving made simple
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Gifting should feel joyful, not stressful. Maison Mai keeps everything in one place so you can plan ahead, stay inspired, and give with confidence every time.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 shadow-sm">
                <Check className="w-8 h-8 text-primary-600 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-900">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Everything you need to make every gift meaningful
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="group bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-xl hover:border-primary-200 transition-all duration-300"
              >
                <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-200 transition-colors">
                  <Icon className="w-7 h-7 text-primary-700" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1200"
                  alt="Curated gift collection"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 bg-primary-200 text-gray-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <ShoppingBag className="w-4 h-4" />
                <span>Maison Mai Partners</span>
              </div>

              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Discover and shop with Maison Mai Partners
              </h2>

              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Explore unique brands and exclusive offers from our trusted partners. Each collection is curated to help you find gifts that tell a story.
              </p>

              <button
                onClick={onGetStarted}
                className="group bg-gray-900 text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition-all inline-flex items-center gap-2"
              >
                Explore Partners
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl overflow-hidden shadow-2xl">
          <div className="px-8 py-16 sm:px-16 text-center">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-white">
              Ready to bring more heart into your giving?
            </h2>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              Join the Maison Mai community and start making every moment count.
            </p>
            <button
              onClick={onGetStarted}
              className="group bg-white text-primary-600 px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="bg-gray-900 p-2 rounded-lg">
                    <Gift className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-lg font-bold text-gray-900">Maison Mai</span>
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
    </div>
  );
}
