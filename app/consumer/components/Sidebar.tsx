import Image from 'next/image';
import { LogOut, MessageSquare, Compass, UserCircle } from 'lucide-react';
import logoImage from './logo.png';

interface SidebarProps {
  activeSection: 'chats' | 'agents' | 'account';
  onSectionChange: (section: 'chats' | 'agents' | 'account') => void;
  userEmail: string;
  onLogout: () => void;
}

export default function Sidebar({ 
  activeSection, 
  onSectionChange, 
  userEmail,
  onLogout 
}: SidebarProps) {
  return (
    <aside className="w-20 bg-black text-white flex flex-col h-full items-center">
      {/* Workspace Header */}
      <div className="p-4 border-b border-gray-700 w-full flex flex-col items-center gap-2">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-white flex items-center justify-center">
          <Image
            src={logoImage}
            alt="Logo"
            width={32}
            height={32}
            className="object-cover"
          />
        </div>
      </div>

      {/* Navigation Icons */}
      <nav className="flex-1 p-3 w-full">
        <ul className="space-y-3">
          <li>
            <button 
              onClick={() => onSectionChange('chats')}
              className={`w-full flex flex-col items-center justify-center px-2 py-3 rounded-lg transition-colors ${
                activeSection === 'chats' 
                  ? 'bg-blue-600 text-white' 
                  : 'hover:bg-gray-800'
              }`}
              title="Chats"
            >
              <MessageSquare size={24} />
              <span className="text-xs mt-1">Chats</span>
            </button>
          </li>
          <li>
            <button 
              onClick={() => onSectionChange('agents')}
              className={`w-full flex flex-col items-center justify-center px-2 py-3 rounded-lg transition-colors ${
                activeSection === 'agents' 
                  ? 'bg-blue-600 text-white' 
                  : 'hover:bg-gray-800'
              }`}
              title="Discover Agents"
            >
              <Compass size={24} />
              <span className="text-xs mt-1">Agents</span>
            </button>
          </li>
          <li>
            <button 
              onClick={() => onSectionChange('account')}
              className={`w-full flex flex-col items-center justify-center px-2 py-3 rounded-lg transition-colors ${
                activeSection === 'account' 
                  ? 'bg-blue-600 text-white' 
                  : 'hover:bg-gray-800'
              }`}
              title="Account"
            >
              <UserCircle size={24} />
              <span className="text-xs mt-1">Account</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-700 w-full">
        <button
          onClick={onLogout}
          className="w-full flex flex-col items-center justify-center px-2 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          title="Logout"
        >
          <LogOut size={24} />
        </button>
      </div>
    </aside>
  );
}