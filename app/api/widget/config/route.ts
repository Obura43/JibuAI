import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get('org_id');
  if (!orgId) return NextResponse.json({ error: 'org_id required' }, { status: 400 });

  const admin = createAdminClient();
  const { data: widget, error } = await admin.from('widget_settings').select('primary_color, accent_color, welcome_message, offline_message, widget_position, show_watermark').eq('organization_id', orgId).maybeSingle();
  if (error || !widget) return NextResponse.json({ error: 'Widget not found' }, { status: 404 });

  const { data: org } = await admin.from('organizations').select('name, status').eq('id', orgId).maybeSingle();
  if (!org || org.status === 'suspended') return NextResponse.json({ error: 'Organization unavailable' }, { status: 403 });

  const { data: sub } = await admin.from('subscriptions').select('subscription_status, trial_ends_at').eq('organization_id', orgId).maybeSingle();

  const canReceive = sub && (
    sub.subscription_status === 'active' ||
    (sub.subscription_status === 'trialing' && sub.trial_ends_at && new Date(sub.trial_ends_at) > new Date())
  );

  return NextResponse.json({
    ...widget,
    org_name: org.name,
    can_receive: canReceive,
    subscription_status: sub?.subscription_status ?? 'none',
    trial_ends_at: sub?.trial_ends_at,
  });
}
