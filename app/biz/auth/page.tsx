'use client';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabase';
import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import logoImage from '../components/logo.png';

function AuthContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Helper function to get main domain URL
  const getMainDomainUrl = (path = '') => {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // LOCAL: app.localhost:3000 → localhost:3000
      return `${protocol}//localhost${port ? `:${port}` : ''}${path}`;
    } else if (hostname.includes('localhost')) {
      // LOCAL with subdomain: app.localhost:3000 → localhost:3000
      return `${protocol}//localhost${port ? `:${port}` : ''}${path}`;
    } else {
      // PRODUCTION: app.parasync.com → parasync.com
      const parts = hostname.split('.');
      const rootDomain = parts.length > 2 ? parts.slice(-2).join('.') : hostname;
      return `${protocol}//${rootDomain}${path}`;
    }
  };

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        window.location.href = '/';
      } else {
        setLoading(false);
      }
    });

    // Listen for successful sign-ins
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        window.location.href = '/';
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Image 
            src={logoImage} 
            alt="Parasync" 
            width={60} 
            height={60}
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Subtle Background Pattern */}
      <div className="fixed inset-0 bg-gray-50">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      </div>

    {/* Back to Home Link */}
    <div className="relative z-10 p-6">
      <a 
        href="/"
        onClick={(e) => {
          e.preventDefault();
          window.location.href = getMainDomainUrl('/');
        }}
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to home
      </a>
    </div>

      {/* Auth Container */}
      <div className="relative z-10 flex items-start justify-center px-6 pt-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-4">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-2 flex justify-center"
            >
              <Image 
                src={logoImage}
                alt="Parasync" 
                width={40} 
                height={40}
                className="drop-shadow-lg"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <h1 className="text-2xl font-bold mb-1 text-gray-900">
                Welcome to Parasync
              </h1>
              <p className="text-gray-600 text-xs">
                Your Agentic World
              </p>
            </motion.div>

            {/* Platform Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-xs"
            >
              <Sparkles className="w-3 h-3 text-blue-600" />
              <span className="text-blue-600 font-semibold">Agentic Commerce Platform</span>
            </motion.div>
          </div>

          {/* Auth Form Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg"
          >
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#2563eb',
                      brandAccent: '#1d4ed8',
                      inputBackground: 'white',
                      inputBorder: 'rgba(209, 213, 219, 1)',
                      inputBorderHover: 'rgba(156, 163, 175, 1)',
                      inputBorderFocus: 'rgba(37, 99, 235, 1)',
                      inputText: 'rgba(17, 24, 39, 1)',
                      inputLabelText: 'rgba(55, 65, 81, 1)',
                      inputPlaceholder: 'rgba(156, 163, 175, 1)',
                    },
                    space: {
                      spaceSmall: '6px',
                      spaceMedium: '8px',
                      spaceLarge: '10px',
                    },
                    fontSizes: {
                      baseBodySize: '13px',
                      baseInputSize: '13px',
                      baseLabelSize: '12px',
                      baseButtonSize: '13px',
                    },
                    radii: {
                      borderRadiusButton: '6px',
                      buttonBorderRadius: '6px',
                      inputBorderRadius: '6px',
                    },
                  },
                },
                className: {
                  container: 'auth-container',
                  button: 'auth-button',
                  input: 'auth-input',
                  label: 'auth-label',
                  anchor: 'text-blue-600 hover:text-blue-700 transition-colors',
                },
              }}
              providers={[]}
              view="sign_in"
              showLinks={true}
              theme="light"
            />

            {/* Additional Info */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-[10px] text-center text-gray-500 leading-relaxed">
                By signing up, you agree to our{' '}
                <a 
                  href="/terms"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = getMainDomainUrl('/terms');
                  }}
                  className="text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                >
                  Terms of Use
                </a>{' '}
                and{' '}
                <a 
                  href="/privacy"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = getMainDomainUrl('/privacy');
                  }}
                  className="text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                >
                  Privacy Policy
                </a>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Custom Styles for Supabase Auth UI */}
      <style jsx global>{`
        .auth-container {
          width: 100%;
        }
        
        .auth-button {
          background: #2563eb !important;
          color: white !important;
          font-weight: 600 !important;
          transition: all 0.2s !important;
        }
        
        .auth-button:hover {
          background: #1d4ed8 !important;
        }
        
        .auth-input {
          background: white !important;
          border: 1px solid rgba(209, 213, 219, 1) !important;
          color: rgba(17, 24, 39, 1) !important;
        }
        
        .auth-input:hover {
          border-color: rgba(156, 163, 175, 1) !important;
        }
        
        .auth-input:focus {
          border-color: rgba(37, 99, 235, 1) !important;
          box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.5) !important;
        }
        
        .auth-label {
          color: rgba(55, 65, 81, 1) !important;
          font-weight: 500 !important;
        }
      `}</style>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Image 
            src={logoImage}
            alt="Parasync" 
            width={60} 
            height={60}
          />
        </motion.div>
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}