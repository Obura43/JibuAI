'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase/client';
import { Settings, User, Building2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { profile, organization, refreshOrg } = useAuth();
  const [profileForm, setProfileForm] = useState({ full_name: profile?.full_name ?? '', email: profile?.email ?? '' });
  const [orgForm, setOrgForm] = useState({ name: organization?.name ?? '', industry: organization?.industry ?? '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingOrg, setSavingOrg] = useState(false);

  async function saveProfile() {
    if (!profile) return;
    setSavingProfile(true);
    const { error } = await supabase.from('profiles').update({ full_name: profileForm.full_name }).eq('id', profile.id);
    if (error) toast.error('Failed to save'); else { toast.success('Profile updated'); await refreshOrg(); }
    setSavingProfile(false);
  }

  async function saveOrg() {
    if (!organization) return;
    setSavingOrg(true);
    const { error } = await supabase.from('organizations').update({ name: orgForm.name, industry: orgForm.industry }).eq('id', organization.id);
    if (error) toast.error('Failed to save'); else { toast.success('Organization updated'); await refreshOrg(); }
    setSavingOrg(false);
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-500">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your profile and organization settings.</p>
      </div>

      <div className="space-y-5">
        {/* Profile */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-navy-500" />
            <h2 className="font-semibold text-navy-500">Profile</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label>Full name</Label>
              <Input value={profileForm.full_name} onChange={e => setProfileForm(p => ({ ...p, full_name: e.target.value }))} className="mt-1.5" />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={profileForm.email} disabled className="mt-1.5 bg-gray-50 text-gray-400" />
              <p className="text-gray-400 text-xs mt-1">Email cannot be changed here.</p>
            </div>
            <Button onClick={saveProfile} disabled={savingProfile} className="bg-navy-500 hover:bg-navy-400 text-white">
              {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Profile'}
            </Button>
          </div>
        </div>

        {/* Organization */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-navy-500" />
            <h2 className="font-semibold text-navy-500">Organization</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label>Business name</Label>
              <Input value={orgForm.name} onChange={e => setOrgForm(p => ({ ...p, name: e.target.value }))} className="mt-1.5" />
            </div>
            <div>
              <Label>Industry</Label>
              <Input value={orgForm.industry} onChange={e => setOrgForm(p => ({ ...p, industry: e.target.value }))} placeholder="e.g. SACCO, Healthcare, Real Estate" className="mt-1.5" />
            </div>
            <div>
              <Label>Organization ID</Label>
              <Input value={organization?.id ?? ''} disabled className="mt-1.5 bg-gray-50 text-gray-400 font-mono text-xs" />
            </div>
            <Button onClick={saveOrg} disabled={savingOrg} className="bg-navy-500 hover:bg-navy-400 text-white">
              {savingOrg ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Organization'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
