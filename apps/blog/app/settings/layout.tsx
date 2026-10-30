import { Suspense } from 'react';
import { SettingsSession } from '../../components/settings-session/SettingsSession';

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-dvh bg-base-white px-4 py-8">
      <Suspense>
        <SettingsSession>{children}</SettingsSession>
      </Suspense>
    </main>
  );
}
