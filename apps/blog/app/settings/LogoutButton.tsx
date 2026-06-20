'use client';

import { useRouter } from 'next/navigation';
import { Button } from 'ui';

import { authClient } from '../../infrastructure/auth/auth-client';

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/login');
        },
      },
    });
  };

  return (
    <Button color="dark" variant="outline" onClick={handleLogout}>
      ログアウト
    </Button>
  );
}
