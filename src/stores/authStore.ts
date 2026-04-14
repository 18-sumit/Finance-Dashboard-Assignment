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
  signInWithPassword: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithPassword: (email: string, password: string) => Promise<{ error?: string }>;
  signInWithOtp: (email: string) => Promise<{ error?: string }>;
  signOut: () => Promise<{ error?: string }>;
}

const getAuthRedirectUrl = () => {
  const envRedirect = import.meta.env.VITE_AUTH_REDIRECT_URL as string | undefined;
  if (envRedirect && envRedirect.trim().length > 0) {
    return envRedirect.trim();
  }

  return window.location.origin;
};

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

  signInWithPassword: async (email, password) => {
    if (!isSupabaseConfigured || !supabase) {
      const error = 'Supabase env vars are missing.';
      set({ error });
      return { error };
    }

    set({ loading: true, error: null });
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    set({ loading: false, error: error?.message ?? null });
    if (error) return { error: error.message };
    return {};
  },

  signUpWithPassword: async (email, password) => {
    if (!isSupabaseConfigured || !supabase) {
      const error = 'Supabase env vars are missing.';
      set({ error });
      return { error };
    }

    set({ loading: true, error: null });
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getAuthRedirectUrl(),
      },
    });

    set({ loading: false, error: error?.message ?? null });
    if (error) return { error: error.message };
    return {};
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
        emailRedirectTo: getAuthRedirectUrl(),
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
