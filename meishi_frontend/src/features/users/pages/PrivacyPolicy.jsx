import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
              <div className="space-y-4 text-gray-600">
                <p>We collect information that you provide directly to us, including:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Account information (name, email, username)</li>
                  <li>Profile information (profile picture, preferences)</li>
                  <li>Restaurant information (for restaurant owners)</li>
                  <li>User-generated content (reviews, ratings, comments)</li>
                  <li>Communication preferences</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
              <div className="space-y-4 text-gray-600">
                <p>We use the collected information to:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Provide and maintain our services</li>
                  <li>Personalize your experience</li>
                  <li>Process transactions</li>
                  <li>Send service-related communications</li>
                  <li>Improve our services</li>
                  <li>Protect against fraud and abuse</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Information Sharing</h2>
              <div className="space-y-4 text-gray-600">
                <p>We may share your information with:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Service providers who assist in our operations</li>
                  <li>Restaurant partners (for booking-related information)</li>
                  <li>Legal authorities when required by law</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
              <p className="text-gray-600">
                We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Your Rights</h2>
              <div className="space-y-4 text-gray-600">
                <p>You have the right to:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate information</li>
                  <li>Request deletion of your information</li>
                  <li>Object to processing of your information</li>
                  <li>Withdraw consent</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Contact Us</h2>
              <p className="text-gray-600">
                If you have any questions about this Privacy Policy, please contact us at privacy@example.com
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Changes to This Policy</h2>
              <p className="text-gray-600">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
              </p>
            </section>

            <div className="text-sm text-gray-500 pt-8 border-t">
              Last Updated: February 20, 2024
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}