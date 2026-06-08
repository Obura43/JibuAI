'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Shield, Building2, Users, MessageSquare, Loader2, Ban, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function AdminPage() {
  const { isSuperAdmin, loading, user } = useAuth();
  const router = useRouter();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [stats, setStats] = useState({ orgs: 0, users: 0, conversations: 0 });
  const [loadingData, setLoadingData] = useState(true);
  const [extendDays, setExtendDays] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!loading && (!user || !isSuperAdmin)) router.push('/dashboard');
  }, [loading, user, isSuperAdmin, router]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    async function loadData() {
      const { data: orgs } = await supabase.from('organizations').select('*, subscriptions(*), organization_members(count)').order('created_at', { ascending: false });
      const [orgCount, userCount, convCount] = await Promise.all([
        supabase.from('organizations').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('conversations').select('id', { count: 'exact', head: true }),
      ]);
      setOrganizations(orgs ?? []);
      setStats({ orgs: orgCount.count ?? 0, users: userCount.count ?? 0, conversations: convCount.count ?? 0 });
      setLoadingData(false);
    }
    loadData();
  }, [isSuperAdmin]);

  async function suspendOrg(orgId: string) {
    const { error } = await supabase.from('organizations').update({ status: 'suspended' }).eq('id', orgId);
    if (error) { toast.error('Failed'); return; }
    toast.success('Organization suspended');
    setOrganizations(o => o.map(org => org.id === orgId ? { ...org, status: 'suspended' } : org));
  }

  async function activateOrg(orgId: string) {
    const { error } = await supabase.from('organizations').update({ status: 'active' }).eq('id', orgId);
    if (error) { toast.error('Failed'); return; }
    toast.success('Organization activated');
    setOrganizations(o => o.map(org => org.id === orgId ? { ...org, status: 'active' } : org));
  }

  async function extendTrial(orgId: string, days: string) {
    const d = parseInt(days, 10);
    if (!d || d < 1 || d > 90) { toast.error('Enter 1-90 days'); return; }
    try {
      const res = await fetch('/api/admin/extend-trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organization_id: orgId, days: d }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Trial extended by ${d} days`);
      const { data: orgs } = await supabase.from('organizations').select('*, subscriptions(*), organization_members(count)').order('created_at', { ascending: false });
      setOrganizations(orgs ?? []);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    }
  }

  if (loading || loadingData) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-navy-500" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-navy-500 px-6 py-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gold-400 flex items-center justify-center">
          <Shield className="w-4 h-4 text-navy-500" />
        </div>
        <div>
          <h1 className="text-white font-bold text-lg">Super Admin Panel</h1>
          <p className="text-white/60 text-xs">Platform-wide management</p>
        </div>
        <div className="ml-auto">
          <Button variant="ghost" className="text-white/60 hover:text-white" onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Organizations', value: stats.orgs, icon: Building2, color: 'text-royal-500', bg: 'bg-royal-50' },
            { label: 'Total Users', value: stats.users, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Conversations', value: stats.conversations, icon: MessageSquare, color: 'text-gold-600', bg: 'bg-gold-50' },
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

        {/* Organizations table */}
        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-navy-500">Organizations</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Name</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Plan</th>
                  <th className="text-left px-4 py-3 font-medium">Trial ends</th>
                  <th className="text-left px-4 py-3 font-medium">Members</th>
                  <th className="text-left px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {organizations.map(org => {
                  const sub = Array.isArray(org.subscriptions) ? org.subscriptions[0] : org.subscriptions;
                  const memberCount = Array.isArray(org.organization_members) ? org.organization_members[0]?.count ?? 0 : 0;
                  return (
                    <tr key={org.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-navy-500">{org.name}</div>
                        <div className="text-gray-400 text-xs">{org.slug}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`text-xs ${org.status === 'active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-600 border-red-200'}`}>{org.status}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`text-xs ${sub?.subscription_status === 'trialing' ? 'bg-gold-100 text-gold-700 border-gold-200' : sub?.subscription_status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                          {sub?.subscription_status ?? 'none'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {sub?.trial_ends_at ? new Date(sub.trial_ends_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{memberCount}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {org.status === 'active' ? (
                            <button onClick={() => suspendOrg(org.id)} className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-lg transition-colors">
                              <Ban className="w-3 h-3" /> Suspend
                            </button>
                          ) : (
                            <button onClick={() => activateOrg(org.id)} className="text-emerald-600 hover:text-emerald-700 text-xs flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-lg transition-colors">
                              Activate
                            </button>
                          )}
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              placeholder="Days"
                              className="w-16 h-7 text-xs"
                              value={extendDays[org.id] ?? ''}
                              onChange={e => setExtendDays(p => ({ ...p, [org.id]: e.target.value }))}
                            />
                            <button onClick={() => extendTrial(org.id, extendDays[org.id] ?? '')} className="text-royal-600 hover:text-royal-700 text-xs flex items-center gap-1 bg-royal-50 hover:bg-royal-100 px-2 py-1 rounded-lg transition-colors">
                              <Clock className="w-3 h-3" /> Extend
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {organizations.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-sm">No organizations yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
