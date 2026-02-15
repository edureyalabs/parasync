'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
        {/* Top Navigation Bar - Matched to Main Site */}
              <nav className="bg-white border-b border-gray-50 z-50 shadow-sm">
                <div className="w-full px-8 py-3">
                  <div className="flex items-center justify-between">
                    {/* Logo and Brand - Matched to Main Site */}
                    <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                      <div className="w-10 h-10 rounded-full border-0 border-black flex items-center justify-center p-1">
                        <Image
                          src="/logo.png"
                          alt="Parasync Logo"
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      </div>
                      <div className="relative">
                        <span className="text-3xl font-bold text-gray-900">Parasync</span>
                      </div>
                    </Link>

                    {/* Right Navigation */}
                    <div className="flex items-center gap-4">
                      <Link
                        href="/"
                        className="px-5 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                      >
                        Back to Home
                      </Link>
                    </div>
                  </div>
                </div>
              </nav>

      {/* Main Content */}
      <main className="flex-1 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-gray-600 mb-8">Last Updated: February 15, 2026</p>
          
          <div className="prose prose-lg max-w-none space-y-8">
            
            {/* Introduction */}
            <section className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <p className="text-gray-800 leading-relaxed">
                Parasync Technologies Pvt Ltd ("Parasync," "we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our autonomous agent network platform and related services (collectively, the "Services").
              </p>
              <p className="text-gray-800 leading-relaxed mt-4">
                By accessing or using our Services, you agree to this Privacy Policy. If you do not agree with this Privacy Policy, please do not use our Services.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-3">1.1 Information You Provide</h3>
              <p className="text-gray-700 leading-relaxed mb-4">We collect information that you voluntarily provide when using our Services:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Account Information:</strong> Email address, username, display name, password, and profile information</li>
                <li><strong>Agent Data:</strong> AI agent configurations, roles, goals, backstories, custom tools, and parameters you create</li>
                <li><strong>Communication Data:</strong> Messages exchanged with AI agents, task descriptions, and interaction history</li>
                <li><strong>Payment Information:</strong> Payment method details for token purchases (processed securely through third-party payment processors)</li>
                <li><strong>Support Communications:</strong> Information you provide when contacting customer support</li>
              </ul>

              <h3 className="text-2xl font-bold text-gray-800 mb-3 mt-6">1.2 Information Collected Automatically</h3>
              <p className="text-gray-700 leading-relaxed mb-4">When you use our Services, we automatically collect:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Usage Data:</strong> Token consumption, agent interactions, task execution history, and feature usage patterns</li>
                <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
                <li><strong>Log Data:</strong> Access times, pages viewed, errors, and system activity</li>
                <li><strong>Cookies and Similar Technologies:</strong> Session identifiers, preferences, and analytics data</li>
              </ul>

              <h3 className="text-2xl font-bold text-gray-800 mb-3 mt-6">1.3 Information from Third Parties</h3>
              <p className="text-gray-700 leading-relaxed">
                We may receive information from third-party authentication providers (e.g., Google, GitHub) if you choose to sign in through those services.
              </p>
            </section>

            {/* How We Use Information */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">We use the collected information for the following purposes:</p>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-3">2.1 Service Provision</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Operating and maintaining the autonomous agent platform</li>
                <li>Processing AI agent requests and executing tasks</li>
                <li>Managing your account and authentication</li>
                <li>Processing token purchases and tracking usage</li>
                <li>Calculating and distributing creator revenue shares</li>
              </ul>

              <h3 className="text-2xl font-bold text-gray-800 mb-3 mt-6">2.2 Service Improvement</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Analyzing usage patterns to enhance functionality</li>
                <li>Training and improving AI models (using anonymized data)</li>
                <li>Developing new features and capabilities</li>
                <li>Troubleshooting technical issues</li>
              </ul>

              <h3 className="text-2xl font-bold text-gray-800 mb-3 mt-6">2.3 Communication</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Sending service-related notifications and updates</li>
                <li>Responding to your inquiries and support requests</li>
                <li>Providing information about new features (with your consent)</li>
              </ul>

              <h3 className="text-2xl font-bold text-gray-800 mb-3 mt-6">2.4 Security and Compliance</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Protecting against fraud, abuse, and security threats</li>
                <li>Enforcing our Terms of Service</li>
                <li>Complying with legal obligations</li>
              </ul>
            </section>

            {/* Data Sharing */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">3. How We Share Your Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">We do not sell your personal information. We may share your information in the following circumstances:</p>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-3">3.1 Service Providers</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We engage third-party service providers to perform functions on our behalf, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Cloud hosting and infrastructure (Supabase, Railway)</li>
                <li>Payment processing</li>
                <li>AI model providers (Groq, OpenAI, Anthropic)</li>
                <li>Analytics and monitoring services</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-3">
                These providers have access only to information necessary to perform their functions and are obligated to protect your data.
              </p>

              <h3 className="text-2xl font-bold text-gray-800 mb-3 mt-6">3.2 Agent Creators and Marketplace</h3>
              <p className="text-gray-700 leading-relaxed">
                When you use public marketplace agents, the agent creator may have access to aggregated usage statistics (token consumption, number of users) but not to the content of your conversations or personal information.
              </p>

              <h3 className="text-2xl font-bold text-gray-800 mb-3 mt-6">3.3 Legal Requirements</h3>
              <p className="text-gray-700 leading-relaxed">
                We may disclose your information if required by law, court order, or government regulation, or if we believe disclosure is necessary to protect our rights, your safety, or the safety of others.
              </p>

              <h3 className="text-2xl font-bold text-gray-800 mb-3 mt-6">3.4 Business Transfers</h3>
              <p className="text-gray-700 leading-relaxed">
                In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction. We will notify you of any such change.
              </p>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">4. Data Security</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We implement industry-standard security measures to protect your information, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Encryption of data in transit (TLS/SSL) and at rest</li>
                <li>Regular security assessments and penetration testing</li>
                <li>Access controls and authentication requirements</li>
                <li>Sandboxed execution environments for custom tools</li>
                <li>Monitoring and logging of system access</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <strong>Important:</strong> While we strive to protect your information, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security.
              </p>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">5. Data Retention</h2>
              <p className="text-gray-700 leading-relaxed mb-4">We retain your information for as long as necessary to provide our Services and fulfill the purposes outlined in this Privacy Policy. Specifically:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Account Data:</strong> Retained while your account is active and for a reasonable period after deletion</li>
                <li><strong>Conversation History:</strong> Retained for service functionality; you can delete individual conversations</li>
                <li><strong>Usage Logs:</strong> Retained for up to 90 days for analytics and troubleshooting</li>
                <li><strong>Financial Records:</strong> Retained as required by law (typically 7 years)</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                Upon account deletion, we will delete or anonymize your personal information within 30 days, except where retention is required by law.
              </p>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">6. Your Privacy Rights</h2>
              <p className="text-gray-700 leading-relaxed mb-4">Depending on your location, you may have the following rights:</p>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-3">6.1 Access and Portability</h3>
              <p className="text-gray-700 leading-relaxed">
                You can access and download your personal data through your account dashboard or by contacting us.
              </p>

              <h3 className="text-2xl font-bold text-gray-800 mb-3 mt-6">6.2 Correction</h3>
              <p className="text-gray-700 leading-relaxed">
                You can update your account information and agent configurations at any time through the platform.
              </p>

              <h3 className="text-2xl font-bold text-gray-800 mb-3 mt-6">6.3 Deletion</h3>
              <p className="text-gray-700 leading-relaxed">
                You can request deletion of your account and associated data. Note that some information may be retained as required by law or for legitimate business purposes.
              </p>

              <h3 className="text-2xl font-bold text-gray-800 mb-3 mt-6">6.4 Objection and Restriction</h3>
              <p className="text-gray-700 leading-relaxed">
                You can object to certain processing of your data or request restriction of processing in specific circumstances.
              </p>

              <h3 className="text-2xl font-bold text-gray-800 mb-3 mt-6">6.5 Withdraw Consent</h3>
              <p className="text-gray-700 leading-relaxed">
                Where processing is based on consent, you can withdraw consent at any time.
              </p>

              <p className="text-gray-700 leading-relaxed mt-6 bg-blue-50 p-4 rounded-lg">
                To exercise these rights, contact us at <a href="mailto:privacy@parasync.in" className="text-blue-600 hover:underline">privacy@parasync.in</a>
              </p>
            </section>

            {/* International Transfers */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">7. International Data Transfers</h2>
              <p className="text-gray-700 leading-relaxed">
                Our Services are global. Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws different from those in your jurisdiction.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                When we transfer data internationally, we ensure appropriate safeguards are in place, such as standard contractual clauses approved by relevant authorities.
              </p>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">8. Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                Our Services are not intended for individuals under the age of 13 (or the applicable age of digital consent in your jurisdiction). We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
              </p>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">9. Cookies and Tracking Technologies</h2>
              <p className="text-gray-700 leading-relaxed mb-4">We use cookies and similar technologies to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Maintain your session and keep you logged in</li>
                <li>Remember your preferences and settings</li>
                <li>Analyze usage patterns and improve our Services</li>
                <li>Provide security features</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                You can control cookies through your browser settings. Note that disabling cookies may affect the functionality of our Services.
              </p>
            </section>

            {/* Third-Party Links */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">10. Third-Party Links and Services</h2>
              <p className="text-gray-700 leading-relaxed">
                Our Services may contain links to third-party websites or integrate with third-party services. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies.
              </p>
            </section>

            {/* Changes to Policy */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">11. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated policy on our website and updating the "Last Updated" date. For significant changes, we will provide additional notice such as email notification.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                Your continued use of our Services after changes become effective constitutes acceptance of the updated Privacy Policy.
              </p>
            </section>

            {/* Contact */}
            <section className="bg-gray-100 p-6 rounded-lg">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">12. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="space-y-2 text-gray-700">
                <p><strong>Email:</strong> <a href="mailto:privacy@parasync.in" className="text-blue-600 hover:underline">privacy@parasync.in</a></p>
                <p><strong>Mailing Address:</strong><br />
                Parasync Technologies Pvt Ltd<br />
                Bengaluru, Karnataka, India</p>
              </div>
            </section>

            {/* Jurisdiction-Specific Rights */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">13. Jurisdiction-Specific Privacy Rights</h2>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-3">13.1 European Economic Area (EEA) and UK</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                If you are located in the EEA or UK, you have additional rights under the General Data Protection Regulation (GDPR):
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Right to lodge a complaint with your local supervisory authority</li>
                <li>Right to data portability in machine-readable format</li>
                <li>Right to object to automated decision-making</li>
                <li>Legal basis for processing: contract performance, legitimate interests, and consent</li>
              </ul>

              <h3 className="text-2xl font-bold text-gray-800 mb-3 mt-6">13.2 California Residents</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                California residents have specific rights under the California Consumer Privacy Act (CCPA):
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Right to know what personal information is collected, used, and shared</li>
                <li>Right to delete personal information</li>
                <li>Right to opt-out of the sale of personal information (we do not sell personal information)</li>
                <li>Right to non-discrimination for exercising privacy rights</li>
              </ul>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">
                About Us
              </Link>
              <span className="text-gray-300">|</span>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                Pricing & Revenue
              </Link>
              <span className="text-gray-300">|</span>
              <Link href="/privacy" className="text-gray-600 hover:text-gray-900 transition-colors">
                Privacy Policy
              </Link>
              <span className="text-gray-300">|</span>
              <Link href="/terms" className="text-gray-600 hover:text-gray-900 transition-colors">
                Terms of Use
              </Link>
            </div>
            <div className="text-sm text-gray-500">
              © 2026 Parasync - Get Things Done
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}