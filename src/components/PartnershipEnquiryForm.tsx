import { useState } from 'react';
import { X, Store } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PartnershipEnquiryFormProps {
  onClose: () => void;
}

export function PartnershipEnquiryForm({ onClose }: PartnershipEnquiryFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    email: '',
    phone_number: '',
    tier: 'starter',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const { error } = await supabase
        .from('partnership_enquiries')
        .insert([formData]);

      if (error) throw error;

      setSubmitStatus('success');
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Error submitting partnership enquiry:', err);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-200 rounded-xl flex items-center justify-center">
              <Store className="w-6 h-6 text-gray-800" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Partnership Enquiry</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {submitStatus === 'success' ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Thank You!</h3>
              <p className="text-gray-600">
                Your partnership enquiry has been submitted. Our team will be in touch soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="text-gray-600 mb-6">
                Ready to connect with thoughtful gift buyers? Fill out the form below and our partnerships team will be in touch.
              </p>

              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="John Smith"
                />
              </div>

              <div>
                <label htmlFor="company_name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  id="company_name"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="Your Company Ltd"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="john@company.com"
                />
              </div>

              <div>
                <label htmlFor="phone_number" className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="+44 20 1234 5678"
                />
              </div>

              <div>
                <label htmlFor="tier" className="block text-sm font-semibold text-gray-700 mb-2">
                  Partnership Tier *
                </label>
                <select
                  id="tier"
                  name="tier"
                  value={formData.tier}
                  onChange={(e) => setFormData(prev => ({ ...prev, tier: e.target.value }))}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all bg-white"
                >
                  <option value="starter">Starter (Free)</option>
                  <option value="featured">Featured Partner (£50 first month, then £79/month)</option>
                  <option value="premium">Premium Partner (£300/month - locked for full year)</option>
                </select>
                <p className="mt-2 text-xs text-gray-500">
                  Select the tier that best fits your business needs
                </p>
              </div>

              {submitStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                  There was an error submitting your enquiry. Please try again.
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Enquiry'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
