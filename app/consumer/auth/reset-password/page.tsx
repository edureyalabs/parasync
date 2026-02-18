'use client';
import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Check, AlertCircle } from 'lucide-react';

function ResetPasswordContent() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    // Check if user has a valid recovery session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        console.log('✅ Recovery session found');
        setHasSession(true);
      } else {
        console.error('❌ No session - invalid or expired link');
        setError('Invalid or expired reset link. Please request a new one.');
      }
    });
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
      } else {
        console.log('✅ Password updated successfully');
        setSuccess(true);

        // Sign out and redirect to login
        setTimeout(async () => {
          await supabase.auth.signOut();
          router.push('/auth');
        }, 2000);
      }
    } catch (err) {
      setError('An error occurred while updating password');
      setLoading(false);
    }
  };

  if (!hasSession && error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        {/* Subtle Background Pattern */}
        <div className="fixed inset-0 bg-gray-50">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 bg-white border border-gray-200 rounded-xl shadow-lg p-8 max-w-md w-full text-center"
        >
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-red-500" />
            </div>
          </div>
          <p className="text-sm text-gray-700 font-semibold mb-4">{error}</p>
          <button
            onClick={() => router.push('/auth')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            Back to Login
          </button>
        </motion.div>
      </div>
    );
  }

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
        className="relative z-10 w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Reset Password</h1>
          <p className="text-sm text-gray-500">Enter your new password below</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
          {success ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-4"
            >
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-green-50 border border-green-100 flex items-center justify-center">
                  <Check className="w-7 h-7 text-green-500" />
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-800">Password updated!</p>
              <p className="text-xs text-gray-400 mt-1">Redirecting to login...</p>
            </motion.div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                    placeholder="Enter new password"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                    placeholder="Confirm new password"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2"
                >
                  <AlertCircle className="text-red-500 shrink-0" size={16} />
                  <p className="text-red-700 text-xs">{error}</p>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading || !hasSession}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}