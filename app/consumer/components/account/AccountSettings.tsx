import { useState } from 'react';
import GeneralSettings from './GeneralSettings';
import UsageMetrics from './UsageMetrics';
import PurchaseTokens from './PurchaseTokens';

interface AccountSettingsProps {
  userId: string;
}

type TabType = 'general' | 'usage' | 'purchase';

export default function AccountSettings({ userId }: AccountSettingsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('general');

  const tabs: { id: TabType; label: string }[] = [
    { id: 'general', label: 'General' },
    { id: 'usage', label: 'Usage Metrics' },
    { id: 'purchase', label: 'Purchase Tokens' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralSettings userId={userId} />;
      case 'usage':
        return <UsageMetrics userId={userId} />;
      case 'purchase':
        return <PurchaseTokens />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Account</h1>
      
      <div className="flex gap-6">
        {/* Left Sidebar - Tabs */}
        <aside className="w-56 flex-shrink-0">
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