import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/auth.store';
import { refreshTokens, getMe } from '../api/auth.api';
import { setAccessToken } from '../utils/token.util';

// Loading spinner component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
  </div>
);

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading, login } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Try to refresh tokens using the HTTP-only cookie
        const data = await refreshTokens();
        setAccessToken(data.accessToken);

        // Fetch user data and login
        const user = await getMe();
        login(user);
      } catch {
        // No valid refresh token - user needs to login
        // Silently fail - auth state remains unauthenticated
        setLoading(false);
      } finally {
        setIsReady(true);
      }
    };

    initAuth();
  }, [setUser, setLoading, login]);

  if (!isReady) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
}
