'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase/client';
import { getTrialDaysRemaining, isTrialActive } from '@/lib/trial';
import { MessageSquare, TicketCheck, TrendingUp, Code2, ArrowRight, Bot } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Stats {
  totalConversations: number;
  openTickets: number;
  openConversations: number;
}

export default function DashboardPage() {
  const { organization, subscription, profile } = useAuth();
  const [stats, setStats] = useState<Stats>({ totalConversations: 0, openTickets: 0, openConversations: 0 });
  const [recentConvs, setRecentConvs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organization) return;
    async function load() {
      const orgId = organization!.id;
      const [convRes, ticketRes, openConvRes, recentRes] = await Promise.all([
        supabase.from('conversations').select('id', { count: 'exact', head: true }).eq('organization_id', orgId),
        supabase.from('tickets').select('id', { count: 'exact', head: true }).eq('organization_id', orgId).eq('status', 'open'),
        supabase.from('conversations').select('id', { count: 'exact', head: true }).eq('organization_id', orgId).eq('status', 'open'),
        supabase.from('conversations').select('id, status, channel, last_message_at, contacts(name, email)').eq('organization_id', orgId).order('last_message_at', { ascending: false }).limit(5),
      ]);
      setStats({
        totalConversations: convRes.count ?? 0,
        openTickets: ticketRes.count ?? 0,
        openConversations: openConvRes.count ?? 0,
      });
      setRecentConvs(recentRes.data ?? []);
      setLoading(false);
    }
    load();
  }, [organization]);

  const daysLeft = getTrialDaysRemaining(subscription);
  const trialActive = isTrialActive(subscription);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-500">Welcome back, {profile?.full_name?.split(' ')[0] ?? 'there'}</h1>
        <p className="text-gray-500 text-sm mt-1">Here is what is happening in your workspace today.</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Conversations', value: loading ? '—' : stats.totalConversations, icon: MessageSquare, color: 'text-royal-500', bg: 'bg-royal-50' },
          { label: 'Open Conversations', value: loading ? '—' : stats.openConversations, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Open Tickets', value: loading ? '—' : stats.openTickets, icon: TicketCheck, color: 'text-gold-600', bg: 'bg-gold-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center`}>
              <s.icon className={`w-6 h-6 ${s.color}`} />
            </div>
            <div>
              <div className="text-2xl font-bold text-navy-500">{s.value}</div>
              <div className="text-gray-500 text-sm">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent conversations */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-navy-500">Recent Conversations</h2>
            <Link href="/inbox" className="text-royal-500 text-sm hover:underline flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />)}</div>
          ) : recentConvs.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No conversations yet.</p>
              <p className="text-gray-400 text-xs mt-1">Install the widget to start receiving messages.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentConvs.map((c: any) => (
                <Link key={c.id} href={`/inbox?id=${c.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-royal-100 flex items-center justify-center text-royal-600 font-semibold text-sm flex-shrink-0">
                    {(c.contacts?.name ?? 'V')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-navy-500 text-sm font-medium truncate">{c.contacts?.name ?? c.contacts?.email ?? 'Website Visitor'}</div>
                    <div className="text-gray-400 text-xs">{c.channel} · {c.last_message_at ? new Date(c.last_message_at).toLocaleDateString() : ''}</div>
                  </div>
                  <Badge className={`text-xs ${c.status === 'open' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>{c.status}</Badge>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar cards */}
        <div className="space-y-4">
          {/* Widget install */}
          <div className="bg-navy-500 rounded-2xl p-5 text-white">
            <div className="w-10 h-10 rounded-xl bg-gold-400/20 flex items-center justify-center mb-3">
              <Code2 className="w-5 h-5 text-gold-400" />
            </div>
            <h3 className="font-semibold mb-1">Install your widget</h3>
            <p className="text-white/60 text-sm mb-4">Add a live chat to your website in under 2 minutes.</p>
            <Link href="/widget-setup"><Button size="sm" className="bg-gold-400 text-navy-500 hover:bg-gold-300 font-semibold w-full">Set up widget</Button></Link>
          </div>

          {/* AI */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="w-10 h-10 rounded-xl bg-gold-50 flex items-center justify-center mb-3">
              <Bot className="w-5 h-5 text-gold-600" />
            </div>
            <h3 className="font-semibold text-navy-500 mb-1">AI suggestions ready</h3>
            <p className="text-gray-500 text-sm mb-4">Open any conversation and click &quot;AI Suggest&quot; to get a reply draft.</p>
            <Link href="/inbox"><Button size="sm" variant="outline" className="w-full border-gray-200 text-navy-500">Go to inbox</Button></Link>
          </div>

          {/* Trial */}
          {trialActive && (
            <div className="bg-gold-50 border border-gold-200 rounded-2xl p-4">
              <div className="text-gold-700 font-semibold text-sm mb-1">{daysLeft} days left in trial</div>
              <p className="text-gold-600 text-xs mb-3">Upgrade before your trial expires to keep all features.</p>
              <Link href="/billing"><Button size="sm" className="bg-gold-400 text-navy-500 hover:bg-gold-300 font-semibold text-xs w-full">View plans</Button></Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
