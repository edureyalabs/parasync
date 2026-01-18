import AccountSettings from './account/AccountSettings';

interface AccountProps {
  userEmail: string;
  userId: string;
  onLogout: () => void;
}

export default function Account({ userEmail, userId, onLogout }: AccountProps) {
  return <AccountSettings userEmail={userEmail} userId={userId} onLogout={onLogout} />;
}