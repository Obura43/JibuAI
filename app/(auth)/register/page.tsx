'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { MessageSquare, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase/client';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', businessName: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  function setField(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm(prev => ({ ...prev, [k]: e.target.value }));
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register-business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password, fullName: form.fullName, businessName: form.businessName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      // Sign in the newly created user
      const { error: signInError } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
      if (signInError) throw signInError;
      toast.success('Workspace created! Welcome to JibuAI.');
      router.push('/dashboard');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-navy-500 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-gold-400" />
            </div>
            <span className="text-navy-500 font-bold text-xl">JibuAI</span>
          </Link>
          <h1 className="text-2xl font-bold text-navy-500">Create your workspace</h1>
          <p className="text-gray-500 text-sm mt-1">Start your 14-day free trial today</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Label htmlFor="fullName" className="text-gray-700">Full name</Label>
              <Input id="fullName" placeholder="Jane Wanjiku" value={form.fullName} onChange={setField('fullName')} className="mt-1.5 h-11" required />
            </div>
            <div>
              <Label htmlFor="businessName" className="text-gray-700">Business name</Label>
              <Input id="businessName" placeholder="Acme SACCO" value={form.businessName} onChange={setField('businessName')} className="mt-1.5 h-11" required />
            </div>
            <div>
              <Label htmlFor="email" className="text-gray-700">Work email</Label>
              <Input id="email" type="email" placeholder="jane@acme.co.ke" value={form.email} onChange={setField('email')} className="mt-1.5 h-11" required />
            </div>
            <div>
              <Label htmlFor="password" className="text-gray-700">Password</Label>
              <div className="relative mt-1.5">
                <Input id="password" type={showPw ? 'text' : 'password'} placeholder="Min 6 characters" value={form.password} onChange={setField('password')} className="h-11 pr-10" required />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full h-11 bg-navy-500 hover:bg-navy-400 text-white font-semibold mt-2" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Free Workspace'}
            </Button>
          </form>
          <div className="mt-6 space-y-2">
            {['14-day free trial included', 'No credit card required', 'Cancel anytime'].map(item => (
              <div key={item} className="flex items-center gap-2 text-sm text-gray-500">
                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-royal-500 hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
