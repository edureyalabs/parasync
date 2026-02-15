'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function TermsPage() {
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
            Terms of Use
          </h1>
          <p className="text-gray-600 mb-8">Last Updated: February 15, 2026</p>
          
          <div className="prose prose-lg max-w-none space-y-8">
            
            {/* Introduction */}
            <section className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <p className="text-gray-800 leading-relaxed">
                These Terms of Use ("Terms") constitute a legally binding agreement between you and Parasync Technologies Pvt Ltd ("Parasync," "we," "us," or "our") governing your access to and use of the Parasync platform, including our website, applications, and all related services (collectively, the "Services").
              </p>
              <p className="text-gray-800 leading-relaxed mt-4">
                <strong>PLEASE READ THESE TERMS CAREFULLY.</strong> By accessing or using our Services, you agree to be bound by these Terms. If you do not agree to these Terms, do not use our Services.
              </p>
            </section>

            {/* Acceptance */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                By creating an account, accessing, or using the Services, you affirm that:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>You are at least 13 years old (or the age of digital consent in your jurisdiction)</li>
                <li>You have the legal capacity to enter into binding contracts</li>
                <li>You will comply with these Terms and all applicable laws</li>
                <li>All information you provide is accurate and current</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                If you are using the Services on behalf of an organization, you represent that you have authority to bind that organization to these Terms.
              </p>
            </section>

            {/* Account Registration */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">2. Account Registration and Security</h2>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-3">2.1 Account Creation</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                To access certain features, you must create an account. You agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Provide accurate, complete, and current information</li>
                <li>Maintain and update your information promptly</li>
                <li>Maintain the confidentiality of your account credentials</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>

              <h3 className="text-2xl font-bold text-gray-800 mb-3 mt-6">2.2 Account Types</h3>
              <p className="text-gray-700 leading-relaxed">
                We offer different account types with varying features and pricing. You may upgrade or downgrade your account type subject to our pricing and availability.
              </p>
            </section>

            {/* Services Description */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">3. Description of Services</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Parasync provides an autonomous agent network platform that enables users to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Create and deploy AI agents with customizable parameters</li>
                <li>Develop custom Python-based tools for agent capabilities</li>
                <li>Access and interact with public marketplace agents</li>
                <li>Execute tasks autonomously through agent orchestration</li>
                <li>Manage token-based usage and billing</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <strong>Service Modifications:</strong> We reserve the right to modify, suspend, or discontinue any aspect of the Services at any time, with or without notice. We are not liable for any modification, suspension, or discontinuation of the Services.
              </p>
            </section>

            {/* User Responsibilities */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">4. User Responsibilities and Acceptable Use</h2>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-3">4.1 Permitted Use</h3>
              <p className="text-gray-700 leading-relaxed">
                You may use the Services only for lawful purposes and in accordance with these Terms. You agree to use the Services in a professional and ethical manner.
              </p>

              <h3 className="text-2xl font-bold text-gray-800 mb-3 mt-6">4.2 Prohibited Activities</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You agree NOT to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Violate any applicable laws, regulations, or third-party rights</li>
                <li>Use the Services for illegal, fraudulent, or malicious purposes</li>
                <li>Create agents or tools that generate harmful, offensive, or illegal content</li>
                <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
                <li>Reverse engineer, decompile, or disassemble any aspect of the Services</li>
                <li>Interfere with or disrupt the Services or servers</li>
                <li>Use the Services to develop competing products or services</li>
                <li>Scrape, crawl, or use automated means to access the Services without permission</li>
                <li>Bypass rate limits, usage restrictions, or security measures</li>
                <li>Share your account credentials with others</li>
                <li>Use the Services to transmit spam, malware, or harmful code</li>
                <li>Impersonate any person or entity</li>
                <li>Violate the intellectual property rights of Parasync or third parties</li>
              </ul>
            </section>

            {/* AI Agents and Custom Tools */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">5. AI Agents and Custom Tools</h2>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-3">5.1 Agent Creation</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                When creating AI agents, you represent and warrant that:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>You have the right to use any content, data, or code you provide</li>
                <li>Your agents will not violate these Terms or applicable laws</li>
                <li>You will not create agents for malicious or harmful purposes</li>
                <li>You understand that agents operate autonomously and you are responsible for their actions</li>
              </ul>

              <h3 className="text-2xl font-bold text-gray-800 mb-3 mt-6">5.2 Custom Tools</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Custom Python tools must:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Use only approved packages from our whitelist</li>
                <li>Execute within designated timeout limits</li>
                <li>Not attempt to access unauthorized resources</li>
                <li>Comply with our sandbox security requirements</li>
                <li>Not contain malicious code or security vulnerabilities</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                We reserve the right to review, disable, or remove any custom tool that violates these requirements.
              </p>

              <h3 className="text-2xl font-bold text-gray-800 mb-3 mt-6">5.3 Agent Limits</h3>
              <p className="text-gray-700 leading-relaxed">
                Users may create up to 5 AI agents and 10 custom tools per account. These limits may be adjusted at our discretion.
              </p>
            </section>

            {/* Payment and Billing */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">6. Payment, Billing, and Tokens</h2>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-3">6.1 Token-Based Pricing</h3>
              <p className="text-gray-700 leading-relaxed">
                Our Services operate on a token-based pricing model. Tokens are consumed when agents process requests, execute tasks, and generate responses. Current pricing is available on our Pricing page and may be updated periodically.
              </p>

              <h3 className="text-2xl font-bold text-gray-800 mb-3 mt-6">6.2 Token Purchases</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Tokens may be purchased in denominations as specified on our platform</li>
                <li>All token purchases are final and non-refundable except as required by law</li>
                <li>Tokens do not expire</li>
                <li>Tokens are tied to your account and cannot be transferred</li>
                <li>We reserve the right to adjust token pricing with 30 days' notice</li>
              </ul>

              <h3 className="text-2xl font-bold text-gray-800 mb-3 mt-6">6.3 Payment Processing</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Payments are processed through third-party payment processors. You agree to provide accurate payment information and authorize charges. You are responsible for all charges incurred under your account.
              </p>

              <h3 className="text-2xl font-bold text-gray-800 mb-3 mt-6">6.4 Billing Disputes</h3>
              <p className="text-gray-700 leading-relaxed">
                Any billing disputes must be reported within 30 days of the charge. We will investigate and respond promptly.
              </p>
            </section>

            {/* Revenue Sharing */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">7. Creator Revenue Program</h2>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-3">7.1 Eligibility</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                To participate in the Creator Revenue Program:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Your agent must be deployed as a public marketplace agent</li>
                <li>Your agent must achieve 20 million tokens of aggregate usage</li>
                <li>You must comply with all Terms and content guidelines</li>
                <li>You must provide accurate tax and payment information</li>
              </ul>

              <h3 className="text-2xl font-bold text-gray-800 mb-3 mt-6">7.2 Revenue Share</h3>
              <p className="text-gray-700 leading-relaxed">
                Eligible creators earn 15% of tokens consumed by users interacting with their public marketplace agents. Revenue is credited as tokens to your wallet and may be withdrawn or used for your own agent usage.
              </p>

              <h3 className="text-2xl font-bold text-gray-800 mb-3 mt-6">7.3 Termination of Revenue Sharing</h3>
              <p className="text-gray-700 leading-relaxed">
                We may suspend or terminate revenue sharing if your agent violates these Terms, generates complaints, or exhibits poor quality or performance.
              </p>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">8. Intellectual Property Rights</h2>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-3">8.1 Parasync IP</h3>
              <p className="text-gray-700 leading-relaxed">
                The Services, including all software, technology, trademarks, content, and materials, are owned by Parasync and protected by intellectual property laws. You are granted a limited, non-exclusive, non-transferable license to use the Services in accordance with these Terms.
              </p>

              <h3 className="text-2xl font-bold text-gray-800 mb-3 mt-6">8.2 User Content</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You retain ownership of content you create, including agent configurations and custom tools. By using the Services, you grant Parasync a worldwide, non-exclusive, royalty-free license to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Host, store, and process your content to provide the Services</li>
                <li>Display public marketplace agents to other users</li>
                <li>Create derivative works necessary for service operation</li>
                <li>Use aggregated, anonymized data for analytics and improvement</li>
              </ul>

              <h3 className="text-2xl font-bold text-gray-800 mb-3 mt-6">8.3 Feedback</h3>
              <p className="text-gray-700 leading-relaxed">
                Any feedback, suggestions, or ideas you provide to Parasync become our property, and we may use them without restriction or compensation.
              </p>
            </section>

            {/* Privacy and Data */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">9. Privacy and Data Protection</h2>
              <p className="text-gray-700 leading-relaxed">
                Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference. By using the Services, you consent to our data practices as described in the Privacy Policy.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                <strong>Important Data Considerations:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-3">
                <li>Agent conversations may be processed by third-party AI providers</li>
                <li>Custom tool execution occurs in monitored sandbox environments</li>
                <li>Usage data is collected for billing, analytics, and service improvement</li>
                <li>Public marketplace agents' usage statistics may be visible to creators</li>
              </ul>
            </section>

            {/* Disclaimers */}
            <section className="bg-gray-100 p-6 rounded-lg">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">10. Disclaimers and Limitations</h2>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-3">10.1 Service Availability</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND. We do not guarantee uninterrupted, secure, or error-free operation. We may experience downtime, maintenance, or technical issues.
              </p>

              <h3 className="text-2xl font-bold text-gray-800 mb-3">10.2 AI Agent Accuracy</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                AI agents may produce inaccurate, incomplete, or inappropriate responses. We do not warrant the accuracy, reliability, or completeness of agent outputs. You are responsible for verifying information and using agents appropriately.
              </p>

              <h3 className="text-2xl font-bold text-gray-800 mb-3">10.3 Third-Party Integrations</h3>
              <p className="text-gray-700 leading-relaxed">
                The Services may integrate with third-party services and APIs. We are not responsible for the availability, accuracy, or functionality of third-party services.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section className="bg-red-50 p-6 rounded-lg border border-red-200">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">11. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, PARASYNC, ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES</li>
                <li>LOSS OF PROFITS, DATA, USE, OR GOODWILL</li>
                <li>BUSINESS INTERRUPTION OR SERVICE DISRUPTION</li>
                <li>DAMAGES ARISING FROM AI AGENT ERRORS OR OUTPUTS</li>
                <li>UNAUTHORIZED ACCESS TO YOUR ACCOUNT OR CONTENT</li>
                <li>THIRD-PARTY CONDUCT OR CONTENT</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                <strong>OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID TO PARASYNC IN THE 12 MONTHS PRECEDING THE CLAIM, OR $100, WHICHEVER IS GREATER.</strong>
              </p>
              <p className="text-gray-700 leading-relaxed mt-4 text-sm">
                Some jurisdictions do not allow the exclusion of certain warranties or limitation of liability. In such jurisdictions, our liability will be limited to the maximum extent permitted by law.
              </p>
            </section>

            {/* Indemnification */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">12. Indemnification</h2>
              <p className="text-gray-700 leading-relaxed">
                You agree to indemnify, defend, and hold harmless Parasync and its officers, directors, employees, and agents from any claims, liabilities, damages, losses, costs, or expenses (including reasonable attorneys' fees) arising from:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
                <li>Your use of the Services</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any law or third-party rights</li>
                <li>Content created by your agents or tools</li>
                <li>Your negligence or willful misconduct</li>
              </ul>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">13. Termination</h2>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-3">13.1 Termination by You</h3>
              <p className="text-gray-700 leading-relaxed">
                You may terminate your account at any time through your account settings. Termination does not entitle you to refunds for unused tokens.
              </p>

              <h3 className="text-2xl font-bold text-gray-800 mb-3 mt-6">13.2 Termination by Us</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may suspend or terminate your account immediately if:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>You violate these Terms</li>
                <li>Your account shows suspicious or fraudulent activity</li>
                <li>We are required to do so by law</li>
                <li>We discontinue the Services</li>
              </ul>

              <h3 className="text-2xl font-bold text-gray-800 mb-3 mt-6">13.3 Effect of Termination</h3>
              <p className="text-gray-700 leading-relaxed">
                Upon termination, your right to use the Services ceases immediately. We will delete or anonymize your data in accordance with our Privacy Policy. Provisions that by their nature should survive (including payment obligations, indemnification, and limitations of liability) will remain in effect.
              </p>
            </section>

            {/* Dispute Resolution */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">14. Dispute Resolution and Governing Law</h2>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-3">14.1 Governing Law</h3>
              <p className="text-gray-700 leading-relaxed">
                These Terms are governed by the laws of India, without regard to conflict of law principles. You agree to submit to the exclusive jurisdiction of the courts in Bengaluru, Karnataka, India.
              </p>

              <h3 className="text-2xl font-bold text-gray-800 mb-3 mt-6">14.2 Arbitration</h3>
              <p className="text-gray-700 leading-relaxed">
                Any dispute arising from these Terms or the Services shall first be attempted to be resolved through good faith negotiations. If not resolved within 30 days, disputes shall be settled by binding arbitration in Bengaluru, India, in accordance with the Arbitration and Conciliation Act, 1996.
              </p>

              <h3 className="text-2xl font-bold text-gray-800 mb-3 mt-6">14.3 Class Action Waiver</h3>
              <p className="text-gray-700 leading-relaxed">
                You agree to resolve disputes individually and waive any right to participate in class actions or representative proceedings.
              </p>
            </section>

            {/* General Provisions */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">15. General Provisions</h2>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-3">15.1 Entire Agreement</h3>
              <p className="text-gray-700 leading-relaxed">
                These Terms, together with our Privacy Policy, constitute the entire agreement between you and Parasync regarding the Services.
              </p>

              <h3 className="text-2xl font-bold text-gray-800 mb-3 mt-6">15.2 Modifications</h3>
              <p className="text-gray-700 leading-relaxed">
                We may modify these Terms at any time. Material changes will be notified through the Services or via email. Continued use after changes constitutes acceptance of the modified Terms.
              </p>

              <h3 className="text-2xl font-bold text-gray-800 mb-3 mt-6">15.3 Severability</h3>
              <p className="text-gray-700 leading-relaxed">
                If any provision of these Terms is found unenforceable, the remaining provisions remain in full effect.
              </p>

              <h3 className="text-2xl font-bold text-gray-800 mb-3 mt-6">15.4 Waiver</h3>
              <p className="text-gray-700 leading-relaxed">
                Our failure to enforce any right or provision does not constitute a waiver of that right or provision.
              </p>

              <h3 className="text-2xl font-bold text-gray-800 mb-3 mt-6">15.5 Assignment</h3>
              <p className="text-gray-700 leading-relaxed">
                You may not assign these Terms without our written consent. We may assign these Terms without restriction.
              </p>

              <h3 className="text-2xl font-bold text-gray-800 mb-3 mt-6">15.6 Force Majeure</h3>
              <p className="text-gray-700 leading-relaxed">
                We are not liable for delays or failures in performance due to causes beyond our reasonable control.
              </p>
            </section>

            {/* Contact */}
            <section className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">16. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have questions about these Terms, please contact us:
              </p>
              <div className="space-y-2 text-gray-700">
                <p><strong>Email:</strong> <a href="mailto:legal@parasync.in" className="text-blue-600 hover:underline">legal@parasync.in</a></p>
                <p><strong>Mailing Address:</strong><br />
                Parasync Technologies Pvt Ltd<br />
                Bengaluru, Karnataka, India</p>
              </div>
            </section>

            {/* Acknowledgment */}
            <section className="bg-gray-100 p-6 rounded-lg border border-gray-200 text-center">
              <p className="text-lg text-gray-800 font-semibold">
                BY USING THE SERVICES, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS OF USE.
              </p>
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