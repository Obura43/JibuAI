'use client';

import Link from 'next/link';
import { MessageSquare, Users, Bot, TicketCheck, Globe, Shield, Zap, BarChart2, Star, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: MessageSquare, title: 'Live Chat Widget', color: 'bg-royal-50 text-royal-500',
    points: ['Embeds in 1 line of code', 'Mobile responsive', 'Customizable colors', 'Offline messages'],
    desc: 'Add a professional live chat to any website instantly. Visitors can start conversations without leaving your page.',
  },
  {
    icon: Users, title: 'Shared Team Inbox', color: 'bg-emerald-50 text-emerald-600',
    points: ['All channels in one view', 'Assign conversations', 'Filter by status', 'Real-time updates'],
    desc: 'Your entire team works from one unified inbox. No more missed messages or duplicate replies.',
  },
  {
    icon: Bot, title: 'AI Suggested Replies', color: 'bg-gold-50 text-gold-600',
    points: ['Context-aware suggestions', 'One click to use', 'Powered by GPT-4', 'Learn your tone'],
    desc: 'AI reads each conversation and drafts the perfect reply. Your team reviews and sends with one click.',
  },
  {
    icon: TicketCheck, title: 'Ticket Tracking', color: 'bg-royal-50 text-royal-500',
    points: ['Convert chats to tickets', 'Priority levels', 'Assign to agents', 'Status tracking'],
    desc: 'Turn any conversation into a tracked ticket. Set priorities, assign agents, and ensure nothing falls through the cracks.',
  },
  {
    icon: Globe, title: 'Customer Profiles', color: 'bg-emerald-50 text-emerald-600',
    points: ['Auto-created contacts', 'Full chat history', 'Contact details', 'Source tracking'],
    desc: 'Every conversation automatically creates a customer profile with full history and contact details.',
  },
  {
    icon: Shield, title: 'Team Roles', color: 'bg-gold-50 text-gold-600',
    points: ['Owner, Admin, Agent, Viewer', 'Granular permissions', 'Invite by email', 'Remove anytime'],
    desc: 'Control exactly what each team member can see and do with four role levels and granular permissions.',
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
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

      {/* Hero */}
      <section className="bg-hero-gradient py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Everything you need to support customers better</h1>
          <p className="text-white/70 text-lg mb-8">Powerful features designed for Kenyan businesses — from the smallest shop to the largest SACCO.</p>
          <Link href="/register"><Button size="lg" className="bg-gold-400 text-navy-500 hover:bg-gold-300 font-semibold px-8">Start Free Trial <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-20">
          {features.map((f, i) => (
            <div key={i} className={`grid lg:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`} style={{ direction: i % 2 === 1 ? 'rtl' : 'ltr' }}>
              <div style={{ direction: 'ltr' }}>
                <div className={`w-12 h-12 rounded-2xl ${f.color} flex items-center justify-center mb-4`}><f.icon className="w-6 h-6" /></div>
                <h2 className="text-2xl sm:text-3xl font-bold text-navy-500 mb-3">{f.title}</h2>
                <p className="text-gray-500 text-lg leading-relaxed mb-6">{f.desc}</p>
                <ul className="space-y-2">
                  {f.points.map((p, j) => (
                    <li key={j} className="flex items-center gap-2 text-gray-600"><CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />{p}</li>
                  ))}
                </ul>
              </div>
              <div style={{ direction: 'ltr' }} className="bg-gray-50 rounded-2xl p-8 h-48 flex items-center justify-center border border-gray-100">
                <f.icon className="w-20 h-20 text-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy-500 py-16 px-4 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to get started?</h2>
        <p className="text-white/70 mb-8">14-day free trial. No credit card required.</p>
        <Link href="/register"><Button size="lg" className="bg-gold-400 text-navy-500 hover:bg-gold-300 font-semibold px-10">Create Free Workspace</Button></Link>
      </section>
    </div>
  );
}
