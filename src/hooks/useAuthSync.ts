'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useAppStore } from '@/store';

export function useAuthSync() {
  const { data: session, status } = useSession();
  const { signInWithOAuth, isAuthenticated, users } = useAppStore();

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // Check if user exists in our store
      const existingUser = users.find(u => u.email === session.user.email);
      
      if (!existingUser && !isAuthenticated) {
        // User is signed in with NextAuth but not in our store
        const userData = {
          email: session.user.email!,
          password: '', // No password for OAuth users
          fullName: session.user.name || '',
          title: 'User',
          about: '',
          avatar: session.user.image || undefined,
          provider: 'google' as const,
        };

        try {
          console.log('Syncing OAuth user:', userData);
          signInWithOAuth(userData);
        } catch (error) {
          console.error('Error syncing OAuth user:', error);
        }
      } else if (existingUser && !isAuthenticated) {
        // User exists but not authenticated in our store
        useAppStore.setState({ 
          currentUser: existingUser, 
          isAuthenticated: true 
        });
      }
    } else if (status === 'unauthenticated' && isAuthenticated) {
      // User signed out from NextAuth, sign out from our store too
      useAppStore.getState().signOut();
    }
  }, [session, status, isAuthenticated, signInWithOAuth, users]);

  return { session, status };
}
