'use client';

import Link from 'next/link';
import { MessageSquare, CheckCircle, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const plans = [
  { name: 'Trial', price: 'Free', period: '14 days', desc: 'Perfect for testing JibuAI with your team.', features: ['1 agent seat', 'Live chat widget', 'AI suggestions (mock)', '100 conversations', 'JibuAI Trial watermark', 'Email support'], cta: 'Start Trial', href: '/register', highlight: false },
  { name: 'Starter', price: 'KES 2,500', period: '/month', desc: 'For small businesses getting started with live chat.', features: ['3 agent seats', 'Live chat widget', 'AI suggested replies', '1,000 conversations/month', 'Custom branding', 'Remove watermark', 'Priority email support'], cta: 'Get Started', href: '/register', highlight: true },
  { name: 'Growth', price: 'KES 6,500', period: '/month', desc: 'For growing teams handling high volumes.', features: ['10 agent seats', 'All Starter features', '5,000 conversations/month', 'Analytics dashboard', 'API access', 'Dedicated support'], cta: 'Get Started', href: '/register', highlight: false },
  { name: 'Business', price: 'Custom', period: '', desc: 'For large organizations with custom needs.', features: ['Unlimited agents', 'All Growth features', 'Unlimited conversations', 'Custom integrations', 'SLA guarantee', 'Onboarding assistance', 'Dedicated account manager'], cta: 'Contact Sales', href: '/contact', highlight: false },
];

const faqs = [
  { q: 'Is there a free trial?', a: 'Yes! Every new workspace gets a 14-day free trial with full access to all features. No credit card required.' },
  { q: 'Can I cancel anytime?', a: 'Yes, you can cancel your subscription at any time. Your workspace will remain active until the end of the billing period.' },
  { q: 'Can I pay with M-Pesa?', a: 'M-Pesa payment integration is coming soon! We will notify you as soon as it is available.' },
  { q: 'How many websites can I add the widget to?', a: 'You can add the chat widget to unlimited websites under one workspace.' },
  { q: 'Do you offer discounts for NGOs or schools?', a: 'Yes! Contact us at hello@jibuai.co.ke for special pricing for non-profit organizations and educational institutions.' },
];

export default function PricingPage() {
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
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Simple, honest pricing</h1>
          <p className="text-white/70 text-lg mb-6">Start free. Upgrade when ready. No hidden fees.</p>
          <div className="inline-flex items-center gap-2 bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 rounded-full px-4 py-2 text-sm">
            <Zap className="w-4 h-4" /> M-Pesa subscriptions coming soon
          </div>
        </div>
      </section>

      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {plans.map((p, i) => (
            <div key={i} className={`rounded-2xl p-6 border transition-all ${p.highlight ? 'bg-navy-500 border-navy-500 ring-2 ring-gold-400 shadow-xl' : 'bg-white border-gray-100 hover:shadow-lg'}`}>
              <div className={`text-sm font-semibold mb-1 ${p.highlight ? 'text-gold-400' : 'text-gray-500'}`}>{p.name}</div>
              <div className={`text-3xl font-bold mb-0.5 ${p.highlight ? 'text-white' : 'text-navy-500'}`}>{p.price}</div>
              <div className={`text-xs mb-2 ${p.highlight ? 'text-white/50' : 'text-gray-400'}`}>{p.period}</div>
              <p className={`text-sm mb-5 leading-relaxed ${p.highlight ? 'text-white/70' : 'text-gray-500'}`}>{p.desc}</p>
              <ul className="space-y-2 mb-6">
                {p.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm">
                    <CheckCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${p.highlight ? 'text-gold-400' : 'text-emerald-500'}`} />
                    <span className={p.highlight ? 'text-white/80' : 'text-gray-600'}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link href={p.href}>
                <Button className={`w-full font-semibold ${p.highlight ? 'bg-gold-400 text-navy-500 hover:bg-gold-300' : 'bg-navy-500 text-white hover:bg-navy-400'}`}>{p.cta}</Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-navy-500 text-center mb-10">Frequently asked questions</h2>
          <div className="space-y-4">
            {faqs.map((f, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="font-semibold text-navy-500 mb-2">{f.q}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-navy-500 py-16 px-4 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Start your free 14-day trial</h2>
        <p className="text-white/70 mb-8">No credit card required. Cancel anytime.</p>
        <Link href="/register"><Button size="lg" className="bg-gold-400 text-navy-500 hover:bg-gold-300 font-semibold px-10">Create Free Workspace <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
      </section>
    </div>
  );
}
