'use client';

import type {
  AuthContext as AuthContextType,
  AuthPermission,
  AuthUser,
} from '@/features/auth/types/types';
import {
  can,
  getPermissionsForRole,
  hasPermission,
} from '@/features/auth/utils/authorization';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type React from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_ADMIN = { email: 'admin@test.com', password: '12345' };
const DEMO_USER = { email: 'user@test.com', password: '12345' };

function subscribeToStoredUser(onStoreChange: () => void) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === 'user') {
      onStoreChange();
    }
  };

  window.addEventListener('storage', handleStorage);
  return () => window.removeEventListener('storage', handleStorage);
}

function getStoredUserSnapshot(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('user');
}

function sessionToAuthUser(
  id: string | undefined,
  email: string | null | undefined,
  role: 'admin' | 'user' | undefined,
  permissions: AuthPermission[] | undefined,
): AuthUser {
  const resolvedRole = role ?? 'user';
  return {
    id: id ?? email ?? 'user',
    email: email ?? '',
    role: resolvedRole,
    permissions: permissions ?? getPermissionsForRole(resolvedRole),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const storedDemoUserSnapshot = useSyncExternalStore(
    subscribeToStoredUser,
    getStoredUserSnapshot,
    () => null,
  );
  const [demoUser, setDemoUser] = useState<AuthUser | null>(null);
  const router = useRouter();
  const storedDemoUser = useMemo(() => {
    if (!storedDemoUserSnapshot) {
      return null;
    }

    try {
      return JSON.parse(storedDemoUserSnapshot) as AuthUser;
    } catch {
      window.localStorage.removeItem('user');
      return null;
    }
  }, [storedDemoUserSnapshot]);

  const userFromSession =
    status === 'authenticated' && session?.user
      ? sessionToAuthUser(
          (session.user as { id?: string }).id ??
            session.user.email ??
            undefined,
          session.user.email ?? undefined,
          (session.user as { role?: 'admin' | 'user' }).role,
          (session.user as { permissions?: AuthPermission[] }).permissions,
        )
      : null;

  const user = userFromSession ?? demoUser ?? storedDemoUser;
  const isLoading = status === 'loading';

  const login = useCallback(async (email: string, password: string) => {
    let role: 'admin' | 'user' | null = null;
    if (email === DEMO_ADMIN.email && password === DEMO_ADMIN.password) {
      role = 'admin';
    } else if (email === DEMO_USER.email && password === DEMO_USER.password) {
      role = 'user';
    } else {
      throw new Error('Invalid credentials');
    }
    const mockUser: AuthUser = {
      id: 'user-' + Date.now(),
      email,
      role,
      permissions: getPermissionsForRole(role),
    };
    setDemoUser(mockUser);
    window.localStorage.setItem('user', JSON.stringify(mockUser));
  }, []);

  const logout = useCallback(() => {
    setDemoUser(null);
    window.localStorage.removeItem('user');
    if (status === 'authenticated') {
      void signOut({ callbackUrl: '/login' });
    } else {
      router.replace('/login');
      router.refresh();
    }
  }, [router, status]);

  const signInWithGoogle = useCallback(async () => {
    await signIn('google', { callbackUrl: '/dashboard' });
  }, []);

  const isGoogleEnabled =
    process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === 'true';

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        signInWithGoogle,
        isAuthenticated: !!user,
        isGoogleEnabled,
        hasPermission: (permission) =>
          hasPermission(user?.permissions, permission),
        can: (action, resource) =>
          can(user?.id, user?.permissions, action, resource),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
