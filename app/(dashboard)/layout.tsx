'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { isTrialActive, getTrialDaysRemaining } from '@/lib/trial';
import {
  LayoutDashboard, MessageSquare, Users, TicketCheck, Settings, CreditCard,
  Code2, UserCog, LogOut, ChevronRight, AlertTriangle, Bot, Menu, X
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/inbox', label: 'Inbox', icon: MessageSquare },
  { href: '/contacts', label: 'Contacts', icon: Users },
  { href: '/tickets', label: 'Tickets', icon: TicketCheck },
  { href: '/team', label: 'Team', icon: UserCog },
  { href: '/widget-setup', label: 'Widget', icon: Code2 },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/billing', label: 'Billing', icon: CreditCard },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, organization, subscription, loading, signOut, isSuperAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-navy-500 flex items-center justify-center animate-pulse">
            <Bot className="w-5 h-5 text-gold-400" />
          </div>
          <p className="text-gray-500 text-sm">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const trialActive = isTrialActive(subscription);
  const daysLeft = getTrialDaysRemaining(subscription);
  const trialExpired = subscription && !trialActive && subscription.subscription_status === 'trialing';

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-navy-500 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gold-400 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-navy-500" />
            </div>
            <span className="text-white font-bold text-lg">JibuAI</span>
          </div>
          {organization && (
            <div className="mt-2">
              <p className="text-white/60 text-xs truncate">{organization.name}</p>
            </div>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${active ? 'bg-white/15 text-white' : 'text-white/60 hover:text-white hover:bg-white/10'}`}>
                <item.icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-gold-400' : 'group-hover:text-white/80'}`} />
                {item.label}
                {active && <ChevronRight className="w-3.5 h-3.5 ml-auto text-gold-400/60" />}
              </Link>
            );
          })}
          {isSuperAdmin && (
            <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gold-400 hover:bg-white/10 transition-colors mt-2 border border-gold-400/20">
              <UserCog className="w-4 h-4" /> Super Admin
            </Link>
          )}
        </nav>

        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-royal-400 flex items-center justify-center text-white text-xs font-bold">
              {profile?.full_name?.[0] ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{profile?.full_name}</p>
              <p className="text-white/40 text-xs truncate">{profile?.email}</p>
            </div>
          </div>
          <button onClick={signOut} className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 text-sm transition-colors">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center gap-3">
          <button className="lg:hidden text-gray-500 hover:text-gray-700" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          {trialActive && (
            <div className="hidden sm:flex items-center gap-2 bg-gold-400/10 border border-gold-400/30 rounded-full px-3 py-1.5 text-xs font-medium text-gold-600">
              <AlertTriangle className="w-3.5 h-3.5" />
              Trial — {daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining
            </div>
          )}
          {trialExpired && (
            <Link href="/billing" className="hidden sm:flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-3 py-1.5 text-xs font-medium text-red-600">
              <AlertTriangle className="w-3.5 h-3.5" />
              Trial expired — Upgrade now
            </Link>
          )}
        </header>

        {/* Trial banner */}
        {trialActive && daysLeft <= 7 && (
          <div className="bg-gold-400/10 border-b border-gold-400/20 px-6 py-2.5 flex items-center justify-between gap-4">
            <p className="text-sm text-gold-700 font-medium">
              You are on a 14-day free trial. <strong>{daysLeft} days remaining.</strong> Upgrade to keep your workspace active.
            </p>
            <Link href="/billing"><Button size="sm" className="bg-gold-400 text-navy-500 hover:bg-gold-300 font-semibold text-xs flex-shrink-0">Upgrade</Button></Link>
          </div>
        )}
        {trialExpired && (
          <div className="bg-red-50 border-b border-red-200 px-6 py-2.5 flex items-center justify-between gap-4">
            <p className="text-sm text-red-700 font-medium">Your trial has expired. Upgrade to continue receiving and sending messages.</p>
            <Link href="/billing"><Button size="sm" className="bg-red-600 text-white hover:bg-red-700 font-semibold text-xs flex-shrink-0">Upgrade Now</Button></Link>
          </div>
        )}

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
