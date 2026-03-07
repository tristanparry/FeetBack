import { PropsWithChildren, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/Auth/AuthContext';
import { AppRoutes } from '@/constants/app';

const AuthGuard = ({ children }: PropsWithChildren) => {
  const { isReady, isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isReady && !isLoggedIn) {
      router.replace(AppRoutes.Login);
    }
  }, [isReady, isLoggedIn, router]);

  if (!isReady) return null;

  return <>{children}</>;
};

export default AuthGuard;
