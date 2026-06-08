'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase/client';
import { Users, UserPlus, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

const roleColors: Record<string, string> = {
  org_owner: 'bg-gold-100 text-gold-700 border-gold-200',
  org_admin: 'bg-navy-100 text-navy-700 border-navy-200',
  agent: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  viewer: 'bg-gray-100 text-gray-600 border-gray-200',
};

export default function TeamPage() {
  const { organization, memberRole, user } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('agent');
  const [inviting, setInviting] = useState(false);
  const [open, setOpen] = useState(false);

  const canManage = memberRole === 'org_owner' || memberRole === 'org_admin';

  async function loadMembers() {
    if (!organization) return;
    const { data } = await supabase.from('organization_members')
      .select('*, profiles(id, full_name, email, avatar_url)')
      .eq('organization_id', organization.id)
      .order('created_at', { ascending: true });
    setMembers(data ?? []);
    setLoading(false);
  }

  useEffect(() => { loadMembers(); }, [organization]);

  async function inviteMember() {
    if (!inviteEmail.trim() || !organization) return;
    setInviting(true);
    try {
      const res = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole, organization_id: organization.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Invitation sent');
      setOpen(false);
      setInviteEmail('');
      await loadMembers();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to invite');
    } finally {
      setInviting(false);
    }
  }

  async function removeMember(memberId: string, membUserId: string) {
    if (membUserId === user?.id) { toast.error("You can't remove yourself"); return; }
    await supabase.from('organization_members').delete().eq('id', memberId);
    await loadMembers();
    toast.success('Member removed');
  }

  async function changeRole(memberId: string, newRole: string) {
    await supabase.from('organization_members').update({ role: newRole as 'org_owner' | 'org_admin' | 'agent' | 'viewer' }).eq('id', memberId);
    await loadMembers();
    toast.success('Role updated');
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-500">Team</h1>
          <p className="text-gray-500 text-sm mt-1">{members.length} member{members.length !== 1 ? 's' : ''}</p>
        </div>
        {canManage && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-navy-500 hover:bg-navy-400 text-white"><UserPlus className="w-4 h-4 mr-2" />Invite Member</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Invite Team Member</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label>Email address</Label>
                  <Input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="colleague@company.com" className="mt-1.5" type="email" />
                </div>
                <div>
                  <Label>Role</Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="org_admin">Admin</SelectItem>
                      <SelectItem value="agent">Agent</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={inviteMember} disabled={inviting || !inviteEmail.trim()} className="w-full bg-navy-500 hover:bg-navy-400 text-white">
                  {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Invite'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
        {loading ? (
          <div className="p-4 space-y-3">{[1,2,3].map(i => <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />)}</div>
        ) : members.map(m => (
          <div key={m.id} className="flex items-center gap-4 px-4 py-3">
            <div className="w-10 h-10 rounded-full bg-royal-100 flex items-center justify-center text-royal-600 font-semibold text-sm flex-shrink-0">
              {(m.profiles?.full_name ?? m.profiles?.email ?? '?')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-navy-500 font-medium text-sm">{m.profiles?.full_name ?? 'Invited user'}</div>
              <div className="text-gray-400 text-xs">{m.profiles?.email}</div>
            </div>
            <Badge className={`text-xs ${roleColors[m.role] ?? ''}`}>{m.role.replace('_', ' ')}</Badge>
            {canManage && m.profiles?.id !== user?.id && (
              <div className="flex items-center gap-2">
                <select
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-600 focus:outline-none"
                  value={m.role}
                  onChange={e => changeRole(m.id, e.target.value)}>
                  {['org_admin','agent','viewer'].map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                </select>
                <button onClick={() => removeMember(m.id, m.profiles?.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 bg-gray-50 rounded-2xl border border-gray-100 p-5">
        <h3 className="font-semibold text-navy-500 mb-3">Role permissions</h3>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          {[
            { role: 'Owner', perms: 'Full access including billing and widget' },
            { role: 'Admin', perms: 'Manage team, inbox, tickets, contacts, widget' },
            { role: 'Agent', perms: 'View and reply to conversations, manage tickets' },
            { role: 'Viewer', perms: 'Read-only access to conversations and contacts' },
          ].map(r => (
            <div key={r.role} className="flex gap-3 bg-white rounded-xl p-3 border border-gray-100">
              <Badge className={`text-xs self-start ${r.role === 'Owner' ? 'bg-gold-100 text-gold-700 border-gold-200' : r.role === 'Admin' ? 'bg-navy-100 text-navy-700' : r.role === 'Agent' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{r.role}</Badge>
              <p className="text-gray-500 text-xs leading-relaxed">{r.perms}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
