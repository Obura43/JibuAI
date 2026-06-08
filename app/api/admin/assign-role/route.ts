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
    const { target_user_id, role } = body;
    if (!target_user_id || !role) {
      return NextResponse.json({ error: 'target_user_id and role are required' }, { status: 400 });
    }

    if (role === 'super_admin') {
      const { error } = await admin.from('profiles').update({ is_super_admin: true }).eq('id', target_user_id);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    } else if (role === 'remove_super_admin') {
      if (target_user_id === user.id) return NextResponse.json({ error: 'Cannot remove your own super admin role' }, { status: 400 });
      const { error } = await admin.from('profiles').update({ is_super_admin: false }).eq('id', target_user_id);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    } else {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    await admin.from('audit_logs').insert({
      actor_id: user.id,
      action: 'admin.role_assigned',
      metadata: { target_user_id, role },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
