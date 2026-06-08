'use client';

import { useAuth } from '@/context/auth-context';
import { getTrialDaysRemaining, isTrialActive } from '@/lib/trial';
import { CreditCard, CheckCircle, Zap, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const plans = [
  { name: 'Starter', price: 'KES 2,500', period: '/month', agents: '3 agents', convs: '1,000 conversations', features: ['Live chat widget', 'AI suggestions', 'Ticket tracking', 'Custom branding', 'Email support'] },
  { name: 'Growth', price: 'KES 6,500', period: '/month', agents: '10 agents', convs: '5,000 conversations', features: ['All Starter features', 'Priority support', 'Analytics', 'API access', 'Remove watermark'], highlight: true },
  { name: 'Business', price: 'Custom', period: '', agents: 'Unlimited agents', convs: 'Unlimited conversations', features: ['All Growth features', 'Dedicated support', 'SLA guarantee', 'Custom integrations', 'Onboarding assistance'] },
];

export default function BillingPage() {
  const { subscription, organization } = useAuth();
  const trialActive = isTrialActive(subscription);
  const daysLeft = getTrialDaysRemaining(subscription);
  const isPaid = subscription?.subscription_status === 'active';

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-500">Billing & Plans</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your subscription and billing.</p>
      </div>

      {/* Current status */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="font-semibold text-navy-500">Current Plan</h2>
              {trialActive && <Badge className="bg-gold-100 text-gold-700 border-gold-200 text-xs">Trial</Badge>}
              {isPaid && <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">Active</Badge>}
              {!trialActive && !isPaid && <Badge className="bg-red-100 text-red-600 border-red-200 text-xs">Expired</Badge>}
            </div>
            {trialActive && (
              <p className="text-gray-500 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-gold-500" />
                Free Trial — <strong className="text-gold-600">{daysLeft} days remaining</strong>
              </p>
            )}
            {!trialActive && !isPaid && (
              <p className="text-red-600 text-sm">Your trial has expired. Upgrade to continue using JibuAI.</p>
            )}
            {isPaid && <p className="text-gray-500 text-sm">Your subscription is active.</p>}
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-navy-500">{isPaid ? subscription?.plan ?? 'Starter' : 'Trial'}</p>
            <p className="text-gray-400 text-sm">{isPaid ? 'per month' : 'free'}</p>
          </div>
        </div>
        {trialActive && (
          <div className="mt-4 bg-gray-100 rounded-full h-2 overflow-hidden">
            <div className="bg-gold-400 h-2 rounded-full transition-all" style={{ width: `${(daysLeft / 14) * 100}%` }} />
          </div>
        )}
      </div>

      {/* M-Pesa notice */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
        <Zap className="w-5 h-5 text-emerald-600 flex-shrink-0" />
        <div>
          <p className="text-emerald-800 font-medium text-sm">M-Pesa subscriptions coming soon!</p>
          <p className="text-emerald-600 text-xs mt-0.5">Pay for your JibuAI subscription directly via M-Pesa. We will notify you when it is available.</p>
        </div>
      </div>

      {/* Plans */}
      <h2 className="font-semibold text-navy-500 mb-4">Upgrade your plan</h2>
      <div className="grid sm:grid-cols-3 gap-4">
        {plans.map((p, i) => (
          <div key={i} className={`rounded-2xl p-5 border transition-all ${p.highlight ? 'bg-navy-500 border-navy-500 text-white ring-2 ring-gold-400' : 'bg-white border-gray-100 hover:shadow-md'}`}>
            <div className={`text-sm font-medium mb-1 ${p.highlight ? 'text-gold-400' : 'text-gray-500'}`}>{p.name}</div>
            <div className={`text-2xl font-bold mb-0.5 ${p.highlight ? 'text-white' : 'text-navy-500'}`}>{p.price}</div>
            <div className={`text-xs mb-4 ${p.highlight ? 'text-white/60' : 'text-gray-400'}`}>{p.period}</div>
            <ul className="space-y-2 mb-5">
              {p.features.map((f, j) => (
                <li key={j} className="flex items-center gap-2 text-sm">
                  <CheckCircle className={`w-4 h-4 flex-shrink-0 ${p.highlight ? 'text-gold-400' : 'text-emerald-500'}`} />
                  <span className={p.highlight ? 'text-white/80' : 'text-gray-600'}>{f}</span>
                </li>
              ))}
            </ul>
            <Button className={`w-full font-semibold ${p.highlight ? 'bg-gold-400 text-navy-500 hover:bg-gold-300' : 'bg-navy-500 text-white hover:bg-navy-400'}`} onClick={() => alert('M-Pesa payments coming soon!')}>
              {p.price === 'Custom' ? 'Contact Sales' : 'Upgrade — M-Pesa soon'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
