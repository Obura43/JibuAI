'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, MessageSquare, Zap, Users, TicketCheck, Bot, Globe, ChevronRight, Star, ArrowRight, CheckCircle, Shield, TrendingUp, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

function useScrolled() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);
  return scrolled;
}

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function Navbar() {
  const scrolled = useScrolled();
  const [open, setOpen] = useState(false);
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass bg-navy-500/95 shadow-lg shadow-navy-500/20' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gold-400 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-navy-500" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">JibuAI</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {[['Features', '/features'], ['Use Cases', '/use-cases'], ['Pricing', '/pricing'], ['Contact', '/contact']].map(([label, href]) => (
              <Link key={href} href={href} className="text-white/80 hover:text-white text-sm font-medium transition-colors">{label}</Link>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login"><Button variant="ghost" className="text-white hover:text-white hover:bg-white/10 text-sm">Login</Button></Link>
            <Link href="/register"><Button className="bg-gold-400 text-navy-500 hover:bg-gold-300 font-semibold text-sm">Start Free Trial</Button></Link>
          </div>
          <button className="md:hidden text-white" onClick={() => setOpen(!open)}>
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden bg-navy-500 border-t border-white/10 px-4 py-4 flex flex-col gap-4">
          {[['Features', '/features'], ['Use Cases', '/use-cases'], ['Pricing', '/pricing'], ['Contact', '/contact']].map(([label, href]) => (
            <Link key={href} href={href} className="text-white/80 hover:text-white text-sm font-medium" onClick={() => setOpen(false)}>{label}</Link>
          ))}
          <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
            <Link href="/login" onClick={() => setOpen(false)}><Button variant="outline" className="w-full border-white/30 text-white hover:bg-white/10">Login</Button></Link>
            <Link href="/register" onClick={() => setOpen(false)}><Button className="w-full bg-gold-400 text-navy-500 hover:bg-gold-300 font-semibold">Start Free Trial</Button></Link>
          </div>
        </div>
      )}
    </nav>
  );
}

function HeroDashboardMock() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep(s => (s + 1) % 4), 2000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="absolute -inset-4 bg-gold-400/20 rounded-3xl blur-2xl" />
      <div className="relative bg-navy-400/80 glass border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-navy-500 px-4 py-3 flex items-center gap-2 border-b border-white/10">
          <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400" /><div className="w-3 h-3 rounded-full bg-yellow-400" /><div className="w-3 h-3 rounded-full bg-green-400" /></div>
          <span className="text-white/60 text-xs ml-2">JibuAI Dashboard</span>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex gap-3">
            <div className="flex-1 bg-white/5 rounded-xl p-3">
              <div className="text-white/40 text-xs mb-1">Conversations</div>
              <div className="text-white font-bold text-2xl">24</div>
              <div className="text-emerald-400 text-xs mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +12%</div>
            </div>
            <div className="flex-1 bg-white/5 rounded-xl p-3">
              <div className="text-white/40 text-xs mb-1">Open Tickets</div>
              <div className="text-white font-bold text-2xl">8</div>
              <div className="text-gold-400 text-xs mt-1">3 urgent</div>
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 space-y-2">
            <div className="text-white/40 text-xs">Recent conversations</div>
            {[{ name: 'Wanjiku M.', msg: 'What are your loan rates?', time: '2m', status: step >= 1 ? 'replied' : 'new' },
              { name: 'James O.', msg: 'How do I apply for a loan?', time: '5m', status: step >= 2 ? 'replied' : 'open' }].map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-royal-400 flex items-center justify-center text-white text-xs font-bold">{c.name[0]}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-xs font-medium">{c.name}</div>
                  <div className="text-white/40 text-xs truncate">{c.msg}</div>
                </div>
                <div className={`text-xs px-2 py-0.5 rounded-full ${c.status === 'replied' ? 'bg-emerald-400/20 text-emerald-400' : 'bg-gold-400/20 text-gold-400'}`}>{c.status}</div>
              </div>
            ))}
          </div>
          {step >= 3 && (
            <div className="bg-gold-400/10 border border-gold-400/30 rounded-xl p-3 animate-slide-in-up">
              <div className="flex items-center gap-2 mb-1.5">
                <Bot className="w-4 h-4 text-gold-400" />
                <span className="text-gold-400 text-xs font-medium">AI Suggestion</span>
              </div>
              <p className="text-white/80 text-xs">"Our personal loan rates start at 14% p.a. You can apply online in 5 minutes. Shall I send you the link?"</p>
              <div className="flex gap-2 mt-2">
                <button className="text-xs bg-gold-400 text-navy-500 px-3 py-1 rounded-lg font-medium">Use Reply</button>
                <button className="text-xs text-white/50 px-3 py-1 rounded-lg border border-white/10">Edit</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex gap-1 items-center">
      {[0, 0.2, 0.4].map((d, i) => (
        <span key={i} className="w-1.5 h-1.5 rounded-full bg-white/60" style={{ animation: `typing 1.4s ${d}s ease-in-out infinite` }} />
      ))}
    </span>
  );
}

