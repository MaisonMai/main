import { ArrowLeft } from 'lucide-react';

type PrivacyPolicyProps = {
  onBack: () => void;
};

export function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                Maison Mai ("we," "our," or "us") is operated by Virtual Speed Date Ltd. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the application.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Information We Collect</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We collect personal information that you voluntarily provide to us when you register on the application, express an interest in obtaining information about us or our products and services, or otherwise contact us.
              </p>
              <p className="text-gray-700 leading-relaxed mb-2">The personal information we collect may include:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Names and contact information (email addresses)</li>
                <li>Profile information (full name, location, country, currency preferences)</li>
                <li>Gift-giving information (people you're buying for, their preferences, gift ideas)</li>
                <li>Reminder and occasion data</li>
                <li>Account credentials</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">How We Use Your Information</h2>
              <p className="text-gray-700 leading-relaxed mb-2">We use the information we collect or receive:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>To facilitate account creation and authentication:</strong> We process your information to create and manage your account.</li>
                <li><strong>To provide and maintain our service:</strong> Including gift recommendations, reminders, and personalized suggestions.</li>
                <li><strong>To send administrative information:</strong> Such as updates about our terms, conditions, and policies.</li>
                <li><strong>To improve our services:</strong> We may use your feedback to improve our products and services.</li>
                <li><strong>To generate AI-powered gift suggestions:</strong> We use your provided information to create personalized gift recommendations.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Advertising and Third-Party Services</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>Google AdSense:</strong> We use Google AdSense to display advertisements on our application. Google AdSense uses cookies and web beacons to serve ads based on your prior visits to our website or other websites on the Internet. Google's use of advertising cookies enables it and its partners to serve ads to you based on your visit to our site and/or other sites on the Internet.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 underline">Google Ads Settings</a> or by visiting <a href="http://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 underline">www.aboutads.info</a>.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                For more information about Google's privacy practices, please review the <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 underline">Google Privacy & Terms</a>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Sharing Your Information</h2>
              <p className="text-gray-700 leading-relaxed mb-2">We may share your information with:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Service providers:</strong> Third-party vendors who perform services on our behalf, such as database hosting (Supabase) and AI services.</li>
                <li><strong>Analytics services:</strong> To help us understand how users interact with our application.</li>
                <li><strong>Advertising partners:</strong> Such as Google AdSense, to display relevant advertisements.</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                We will not sell, rent, or share your personal information with third parties for their marketing purposes without your explicit consent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Data Security</h2>
              <p className="text-gray-700 leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your personal information. However, please note that no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Data Retention</h2>
              <p className="text-gray-700 leading-relaxed">
                We will retain your personal information only for as long as necessary to fulfill the purposes outlined in this privacy policy, unless a longer retention period is required or permitted by law. When your account is idle for a maximum period of 12 months, we may delete your data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Your Privacy Rights</h2>
              <p className="text-gray-700 leading-relaxed mb-2">Depending on your location, you may have the following rights:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Access:</strong> Request access to your personal information.</li>
                <li><strong>Rectification:</strong> Request correction of inaccurate or incomplete data.</li>
                <li><strong>Erasure:</strong> Request deletion of your personal information.</li>
                <li><strong>Restriction:</strong> Request restriction of processing your personal information.</li>
                <li><strong>Data portability:</strong> Request transfer of your data to another service.</li>
                <li><strong>Objection:</strong> Object to our processing of your personal information.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                We do not knowingly solicit data from or market to children under 18 years of age. If you become aware that a child has provided us with personal information, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Changes to This Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Contact Us</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have questions or comments about this privacy policy, please contact us:
              </p>
              <div className="bg-gray-50 rounded-lg p-6 space-y-2">
                <p className="text-gray-700"><strong>Virtual Speed Date Ltd</strong></p>
                <p className="text-gray-700">103 Colney Hatch Ln, Muswell Hill</p>
                <p className="text-gray-700">London, N10 1LR, United Kingdom</p>
                <p className="text-gray-700">Email: support@slushdating.com</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
