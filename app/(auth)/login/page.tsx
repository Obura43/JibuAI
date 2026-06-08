'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { MessageSquare, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    const { data: profileData } = await supabase
      .from('profiles')
      .select('is_super_admin')
      .eq('id', data.user.id)
      .maybeSingle() as { data: { is_super_admin: boolean } | null };

    if (profileData?.is_super_admin) {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-navy-500 flex items-center justify-center">
              <MessageSquare className="w-4.5 h-4.5 text-gold-400" />
            </div>
            <span className="text-navy-500 font-bold text-xl">JibuAI</span>
          </Link>
          <h1 className="text-2xl font-bold text-navy-500">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your workspace</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <Label htmlFor="email" className="text-gray-700">Email address</Label>
              <Input id="email" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} className="mt-1.5 h-11" required />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label htmlFor="password" className="text-gray-700">Password</Label>
                <Link href="#" className="text-xs text-royal-500 hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Input id="password" type={showPw ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="h-11 pr-10" required />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full h-11 bg-navy-500 hover:bg-navy-400 text-white font-semibold" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
            </Button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-royal-500 hover:underline font-medium">Create workspace</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
