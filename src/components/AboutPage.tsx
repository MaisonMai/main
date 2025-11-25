import { ArrowLeft, Heart, Users, Target, Sparkles } from 'lucide-react';

interface AboutPageProps {
  onBack: () => void;
}

export function AboutPage({ onBack }: AboutPageProps) {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">Back to Home</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            About Maison Mai
          </h1>
          <p className="text-xl text-gray-600">
            The home of thoughtful gifting
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="bg-primary-50 rounded-2xl p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Maison Mai was born from a simple observation: giving gifts should be joyful, not stressful.
              We've all been there—scrambling at the last minute, wondering what to get someone special,
              or feeling like we're giving generic gifts that don't truly reflect how much we care.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We created Maison Mai to change that. Our platform helps you stay organised, remember what
              matters, and discover gift ideas that come from the heart. Because the best gifts aren't
              about how much you spend—they're about showing someone you truly know them.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                To make thoughtful gifting effortless by helping people remember, organize, and celebrate
                the special moments in their loved ones' lives.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                A world where every gift is meaningful, every celebration is remembered, and every
                relationship is strengthened through thoughtful gestures.
              </p>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">What We Believe</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Heart className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Thoughtfulness Over Price Tags</h3>
                  <p className="text-gray-600">
                    The most meaningful gifts show you understand someone, not that you spent a lot.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Users className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Relationships First</h3>
                  <p className="text-gray-600">
                    Strong relationships are built on small, consistent gestures that show you care.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Sparkles className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Joy in Giving</h3>
                  <p className="text-gray-600">
                    Giving should feel exciting and meaningful, not stressful or overwhelming.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Join Our Community</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Maison Mai is more than just a tool—it's a community of people who believe in the power
              of thoughtful gestures. Whether you're celebrating a birthday, anniversary, or just want
              to show someone you're thinking of them, we're here to help make every moment special.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Together, we're bringing back the art of meaningful gift-giving, one thoughtful gesture at a time.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
