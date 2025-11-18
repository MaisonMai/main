import { useState, useEffect } from 'react';
import { ExternalLink, Tag, Package, Sparkles, MapPin, Star, Zap, Crown, Check, TrendingUp, MessageCircle, BarChart3, Award } from 'lucide-react';
import { supabase, GiftPartner } from '../lib/supabase';
import { trackPartnerClick } from '../lib/tracking';

type GiftPartnersViewProps = {
  onViewPartner?: (partnerId: string) => void;
  onStartChat?: (partnerId: string) => void;
};

export function GiftPartnersView({ onViewPartner, onStartChat }: GiftPartnersViewProps = {}) {
  const [partners, setPartners] = useState<GiftPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPricing, setShowPricing] = useState(false);

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      const { data, error } = await supabase
        .from('gift_partners')
        .select('*')
        .eq('is_active', true)
        .eq('profile_completed', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setPartners(data || []);
    } catch (err) {
      console.error('Error loading gift partners:', err);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 rounded-3xl mb-12 p-12 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">Exclusive Partner Program</span>
          </div>
          <h1 className="text-5xl font-bold mb-4">
            Join MaisonMai Partners
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl">
            Connect with thoughtful gift-givers and grow your business with AI-powered recommendations,
            exclusive promotions, and direct customer engagement.
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setShowPricing(!showPricing)}
              className="px-8 py-4 bg-white text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
            >
              {showPricing ? 'View Partners' : 'View Pricing'}
            </button>
            <button
              onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
              className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl font-bold hover:bg-white/30 transition-colors border-2 border-white/30"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        {[
          { icon: TrendingUp, label: 'Growing Community', value: '10K+' },
          { icon: Award, label: 'Active Partners', value: partners.length.toString() },
          { icon: Sparkles, label: 'AI Recommendations', value: 'Smart' },
          { icon: BarChart3, label: 'Monthly Reports', value: 'Detailed' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-gray-100 p-6 text-center hover:shadow-lg transition-shadow">
            <stat.icon className="w-8 h-8 text-orange-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {showPricing ? (
        /* Pricing Tiers Section */
        <div className="mb-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full mb-4 animate-pulse">
              <Zap className="w-4 h-4" />
              <span className="font-bold">Black Friday Special - Limited Time!</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Partnership Level</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start growing your business today with our exclusive Black Friday pricing
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {pricingTiers.map((tier, idx) => (
              <div
                key={idx}
                className={`relative bg-white rounded-3xl border-2 ${tier.borderColor} p-8 hover:shadow-2xl transition-all transform hover:-translate-y-2 ${
                  tier.popular ? 'ring-4 ring-orange-200' : ''
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
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button className="w-full py-4 bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-xl font-bold hover:from-gray-800 hover:to-gray-600 transition-all transform hover:scale-105">
                  Get Started
                </button>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 md:p-12 text-center">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Ready to Partner with MaisonMai?</h3>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join our growing community of gift partners and start connecting with customers who are actively
              looking for the perfect gifts. Black Friday pricing available for a limited time only.
            </p>
            <button
              onClick={() => setShowPricing(false)}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold hover:from-orange-600 hover:to-red-700 transition-all transform hover:scale-105 shadow-lg"
            >
              View Our Partners
            </button>
          </div>
        </div>
      ) : (
        /* Partners Grid Section */
        <>
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Our Trusted Partners</h2>
                <p className="text-gray-600">
                  Discover exclusive deals and unique gift options from our curated partners
                </p>
              </div>
              <button
                onClick={() => setShowPricing(true)}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 transition-all transform hover:scale-105"
              >
                Become a Partner
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : partners.length === 0 ? (
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl border border-gray-100 p-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-full mb-6">
                <Sparkles className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Partners Coming Soon</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                We're partnering with amazing brands to bring you exclusive gift deals and recommendations.
                Check back soon or become our first partner!
              </p>
              <button
                onClick={() => setShowPricing(true)}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 transition-all"
              >
                Become a Partner
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {partners.map((partner) => (
                <div
                  key={partner.id}
                  className="group bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-2"
                >
                  {partner.logo_url && (
                    <div className="relative h-48 bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-6 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <img
                        src={partner.logo_url}
                        alt={partner.name}
                        className="max-h-full max-w-full object-contain relative z-10 transform group-hover:scale-110 transition-transform"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <button
                      onClick={() => onViewPartner?.(partner.id)}
                      className="text-left w-full mb-3"
                    >
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                        {partner.name}
                      </h3>
                    </button>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {partner.description}
                    </p>

                    {partner.categories.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {partner.categories.slice(0, 3).map((category, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-orange-50 to-red-50 text-orange-700 rounded-lg text-xs font-semibold"
                          >
                            <Package className="w-3 h-3" />
                            {category}
                          </span>
                        ))}
                      </div>
                    )}

                    {partner.discount_code && (
                      <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4 mb-4">
                        <div className="flex items-start gap-2">
                          <Tag className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs font-bold text-orange-900 mb-2 uppercase tracking-wide">
                              Exclusive Discount
                            </p>
                            <code className="inline-block bg-white px-3 py-2 rounded-lg text-base font-bold text-orange-700 border-2 border-orange-300 shadow-sm">
                              {partner.discount_code}
                            </code>
                            {partner.discount_description && (
                              <p className="text-xs text-orange-700 mt-2">
                                {partner.discount_description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {partner.address && (
                      <button
                        onClick={() => {
                          const address = [partner.address, partner.city, partner.state, partner.postal_code, partner.country]
                            .filter(Boolean)
                            .join(', ');
                          window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
                          trackPartnerClick(partner.id, 'partner_profile');
                        }}
                        className="flex items-center gap-2 w-full px-4 py-3 bg-gray-50 text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-colors mb-2"
                      >
                        <MapPin className="w-4 h-4 text-orange-600" />
                        <div className="flex-1 text-left text-sm">
                          {[partner.city, partner.state].filter(Boolean).join(', ') || partner.address}
                        </div>
                      </button>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onViewPartner?.(partner.id)}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-xl font-semibold hover:from-gray-800 hover:to-gray-600 transition-all text-sm"
                      >
                        View Details
                      </button>
                      {partner.website_url && (
                        <a
                          href={partner.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => trackPartnerClick(partner.id, 'website_click')}
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 transition-all text-sm"
                        >
                          Visit
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
