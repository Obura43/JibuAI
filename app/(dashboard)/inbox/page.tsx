'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase/client';
import { canSendReplies } from '@/lib/trial';
import { Send, Bot, Loader2, User, MessageSquare, TicketCheck, ChevronDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';

interface Message {
  id: string;
  body: string;
  sender_type: string;
  sender_id: string | null;
  created_at: string;
}

interface Conversation {
  id: string;
  status: string;
  channel: string;
  last_message_at: string | null;
  contacts: { name: string | null; email: string | null } | null;
}

export default function InboxPage() {
  const { organization, subscription, user } = useAuth();
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(searchParams.get('id'));
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const canReply = canSendReplies(subscription);

  const loadConversations = useCallback(async () => {
    if (!organization) return;
    const { data } = await supabase
      .from('conversations')
      .select('id, status, channel, last_message_at, contacts(name, email)')
      .eq('organization_id', organization.id)
      .order('last_message_at', { ascending: false });
    setConversations((data as unknown as Conversation[]) ?? []);
    setLoadingConvs(false);
  }, [organization]);

  const loadMessages = useCallback(async (convId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });
    setMessages((data as unknown as Message[]) ?? []);
    setAiSuggestion('');
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);
  useEffect(() => { if (selectedId) loadMessages(selectedId); }, [selectedId, loadMessages]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const selectedConv = conversations.find(c => c.id === selectedId);

  async function sendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim() || !selectedId || !organization || !user) return;
    if (!canReply) { toast.error('Trial expired. Please upgrade to send replies.'); return; }
    setSending(true);
    const { error } = await supabase.from('messages').insert({
      organization_id: organization.id,
      conversation_id: selectedId,
      sender_type: 'agent',
      sender_id: user.id,
      body: reply.trim(),
    });
    if (error) { toast.error('Failed to send message'); setSending(false); return; }
    await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', selectedId);
    setReply('');
    setAiSuggestion('');
    await loadMessages(selectedId);
    await loadConversations();
    setSending(false);
  }

  async function getAiSuggestion() {
    if (!selectedId || !organization) return;
    setAiLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/ai/suggest-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token ?? ''}` },
        body: JSON.stringify({ conversation_id: selectedId, organization_id: organization.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAiSuggestion(data.suggestion);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'AI suggestion failed');
    } finally {
      setAiLoading(false);
    }
  }

  async function changeConvStatus(status: string) {
    if (!selectedId) return;
    await supabase.from('conversations').update({ status }).eq('id', selectedId);
    await loadConversations();
    toast.success(`Conversation marked as ${status}`);
  }

  const filteredConvs = conversations.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (c.contacts?.name ?? '').toLowerCase().includes(q) || (c.contacts?.email ?? '').toLowerCase().includes(q);
  });

  return (
    <div className="flex h-[calc(100vh-65px)] overflow-hidden">
      {/* Conversation list */}
      <div className={`w-full lg:w-80 border-r border-gray-200 bg-white flex flex-col flex-shrink-0 ${selectedId ? 'hidden lg:flex' : 'flex'}`}>
        <div className="p-3 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search conversations..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm bg-gray-50" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loadingConvs ? (
            <div className="p-3 space-y-2">{[1,2,3,4].map(i => <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse" />)}</div>
          ) : filteredConvs.length === 0 ? (
            <div className="p-6 text-center">
              <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No conversations yet</p>
            </div>
          ) : filteredConvs.map(c => (
            <button key={c.id} onClick={() => setSelectedId(c.id)}
              className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${selectedId === c.id ? 'bg-navy-50 border-l-2 border-l-navy-500' : ''}`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-royal-100 flex items-center justify-center text-royal-600 font-semibold text-sm flex-shrink-0">
                  {(c.contacts?.name ?? 'V')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-navy-500 text-sm font-medium truncate">{c.contacts?.name ?? c.contacts?.email ?? 'Visitor'}</span>
                    <Badge className={`text-xs flex-shrink-0 ${c.status === 'open' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>{c.status}</Badge>
                  </div>
                  <div className="text-gray-400 text-xs mt-0.5">{c.channel} · {c.last_message_at ? new Date(c.last_message_at).toLocaleDateString() : ''}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Message thread */}
      {selectedId ? (
        <div className="flex-1 flex flex-col min-w-0 bg-gray-50">
          {/* Thread header */}
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
            <button className="lg:hidden text-gray-500" onClick={() => setSelectedId(null)}>
              <ChevronDown className="w-5 h-5 rotate-90" />
            </button>
            <div className="w-9 h-9 rounded-full bg-royal-100 flex items-center justify-center text-royal-600 font-semibold text-sm">
              {(selectedConv?.contacts?.name ?? 'V')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-navy-500 font-semibold text-sm">{selectedConv?.contacts?.name ?? selectedConv?.contacts?.email ?? 'Website Visitor'}</div>
              <div className="text-gray-400 text-xs">{selectedConv?.channel}</div>
            </div>
            <div className="flex items-center gap-2">
              <select
                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 bg-white focus:outline-none"
                value={selectedConv?.status ?? 'open'}
                onChange={e => changeConvStatus(e.target.value)}>
                <option value="open">Open</option>
                <option value="pending">Pending</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">No messages yet</div>
            ) : messages.map(m => (
              <div key={m.id} className={`flex gap-2 ${m.sender_type === 'agent' ? 'justify-end' : 'justify-start'}`}>
                {m.sender_type !== 'agent' && (
                  <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-3.5 h-3.5 text-gray-500" />
                  </div>
                )}
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  m.sender_type === 'agent' ? 'bg-navy-500 text-white rounded-tr-sm' :
                  m.sender_type === 'ai' ? 'bg-gold-50 border border-gold-200 text-gray-700 rounded-tl-sm' :
                  m.sender_type === 'system' ? 'bg-gray-100 text-gray-500 text-xs italic rounded-xl' :
                  'bg-white border border-gray-200 text-gray-700 rounded-tl-sm'
                }`}>
                  {m.sender_type === 'ai' && <div className="text-gold-600 text-xs font-medium mb-1 flex items-center gap-1"><Bot className="w-3 h-3" /> AI</div>}
                  <p className="text-sm leading-relaxed">{m.body}</p>
                  <div className={`text-xs mt-1 ${m.sender_type === 'agent' ? 'text-white/50' : 'text-gray-400'}`}>
                    {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* AI suggestion */}
          {aiSuggestion && (
            <div className="mx-4 mb-2 bg-gold-50 border border-gold-200 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <Bot className="w-4 h-4 text-gold-600" />
                <span className="text-gold-700 text-xs font-semibold">AI Suggestion</span>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed mb-2">{aiSuggestion}</p>
              <div className="flex gap-2">
                <Button size="sm" className="bg-gold-400 text-navy-500 hover:bg-gold-300 font-semibold text-xs" onClick={() => { setReply(aiSuggestion); setAiSuggestion(''); }}>Use reply</Button>
                <Button size="sm" variant="ghost" className="text-gray-500 text-xs" onClick={() => setAiSuggestion('')}>Dismiss</Button>
              </div>
            </div>
          )}

          {/* Reply box */}
          <div className="bg-white border-t border-gray-200 p-3">
            {!canReply && (
              <div className="text-center text-xs text-red-500 mb-2 py-1 bg-red-50 rounded-lg">Trial expired — upgrade to send replies</div>
            )}
            <form onSubmit={sendReply} className="flex gap-2">
              <Input
                value={reply}
                onChange={e => setReply(e.target.value)}
                placeholder={canReply ? 'Type your reply...' : 'Upgrade to reply...'}
                disabled={!canReply}
                className="flex-1 h-10 text-sm"
              />
              <Button type="button" variant="outline" size="sm" onClick={getAiSuggestion} disabled={aiLoading} className="border-gold-300 text-gold-600 hover:bg-gold-50 px-3">
                {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
              </Button>
              <Button type="submit" size="sm" className="bg-navy-500 hover:bg-navy-400 text-white px-4" disabled={sending || !reply.trim() || !canReply}>
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </form>
          </div>
        </div>
      ) : (
        <div className="hidden lg:flex flex-1 items-center justify-center bg-gray-50">
          <div className="text-center">
            <MessageSquare className="w-14 h-14 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">Select a conversation</p>
            <p className="text-gray-400 text-sm mt-1">Choose from the list to view messages</p>
          </div>
        </div>
      )}
    </div>
  );
}
