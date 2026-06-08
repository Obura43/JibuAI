import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const token = authHeader.replace('Bearer ', '');
    const serverClient = createServerClient();
    const { data: { user }, error: authError } = await serverClient.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = createAdminClient();
    const { data: requester } = await admin.from('profiles').select('is_super_admin').eq('id', user.id).maybeSingle();
    if (!requester?.is_super_admin) return NextResponse.json({ error: 'Super admin only' }, { status: 403 });

    const body = await req.json();
    const { organization_id, days } = body;
    if (!organization_id || !days || days < 1) {
      return NextResponse.json({ error: 'organization_id and days are required' }, { status: 400 });
    }

    const { data: sub } = await admin.from('subscriptions').select('trial_ends_at, subscription_status').eq('organization_id', organization_id).maybeSingle();
    if (!sub) return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });

    const baseDate = sub.trial_ends_at && new Date(sub.trial_ends_at) > new Date()
      ? new Date(sub.trial_ends_at)
      : new Date();
    baseDate.setDate(baseDate.getDate() + days);

    const { error } = await admin.from('subscriptions').update({
      trial_ends_at: baseDate.toISOString(),
      subscription_status: 'trialing',
    }).eq('organization_id', organization_id);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    await admin.from('audit_logs').insert({
      organization_id,
      actor_id: user.id,
      action: 'admin.trial_extended',
      metadata: { days, new_trial_ends_at: baseDate.toISOString() },
    });

    return NextResponse.json({ success: true, new_trial_ends_at: baseDate.toISOString() });
  } catch (err: unknown) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
