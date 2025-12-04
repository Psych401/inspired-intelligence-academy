import { CONTACT_EMAIL } from '@/constants';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-brand-white pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">
          <h1 className="font-heading font-bold text-4xl text-brand-indigo mb-8">Privacy Policy</h1>
          <p className="text-gray-500 mb-8 italic">Last Updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-8 text-gray-700 leading-relaxed font-sans">
            <section>
              <h2 className="text-2xl font-bold text-brand-indigo mb-4">1. Introduction</h2>
              <p>
                Welcome to Inspired Intelligence Academy. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-brand-indigo mb-4">2. The Information We Collect</h2>
              <p className="mb-4">We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Identity Data:</strong> includes first name, last name.</li>
                <li><strong>Contact Data:</strong> includes email address and billing address.</li>
                <li><strong>Transaction Data:</strong> includes details about payments to and from you and other details of products you have purchased from us.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-brand-indigo mb-4">3. How We Use Your Information</h2>
              <p className="mb-4">We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>To process and deliver your order.</li>
                <li>To manage our relationship with you (including notifying you about changes to our terms or privacy policy).</li>
                <li>To enable you to access the student resources you have purchased.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-brand-indigo mb-4">4. Data Security</h2>
              <p>
                We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-brand-indigo mb-4">5. Third-Party Links</h2>
              <p>
                This website may include links to third-party websites, plug-ins and applications. Clicking on those links or enabling those connections may allow third parties to collect or share data about you. We do not control these third-party websites and are not responsible for their privacy statements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-brand-indigo mb-4">6. Contact Us</h2>
              <p>
                If you have any questions about this privacy policy or our privacy practices, please contact us at:
              </p>
              <p className="mt-4 font-bold text-brand-indigo">
                {CONTACT_EMAIL}
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

