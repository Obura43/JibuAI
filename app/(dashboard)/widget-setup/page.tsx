'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase/client';
import { Code2, Copy, Check, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function WidgetSetupPage() {
  const { organization } = useAuth();
  const [settings, setSettings] = useState({ primary_color: '#071A2F', accent_color: '#D4AF37', welcome_message: 'Hi there! How can we help you today?', offline_message: '', widget_position: 'bottom-right' });
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!organization) return;
    supabase.from('widget_settings').select('*').eq('organization_id', organization.id).maybeSingle()
      .then(({ data }) => {
        const d = data as { primary_color: string; accent_color: string; welcome_message: string; offline_message: string | null; widget_position: string } | null;
        if (d) setSettings({ primary_color: d.primary_color, accent_color: d.accent_color, welcome_message: d.welcome_message, offline_message: d.offline_message ?? '', widget_position: d.widget_position });
      });
  }, [organization]);

  const embedCode = `<script src="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://jibuai.co.ke'}/widget.js" data-org-id="${organization?.id ?? 'YOUR_ORG_ID'}"></script>`;

  async function saveSettings() {
    if (!organization) return;
    setSaving(true);
    const { error } = await supabase.from('widget_settings').update({ primary_color: settings.primary_color, accent_color: settings.accent_color, welcome_message: settings.welcome_message, offline_message: settings.offline_message, widget_position: settings.widget_position }).eq('organization_id', organization.id);
    if (error) toast.error('Failed to save'); else toast.success('Widget settings saved');
    setSaving(false);
  }

  function copyEmbed() {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Embed code copied!');
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-500">Widget Setup</h1>
        <p className="text-gray-500 text-sm mt-1">Customize and install your live chat widget.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Settings */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-semibold text-navy-500 mb-4">Customization</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">Primary color</Label>
                  <div className="flex gap-2 mt-1.5">
                    <input type="color" value={settings.primary_color} onChange={e => setSettings(p => ({ ...p, primary_color: e.target.value }))} className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
                    <Input value={settings.primary_color} onChange={e => setSettings(p => ({ ...p, primary_color: e.target.value }))} className="h-10 font-mono text-sm" />
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Accent color</Label>
                  <div className="flex gap-2 mt-1.5">
                    <input type="color" value={settings.accent_color} onChange={e => setSettings(p => ({ ...p, accent_color: e.target.value }))} className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
                    <Input value={settings.accent_color} onChange={e => setSettings(p => ({ ...p, accent_color: e.target.value }))} className="h-10 font-mono text-sm" />
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-sm text-gray-600">Welcome message</Label>
                <Textarea value={settings.welcome_message} onChange={e => setSettings(p => ({ ...p, welcome_message: e.target.value }))} className="mt-1.5 resize-none" rows={2} />
              </div>
              <div>
                <Label className="text-sm text-gray-600">Offline message</Label>
                <Textarea value={settings.offline_message} onChange={e => setSettings(p => ({ ...p, offline_message: e.target.value }))} placeholder="We're offline. Leave a message..." className="mt-1.5 resize-none" rows={2} />
              </div>
              <div>
                <Label className="text-sm text-gray-600">Widget position</Label>
                <select className="w-full mt-1.5 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none" value={settings.widget_position} onChange={e => setSettings(p => ({ ...p, widget_position: e.target.value }))}>
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                </select>
              </div>
              <Button onClick={saveSettings} disabled={saving} className="w-full bg-navy-500 hover:bg-navy-400 text-white">
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>

          {/* Embed code */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-semibold text-navy-500 mb-2">Install on your website</h2>
            <p className="text-gray-500 text-sm mb-3">Paste this code before the closing &lt;/body&gt; tag:</p>
            <div className="relative bg-navy-500 rounded-xl p-4">
              <code className="text-emerald-400 text-xs font-mono break-all leading-relaxed">{embedCode}</code>
              <button onClick={copyEmbed} className="absolute top-3 right-3 bg-white/10 hover:bg-white/20 rounded-lg p-1.5 transition-colors">
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-white" />}
              </button>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-semibold text-navy-500 mb-4">Live Preview</h2>
            <div className="relative bg-gray-100 rounded-xl p-4 min-h-[400px] flex items-end justify-end overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
                <p className="text-gray-400 text-sm">Your website</p>
              </div>
              <div className="relative z-10" style={{ marginBottom: settings.widget_position.includes('bottom') ? '0' : 'auto' }}>
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden w-72 mb-3">
                  <div className="px-4 py-4 text-white" style={{ backgroundColor: settings.primary_color }}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: settings.accent_color }}>
                        <MessageSquare className="w-4 h-4" style={{ color: settings.primary_color }} />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{organization?.name ?? 'Your Business'}</div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                          <span className="text-white/70 text-xs">Online</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50">
                    <div className="bg-white rounded-xl rounded-tl-none px-3 py-2 shadow-sm inline-block max-w-[220px]">
                      <p className="text-gray-700 text-sm">{settings.welcome_message}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-white border-t border-gray-100">
                    <div className="flex gap-2">
                      <Input className="flex-1 h-8 text-xs bg-gray-50" placeholder="Type a message..." readOnly />
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white" style={{ backgroundColor: settings.accent_color }}>
                        <MessageSquare className="w-3.5 h-3.5" style={{ color: settings.primary_color }} />
                      </button>
                    </div>
                    <p className="text-center text-gray-400 text-xs mt-1.5">Powered by <span className="font-medium" style={{ color: settings.accent_color }}>JibuAI</span> · Trial</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: settings.primary_color }}>
                    <MessageSquare className="w-6 h-6" style={{ color: settings.accent_color }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
