'use client';

import AccountSettings from './account/AccountSettings';

interface MyAccountProps {
  userId: string;
}

export default function MyAccount({ userId }: MyAccountProps) {
  return <AccountSettings userId={userId} />;
}