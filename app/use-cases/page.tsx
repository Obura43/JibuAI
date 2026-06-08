'use client';

import Link from 'next/link';
import { MessageSquare, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const useCases = [
  {
    icon: '🏦', title: 'SACCOs & Microfinance',
    desc: 'Handle member queries about loans, savings, and account information. Auto-create leads from interested visitors.',
    example: '"What documents do I need to apply for a development loan?"',
    benefits: ['Loan enquiry automation', 'Member onboarding', 'Account query handling', 'Lead capture from website'],
  },
  {
    icon: '🎓', title: 'Schools & Universities',
    desc: 'Answer questions about admissions, fees, courses, and timetables. Reduce phone calls to your front desk.',
    example: '"When does Form 1 admission for 2025 open and what are the requirements?"',
    benefits: ['Admissions enquiries', 'Fee structure queries', 'Timetable information', 'Parent communication'],
  },
  {
    icon: '🏥', title: 'Clinics & Hospitals',
    desc: 'Book appointments, answer service questions, and guide patients to the right department.',
    example: '"Do you accept NHIF? I need to book an appointment with a gynecologist."',
    benefits: ['Appointment booking', 'Service enquiries', 'Insurance questions', 'Patient follow-ups'],
  },
  {
    icon: '🏠', title: 'Real Estate Agents',
    desc: 'Convert website visitors into viewing appointments. Answer property questions and capture leads.',
    example: '"What 3-bedroom units are available in Karen under KES 80,000 per month?"',
    benefits: ['Property enquiries', 'Viewing bookings', 'Lead qualification', 'Tenant queries'],
  },
  {
    icon: '🛍️', title: 'Online Shops & E-commerce',
    desc: 'Handle order status, product questions, returns, and delivery queries without manual effort.',
    example: '"My order #KE-3821 was supposed to arrive yesterday. What happened?"',
    benefits: ['Order tracking', 'Product questions', 'Returns & refunds', 'Delivery updates'],
  },
  {
    icon: '✨', title: 'Service Businesses',
    desc: 'From cleaners to mechanics, convert enquiries into bookings and reduce back-and-forth.',
    example: '"How much does a full house deep clean cost for a 3-bedroom apartment?"',
    benefits: ['Service quotes', 'Booking management', 'Schedule enquiries', 'Follow-up automation'],
  },
];

export default function UseCasesPage() {
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

      <section className="bg-hero-gradient py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Built for every Kenyan business</h1>
          <p className="text-white/70 text-lg">See how businesses like yours use JibuAI to answer faster and convert more customers.</p>
        </div>
      </section>

      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {useCases.map((uc, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="text-4xl mb-3">{uc.icon}</div>
              <h2 className="text-xl font-bold text-navy-500 mb-2">{uc.title}</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">{uc.desc}</p>
              <div className="bg-gray-50 rounded-xl p-3 mb-4 border border-gray-100">
                <p className="text-xs text-gray-400 mb-1">Customer asks:</p>
                <p className="text-sm text-gray-600 italic">{uc.example}</p>
              </div>
              <ul className="space-y-1.5">
                {uc.benefits.map((b, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />{b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-navy-500 py-16 px-4 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">See JibuAI in action</h2>
        <p className="text-white/70 mb-8">Start your free 14-day trial today.</p>
        <Link href="/register"><Button size="lg" className="bg-gold-400 text-navy-500 hover:bg-gold-300 font-semibold px-10">Get Started Free <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
      </section>
    </div>
  );
}
