import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
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

    const { data: organizations } = await admin.from('organizations').select('*, subscriptions(*), organization_members(count)').order('created_at', { ascending: false });

    return NextResponse.json({ organizations: organizations ?? [] });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
