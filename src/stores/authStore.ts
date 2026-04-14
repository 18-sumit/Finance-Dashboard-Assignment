import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  initialized: boolean;
  loading: boolean;
  error: string | null;
  initialize: () => Promise<(() => void) | void>;
  signInWithOtp: (email: string) => Promise<{ error?: string }>;
  signOut: () => Promise<{ error?: string }>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  initialized: false,
  loading: false,
  error: null,

  initialize: async () => {
    if (!isSupabaseConfigured || !supabase) {
      set({ initialized: true, loading: false, error: 'Supabase env vars are missing.' });
      return;
    }

    set({ loading: true, error: null });

    const { data, error } = await supabase.auth.getSession();
    if (error) {
      set({ initialized: true, loading: false, error: error.message });
    } else {
      set({
        session: data.session,
        user: data.session?.user ?? null,
        initialized: true,
        loading: false,
        error: null,
      });
    }

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null, initialized: true });
    });

    return () => listener.subscription.unsubscribe();
  },

  signInWithOtp: async (email) => {
    if (!isSupabaseConfigured || !supabase) {
      const error = 'Supabase env vars are missing.';
      set({ error });
      return { error };
    }

    set({ loading: true, error: null });
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    set({ loading: false, error: error?.message ?? null });
    if (error) return { error: error.message };
    return {};
  },

  signOut: async () => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: 'Supabase env vars are missing.' };
    }

    set({ loading: true, error: null });
    const { error } = await supabase.auth.signOut();
    set({ loading: false, error: error?.message ?? null });
    if (error) return { error: error.message };
    return {};
  },
}));
