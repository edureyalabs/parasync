import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Zap, TrendingUp, Clock } from 'lucide-react';

interface UsageMetricsProps {
  userId: string;
}

export default function UsageMetrics({ userId }: UsageMetricsProps) {
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);
  const [lifetimeUsed, setLifetimeUsed] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    loadWalletData();
  }, [userId]);

  const loadWalletData = async () => {
    try {
      setLoading(true);

      const { data: wallet } = await supabase
        .from('user_wallets')
        .select('token_balance, lifetime_tokens_used')
        .eq('user_id', userId)
        .single();

      if (wallet) {
        setWalletBalance(wallet.token_balance);
        setLifetimeUsed(wallet.lifetime_tokens_used);
      }

      const { data: walletId } = await supabase
        .from('user_wallets')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (walletId) {
        const { data: txns } = await supabase
          .from('token_transactions')
          .select('*')
          .eq('wallet_id', walletId.id)
          .order('created_at', { ascending: false })
          .limit(10);

        setTransactions(txns || []);
      }
    } catch (error) {
      console.error('Error loading wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Token Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Zap className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Token Balance</p>
              <p className="text-3xl font-bold text-gray-900">{formatNumber(walletBalance)}</p>
            </div>
          </div>
          <p className="text-sm text-gray-500">Available tokens for AI usage</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Lifetime Usage</p>
              <p className="text-3xl font-bold text-gray-900">{formatNumber(lifetimeUsed)}</p>
            </div>
          </div>
          <p className="text-sm text-gray-500">Total tokens consumed</p>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-800">Recent Transactions</h3>
        </div>
        <div className="p-6">
          {transactions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((txn) => (
                <div key={txn.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock size={16} className="text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{txn.description}</p>
                      <p className="text-xs text-gray-500">{formatDate(txn.created_at)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${
                      txn.transaction_type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {txn.transaction_type === 'credit' ? '+' : '-'}{formatNumber(txn.amount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Balance: {formatNumber(txn.balance_after)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}