import { redirect } from 'next/navigation';
import { getSession } from '../../infrastructure/auth/getSession';

interface Props {
  children: React.ReactNode;
}

// Every /settings route segment and Server Action authorizes itself; this layout guard is defense in depth.
export async function SettingsSession({ children }: Props) {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }
  return children;
}
