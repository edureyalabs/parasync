// app/biz/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Sidebar from './components/Sidebar';
import Account from './components/Account';
import Agents from './components/Agents';
import Chats from './components/Chats';
import CustomTools from './components/CustomTools';

export default function Page() {
  const [activeSection, setActiveSection] = useState<'dashboard' | 'chats' | 'agents' | 'custom-tools' | 'account'>('dashboard');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function getUser() {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        router.push('/auth');
        return;
      }
      
      setUserEmail(user.email || 'No email');
      setUserId(user.id);
      setLoading(false);
    }

    getUser();
  }, [supabase, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="flex items-center justify-center h-full">
            <h1 className="text-4xl font-bold text-gray-800">Dashboard</h1>
          </div>
        );
      case 'chats':
        return <Chats userId={userId} />;
      case 'agents':
        return <Agents userId={userId} />;
      case 'custom-tools':
        return <CustomTools userId={userId} />;
      case 'account':
        return <Account userEmail={userEmail} userId={userId} onLogout={handleLogout} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        userEmail={userEmail}
        onLogout={handleLogout}
      />
      
      <main className="flex-1 bg-gray-100 p-8 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
}