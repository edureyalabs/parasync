'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Sidebar from './components/Sidebar';
import MyChats from './components/MyChats';
import AgentDiscovery from './components/AgentDiscovery';
import MyAccount from './components/MyAccount';

export default function Home() {
  const [activeSection, setActiveSection] = useState<'chats' | 'agents' | 'account'>('chats');
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/auth');
      } else {
        setUserEmail(session.user.email || '');
        setUserId(session.user.id);
        setLoading(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      console.log('Logging out...');
      await supabase.auth.signOut();
      router.push('/auth');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        userEmail={userEmail}
        onLogout={handleLogout}
      />

      <main className="flex-1 overflow-hidden">
        {activeSection === 'chats' && <MyChats />}
        {activeSection === 'agents' && <AgentDiscovery />}
        {activeSection === 'account' && <MyAccount userId={userId} />}
      </main>
    </div>
  );
}