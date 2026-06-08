'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  is_super_admin: boolean;
  created_at: string;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  owner_id: string | null;
  status: string;
  industry: string | null;
  country: string;
  created_at: string;
}

interface Subscription {
  id: string;
  organization_id: string;
  plan: string;
  subscription_status: 'trialing' | 'active' | 'past_due' | 'expired' | 'cancelled';
  trial_starts_at: string | null;
  trial_ends_at: string | null;
  current_period_end: string | null;
  created_at: string;
}

type OrgRole = 'org_owner' | 'org_admin' | 'agent' | 'viewer';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  organization: Organization | null;
  subscription: Subscription | null;
  memberRole: OrgRole | null;
  loading: boolean;
  isSuperAdmin: boolean;
  signOut: () => Promise<void>;
  refreshOrg: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  profile: null,
  organization: null,
  subscription: null,
  memberRole: null,
  loading: true,
  isSuperAdmin: false,
  signOut: async () => {},
  refreshOrg: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [memberRole, setMemberRole] = useState<OrgRole | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserData = useCallback(async (userId: string) => {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    setProfile(profileData);

    const { data: memberData } = await supabase
      .from('organization_members')
      .select('*, organizations(*)')
      .eq('user_id', userId)
      .maybeSingle();

    if (memberData) {
      setMemberRole(memberData.role);
      const org = memberData.organizations as Organization;
      setOrganization(org);

      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('organization_id', org.id)
        .maybeSingle();

      setSubscription(subData);
    }
  }, []);

  const refreshOrg = useCallback(async () => {
    if (!user) return;
    await loadUserData(user.id);
  }, [user, loadUserData]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserData(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      (async () => {
        if (session?.user) {
          await loadUserData(session.user.id);
        } else {
          setProfile(null);
          setOrganization(null);
          setSubscription(null);
          setMemberRole(null);
        }
        setLoading(false);
      })();
    });

    return () => authSub.unsubscribe();
  }, [loadUserData]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const isSuperAdmin = profile?.is_super_admin === true;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        organization,
        subscription,
        memberRole,
        loading,
        isSuperAdmin,
        signOut,
        refreshOrg,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
