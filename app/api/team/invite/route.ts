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
    const { email, role, organization_id } = body;
    if (!email || !role || !organization_id) {
      return NextResponse.json({ error: 'email, role, and organization_id are required' }, { status: 400 });
    }
    if (!['org_admin','agent','viewer'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: requesterMember } = await admin.from('organization_members').select('role').eq('organization_id', organization_id).eq('user_id', user.id).maybeSingle();
    if (!requesterMember || !['org_owner','org_admin'].includes(requesterMember.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Check if user already exists
    const { data: existingProfile } = await admin.from('profiles').select('id').eq('email', email).maybeSingle();

    if (existingProfile) {
      const { data: existingMember } = await admin.from('organization_members').select('id').eq('organization_id', organization_id).eq('user_id', existingProfile.id).maybeSingle();
      if (existingMember) return NextResponse.json({ error: 'User is already a member' }, { status: 400 });

      await admin.from('organization_members').insert({ organization_id, user_id: existingProfile.id, role });
      await admin.from('audit_logs').insert({ organization_id, actor_id: user.id, action: 'team.member_added', metadata: { email, role } });
      return NextResponse.json({ success: true, message: 'Member added' });
    }

    // Create user
    const { data: newUser, error: createError } = await admin.auth.admin.createUser({ email, email_confirm: true, password: Math.random().toString(36).slice(-12) });
    if (createError) return NextResponse.json({ error: createError.message }, { status: 400 });

    await admin.from('profiles').insert({ id: newUser.user.id, email, full_name: email.split('@')[0] });
    await admin.from('organization_members').insert({ organization_id, user_id: newUser.user.id, role });
    await admin.from('audit_logs').insert({ organization_id, actor_id: user.id, action: 'team.member_invited', metadata: { email, role } });

    return NextResponse.json({ success: true, message: 'Invitation sent' });
  } catch (err: unknown) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
