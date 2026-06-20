import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getSession } from '../../infrastructure/auth/getSession';
import { LogoutButton } from './LogoutButton';
import { SyncTriggers } from './SyncTriggers';

export const metadata: Metadata = {
  title: '設定',
  robots: { index: false, follow: false },
};

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="mx-auto flex w-full max-w-[600px] flex-col items-start gap-6">
      <div className="flex flex-col gap-normal">
        <h1 className="text-heading-3 leading-heading-3 font-bold text-base-black">
          設定
        </h1>
        <p className="text-body-r-sm text-neutral-600">
          {session.user.email} でログイン中
        </p>
      </div>
      <SyncTriggers />
      <LogoutButton />
    </div>
  );
}
