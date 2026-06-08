import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { org_id, visitor_name, visitor_email, message } = body;

    if (!org_id || !message?.trim()) {
      return NextResponse.json({ error: 'org_id and message are required' }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: org } = await admin.from('organizations').select('id, name, status').eq('id', org_id).maybeSingle();
    if (!org || org.status === 'suspended') {
      return NextResponse.json({ error: 'Organization unavailable' }, { status: 403 });
    }

    const { data: sub } = await admin.from('subscriptions').select('subscription_status, trial_ends_at').eq('organization_id', org_id).maybeSingle();
    const canReceive = sub && (
      sub.subscription_status === 'active' ||
      (sub.subscription_status === 'trialing' && sub.trial_ends_at && new Date(sub.trial_ends_at) > new Date())
    );

    if (!canReceive) {
      return NextResponse.json({ error: 'This workspace is not accepting messages. Trial may have expired.' }, { status: 403 });
    }

    // Upsert contact
    let contactId: string | null = null;
    if (visitor_email) {
      const { data: existingContact } = await admin.from('contacts').select('id').eq('organization_id', org_id).eq('email', visitor_email).maybeSingle();
      if (existingContact) {
        contactId = existingContact.id;
      } else {
        const { data: newContact } = await admin.from('contacts').insert({ organization_id: org_id, name: visitor_name ?? visitor_email, email: visitor_email, source: 'website' }).select('id').single();
        contactId = newContact?.id ?? null;
      }
    }

    // Create conversation
    const { data: conv } = await admin.from('conversations').insert({
      organization_id: org_id,
      contact_id: contactId,
      status: 'open',
      channel: 'website',
      last_message_at: new Date().toISOString(),
    }).select('id').single();

    if (!conv) return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });

    // Create message
    await admin.from('messages').insert({
      organization_id: org_id,
      conversation_id: conv.id,
      sender_type: 'visitor',
      body: message.trim(),
    });

    // System message for watermark on trial
    const isTrialing = sub?.subscription_status === 'trialing';

    return NextResponse.json({
      success: true,
      conversation_id: conv.id,
      is_trial: isTrialing,
    });
  } catch (err: unknown) {
    console.error('Widget message error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
