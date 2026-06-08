import type { Database } from '@/types/database';

type Subscription = Database['public']['Tables']['subscriptions']['Row'];

export function getTrialDaysRemaining(subscription: Subscription | null): number {
  if (!subscription || !subscription.trial_ends_at) return 0;
  const now = new Date();
  const trialEnd = new Date(subscription.trial_ends_at);
  const diff = trialEnd.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function isTrialActive(subscription: Subscription | null): boolean {
  if (!subscription) return false;
  if (subscription.subscription_status !== 'trialing') return false;
  if (!subscription.trial_ends_at) return false;
  return new Date(subscription.trial_ends_at) > new Date();
}

export function isSubscriptionActive(subscription: Subscription | null): boolean {
  if (!subscription) return false;
  if (subscription.subscription_status === 'active') return true;
  return isTrialActive(subscription);
}

export function canReceiveMessages(subscription: Subscription | null): boolean {
  return isSubscriptionActive(subscription);
}

export function canSendReplies(subscription: Subscription | null): boolean {
  return isSubscriptionActive(subscription);
}

export function getSubscriptionBadge(subscription: Subscription | null): {
  label: string;
  type: 'trial' | 'active' | 'expired' | 'none';
} {
  if (!subscription) return { label: 'No subscription', type: 'none' };
  if (subscription.subscription_status === 'active') return { label: 'Active', type: 'active' };
  if (isTrialActive(subscription)) {
    const days = getTrialDaysRemaining(subscription);
    return { label: `Trial — ${days} day${days !== 1 ? 's' : ''} left`, type: 'trial' };
  }
  return { label: 'Trial expired', type: 'expired' };
}
