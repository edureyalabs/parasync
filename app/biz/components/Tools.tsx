// app/biz/components/Tools.tsx
import { useState } from 'react';
import { Key, Variable, Code, Wrench } from 'lucide-react';
import ApiTools from './tools/ApiTools';

interface ToolsProps {
  userId: string;
}

type TabType = 'keys' | 'static' | 'dynamic' | 'api';

export default function Tools({ userId }: ToolsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('api');

  const tabs = [
    { id: 'keys' as TabType, label: 'Keys', icon: Key },
    { id: 'static' as TabType, label: 'Static Variables', icon: Variable },
    { id: 'dynamic' as TabType, label: 'Dynamic Variables', icon: Code },
    { id: 'api' as TabType, label: 'API Tools', icon: Wrench },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'api':
        return <ApiTools userId={userId} />;
      case 'keys':
      case 'static':
      case 'dynamic':
        return (
          <div className="flex flex-col items-center justify-center h-96 bg-white rounded-lg shadow-md">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              {tabs.find(t => t.id === activeTab)?.icon && (
                <div className="text-gray-400">
                  {(() => {
                    const Icon = tabs.find(t => t.id === activeTab)!.icon;
                    return <Icon size={40} />;
                  })()}
                </div>
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Coming Soon</h2>
            <p className="text-gray-600 text-center max-w-md">
              This feature will be available in a future update
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Tools</h1>
        <p className="text-gray-600 mt-1">
          Manage your API tools, keys, and variables
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
}