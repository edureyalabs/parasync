'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Sidebar from './components/Sidebar';

export default function Page() {
  const [activeSection, setActiveSection] = useState<'projects' | 'assets'>('projects');
  const [userEmail, setUserEmail] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  // Fetch user data on component mount
  useEffect(() => {
    async function getUser() {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        // If no user, redirect to login
        router.push('/auth');
        return;
      }
      
      setUserEmail(user.email || 'No email');
      setLoading(false);
    }

    getUser();
  }, [supabase, router]);

  // Handle logout
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

  return (
    <div className="flex h-screen">
      <Sidebar 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        userEmail={userEmail}
        onLogout={handleLogout}
      />
      
      <main className="flex-1 bg-gray-100 p-8 overflow-auto">
        <div className="flex items-center justify-center h-full">
          <h1 className="text-4xl font-bold text-gray-800">Right Dashboard</h1>
        </div>
      </main>
    </div>
  );
}