import { X, Sparkles, ArrowRight, Lock } from 'lucide-react';

type GiftPreviewResultsProps = {
  recipientName: string;
  onSignUp: () => void;
  onClose: () => void;
};

export function GiftPreviewResults({ recipientName, onSignUp, onClose }: GiftPreviewResultsProps) {
  const mockResults = [
    {
      title: 'Personalised Leather Journal Set',
      category: 'Stationery & Writing',
      price: '£45-£60',
    },
    {
      title: 'Artisan Coffee Experience Bundle',
      category: 'Food & Drink',
      price: '£35-£50',
    },
    {
      title: 'Sustainable Wellness Gift Box',
      category: 'Self-Care & Beauty',
      price: '£50-£70',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-600" />
              Perfect Gift Ideas for {recipientName}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              AI-powered personalised recommendations
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-6 py-6">
          <div className="space-y-4">
            {mockResults.map((result, idx) => (
              <div
                key={idx}
                className="relative bg-white border border-gray-200 rounded-xl p-6 overflow-hidden"
              >
                <div className="absolute inset-0 backdrop-blur-sm bg-white/30 z-10"></div>
                <div className="absolute inset-0 z-20 flex items-center justify-center">
                  <div className="bg-white rounded-lg shadow-lg p-4 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-gray-600" />
                    <span className="font-semibold text-gray-900">Sign up to reveal</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0"></div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {result.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{result.category}</p>
                    <p className="text-sm font-semibold text-primary-600">{result.price}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-8 text-center text-white">
            <Sparkles className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-3">
              Create a free account to reveal their perfect gift ideas
            </h3>
            <p className="text-white/90 mb-6 max-w-md mx-auto">
              Get full access to personalised recommendations, save gift ideas, and set reminders for special occasions
            </p>
            <button
              onClick={onSignUp}
              className="bg-white text-primary-600 px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
            >
              Sign Up Free
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-white/80 text-sm mt-4">No credit card required</p>
          </div>
        </div>
      </div>
    </div>
  );
}
