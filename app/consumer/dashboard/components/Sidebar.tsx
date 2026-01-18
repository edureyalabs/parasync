import Image from 'next/image';
import { LogOut } from 'lucide-react'; // Optional: for logout icon

interface SidebarProps {
  activeSection: 'projects' | 'assets';
  onSectionChange: (section: 'projects' | 'assets') => void;
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
    <aside className="w-64 bg-black text-white flex flex-col h-full">
      {/* Workspace Header */}
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
          Parasync
        </h2>
        <p className="text-white mt-1 truncate" title={userEmail}>
          {userEmail}
        </p>
      </div>

      {/* Navigation Tiles */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <button 
              onClick={() => onSectionChange('projects')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeSection === 'projects' 
                  ? 'bg-blue-600 text-white' 
                  : 'hover:bg-gray-800'
              }`}
            >
              Projects
            </button>
          </li>
          <li>
            <button 
              onClick={() => onSectionChange('assets')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeSection === 'assets' 
                  ? 'bg-blue-600 text-white' 
                  : 'hover:bg-gray-800'
              }`}
            >
              Assets
            </button>
          </li>
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 transition-colors text-white"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>

      {/* Logo at Bottom */}
      <div className="p-6 flex justify-center">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-white flex items-center justify-center">
          <Image
            src="/logo.jpg"
            alt="Logo"
            width={64}
            height={64}
            className="object-cover"
          />
        </div>
      </div>
    </aside>
  );
}