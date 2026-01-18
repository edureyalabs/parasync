import { LogOut } from 'lucide-react';

interface AccountProps {
  userEmail: string;
  onLogout: () => void;
}

export default function Account({ userEmail, onLogout }: AccountProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Account</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Email</h2>
          <p className="text-gray-600">{userEmail}</p>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 transition-colors text-white font-medium"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}