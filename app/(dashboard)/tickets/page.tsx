'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase/client';
import { TicketCheck, Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  open: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
  resolved: 'bg-gray-100 text-gray-600 border-gray-200',
  closed: 'bg-gray-100 text-gray-500 border-gray-200',
};

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-500',
  normal: 'bg-blue-100 text-blue-600',
  high: 'bg-orange-100 text-orange-600',
  urgent: 'bg-red-100 text-red-600',
};

export default function TicketsPage() {
  const { organization, user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [newTicket, setNewTicket] = useState({ title: '', priority: 'normal' });
  const [creating, setCreating] = useState(false);
  const [open, setOpen] = useState(false);

  async function loadTickets() {
    if (!organization) return;
    const { data } = await supabase.from('tickets').select('*, profiles(full_name)').eq('organization_id', organization.id).order('created_at', { ascending: false });
    setTickets(data ?? []);
    setLoading(false);
  }

  useEffect(() => { loadTickets(); }, [organization]);

  async function createTicket() {
    if (!organization || !newTicket.title.trim()) return;
    setCreating(true);
    const { error } = await supabase.from('tickets').insert({
      organization_id: organization.id,
      title: newTicket.title.trim(),
      priority: newTicket.priority,
      status: 'open',
    });
    if (error) { toast.error('Failed to create ticket'); } else {
      toast.success('Ticket created');
      setOpen(false);
      setNewTicket({ title: '', priority: 'normal' });
      await loadTickets();
    }
    setCreating(false);
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from('tickets').update({ status }).eq('id', id);
    await loadTickets();
    toast.success('Ticket updated');
  }

  const filtered = tickets.filter(t => !search || t.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-500">Tickets</h1>
          <p className="text-gray-500 text-sm mt-1">{tickets.length} total tickets</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-navy-500 hover:bg-navy-400 text-white"><Plus className="w-4 h-4 mr-2" />New Ticket</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Ticket</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Title</Label>
                <Input value={newTicket.title} onChange={e => setNewTicket(p => ({ ...p, title: e.target.value }))} placeholder="Describe the issue..." className="mt-1.5" />
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={newTicket.priority} onValueChange={v => setNewTicket(p => ({ ...p, priority: v }))}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['low','normal','high','urgent'].map(p => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={createTicket} disabled={creating || !newTicket.title.trim()} className="w-full bg-navy-500 hover:bg-navy-400 text-white">
                {creating ? 'Creating...' : 'Create Ticket'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search tickets..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
          </div>
        </div>
        {loading ? (
          <div className="p-4 space-y-3">{[1,2,3].map(i => <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <TicketCheck className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400">No tickets yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(t => (
              <div key={t.id} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="text-navy-500 text-sm font-medium">{t.title}</div>
                  <div className="text-gray-400 text-xs mt-0.5">{t.profiles?.full_name ? `Assigned to ${t.profiles.full_name}` : 'Unassigned'} · {new Date(t.created_at).toLocaleDateString()}</div>
                </div>
                <Badge className={`text-xs ${priorityColors[t.priority] ?? ''} border-0`}>{t.priority}</Badge>
                <select
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-600 focus:outline-none"
                  value={t.status}
                  onChange={e => updateStatus(t.id, e.target.value)}>
                  {['open','in_progress','resolved','closed'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
