import { FormEvent, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { useAuthStore } from '../stores/authStore';
import { isSupabaseConfigured } from '../lib/supabase';

export const AuthPage = () => {
  const { user, loading, signInWithOtp } = useAuthStore();
  const [email, setEmail] = useState('');

  const isValidEmail = useMemo(() => /.+@.+\..+/.test(email), [email]);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!isValidEmail) {
      toast.error('Enter a valid email address.');
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
          <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
          <p className="text-sm text-muted-foreground">Use your email to access your personal expense data.</p>
        </div>

        {!isSupabaseConfigured && (
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-300">
            Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in env.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
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

          <Button type="submit" className="w-full" disabled={!isValidEmail || loading || !isSupabaseConfigured}>
            {loading ? 'Sending...' : 'Send Magic Link'}
          </Button>
        </form>
      </div>
    </div>
  );
};
