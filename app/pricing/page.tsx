'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Check, Zap, TrendingUp, DollarSign, Users, Shield } from 'lucide-react';

export default function PricingPage() {
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
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Pricing & Revenue
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transparent, usage-based pricing that scales with your needs. Pay only for what you use.
            </p>
          </div>

          {/* Pricing Model Overview */}
          <section className="mb-16">
            <div className="bg-blue-50 p-8 rounded-2xl border border-blue-100">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="text-blue-600" size={32} />
                <h2 className="text-3xl font-bold text-gray-900">Token-Based Pricing</h2>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Parasync uses a token-based pricing model. Tokens are consumed when AI agents process your requests, execute tasks, and generate responses. This ensures you only pay for actual computational usage, not idle time or subscriptions.
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-3xl font-bold text-gray-800 mb-2">1 Token</div>
                  <div className="text-gray-600">≈ 0.75 words</div>
                  <div className="text-sm text-gray-500 mt-2">Or roughly 1 character of input/output</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-3xl font-bold text-gray-800 mb-2">Pay As You Go</div>
                  <div className="text-gray-600">No subscriptions</div>
                  <div className="text-sm text-gray-500 mt-2">Buy tokens in flexible amounts</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-3xl font-bold text-gray-800 mb-2">100% Transparent</div>
                  <div className="text-gray-600">Track every token</div>
                  <div className="text-sm text-gray-500 mt-2">Detailed usage breakdowns in your dashboard</div>
                </div>
              </div>
            </div>
          </section>

          {/* Agent Types */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Agent Deployment Models</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Self Use */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                <div className="bg-gray-800 text-white p-6">
                  <Shield size={40} className="mb-3" />
                  <h3 className="text-2xl font-bold mb-2">Self Use</h3>
                  <p className="text-gray-200">Personal agents for your own tasks</p>
                </div>
                <div className="p-6">
                  <div className="space-y-4 mb-6">
                    <div className="flex items-start gap-3">
                      <Check className="text-green-600 flex-shrink-0 mt-1" size={20} />
                      <span className="text-gray-700">You create and own the agent</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="text-green-600 flex-shrink-0 mt-1" size={20} />
                      <span className="text-gray-700">You pay for all token usage</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="text-green-600 flex-shrink-0 mt-1" size={20} />
                      <span className="text-gray-700">Private by default</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="text-green-600 flex-shrink-0 mt-1" size={20} />
                      <span className="text-gray-700">Full control and customization</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="text-sm text-gray-600 mb-1">Who Pays:</div>
                    <div className="text-lg font-bold text-gray-900">Agent Creator (You)</div>
                  </div>
                </div>
              </div>

              {/* Enterprise */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-gray-800 relative">
                <div className="absolute top-4 right-4 bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-full">
                  POPULAR
                </div>
                <div className="bg-gray-800 text-white p-6">
                  <Users size={40} className="mb-3" />
                  <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
                  <p className="text-gray-200">Free for your team members</p>
                </div>
                <div className="p-6">
                  <div className="space-y-4 mb-6">
                    <div className="flex items-start gap-3">
                      <Check className="text-green-600 flex-shrink-0 mt-1" size={20} />
                      <span className="text-gray-700">Deploy agents for your organization</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="text-green-600 flex-shrink-0 mt-1" size={20} />
                      <span className="text-gray-700">Team members use agents for free</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="text-green-600 flex-shrink-0 mt-1" size={20} />
                      <span className="text-gray-700">You pay for all team usage</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="text-green-600 flex-shrink-0 mt-1" size={20} />
                      <span className="text-gray-700">Centralized billing and controls</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="text-sm text-gray-600 mb-1">Who Pays:</div>
                    <div className="text-lg font-bold text-gray-900">Agent Creator (Enterprise)</div>
                  </div>
                </div>
              </div>

              {/* Marketplace */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                <div className="bg-gray-800 text-white p-6">
                  <TrendingUp size={40} className="mb-3" />
                  <h3 className="text-2xl font-bold mb-2">Public Marketplace</h3>
                  <p className="text-gray-200">Monetize your agents</p>
                </div>
                <div className="p-6">
                  <div className="space-y-4 mb-6">
                    <div className="flex items-start gap-3">
                      <Check className="text-green-600 flex-shrink-0 mt-1" size={20} />
                      <span className="text-gray-700">Users pay for their own usage</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="text-green-600 flex-shrink-0 mt-1" size={20} />
                      <span className="text-gray-700">You earn 15% revenue share</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="text-green-600 flex-shrink-0 mt-1" size={20} />
                      <span className="text-gray-700">Passive income from quality agents</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="text-green-600 flex-shrink-0 mt-1" size={20} />
                      <span className="text-gray-700">Global distribution</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="text-sm text-gray-600 mb-1">Who Pays:</div>
                    <div className="text-lg font-bold text-gray-900">End Users</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Revenue Sharing for Creators */}
          <section className="mb-16">
            <div className="bg-gray-100 rounded-2xl p-8 md:p-12 border border-gray-200">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <DollarSign size={40} className="text-gray-800" />
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Creator Revenue Program</h2>
                </div>
                
                <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                  Build valuable agents and earn passive income. When your public marketplace agents are used by others, you receive 15% of all tokens consumed.
                </p>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="text-3xl font-bold text-gray-900 mb-2">15%</div>
                    <div className="text-gray-600">Revenue share on every token used via your agents</div>
                  </div>
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="text-3xl font-bold text-gray-900 mb-2">20M</div>
                    <div className="text-gray-600">Token threshold to unlock monetization eligibility</div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">How Monetization Works</h3>
                  <ol className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <span className="font-bold text-2xl text-gray-800">1.</span>
                      <span>Create a high-quality public marketplace agent with valuable capabilities</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="font-bold text-2xl text-gray-800">2.</span>
                      <span>Users discover and connect to your agent via the marketplace</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="font-bold text-2xl text-gray-800">3.</span>
                      <span>Once your agent processes 20 million tokens across all users, monetization activates</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="font-bold text-2xl text-gray-800">4.</span>
                      <span>You earn 15% of every token consumed by users interacting with your agent</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="font-bold text-2xl text-gray-800">5.</span>
                      <span>Revenue is credited to your wallet automatically and can be withdrawn or used for your own agents</span>
                    </li>
                  </ol>
                </div>

                <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <Zap className="flex-shrink-0 mt-1 text-blue-600" size={24} />
                    <div>
                      <div className="font-bold text-lg mb-2 text-gray-900">Example Revenue Scenario</div>
                      <div className="text-gray-700 space-y-1">
                        <p>• Your agent is used by 100 users</p>
                        <p>• Each user consumes an average of 500,000 tokens</p>
                        <p>• Total usage: 50,000,000 tokens</p>
                        <p>• Your revenue: 7,500,000 tokens (15% of 50M)</p>
                        <p className="font-bold pt-2">That's passive income from agents you built once!</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Token Packages (Example) */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Flexible Token Packages</h2>
            <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
              Purchase tokens in any amount that suits your needs. No subscriptions, no commitments. Tokens never expire.
            </p>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 text-center">
                <div className="text-2xl font-bold text-gray-900 mb-2">Starter</div>
                <div className="text-4xl font-bold text-gray-800 mb-4">100K</div>
                <div className="text-sm text-gray-600 mb-4">tokens</div>
                <div className="text-sm text-gray-500">Perfect for trying out agents</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 text-center">
                <div className="text-2xl font-bold text-gray-900 mb-2">Growth</div>
                <div className="text-4xl font-bold text-gray-800 mb-4">1M</div>
                <div className="text-sm text-gray-600 mb-4">tokens</div>
                <div className="text-sm text-gray-500">For regular agent usage</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md border-2 border-gray-800 text-center relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-full">
                  BEST VALUE
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">Pro</div>
                <div className="text-4xl font-bold text-gray-800 mb-4">10M</div>
                <div className="text-sm text-gray-600 mb-4">tokens</div>
                <div className="text-sm text-gray-500">For power users & teams</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 text-center">
                <div className="text-2xl font-bold text-gray-900 mb-2">Enterprise</div>
                <div className="text-4xl font-bold text-gray-800 mb-4">Custom</div>
                <div className="text-sm text-gray-600 mb-4">any amount</div>
                <div className="text-sm text-gray-500">Tailored for organizations</div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-2">How are tokens calculated?</h3>
                <p className="text-gray-700">Tokens represent the computational work done by AI models. Both input (what you send) and output (what the agent responds with) consume tokens. Approximately 1 token = 0.75 words. Complex tasks with tool usage may consume more tokens.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Do tokens expire?</h3>
                <p className="text-gray-700">No, tokens in your wallet never expire. Purchase them once and use them whenever you need.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Can I withdraw my earned revenue?</h3>
                <p className="text-gray-700">Yes, revenue earned from your marketplace agents is credited as tokens to your wallet. You can use these tokens for your own agents or request withdrawal according to our withdrawal policy.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-2">What happens if I run out of tokens?</h3>
                <p className="text-gray-700">If your wallet balance reaches zero, agents will pause execution until you purchase more tokens. You'll receive notifications as your balance gets low.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-2">How do I track my usage?</h3>
                <p className="text-gray-700">Your dashboard provides detailed breakdowns of token usage by agent, task, and time period. Every transaction is recorded with full transparency.</p>
              </div>
            </div>
          </section>
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