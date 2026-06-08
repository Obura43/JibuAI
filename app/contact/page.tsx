'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MessageSquare, Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  function setField(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(p => ({ ...p, [k]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    await new Promise(r => setTimeout(r, 1000));
    toast.success('Message sent! We will get back to you within 24 hours.');
    setForm({ name: '', email: '', subject: '', message: '' });
    setSending(false);
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-navy-500 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gold-400 flex items-center justify-center"><MessageSquare className="w-4 h-4 text-navy-500" /></div>
            <span className="text-white font-bold text-xl">JibuAI</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login"><Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 text-sm">Login</Button></Link>
            <Link href="/register"><Button className="bg-gold-400 text-navy-500 hover:bg-gold-300 font-semibold text-sm">Start Free Trial</Button></Link>
          </div>
        </div>
      </nav>

      <section className="bg-hero-gradient py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-3">Get in touch</h1>
          <p className="text-white/70 text-lg">We typically respond within a few hours.</p>
        </div>
      </section>

      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold text-navy-500 mb-6">Send us a message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <Input value={form.name} onChange={setField('name')} placeholder="Jane Wanjiku" className="mt-1.5 h-11" required />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={setField('email')} placeholder="jane@company.co.ke" className="mt-1.5 h-11" required />
                </div>
              </div>
              <div>
                <Label>Subject</Label>
                <Input value={form.subject} onChange={setField('subject')} placeholder="How can we help?" className="mt-1.5 h-11" required />
              </div>
              <div>
                <Label>Message</Label>
                <Textarea value={form.message} onChange={setField('message')} placeholder="Tell us more about your needs..." className="mt-1.5 resize-none" rows={5} required />
              </div>
              <Button type="submit" className="bg-navy-500 hover:bg-navy-400 text-white w-full h-11 font-semibold" disabled={sending}>
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4 mr-2" />Send Message</>}
              </Button>
            </form>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-navy-500 mb-6">Contact information</h2>
              {[
                { icon: Mail, label: 'Email', value: 'hello@jibuai.co.ke' },
                { icon: Phone, label: 'Phone', value: '+254 700 000 000' },
                { icon: MapPin, label: 'Location', value: 'Nairobi, Kenya' },
              ].map((c, i) => (
                <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-100">
                  <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center flex-shrink-0">
                    <c.icon className="w-5 h-5 text-navy-500" />
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs">{c.label}</div>
                    <div className="text-navy-500 font-medium text-sm">{c.value}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-navy-50 rounded-2xl p-5">
              <h3 className="font-semibold text-navy-500 mb-2">Response time</h3>
              <p className="text-gray-500 text-sm leading-relaxed">We respond to all messages within 24 hours on business days. For urgent issues, our team is available Monday–Friday 8am–6pm EAT.</p>
            </div>
            <div className="bg-gold-50 border border-gold-200 rounded-2xl p-5">
              <h3 className="font-semibold text-navy-500 mb-1">Want to see a demo?</h3>
              <p className="text-gray-500 text-sm mb-3">Start your free 14-day trial and explore the platform yourself.</p>
              <Link href="/register"><Button size="sm" className="bg-gold-400 text-navy-500 hover:bg-gold-300 font-semibold">Start Free Trial</Button></Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
