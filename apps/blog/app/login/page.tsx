import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getSession } from '../../infrastructure/auth/getSession';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = {
  title: 'ログイン',
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    redirect('/settings');
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-base-white p-4">
      <LoginForm />
    </main>
  );
}
