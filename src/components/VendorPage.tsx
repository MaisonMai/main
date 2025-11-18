import { useState } from 'react';
import { ArrowLeft, Store, Sparkles, Star, Crown, Package, Check, Zap, TrendingUp, BarChart3, Award, MessageCircle } from 'lucide-react';
import { PartnershipEnquiryForm } from './PartnershipEnquiryForm';

interface VendorPageProps {
  onBack: () => void;
}

export function VendorPage({ onBack }: VendorPageProps) {
  const [showEnquiryForm, setShowEnquiryForm] = useState(false);

  const pricingTiers = [
    {
      name: 'Starter',
      price: 'Free',
      originalPrice: null,
      icon: Package,
      color: 'from-gray-600 to-gray-800',
      borderColor: 'border-gray-200',
      features: [
        'Shop listing on MaisonMai',
        'Monthly report showing store views',
      ],
    },
    {
      name: 'Featured Partner',
      price: '£50',
      originalPrice: '£100',
      period: ' first month',
      subPrice: 'then £79/month',
      icon: Star,
      color: 'from-orange-500 to-red-600',
      borderColor: 'border-orange-200',
      badge: 'Black Friday Deal',
      popular: true,
      features: [
        'Everything in Starter, plus:',
        'One featured product placement across MaisonMai',
        'Guest article opportunities in the MaisonMai Journal (our newsletter) and on our blog',
        'Social Spotlight on MaisonMai\'s social media channels (Instagram, Pinterest, TikTok)',
        'Year-round promotional opportunities through seasonal campaigns and curated gift guides',
        'Full monthly analytics report (views, clicks, and engagement metrics)',
      ],
    },
    {
      name: 'Premium Partner',
      price: '£300',
      originalPrice: '£500',
      period: '/month',
      lockIn: 'Locked for full year',
      icon: Crown,
      color: 'from-gray-900 to-black',
      borderColor: 'border-gray-900',
      badge: 'Best Value',
      features: [
        'Everything in Featured Partner, plus:',
        'Unlimited featured products across MaisonMai',
        'Two-way messaging with customers directly in the app',
        'Monthly tailored marketing session with our team to analyse performance and promote your brand or product',
        'Advanced Smart Match Optimisation (AI-driven feature that connects your store with users based on their gifting preferences, interests, and budgets)',
        'Priority placement in MaisonMai Journal newsletter features',
        'Additional Social Spotlight exposure throughout the year',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 bg-white border-b border-gray-200 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">Back</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-orange-500 to-red-600 p-2 rounded-lg">
                <Store className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">MaisonMai Partners</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 py-20 px-4 mb-20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">Exclusive Partner Program</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Join MaisonMai Partners
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto">
            Connect with thoughtful gift-givers and grow your business with AI-powered recommendations,
            exclusive promotions, and direct customer engagement.
          </p>
          <button
            onClick={() => setShowEnquiryForm(true)}
            className="px-8 py-4 bg-white text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg text-lg"
          >
            Become a Partner
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 mb-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Store, label: 'Partner Network', value: 'Growing' },
            { icon: Sparkles, label: 'AI Recommendations', value: 'Smart' },
            { icon: BarChart3, label: 'Monthly Reports', value: 'Detailed' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-gray-100 p-6 text-center hover:shadow-xl transition-shadow">
              <stat.icon className="w-8 h-8 text-orange-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Tiers Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full mb-4 animate-pulse">
            <Zap className="w-4 h-4" />
            <span className="font-bold">Black Friday Special - Limited Time!</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Choose Your Partnership Level</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start growing your business today with our exclusive Black Friday pricing
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {pricingTiers.map((tier, idx) => (
            <div
              key={idx}
              className={`relative bg-white rounded-3xl border-2 ${tier.borderColor} p-8 hover:shadow-2xl transition-all transform hover:-translate-y-2 ${
                tier.popular ? 'ring-4 ring-orange-200 scale-105' : ''
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                  {tier.badge}
                </div>
              )}

              <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${tier.color} rounded-2xl mb-6 text-white`}>
                <tier.icon className="w-8 h-8" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>

              <div className="mb-6">
                {tier.originalPrice && (
                  <div className="text-lg text-gray-400 line-through mb-1">{tier.originalPrice}</div>
                )}
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-gray-900">{tier.price}</span>
                  {tier.period && <span className="text-gray-600">{tier.period}</span>}
                </div>
                {tier.subPrice && (
                  <div className="text-sm text-gray-600 mt-1">{tier.subPrice}</div>
                )}
                {tier.lockIn && (
                  <div className="text-sm text-orange-600 font-semibold mt-2">{tier.lockIn}</div>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                {tier.features.map((feature, featureIdx) => (
                  <li key={featureIdx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => setShowEnquiryForm(true)}
                className="w-full py-4 bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-xl font-bold hover:from-gray-800 hover:to-gray-600 transition-all transform hover:scale-105"
              >
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Why Partner Section */}
      <div className="bg-gradient-to-br from-gray-50 to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Partner with MaisonMai?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We connect you with shoppers who are already in the gifting mindset, planning birthdays,
              anniversaries, weddings, and all of life's special moments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: Sparkles,
                title: 'Smart Product Recommendations',
                description: 'Our AI-powered matching system recommends your products directly to users preparing for upcoming celebrations.',
              },
              {
                icon: MessageCircle,
                title: 'Direct Customer Engagement',
                description: 'Premium partners can message customers directly in the app, building relationships and closing sales.',
              },
              {
                icon: Award,
                title: 'Social & Editorial Features',
                description: 'Get featured across Instagram, Pinterest, TikTok, and our MaisonMai Journal newsletter and blog.',
              },
            ].map((benefit, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl mb-4">
                  <benefit.icon className="w-7 h-7 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-gray-900 to-black text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Partner with MaisonMai?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join our growing community of gift partners and start connecting with customers who are actively
            looking for the perfect gifts. Black Friday pricing available for a limited time only.
          </p>
          <button
            onClick={() => setShowEnquiryForm(true)}
            className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold hover:from-orange-600 hover:to-red-700 transition-all transform hover:scale-105 shadow-lg text-lg"
          >
            Contact Partnerships Team
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 text-sm">
          © 2025 MaisonMai by Virtual Speed Date Ltd. All rights reserved.
        </div>
      </footer>

      {showEnquiryForm && (
        <PartnershipEnquiryForm onClose={() => setShowEnquiryForm(false)} />
      )}
    </div>
  );
}
