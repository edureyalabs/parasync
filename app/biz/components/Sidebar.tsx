import Image from 'next/image';
import { LogOut, FolderKanban, Package, User } from 'lucide-react';
import logoImage from './logo.jpg';

interface SidebarProps {
  activeSection: 'projects' | 'assets' | 'account';
  onSectionChange: (section: 'projects' | 'assets' | 'account') => void;
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

      {/* <h2 className="text-xs font-semibold text-gray-400 text-center">
        Parasync
      </h2> */}
    </div>


      {/* Navigation Icons */}
      <nav className="flex-1 p-3 w-full">
        <ul className="space-y-3">
          <li>
            <button 
              onClick={() => onSectionChange('projects')}
              className={`w-full flex flex-col items-center justify-center px-2 py-3 rounded-lg transition-colors ${
                activeSection === 'projects' 
                  ? 'bg-blue-600 text-white' 
                  : 'hover:bg-gray-800'
              }`}
              title="Projects"
            >
              <FolderKanban size={24} />
              <span className="text-xs mt-1">Projects</span>
            </button>
          </li>
          <li>
            <button 
              onClick={() => onSectionChange('assets')}
              className={`w-full flex flex-col items-center justify-center px-2 py-3 rounded-lg transition-colors ${
                activeSection === 'assets' 
                  ? 'bg-blue-600 text-white' 
                  : 'hover:bg-gray-800'
              }`}
              title="Assets"
            >
              <Package size={24} />
              <span className="text-xs mt-1">Assets</span>
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
              <User size={24} />
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