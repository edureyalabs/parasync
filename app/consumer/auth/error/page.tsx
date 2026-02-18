'use client';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { Suspense } from 'react';

function ErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get('error') || 'An unknown error occurred';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      {/* Subtle Background Pattern */}
      <div className="fixed inset-0 bg-gray-50">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 bg-white border border-gray-200 rounded-xl shadow-lg p-8 max-w-md w-full"
      >
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-red-500" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Authentication Error
          </h1>
          <p className="text-sm text-gray-500 mb-6">{error}</p>

          <div className="space-y-3">
            <button
              onClick={() => router.push('/auth')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              Back to Login
            </button>

            <p className="text-xs text-gray-400">
              If this problem persists, please contact support
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}