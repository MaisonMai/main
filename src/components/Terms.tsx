import { ArrowLeft } from 'lucide-react';

type TermsProps = {
  onBack: () => void;
};

export function Terms({ onBack }: TermsProps) {
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
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Agreement to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms of Service constitute a legally binding agreement between you and Virtual Speed Date Ltd ("Company," "we," "us," or "our"), concerning your access to and use of the Maison Mai application.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                By accessing or using the application, you agree that you have read, understood, and agree to be bound by all of these Terms of Service. If you do not agree with all of these Terms, you are expressly prohibited from using the application.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Application Overview</h2>
              <p className="text-gray-700 leading-relaxed">
                Maison Mai is a gift management and recommendation application that helps users organize gift ideas, manage reminders, and receive AI-powered gift suggestions for their loved ones. The application provides personalized recommendations based on user-provided information and preferences.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">License</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Subject to your compliance with these Terms, we grant you a limited, non-exclusive, non-transferable, revocable license to access and use the application for your personal, non-commercial use.
              </p>
              <p className="text-gray-700 leading-relaxed mb-2">You may not:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Copy, modify, or create derivative works based on the application</li>
                <li>Distribute, transfer, sublicense, lease, lend, or rent the application</li>
                <li>Reverse engineer, decompile, or disassemble the application</li>
                <li>Make the application available over a network where it could be used by multiple devices at the same time</li>
                <li>Use the application for any commercial purpose or for any public display</li>
                <li>Remove, alter, or obscure any proprietary notice on the application</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">User Registration</h2>
              <p className="text-gray-700 leading-relaxed">
                You may be required to register with the application. You agree to keep your password confidential and will be responsible for all use of your account and password. We reserve the right to remove, reclaim, or change a username you select if we determine, in our sole discretion, that such username is inappropriate, obscene, or otherwise objectionable.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Prohibited Activities</h2>
              <p className="text-gray-700 leading-relaxed mb-2">You may not access or use the application for any purpose other than that for which we make it available. Prohibited activities include, but are not limited to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Systematically retrieve data to create a collection, compilation, database, or directory</li>
                <li>Circumvent, disable, or otherwise interfere with security-related features</li>
                <li>Engage in unauthorized framing of or linking to the application</li>
                <li>Trick, defraud, or mislead us and other users</li>
                <li>Interfere with, disrupt, or create an undue burden on the application</li>
                <li>Use any information obtained from the application to harass, abuse, or harm another person</li>
                <li>Use the application in a manner inconsistent with any applicable laws or regulations</li>
                <li>Upload or transmit viruses, Trojan horses, or other malicious code</li>
                <li>Engage in any automated use of the system</li>
                <li>Harass, annoy, intimidate, or threaten any of our employees or agents</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">User Generated Content</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                The application may allow you to create, submit, post, display, transmit, perform, publish, or broadcast content, including but not limited to text, writings, photographs, graphics, and personal information ("User Content").
              </p>
              <p className="text-gray-700 leading-relaxed mb-2">By creating or making available any User Content, you represent and warrant that:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>You own or control all rights to the User Content</li>
                <li>The User Content does not violate the privacy rights, publicity rights, copyrights, contract rights, or any other rights of any person</li>
                <li>Your User Content does not contain any material that is defamatory, obscene, indecent, abusive, offensive, harassing, violent, hateful, inflammatory, or otherwise objectionable</li>
                <li>Your User Content does not contain material that exploits or harms children</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">AI-Generated Suggestions</h2>
              <p className="text-gray-700 leading-relaxed">
                Maison Mai uses artificial intelligence to generate gift suggestions. While we strive to provide helpful and appropriate recommendations, we cannot guarantee the suitability, availability, or quality of any suggested items. All AI-generated suggestions are provided for informational purposes only, and you are solely responsible for any purchases or decisions you make based on these suggestions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Intellectual Property Rights</h2>
              <p className="text-gray-700 leading-relaxed">
                Unless otherwise indicated, the application is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the application (collectively, the "Content") are owned or controlled by us and are protected by copyright and trademark laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Disclaimer of Warranties</h2>
              <p className="text-gray-700 leading-relaxed">
                The application is provided on an "AS IS" and "AS AVAILABLE" basis. You agree that your use of the application will be at your sole risk. To the fullest extent permitted by law, we disclaim all warranties, express or implied, in connection with the application and your use thereof.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                In no event will we or our directors, employees, or agents be liable to you for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages, including lost profit, lost revenue, loss of data, or other damages arising from your use of the application.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Termination</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to terminate or suspend your account and access to the application immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms. Upon termination, your right to use the application will immediately cease.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Governing Law</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms shall be governed by and defined following the laws of the United Kingdom. Virtual Speed Date Ltd and yourself irrevocably consent that the courts of the United Kingdom shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify or replace these Terms at any time. If a revision is material, we will make reasonable efforts to provide notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Contact Us</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions about these Terms of Service, please contact us:
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
