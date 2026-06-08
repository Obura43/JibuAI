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

    const body = await req.json();
    const { conversation_id, organization_id, message } = body;
    if (!conversation_id || !organization_id || !message?.trim()) {
      return NextResponse.json({ error: 'conversation_id, organization_id, and message are required' }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: member } = await admin.from('organization_members').select('role').eq('organization_id', organization_id).eq('user_id', user.id).maybeSingle();
    if (!member || !['org_owner','org_admin','agent'].includes(member.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { data: sub } = await admin.from('subscriptions').select('subscription_status, trial_ends_at').eq('organization_id', organization_id).maybeSingle();
    const canSend = sub && (sub.subscription_status === 'active' || (sub.subscription_status === 'trialing' && sub.trial_ends_at && new Date(sub.trial_ends_at) > new Date()));
    if (!canSend) return NextResponse.json({ error: 'Trial expired. Please upgrade.' }, { status: 403 });

    const { data: msg, error } = await admin.from('messages').insert({
      organization_id,
      conversation_id,
      sender_type: 'agent',
      sender_id: user.id,
      body: message.trim(),
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    await admin.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', conversation_id);

    return NextResponse.json({ success: true, message: msg });
  } catch (err: unknown) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