const features = [
  { icon: MessageSquare, title: 'Live Chat Widget', desc: 'Embed a beautiful chat widget on your website in seconds. Customizable colors and messages.', color: 'text-royal-300' },
  { icon: Users, title: 'Shared Team Inbox', desc: 'All conversations in one place. Assign chats to agents, track replies, and never miss a message.', color: 'text-emerald-400' },
  { icon: Bot, title: 'AI Suggested Replies', desc: 'AI reads the conversation and suggests the perfect reply. One click to send.', color: 'text-gold-400' },
  { icon: TicketCheck, title: 'Ticket Tracking', desc: 'Convert conversations into tickets. Set priorities, assign owners, track resolution.', color: 'text-royal-300' },
  { icon: Globe, title: 'Customer Profiles', desc: 'Auto-create contact profiles from every chat. Full conversation history at a glance.', color: 'text-emerald-400' },
  { icon: Shield, title: 'Team Roles', desc: 'Granular roles: Owner, Admin, Agent, Viewer. Control who can do what.', color: 'text-gold-400' },
  { icon: Zap, title: 'Widget Customization', desc: 'Match your brand. Set colors, welcome messages, and offline responses.', color: 'text-royal-300' },
  { icon: BarChart2, title: 'Super Admin Controls', desc: 'Platform-wide oversight. Manage all organizations, extend trials, suspend accounts.', color: 'text-emerald-400' },
  { icon: Star, title: 'Trial Management', desc: '14-day free trial for every new workspace. Upgrade when ready.', color: 'text-gold-400' },
];

const useCases = [
  { title: 'SACCOs', question: '"What are the requirements to open a savings account?"', icon: '🏦' },
  { title: 'Schools', question: '"When does Form 1 registration open for 2025?"', icon: '🎓' },
  { title: 'Clinics', question: '"Do you accept NHIF? Can I book an appointment?"', icon: '🏥' },
  { title: 'Real Estate', question: '"What 2-bedrooms are available in Westlands under 50k?"', icon: '🏠' },
  { title: 'Online Shops', question: '"Has my order shipped? Order #KE-2847"', icon: '🛍️' },
  { title: 'Service Businesses', question: '"How much does a full-house cleaning cost?"', icon: '✨' },
];

const plans = [
  { name: 'Trial', price: 'Free', period: '14 days', features: ['1 agent', '100 conversations', 'Live chat widget', 'AI suggestions', 'Email support'], cta: 'Start Trial', highlight: false },
  { name: 'Starter', price: 'KES 2,500', period: '/month', features: ['3 agents', '1,000 conversations', 'All Trial features', 'Custom branding', 'Priority support'], cta: 'Get Started', highlight: true },
  { name: 'Growth', price: 'KES 6,500', period: '/month', features: ['10 agents', '5,000 conversations', 'All Starter features', 'Analytics dashboard', 'API access'], cta: 'Get Started', highlight: false },
  { name: 'Business', price: 'Custom', period: '', features: ['Unlimited agents', 'Unlimited conversations', 'All Growth features', 'Dedicated support', 'SLA guarantee'], cta: 'Contact Us', highlight: false },
];

