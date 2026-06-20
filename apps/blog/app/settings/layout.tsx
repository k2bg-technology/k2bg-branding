import { redirect } from 'next/navigation';

import { getSession } from '../../infrastructure/auth/getSession';

// Authoritative security boundary for the whole /settings subtree: a forged or
// expired cookie passes the optimistic middleware but is rejected here.
export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  return <main className="min-h-dvh bg-base-white px-4 py-8">{children}</main>;
}
