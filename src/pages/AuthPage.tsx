import { FormEvent, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { useAuthStore } from '../stores/authStore';
import { isSupabaseConfigured } from '../lib/supabase';

export const AuthPage = () => {
  const { user, loading, signInWithOtp, signInWithPassword, signUpWithPassword } = useAuthStore();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isValidEmail = useMemo(() => /.+@.+\..+/.test(email), [email]);
  const isValidPassword = password.trim().length >= 6;

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!isValidEmail) {
      toast.error('Enter a valid email address.');
      return;
    }

    if (!isValidPassword) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    const result =
      mode === 'signin'
        ? await signInWithPassword(email.trim(), password)
        : await signUpWithPassword(email.trim(), password);

    if (result.error) {
      toast.error(mode === 'signin' ? 'Sign in failed' : 'Sign up failed', {
        description: result.error,
      });
      return;
    }

    if (mode === 'signup') {
      toast.success('Account created', {
        description: 'If email confirmation is enabled, verify once from your inbox.',
      });
      return;
    }

    toast.success('Signed in successfully');
  };

  const handleMagicLink = async () => {
    if (!isValidEmail) {
      toast.error('Enter a valid email address first.');
      return;
    }

    const result = await signInWithOtp(email.trim());
    if (result.error) {
      toast.error('Login failed', { description: result.error });
      return;
    }

    toast.success('Magic link sent', {
      description: 'Check your email and open the link to sign in.',
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground grid place-items-center p-6">
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-sm space-y-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{mode === 'signin' ? 'Sign in' : 'Create account'}</h1>
          <p className="text-sm text-muted-foreground">Use email + password for fast login, or request a magic link.</p>
        </div>

        <div className="grid grid-cols-2 rounded-md border p-1 bg-muted/30">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`h-8 rounded text-sm font-medium transition-colors ${mode === 'signin' ? 'bg-background border shadow-sm' : 'text-muted-foreground'}`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`h-8 rounded text-sm font-medium transition-colors ${mode === 'signup' ? 'bg-background border shadow-sm' : 'text-muted-foreground'}`}
          >
            Sign Up
          </button>
        </div>

        {!isSupabaseConfigured && (
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-300">
            Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in env.
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-3">
          <label className="text-sm font-medium block" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-10 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />

          <label className="text-sm font-medium block" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-10 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            placeholder="At least 6 characters"
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            required
          />

          <Button type="submit" className="w-full" disabled={!isValidEmail || !isValidPassword || loading || !isSupabaseConfigured}>
            {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </Button>

          <Button
            type="button"
            variant="secondary"
            className="w-full"
            disabled={!isValidEmail || loading || !isSupabaseConfigured}
            onClick={handleMagicLink}
          >
            Send Magic Link Instead
          </Button>
        </form>
      </div>
    </div>
  );
};
