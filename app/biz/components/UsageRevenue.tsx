'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2, TrendingUp, Zap, DollarSign, Activity } from 'lucide-react';

interface UsageRevenueProps {
  userId: string;
}

interface AgentUsage {
  agent_id: string;
  agent_name: string;
  agent_type: string;
  total_tokens: number;
  input_tokens: number;
  output_tokens: number;
}

interface Revenue {
  agent_id: string;
  agent_name: string;
  total_tokens_processed: number;
  revenue_share_tokens: number;
}

export default function UsageRevenue({ userId }: UsageRevenueProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [agentUsage, setAgentUsage] = useState<AgentUsage[]>([]);
  const [revenueData, setRevenueData] = useState<Revenue[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [lifetimeUsed, setLifetimeUsed] = useState(0);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
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

      const { data: agents } = await supabase
        .from('agents')
        .select('id, display_name, agent_type')
        .eq('profile_id', userId);

      if (agents && agents.length > 0) {
        const agentIds = agents.map(a => a.id);

        const { data: usage } = await supabase
          .from('token_usage')
          .select('agent_id, input_tokens, output_tokens')
          .in('agent_id', agentIds)
          .eq('charged_to', 'agent_creator');

        const usageMap: Record<string, AgentUsage> = {};

        agents.forEach(agent => {
          usageMap[agent.id] = {
            agent_id: agent.id,
            agent_name: agent.display_name,
            agent_type: agent.agent_type || 'self',
            total_tokens: 0,
            input_tokens: 0,
            output_tokens: 0
          };
        });

        if (usage) {
          usage.forEach(u => {
            if (usageMap[u.agent_id]) {
              usageMap[u.agent_id].input_tokens += u.input_tokens;
              usageMap[u.agent_id].output_tokens += u.output_tokens;
              usageMap[u.agent_id].total_tokens += u.input_tokens + u.output_tokens;
            }
          });
        }

        setAgentUsage(Object.values(usageMap));

        const { data: revenue } = await supabase
          .from('creator_revenue_summary')
          .select('agent_id, total_tokens_processed, revenue_share_tokens')
          .eq('creator_user_id', userId);

        if (revenue) {
          const revenueWithNames = revenue.map(r => {
            const agent = agents.find(a => a.id === r.agent_id);
            return {
              ...r,
              agent_name: agent?.display_name || 'Unknown Agent'
            };
          });
          setRevenueData(revenueWithNames);
        }
      }
    } catch (error) {
      console.error('Error loading usage data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  const totalUsage = agentUsage.reduce((sum, a) => sum + a.total_tokens, 0);
  const totalRevenue = revenueData.reduce((sum, r) => sum + r.revenue_share_tokens, 0);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Usage & Revenue</h1>
        <p className="text-gray-600 mt-1">Track your token usage and marketplace earnings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Zap className="text-blue-600" size={20} />
            </div>
            <span className="text-sm font-medium text-gray-600">Wallet Balance</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatNumber(walletBalance)}</p>
          <p className="text-xs text-gray-500 mt-1">tokens available</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Activity className="text-purple-600" size={20} />
            </div>
            <span className="text-sm font-medium text-gray-600">Lifetime Used</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatNumber(lifetimeUsed)}</p>
          <p className="text-xs text-gray-500 mt-1">total tokens consumed</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <TrendingUp className="text-orange-600" size={20} />
            </div>
            <span className="text-sm font-medium text-gray-600">Total Usage</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatNumber(totalUsage)}</p>
          <p className="text-xs text-gray-500 mt-1">tokens this period</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <DollarSign className="text-green-600" size={20} />
            </div>
            <span className="text-sm font-medium text-gray-600">Revenue Share</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatNumber(totalRevenue)}</p>
          <p className="text-xs text-gray-500 mt-1">tokens earned (15%)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-800">Agent Usage</h3>
            <p className="text-sm text-gray-600">Your paid token consumption</p>
          </div>
          <div className="p-6">
            {agentUsage.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No usage data yet</p>
            ) : (
              <div className="space-y-4">
                {agentUsage.map((agent) => (
                  <div key={agent.agent_id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{agent.agent_name}</h4>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                        {agent.agent_type}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total:</span>
                        <span className="font-semibold text-gray-900">{formatNumber(agent.total_tokens)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Input:</span>
                        <span className="text-gray-700">{formatNumber(agent.input_tokens)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Output:</span>
                        <span className="text-gray-700">{formatNumber(agent.output_tokens)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-800">Marketplace Revenue</h3>
            <p className="text-sm text-gray-600">Your 15% earnings from paid agents</p>
          </div>
          <div className="p-6">
            {revenueData.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No marketplace agents yet</p>
            ) : (
              <div className="space-y-4">
                {revenueData.map((rev) => (
                  <div key={rev.agent_id} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{rev.agent_name}</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Processed:</span>
                        <span className="font-semibold text-gray-900">
                          {formatNumber(rev.total_tokens_processed)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Your Share (15%):</span>
                        <span className="font-semibold text-green-600">
                          {formatNumber(rev.revenue_share_tokens)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}