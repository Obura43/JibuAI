import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim().slice(0, 50);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, fullName, businessName } = body;

    if (!email || !password || !fullName || !businessName) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: authData, error: authError } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });

    const userId = authData.user.id;

    const { error: profileError } = await admin.from('profiles').insert({
      id: userId, full_name: fullName, email,
      is_super_admin: email === process.env.SUPER_ADMIN_EMAIL,
    });
    if (profileError) {
      await admin.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    let slug = slugify(businessName);
    const { data: existing } = await admin.from('organizations').select('slug').eq('slug', slug).maybeSingle();
    if (existing) slug = `${slug}-${Date.now().toString(36)}`;

    const { data: orgData, error: orgError } = await admin.from('organizations').insert({
      name: businessName, slug, owner_id: userId, status: 'active',
    }).select().single();
    if (orgError) {
      await admin.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: orgError.message }, { status: 400 });
    }

    await admin.from('organization_members').insert({ organization_id: orgData.id, user_id: userId, role: 'org_owner' });

    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + 14);
    await admin.from('subscriptions').insert({
      organization_id: orgData.id, plan: 'trial', subscription_status: 'trialing',
      trial_starts_at: now.toISOString(), trial_ends_at: trialEnd.toISOString(),
    });

    await admin.from('widget_settings').insert({
      organization_id: orgData.id, primary_color: '#071A2F', accent_color: '#D4AF37',
      welcome_message: 'Hi there! How can we help you today?', show_watermark: true,
    });

    await admin.from('audit_logs').insert({
      organization_id: orgData.id, actor_id: userId, action: 'organization.created',
      metadata: { business_name: businessName, email },
    });

    return NextResponse.json({ success: true, organization_id: orgData.id, user_id: userId });
  } catch (err: unknown) {
    console.error('Registration error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
