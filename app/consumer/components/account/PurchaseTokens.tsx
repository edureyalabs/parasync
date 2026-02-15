'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Zap, Loader2, DollarSign, TrendingUp, Check, AlertCircle } from 'lucide-react';

export default function PurchaseTokens() {
  const [userId, setUserId] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const [tokensPerDollar, setTokensPerDollar] = useState(1000000);
  const [amountUSD, setAmountUSD] = useState('5.00');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoadingData(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        await loadWalletBalance(user.id);
      }

      // Get token price
      const priceRes = await fetch('/api/wallet/price');
      const priceData = await priceRes.json();
      if (priceData.data) {
        setTokensPerDollar(priceData.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const loadWalletBalance = async (uid: string) => {
    try {
      const { data: wallet } = await supabase
        .from('user_wallets')
        .select('token_balance')
        .eq('user_id', uid)
        .single();

      if (wallet) {
        setWalletBalance(wallet.token_balance);
      }
    } catch (error) {
      console.error('Error loading wallet:', error);
    }
  };

  const calculateTokens = () => {
    const amount = parseFloat(amountUSD) || 0;
    return Math.floor(amount * tokensPerDollar);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const handlePurchase = async () => {
    const amount = parseFloat(amountUSD);
    
    if (amount < 1) {
      setError('Minimum purchase is $1 USD');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Step 1: Create order
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountUSD: amount, userId })
      });

      const orderData = await orderRes.json();
      
      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      // Check if key ID is present
      if (!orderData.razorpayKeyId) {
        throw new Error('Payment configuration error: Missing key ID');
      }

      console.log('Opening Razorpay with key:', orderData.razorpayKeyId);

      // Load Razorpay script if not already loaded
      if (!(window as any).Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      // Step 2: Open Razorpay checkout
      const options = {
        key: orderData.razorpayKeyId,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'Token Purchase',
        description: `${calculateTokens().toLocaleString()} Tokens`,
        order_id: orderData.order.id,
        handler: async (response: any) => {
          // Step 3: Verify payment
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userId
            })
          });

          const verifyData = await verifyRes.json();
          
          if (verifyData.success) {
            setSuccess(true);
            setLoading(false);
            
            // Reload wallet balance
            await loadWalletBalance(userId);
            
            // Reset after 3 seconds
            setTimeout(() => {
              setSuccess(false);
              setAmountUSD('5.00');
            }, 3000);
          } else {
            setError('Payment verification failed');
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          }
        },
        theme: {
          color: '#3B82F6'
        }
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();

    } catch (err: any) {
      console.error('Purchase error:', err);
      setError(err.message || 'Purchase failed');
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Balance */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-md p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <Zap size={24} />
          </div>
          <div>
            <p className="text-sm opacity-90">Current Token Balance</p>
            <p className="text-4xl font-bold">{formatNumber(walletBalance)}</p>
          </div>
        </div>
      </div>

      {/* Purchase Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Purchase Tokens</h2>

        {/* Token Rate Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-blue-800">
            <TrendingUp size={20} />
            <p className="text-sm font-semibold">
              Current Rate: {formatNumber(tokensPerDollar)} tokens per $1 USD
            </p>
          </div>
        </div>

        {/* Amount Input */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Enter Amount (USD)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <DollarSign className="text-gray-400" size={20} />
            </div>
            <input
              type="number"
              value={amountUSD}
              onChange={(e) => setAmountUSD(e.target.value)}
              min="1"
              step="0.01"
              disabled={loading || success}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-xl font-semibold disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="0.00"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">Minimum: $1.00 USD</p>
        </div>

        {/* Token Preview */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 font-medium">You'll receive:</span>
            <Zap className="text-yellow-500" size={20} />
          </div>
          <p className="text-4xl font-bold text-purple-600">
            {formatNumber(calculateTokens())}
          </p>
          <p className="text-sm text-gray-500 mt-1">tokens</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <Check className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-sm font-semibold text-green-800">Payment Successful!</p>
              <p className="text-sm text-green-700">
                {formatNumber(calculateTokens())} tokens have been added to your account
              </p>
            </div>
          </div>
        )}

        {/* Purchase Button */}
        <button
          onClick={handlePurchase}
          disabled={loading || parseFloat(amountUSD) < 1 || success}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-lg font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={24} />
              Processing Payment...
            </>
          ) : success ? (
            <>
              <Check size={24} />
              Purchase Complete!
            </>
          ) : (
            <>
              <Zap size={24} />
              Purchase for ${parseFloat(amountUSD).toFixed(2)}
            </>
          )}
        </button>

        {/* Payment Info */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 leading-relaxed">
            <strong>Secure Payment:</strong> All payments are processed securely through Razorpay. 
            We support credit cards, debit cards, UPI, and net banking. Your payment information 
            is never stored on our servers.
          </p>
        </div>
      </div>

      {/* How it Works */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">How Tokens Work</h3>
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 font-bold text-sm">1</span>
            </div>
            <div>
              <p className="font-semibold text-gray-800">Purchase Tokens</p>
              <p className="text-sm text-gray-600">Buy tokens at the current rate to power your AI interactions</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 font-bold text-sm">2</span>
            </div>
            <div>
              <p className="font-semibold text-gray-800">Use for AI Features</p>
              <p className="text-sm text-gray-600">Tokens are consumed when you use AI-powered features and agents</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 font-bold text-sm">3</span>
            </div>
            <div>
              <p className="font-semibold text-gray-800">Track Usage</p>
              <p className="text-sm text-gray-600">Monitor your balance and transaction history in the Usage Metrics tab</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}