export default function HomePage() {
  const problemSection = useInView();
  const solutionSection = useInView();
  const featuresSection = useInView();
  const widgetSection = useInView();
  const useCasesSection = useInView();
  const pricingSection = useInView();

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen bg-hero-gradient overflow-hidden flex items-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-royal-500/30 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold-400/10 rounded-full blur-3xl" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-royal-400/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <Badge className="bg-gold-400/20 text-gold-400 border-gold-400/30 mb-6 text-xs font-medium px-3 py-1.5">
              AI-powered · Made for Kenya
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 text-balance">
              AI customer support for{' '}
              <span className="text-gold-400">Kenyan businesses</span>
            </h1>
            <p className="text-lg text-white/70 mb-8 leading-relaxed max-w-lg">
              Reply to website visitors, leads, and customer questions from one simple inbox — with AI helping your team respond faster.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/register">
                <Button size="lg" className="bg-gold-400 text-navy-500 hover:bg-gold-300 font-semibold text-base px-8 h-12 animate-pulse-gold w-full sm:w-auto">
                  Start 14-Day Free Trial <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/features">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-medium text-base h-12 w-full sm:w-auto">
                  View Demo
                </Button>
              </Link>
            </div>
            <p className="text-white/40 text-sm mt-4">No credit card required · Cancel anytime</p>
          </div>
          <div className="animate-slide-in-right">
            <HeroDashboardMock />
          </div>
        </div>
      </section>

      {/* Problem */}
      <section ref={problemSection.ref} className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-700 ${problemSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-500 mb-4">Slow replies cost businesses real customers.</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">Every unanswered message is a lost opportunity. Here is what most Kenyan businesses deal with daily.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '📭', title: 'Missed website enquiries', desc: 'Visitors send a message and hear nothing back. They move on to your competitor.' },
              { icon: '📱', title: 'Scattered WhatsApp messages', desc: 'Customer questions spread across multiple phones and personal numbers. Nothing is tracked.' },
              { icon: '🔁', title: 'No follow-up system', desc: 'Teams rely on memory and paper. Follow-ups fall through the cracks. Deals are lost.' },
            ].map((p, i) => (
              <div key={i} className={`bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${problemSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="text-4xl mb-4">{p.icon}</div>
                <h3 className="font-semibold text-navy-500 text-lg mb-2">{p.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section ref={solutionSection.ref} className="py-24 bg-navy-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`grid lg:grid-cols-2 gap-12 items-center transition-all duration-700 ${solutionSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div>
              <Badge className="bg-gold-400/20 text-gold-400 border-gold-400/30 mb-4">The JibuAI Solution</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">One inbox. AI assistance. Human control.</h2>
              <p className="text-white/70 text-lg leading-relaxed mb-8">JibuAI helps teams manage all conversations, contacts, tickets, and AI-assisted replies in one unified platform — built for the Kenyan market.</p>
              <ul className="space-y-3">
                {['All channels in one place', 'AI writes reply drafts instantly', 'Team can review and send in one click', 'Every contact auto-saved to CRM', 'Full ticket and follow-up system'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/80">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/register" className="inline-block mt-8">
                <Button size="lg" className="bg-gold-400 text-navy-500 hover:bg-gold-300 font-semibold">
                  Get Started Free <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="bg-navy-400/50 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gold-400 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-navy-500" />
                </div>
                <div>
                  <div className="text-white font-semibold">Wanjiku from your website</div>
                  <div className="text-white/40 text-xs">Just now · Website chat</div>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 mb-3">
                <p className="text-white/80 text-sm">"Hi, I'm interested in your savings account. What documents do I need?"</p>
              </div>
              <div className="bg-gold-400/10 border border-gold-400/30 rounded-xl p-3 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-4 h-4 text-gold-400" />
                  <span className="text-gold-400 text-xs font-medium">AI Suggestion</span>
                </div>
                <p className="text-white/70 text-sm">"Hello Wanjiku! To open a savings account you will need: National ID, KRA PIN, and a passport photo. You can start the application online at our website. Shall I send you the link?"</p>
                <button className="mt-2 text-xs bg-gold-400 text-navy-500 px-3 py-1 rounded-lg font-medium">Use this reply</button>
              </div>
              <div className="flex items-center gap-2 text-white/30 text-xs">
                <TypingDots />
                <span>Agent is reviewing...</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section ref={featuresSection.ref} className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-700 ${featuresSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-500 mb-4">Everything your team needs</h2>
            <p className="text-gray-500 text-lg">Powerful features to help you handle more conversations with less effort.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className={`group p-6 rounded-2xl border border-gray-100 hover:border-navy-500/20 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-white cursor-default ${featuresSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: `${i * 60}ms` }}>
                <div className="w-10 h-10 rounded-xl bg-navy-500/5 flex items-center justify-center mb-4 group-hover:bg-navy-500/10 transition-colors">
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="font-semibold text-navy-500 text-base mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Widget Preview */}
      <section ref={widgetSection.ref} className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-12 transition-all duration-700 ${widgetSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-500 mb-4">Beautiful widget. Zero friction.</h2>
            <p className="text-gray-500 text-lg">Add a professional live chat to your website with one line of code.</p>
          </div>
          <div className={`flex justify-center transition-all duration-700 delay-200 ${widgetSection.inView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden w-80">
                <div className="bg-navy-500 px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gold-400 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-navy-500" />
                    </div>
                    <div>
                      <div className="text-white font-semibold text-sm">Acme Support</div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                        <span className="text-white/60 text-xs">Online — replies in minutes</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-3 bg-gray-50 min-h-[200px]">
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-navy-500 flex items-center justify-center flex-shrink-0"><MessageSquare className="w-3 h-3 text-white" /></div>
                    <div className="bg-white rounded-xl rounded-tl-none px-3 py-2 shadow-sm max-w-[220px]">
                      <p className="text-gray-700 text-sm">Hi there! How can we help you today?</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-navy-500 rounded-xl rounded-tr-none px-3 py-2 max-w-[220px]">
                      <p className="text-white text-sm">What are your business hours?</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-navy-500 flex items-center justify-center flex-shrink-0"><MessageSquare className="w-3 h-3 text-white" /></div>
                    <div className="bg-white rounded-xl rounded-tl-none px-3 py-2 shadow-sm">
                      <p className="text-gray-700 text-sm">We're open Mon–Fri 8am–6pm and Sat 9am–2pm!</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-white border-t border-gray-100">
                  <div className="flex gap-2">
                    <input className="flex-1 text-sm bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-navy-400" placeholder="Type a message..." readOnly />
                    <button className="w-9 h-9 rounded-lg bg-navy-500 flex items-center justify-center flex-shrink-0">
                      <ArrowRight className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  <p className="text-center text-gray-400 text-xs mt-2">Powered by <span className="text-gold-500 font-medium">JibuAI</span></p>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-14 h-14 rounded-full bg-navy-500 flex items-center justify-center shadow-lg animate-pulse-gold cursor-pointer">
                <MessageSquare className="w-6 h-6 text-gold-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section ref={useCasesSection.ref} className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-700 ${useCasesSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-500 mb-4">Built for every Kenyan business</h2>
            <p className="text-gray-500 text-lg">From SACCOs to clinics, JibuAI helps you answer faster.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map((uc, i) => (
              <div key={i} className={`group p-5 rounded-2xl border border-gray-100 hover:border-navy-500/20 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-default ${useCasesSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: `${i * 60}ms` }}>
                <div className="text-3xl mb-3">{uc.icon}</div>
                <h3 className="font-semibold text-navy-500 text-base mb-2">{uc.title}</h3>
                <p className="text-gray-400 text-sm italic leading-relaxed">{uc.question}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section ref={pricingSection.ref} className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-700 ${pricingSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-500 mb-4">Simple, transparent pricing</h2>
            <p className="text-gray-500 text-lg">Start free. Upgrade when your business is ready.</p>
            <div className="mt-4 inline-flex items-center gap-2 bg-emerald-400/10 text-emerald-600 border border-emerald-400/20 rounded-full px-4 py-2 text-sm font-medium">
              <Zap className="w-4 h-4" />
              Coming soon: M-Pesa subscriptions
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((p, i) => (
              <div key={i} className={`rounded-2xl p-6 transition-all duration-300 ${p.highlight ? 'bg-navy-500 text-white shadow-xl ring-2 ring-gold-400 scale-105' : 'bg-white border border-gray-200 hover:shadow-lg'} ${pricingSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: `${i * 80}ms` }}>
                <div className={`text-sm font-medium mb-1 ${p.highlight ? 'text-gold-400' : 'text-gray-500'}`}>{p.name}</div>
                <div className={`text-3xl font-bold mb-1 ${p.highlight ? 'text-white' : 'text-navy-500'}`}>{p.price}</div>
                <div className={`text-sm mb-6 ${p.highlight ? 'text-white/60' : 'text-gray-400'}`}>{p.period}</div>
                <ul className="space-y-2.5 mb-6">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      <CheckCircle className={`w-4 h-4 flex-shrink-0 ${p.highlight ? 'text-gold-400' : 'text-emerald-500'}`} />
                      <span className={p.highlight ? 'text-white/80' : 'text-gray-600'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/register">
                  <Button className={`w-full ${p.highlight ? 'bg-gold-400 text-navy-500 hover:bg-gold-300' : 'bg-navy-500 text-white hover:bg-navy-400'} font-semibold`}>
                    {p.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-royal-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gold-400/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4">Start replying faster today.</h2>
          <p className="text-white/70 text-lg mb-8">Join businesses across Kenya using JibuAI to delight their customers.</p>
          <Link href="/register">
            <Button size="lg" className="bg-gold-400 text-navy-500 hover:bg-gold-300 font-bold text-base px-10 h-14 animate-pulse-gold">
              Create Free Workspace <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <p className="text-white/40 text-sm mt-4">Free 14-day trial · No credit card</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-500 py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-gold-400 flex items-center justify-center"><MessageSquare className="w-3.5 h-3.5 text-navy-500" /></div>
                <span className="text-white font-bold">JibuAI</span>
              </div>
              <p className="text-white/40 text-sm">AI customer support for Kenyan businesses.</p>
            </div>
            {[
              { label: 'Product', links: ['Features', 'Use Cases', 'Pricing', 'Widget'] },
              { label: 'Company', links: ['About', 'Contact', 'Blog'] },
              { label: 'Legal', links: ['Privacy', 'Terms', 'Security'] },
            ].map(col => (
              <div key={col.label}>
                <div className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">{col.label}</div>
                <ul className="space-y-2">
                  {col.links.map(l => <li key={l}><Link href="#" className="text-white/40 hover:text-white/70 text-sm transition-colors">{l}</Link></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-white/30 text-sm">© 2025 JibuAI. Built for Kenya.</p>
            <p className="text-white/30 text-sm">Nairobi, Kenya</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
