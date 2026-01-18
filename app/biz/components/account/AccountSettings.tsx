import { useState } from 'react';
import GeneralSettings from './GeneralSettings';
import OrganizationSettings from './OrganizationSettings';

interface AccountSettingsProps {
  userEmail: string;
  userId: string;
  onLogout: () => void;
}

type TabType = 'general' | 'organization';

export default function AccountSettings({ userEmail, userId, onLogout }: AccountSettingsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('general');

  const tabs: { id: TabType; label: string }[] = [
    { id: 'general', label: 'General' },
    { id: 'organization', label: 'Organization' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralSettings userEmail={userEmail} userId={userId} onLogout={onLogout} />;
      case 'organization':
        return <OrganizationSettings />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Account Settings</h1>
      
      <div className="flex gap-6">
        {/* Left Sidebar - Tabs */}
        <aside className="w-48 flex-shrink-0">
          <nav className="bg-white rounded-lg shadow-md p-2">
            <ul className="space-y-1">
              {tabs.map((tab) => (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors font-medium ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Right Content Area */}
        <main className="flex-1">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}