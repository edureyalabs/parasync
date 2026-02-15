import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Camera, Loader2, Check, AlertCircle, Upload } from 'lucide-react';

interface GeneralSettingsProps {
  userId: string;
}

interface ProfileData {
  username: string;
  display_name: string;
  avatar_url: string;
}

export default function GeneralSettings({ userId }: GeneralSettingsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [profile, setProfile] = useState<ProfileData>({
    username: '',
    display_name: '',
    avatar_url: '',
  });

  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    loadProfile();
    loadUserEmail();
  }, [userId]);

  const loadUserEmail = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      setUserEmail(user.email);
    }
  };

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          username: data.username || '',
          display_name: data.display_name || '',
          avatar_url: data.avatar_url || '',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile data' });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File size must be less than 5MB' });
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setMessage({ type: 'error', text: 'File must be an image (JPG, PNG, GIF, or WEBP)' });
      return;
    }

    setUploadingAvatar(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);

      const response = await fetch('/api/profiles/upload-avatar', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to upload avatar');
      }

      setProfile({ ...profile, avatar_url: data.url });
      setMessage({ type: 'success', text: 'Avatar updated successfully' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to upload avatar' });
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {message && (
        <div className={`p-4 ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
            <span>{message.text}</span>
          </div>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Avatar Section */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Avatar</label>
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <Camera size={32} className="text-gray-400" />
              )}
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <Loader2 className="animate-spin text-white" size={24} />
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <button
              onClick={handleAvatarClick}
              disabled={uploadingAvatar}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Upload size={16} />
              {uploadingAvatar ? 'Uploading...' : 'Change Avatar'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            JPG, PNG, GIF or WEBP. Max size 5MB.
          </p>
        </div>

        {/* Display Name Section */}
        <DisplayNameSection 
          userId={userId}
          initialDisplayName={profile.display_name}
          onUpdate={(newName) => setProfile({ ...profile, display_name: newName })}
          onMessage={setMessage}
        />

        {/* Username Section */}
        <UsernameSection 
          userId={userId}
          initialUsername={profile.username}
          onUpdate={(newUsername) => setProfile({ ...profile, username: newUsername })}
          onMessage={setMessage}
        />

        {/* Email Section */}
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Email Address</h3>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Your registered email</p>
            <p className="font-medium text-gray-800">{userEmail}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Display Name Component
function DisplayNameSection({ userId, initialDisplayName, onUpdate, onMessage }: {
  userId: string;
  initialDisplayName: string;
  onUpdate: (name: string) => void;
  onMessage: (msg: { type: 'success' | 'error'; text: string } | null) => void;
}) {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    onMessage(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw error;

      onUpdate(displayName);
      onMessage({ type: 'success', text: 'Display name updated successfully' });
      setTimeout(() => onMessage(null), 3000);
    } catch (error: any) {
      onMessage({ type: 'error', text: error.message || 'Failed to update display name' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pt-6 border-t border-gray-200">
      <label htmlFor="displayName" className="block text-sm font-semibold text-gray-700 mb-2">
        Display Name
      </label>
      <div className="flex gap-3">
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder="Your display name"
        />
        <button
          onClick={handleSave}
          disabled={saving || displayName === initialDisplayName}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          {saving && <Loader2 className="animate-spin" size={16} />}
          Save
        </button>
      </div>
    </div>
  );
}

// Username Component
function UsernameSection({ userId, initialUsername, onUpdate, onMessage }: {
  userId: string;
  initialUsername: string;
  onUpdate: (username: string) => void;
  onMessage: (msg: { type: 'success' | 'error'; text: string } | null) => void;
}) {
  const [username, setUsername] = useState(initialUsername);
  const [saving, setSaving] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');
  const [usernameError, setUsernameError] = useState<string>('');

  const checkUsernameAvailability = async (username: string) => {
    if (!username || username.length < 3 || username.length > 20) {
      setUsernameStatus('idle');
      return;
    }

    setUsernameStatus('checking');
    setUsernameError('');

    try {
      const { data, error } = await supabase.rpc('check_username_available', {
        username_to_check: username,
        current_user_id: userId,
      });

      if (error) throw error;

      if (data) {
        setUsernameStatus('available');
      } else {
        setUsernameStatus('unavailable');
        setUsernameError('Username is already taken');
      }
    } catch (error: any) {
      setUsernameStatus('unavailable');
      setUsernameError(error.message || 'Failed to check username');
    }
  };

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    
    if (value.length >= 3 && value.length <= 20) {
      const timeoutId = setTimeout(() => {
        checkUsernameAvailability(value);
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setUsernameStatus('idle');
      setUsernameError('');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    onMessage(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: username || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw error;

      onUpdate(username);
      onMessage({ type: 'success', text: 'Username updated successfully' });
      setTimeout(() => onMessage(null), 3000);
    } catch (error: any) {
      onMessage({ type: 'error', text: error.message || 'Failed to update username' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pt-6 border-t border-gray-200">
      <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
        Username
      </label>
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => handleUsernameChange(e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
              usernameError ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="username"
          />
          {usernameStatus === 'checking' && (
            <Loader2 className="absolute right-3 top-2.5 animate-spin text-gray-400" size={20} />
          )}
          {usernameStatus === 'available' && (
            <Check className="absolute right-3 top-2.5 text-green-600" size={20} />
          )}
          {usernameStatus === 'unavailable' && (
            <AlertCircle className="absolute right-3 top-2.5 text-red-600" size={20} />
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={saving || usernameStatus === 'unavailable' || username === initialUsername}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          {saving && <Loader2 className="animate-spin" size={16} />}
          Save
        </button>
      </div>
      {usernameError && (
        <p className="text-sm text-red-600 mt-1">{usernameError}</p>
      )}
      <p className="text-xs text-gray-500 mt-1">
        3-20 characters, letters, numbers, and underscores only
      </p>
    </div>
  );
}