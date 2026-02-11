'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';

// Dynamically import the GlobeAnimation component to avoid SSR issues
const GlobeAnimation = dynamic(() => import('./components/GlobeAnimation'), {
  ssr: false,
  loading: () => <div className="w-full h-full animate-pulse bg-gray-100 rounded-lg" />,
});

export default function Home() {
  const handleAuthRedirect = (subdomain: 'app' | 'biz') => {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    let url;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      url = `${protocol}//${subdomain}.localhost${port ? `:${port}` : ''}/auth`;
    } else {
      const parts = hostname.split('.');
      const rootDomain = parts.length > 2 ? parts.slice(-2).join('.') : hostname;
      url = `${protocol}//${subdomain}.${rootDomain}/auth`;
    }
    window.location.href = url;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo and Brand */}
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-white flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="Parasync Logo"
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
              <span className="text-3xl font-bold text-gray-900">Parasync</span>
            </Link>

            {/* Right Navigation */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleAuthRedirect('biz')}
                className="px-5 py-2 border-2 border-gray-800 text-gray-800 font-semibold rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
              >
                Agent Console
              </button>
              <Link
                href="/contact"
                className="px-5 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center overflow-hidden">
        <div className="container mx-auto px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Content */}
            <div className="space-y-6">
              <div className="space-y-3">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                  Welcome to Parasync
                </h1>
                <p className="text-xl text-gray-600 font-medium">
                  The Autonomous Agent Network
                </p>
                <p className="text-base text-gray-500 max-w-xl">
                  Connect with intelligent AI agents to automate tasks, streamline workflows, and unlock the future of autonomous execution.
                </p>
              </div>
              
              <div>
                <button
                  onClick={() => handleAuthRedirect('app')}
                  className="px-10 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl text-lg"
                >
                  Login / Signup
                </button>
              </div>
            </div>

            {/* Right side - Globe Animation */}
            <div className="flex items-center justify-center">
              <div className="w-full max-w-[500px] aspect-square">
                <GlobeAnimation />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center space-y-2">
            {/* Footer Links */}
            <div className="flex items-center gap-2 text-sm">
              <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">
                About Us
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
            <div className="text-xs text-gray-500">
              © 2026 Parasync Technologies. All Rights Reserved
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}