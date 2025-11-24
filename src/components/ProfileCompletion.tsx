import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, Globe, User, Gift } from 'lucide-react';

export function ProfileCompletion() {
  const [fullName, setFullName] = useState('');
  const [country, setCountry] = useState('GB');
  const [city, setCity] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { completeProfile } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!fullName.trim()) {
        setError('Please enter your name');
        setLoading(false);
        return;
      }
      if (!city.trim()) {
        setError('Please enter your city');
        setLoading(false);
        return;
      }

      const { error } = await completeProfile(fullName, country, city);
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <div className="bg-gray-900 p-3 rounded-xl">
              <Gift className="w-8 h-8 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Maison Mai</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Profile</h2>
          <p className="text-gray-600">
            Help us personalize your experience with local and exclusive gift recommendations
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-6">
            <div className="flex gap-3">
              <MapPin className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Why we ask for this information</h3>
                <p className="text-sm text-primary-700">
                  Your location helps us suggest gifts that are available locally and tailored to your region,
                  including exclusive items and better shipping options.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="fullName" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <User className="w-4 h-4" />
                Your Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label htmlFor="country" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Globe className="w-4 h-4" />
                Country
              </label>
              <select
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                required
              >
                <option value="US">United States</option>
                <option value="GB">United Kingdom</option>
                <option value="CA">Canada</option>
                <option value="AU">Australia</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="IT">Italy</option>
                <option value="ES">Spain</option>
                <option value="NL">Netherlands</option>
                <option value="BE">Belgium</option>
                <option value="SE">Sweden</option>
                <option value="NO">Norway</option>
                <option value="DK">Denmark</option>
                <option value="FI">Finland</option>
                <option value="CH">Switzerland</option>
                <option value="AT">Austria</option>
                <option value="IE">Ireland</option>
                <option value="NZ">New Zealand</option>
                <option value="SG">Singapore</option>
                <option value="JP">Japan</option>
                <option value="KR">South Korea</option>
                <option value="IN">India</option>
                <option value="BR">Brazil</option>
                <option value="MX">Mexico</option>
                <option value="AR">Argentina</option>
                <option value="CL">Chile</option>
                <option value="ZA">South Africa</option>
                <option value="AE">United Arab Emirates</option>
                <option value="SA">Saudi Arabia</option>
              </select>
            </div>

            <div>
              <label htmlFor="city" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <MapPin className="w-4 h-4" />
                City
              </label>
              <input
                id="city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="London"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                We'll use this to find gifts available in your area
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-500 text-white py-3 rounded-lg font-semibold hover:bg-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? 'Saving...' : 'Complete Setup'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          Your information is private and used only to enhance your experience
        </p>
      </div>
    </div>
  );
}
