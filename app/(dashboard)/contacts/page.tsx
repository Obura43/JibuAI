'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase/client';
import { Users, Search, Mail, Phone, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function ContactsPage() {
  const { organization } = useAuth();
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!organization) return;
    supabase.from('contacts').select('*').eq('organization_id', organization.id).order('created_at', { ascending: false })
      .then(({ data }) => { setContacts(data ?? []); setLoading(false); });
  }, [organization]);

  const filtered = contacts.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (c.name ?? '').toLowerCase().includes(q) || (c.email ?? '').toLowerCase().includes(q) || (c.phone ?? '').toLowerCase().includes(q);
  });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-500">Contacts</h1>
          <p className="text-gray-500 text-sm mt-1">{contacts.length} total contacts</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search contacts..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
          </div>
        </div>
        {loading ? (
          <div className="p-4 space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400">No contacts yet</p>
            <p className="text-gray-400 text-sm mt-1">Contacts are created automatically when visitors chat.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(c => (
              <div key={c.id} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-royal-100 flex items-center justify-center text-royal-600 font-semibold text-sm flex-shrink-0">
                  {(c.name ?? c.email ?? 'V')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-navy-500 font-medium text-sm">{c.name ?? 'Unknown'}</div>
                  <div className="flex items-center gap-3 mt-0.5">
                    {c.email && <span className="text-gray-400 text-xs flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</span>}
                    {c.phone && <span className="text-gray-400 text-xs flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</span>}
                  </div>
                </div>
                <div className="text-gray-400 text-xs">{c.source ?? 'website'}</div>
                <div className="text-gray-400 text-xs">{new Date(c.created_at).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
