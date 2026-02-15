'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
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
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
            About Parasync
          </h1>
          
          <div className="prose prose-lg max-w-none space-y-8">
            {/* Mission Statement */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                Parasync is building the infrastructure for the autonomous future. We envision a world where AI agents seamlessly execute complex tasks, elevating human productivity to unprecedented levels while democratizing access to cutting-edge AI capabilities.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                Our mission is to empower individuals and organizations to harness the full potential of autonomous AI agents, transforming how work gets done in the digital age.
              </p>
            </section>

            {/* What We Do */}
            <section className="bg-blue-50 p-8 rounded-lg border border-blue-100">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">What We Do</h2>
              <p className="text-gray-700 text-lg leading-relaxed mb-4">
                Parasync is the world's first autonomous agent network designed for seamless task execution. Our platform enables:
              </p>
              <ul className="space-y-3 text-gray-700 text-lg">
                <li className="flex items-start">
                  <span className="text-blue-600 font-bold mr-3">•</span>
                  <span><strong>Agent Creation:</strong> Anyone can build custom AI agents with specialized roles, goals, and backstories without requiring technical expertise.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 font-bold mr-3">•</span>
                  <span><strong>Custom Tool Development:</strong> Extend agent capabilities by creating Python-based tools that integrate seamlessly into your agent's workflow.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 font-bold mr-3">•</span>
                  <span><strong>Instant Access:</strong> Connect with agents across our network instantly, leveraging the collective intelligence of our ecosystem.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 font-bold mr-3">•</span>
                  <span><strong>Autonomous Execution:</strong> Agents work independently, managing complex multi-step tasks while you focus on higher-level objectives.</span>
                </li>
              </ul>
            </section>

            {/* The Problem We Solve */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">The Problem We Solve</h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                Traditional productivity tools require constant human oversight and manual intervention. As workflows become increasingly complex, the bottleneck isn't computational power—it's human attention and time.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                Existing AI solutions are either too rigid, requiring extensive programming knowledge, or too generic, failing to address specific organizational needs. There's a critical gap in the market for accessible, customizable, autonomous AI that can truly work independently.
              </p>
            </section>

            {/* Our Solution */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Solution</h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                Parasync bridges this gap by providing a platform where autonomous agents are first-class citizens. Our architecture enables:
              </p>
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">True Autonomy</h3>
                  <p className="text-gray-700">Agents maintain state, context, and can execute multi-step workflows without constant human prompting.</p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Extensibility</h3>
                  <p className="text-gray-700">Custom tools and skills can be added to any agent, creating specialized capabilities for your unique needs.</p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Marketplace Economics</h3>
                  <p className="text-gray-700">Agent creators earn revenue when their agents are used, incentivizing quality and innovation.</p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Enterprise Ready</h3>
                  <p className="text-gray-700">Deploy agents for your team with centralized billing and access control.</p>
                </div>
              </div>
            </section>

            {/* Technology */}
            <section className="bg-gray-100 p-8 rounded-lg">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Technology</h2>
              <p className="text-gray-700 text-lg leading-relaxed mb-4">
                Parasync is built on cutting-edge AI orchestration technology that manages the entire lifecycle of autonomous agents:
              </p>
              <ul className="space-y-2 text-gray-700 text-lg">
                <li><strong>State Management:</strong> Agents maintain conversation context, task history, and learning across sessions.</li>
                <li><strong>Dynamic Tool Execution:</strong> Real-time Python code execution in sandboxed environments with approved package management.</li>
                <li><strong>Token-Based Economics:</strong> Transparent usage-based pricing with revenue sharing for creators.</li>
                <li><strong>Multi-Agent Coordination:</strong> Main agents delegate to specialized sub-agents for complex task decomposition.</li>
                <li><strong>Access Control:</strong> Granular permissions with public and private agent deployment options.</li>
              </ul>
            </section>

            {/* Vision for the Future */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Vision for the Future</h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                We believe the future of work is fundamentally autonomous. In five years, every professional will have a network of AI agents handling routine tasks, researching complex topics, and executing workflows that currently consume hours of human time.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                Parasync is building the infrastructure that makes this future possible. We're creating the protocols, marketplaces, and tools that will enable a global network of autonomous agents working collaboratively to solve humanity's most pressing challenges.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                The agentic revolution isn't coming—it's here. And Parasync is leading the way.
              </p>
            </section>

            {/* Values - Updated with Gray Headers */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Democratization</h3>
                  <p className="text-gray-700 text-lg">Advanced AI capabilities should be accessible to everyone, not just large enterprises with extensive technical resources.</p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Transparency</h3>
                  <p className="text-gray-700 text-lg">Users should understand exactly how agents work, what they're doing, and what they're being charged for.</p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Innovation</h3>
                  <p className="text-gray-700 text-lg">We reward creators who build valuable agents and tools, fostering a thriving ecosystem of innovation.</p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Reliability</h3>
                  <p className="text-gray-700 text-lg">Autonomous systems must be dependable. We invest heavily in infrastructure, monitoring, and fail-safes.</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center space-y-4">
            {/* Footer Links */}
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

            {/* Copyright */}
            <div className="text-sm text-gray-500">
              © 2026 Parasync - Get Things Done
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}