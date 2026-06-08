/*
# JibuAI Core Schema

## Purpose
Creates all tables required for the JibuAI multi-tenant AI customer support SaaS platform.

## New Tables
1. `profiles` — Extended user info linked to auth.users
2. `organizations` — Business accounts (tenants)
3. `organization_members` — Maps users to organizations with roles
4. `subscriptions` — Tracks trial/paid plan status per org
5. `contacts` — Customer contacts per organization
6. `conversations` — Chat/support threads per org
7. `messages` — Individual messages in a conversation
8. `tickets` — Support tickets linked to conversations
9. `widget_settings` — Chat widget config per org
10. `ai_suggestions` — AI-generated reply suggestions
11. `audit_logs` — Admin action logs

## Security
- RLS enabled on all tables
- Org data scoped to organization members
- Super admins bypass all restrictions (via profiles.is_super_admin)
- Widget API isolation via separate policies
*/

-- PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  avatar_url text,
  is_super_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id OR (SELECT is_super_admin FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;
CREATE POLICY "profiles_delete_own" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- ORGANIZATIONS
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  owner_id uuid REFERENCES profiles(id),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended')),
  industry text,
  country text DEFAULT 'Kenya',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orgs_select_member" ON organizations;
CREATE POLICY "orgs_select_member" ON organizations FOR SELECT
  TO authenticated USING (
    (SELECT is_super_admin FROM profiles WHERE id = auth.uid()) = true
    OR EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = organizations.id AND om.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "orgs_insert_owner" ON organizations;
CREATE POLICY "orgs_insert_owner" ON organizations FOR INSERT
  TO authenticated WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "orgs_update_owner" ON organizations;
CREATE POLICY "orgs_update_owner" ON organizations FOR UPDATE
  TO authenticated USING (
    owner_id = auth.uid() OR (SELECT is_super_admin FROM profiles WHERE id = auth.uid()) = true
  ) WITH CHECK (
    owner_id = auth.uid() OR (SELECT is_super_admin FROM profiles WHERE id = auth.uid()) = true
  );

DROP POLICY IF EXISTS "orgs_delete_owner" ON organizations;
CREATE POLICY "orgs_delete_owner" ON organizations FOR DELETE
  TO authenticated USING (
    owner_id = auth.uid() OR (SELECT is_super_admin FROM profiles WHERE id = auth.uid()) = true
  );

-- ORGANIZATION MEMBERS
CREATE TABLE IF NOT EXISTS organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('org_owner','org_admin','agent','viewer')),
  created_at timestamptz DEFAULT now(),
  UNIQUE (organization_id, user_id)
);

ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "members_select_member" ON organization_members;
CREATE POLICY "members_select_member" ON organization_members FOR SELECT
  TO authenticated USING (
    (SELECT is_super_admin FROM profiles WHERE id = auth.uid()) = true
    OR user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM organization_members om2 WHERE om2.organization_id = organization_members.organization_id AND om2.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "members_insert_admin" ON organization_members;
CREATE POLICY "members_insert_admin" ON organization_members FOR INSERT
  TO authenticated WITH CHECK (
    (SELECT is_super_admin FROM profiles WHERE id = auth.uid()) = true
    OR EXISTS (SELECT 1 FROM organization_members om2 WHERE om2.organization_id = organization_members.organization_id AND om2.user_id = auth.uid() AND om2.role IN ('org_owner','org_admin'))
    OR user_id = auth.uid()
  );

DROP POLICY IF EXISTS "members_update_admin" ON organization_members;
CREATE POLICY "members_update_admin" ON organization_members FOR UPDATE
  TO authenticated USING (
    (SELECT is_super_admin FROM profiles WHERE id = auth.uid()) = true
    OR EXISTS (SELECT 1 FROM organization_members om2 WHERE om2.organization_id = organization_members.organization_id AND om2.user_id = auth.uid() AND om2.role IN ('org_owner','org_admin'))
  ) WITH CHECK (
    (SELECT is_super_admin FROM profiles WHERE id = auth.uid()) = true
    OR EXISTS (SELECT 1 FROM organization_members om2 WHERE om2.organization_id = organization_members.organization_id AND om2.user_id = auth.uid() AND om2.role IN ('org_owner','org_admin'))
  );

DROP POLICY IF EXISTS "members_delete_admin" ON organization_members;
CREATE POLICY "members_delete_admin" ON organization_members FOR DELETE
  TO authenticated USING (
    (SELECT is_super_admin FROM profiles WHERE id = auth.uid()) = true
    OR user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM organization_members om2 WHERE om2.organization_id = organization_members.organization_id AND om2.user_id = auth.uid() AND om2.role IN ('org_owner','org_admin'))
  );

-- SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'trial',
  subscription_status text NOT NULL DEFAULT 'trialing' CHECK (subscription_status IN ('trialing','active','past_due','expired','cancelled')),
  trial_starts_at timestamptz DEFAULT now(),
  trial_ends_at timestamptz DEFAULT (now() + interval '14 days'),
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "subs_select_member" ON subscriptions;
CREATE POLICY "subs_select_member" ON subscriptions FOR SELECT
  TO authenticated USING (
    (SELECT is_super_admin FROM profiles WHERE id = auth.uid()) = true
    OR EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = subscriptions.organization_id AND om.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "subs_insert_owner" ON subscriptions;
CREATE POLICY "subs_insert_owner" ON subscriptions FOR INSERT
  TO authenticated WITH CHECK (
    (SELECT is_super_admin FROM profiles WHERE id = auth.uid()) = true
    OR EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = subscriptions.organization_id AND om.user_id = auth.uid() AND om.role IN ('org_owner'))
  );

DROP POLICY IF EXISTS "subs_update_owner" ON subscriptions;
CREATE POLICY "subs_update_owner" ON subscriptions FOR UPDATE
  TO authenticated USING (
    (SELECT is_super_admin FROM profiles WHERE id = auth.uid()) = true
    OR EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = subscriptions.organization_id AND om.user_id = auth.uid() AND om.role IN ('org_owner'))
  ) WITH CHECK (
    (SELECT is_super_admin FROM profiles WHERE id = auth.uid()) = true
    OR EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = subscriptions.organization_id AND om.user_id = auth.uid() AND om.role IN ('org_owner'))
  );

DROP POLICY IF EXISTS "subs_delete_owner" ON subscriptions;
CREATE POLICY "subs_delete_owner" ON subscriptions FOR DELETE
  TO authenticated USING (
    (SELECT is_super_admin FROM profiles WHERE id = auth.uid()) = true
  );

-- CONTACTS
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text,
  email text,
  phone text,
  source text DEFAULT 'website',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contacts_select_member" ON contacts;
CREATE POLICY "contacts_select_member" ON contacts FOR SELECT
  TO authenticated USING (
    (SELECT is_super_admin FROM profiles WHERE id = auth.uid()) = true
    OR EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = contacts.organization_id AND om.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "contacts_insert_member" ON contacts;
CREATE POLICY "contacts_insert_member" ON contacts FOR INSERT
  TO authenticated WITH CHECK (
    (SELECT is_super_admin FROM profiles WHERE id = auth.uid()) = true
    OR EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = contacts.organization_id AND om.user_id = auth.uid() AND om.role IN ('org_owner','org_admin','agent'))
  );

DROP POLICY IF EXISTS "contacts_update_member" ON contacts;
CREATE POLICY "contacts_update_member" ON contacts FOR UPDATE
  TO authenticated USING (
    (SELECT is_super_admin FROM profiles WHERE id = auth.uid()) = true
    OR EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = contacts.organization_id AND om.user_id = auth.uid() AND om.role IN ('org_owner','org_admin','agent'))
  ) WITH CHECK (
    (SELECT is_super_admin FROM profiles WHERE id = auth.uid()) = true
    OR EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = contacts.organization_id AND om.user_id = auth.uid() AND om.role IN ('org_owner','org_admin','agent'))
  );

DROP POLICY IF EXISTS "contacts_delete_member" ON contacts;
CREATE POLICY "contacts_delete_member" ON contacts FOR DELETE
  TO authenticated USING (
    (SELECT is_super_admin FROM profiles WHERE id = auth.uid()) = true
    OR EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = contacts.organization_id AND om.user_id = auth.uid() AND om.role IN ('org_owner','org_admin'))
  );

-- Service role bypass for contacts (widget API)
DROP POLICY IF EXISTS "contacts_service_role" ON contacts;
CREATE POLICY "contacts_service_role" ON contacts FOR ALL
  TO service_role USING (true) WITH CHECK (true);

-- CONVERSATIONS
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES contacts(id),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed','pending')),
  channel text NOT NULL DEFAULT 'website',
  assigned_to uuid REFERENCES profiles(id),
  last_message_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "convs_select_member" ON conversations;
CREATE POLICY "convs_select_member" ON conversations FOR SELECT
  TO authenticated USING (
    (SELECT is_super_admin FROM profiles WHERE id = auth.uid()) = true
    OR EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = conversations.organization_id AND om.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "convs_insert_member" ON conversations;
CREATE POLICY "convs_insert_member" ON conversations FOR INSERT
  TO authenticated WITH CHECK (
    (SELECT is_super_admin FROM profiles WHERE id = auth.uid()) = true
    OR EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = conversations.organization_id AND om.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "convs_update_member" ON conversations;
CREATE POLICY "convs_update_member" ON conversations FOR UPDATE
  TO authenticated USING (
    (SELECT is_super_admin FROM profiles WHERE id = auth.uid()) = true
    OR EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = conversations.organization_id AND om.user_id = auth.uid() AND om.role IN ('org_owner','org_admin','agent'))
  ) WITH CHECK (
    (SELECT is_super_admin FROM profiles WHERE id = auth.uid()) = true
    OR EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = conversations.organization_id AND om.user_id = auth.uid() AND om.role IN ('org_owner','org_admin','agent'))
  );

DROP POLICY IF EXISTS "convs_delete_member" ON conversations;
CREATE POLICY "convs_delete_member" ON conversations FOR DELETE
  TO authenticated USING (
    (SELECT is_super_admin FROM profiles WHERE id = auth.uid()) = true
    OR EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = conversations.organization_id AND om.user_id = auth.uid() AND om.role IN ('org_owner','org_admin'))
  );

DROP POLICY IF EXISTS "convs_service_role" ON conversations;
CREATE POLICY "convs_service_role" ON conversations FOR ALL
  TO service_role USING (true) WITH CHECK (true);

-- MESSAGES
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_type text NOT NULL CHECK (sender_type IN ('visitor','agent','ai','system')),
  sender_id uuid REFERENCES profiles(id),
  body text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "msgs_select_member" ON messages;
CREATE POLICY "msgs_select_member" ON messages FOR SELECT
  TO authenticated USING (
    (SELECT is_super_admin FROM profiles WHERE id = auth.uid()) = true
    OR EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = messages.organization_id AND om.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "msgs_insert_member" ON messages;
CREATE POLICY "msgs_insert_member" ON messages FOR INSERT
  TO authenticated WITH CHECK (
    (SELECT is_super_admin FROM profiles WHERE id = auth.uid()) = true
    OR EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = messages.organization_id AND om.user_id = auth.uid() AND om.role IN ('org_owner','org_admin','agent'))
  );

DROP POLICY IF EXISTS "msgs_update_member" ON messages;
CREATE POLICY "msgs_update_member" ON messages FOR UPDATE
  TO authenticated USING (
    (SELECT is_super_admin FROM profiles WHERE id = auth.uid()) = true
    OR (sender_id = auth.uid() AND EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = messages.organization_id AND om.user_id = auth.uid()))
  ) WITH CHECK (
    (SELECT is_super_admin FROM profiles WHERE id = auth.uid()) = true
    OR (sender_id = auth.uid() AND EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = messages.organization_id AND om.user_id = auth.uid()))
  );

DROP POLICY IF EXISTS "msgs_delete_member" ON messages;
CREATE POLICY "msgs_delete_member" ON messages FOR DELETE
  TO authenticated USING (
    (SELECT is_super_admin FROM profiles WHERE id = auth.uid()) = true
    OR EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = messages.organization_id AND om.user_id = auth.uid() AND om.role IN ('org_owner','org_admin'))
  );

DROP POLICY IF EXISTS "msgs_service_role" ON messages;
CREATE POLICY "msgs_service_role" ON messages FOR ALL
  TO service_role USING (true) WITH CHECK (true);

-- TICKETS
CREATE TABLE IF NOT EXISTS tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES conversations(id),
  title text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved','closed')),
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  assigned_to uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tickets_select_member" ON tickets;
CREATE POLICY "tickets_select_member" ON tickets FOR SELECT
  TO authenticated USING (
    (SELECT is_super_admin FROM profiles WHERE id = auth.uid()) = true
    OR EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = tickets.organization_id AND om.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "tickets_insert_member" ON tickets;
CREATE POLICY "tickets_insert_member" ON tickets FOR INSERT
  TO authenticated WITH CHECK (
    (SELECT is_super_admin FROM profiles WHERE id = auth.uid()) = true
    OR EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = tickets.organization_id AND om.user_id = auth.uid() AND om.role IN ('org_owner','org_admin','agent'))
  );

DROP POLICY IF EXISTS "tickets_update_member" ON tickets;
CREATE POLICY "tickets_update_member" ON tickets FOR UPDATE
  TO authenticated USING (
    (SELECT is_super_admin FROM profiles WHERE id = auth.uid()) = true
    OR EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = tickets.organization_id AND om.user_id = auth.uid() AND om.role IN ('org_owner','org_admin','agent'))
  ) WITH CHECK (
    (SELECT is_super_admin FROM profiles WHERE id = auth.uid()) = true
    OR EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = tickets.organization_id AND om.user_id = auth.uid() AND om.role IN ('org_owner','org_admin','agent'))
  );

DROP POLICY IF EXISTS "tickets_delete_member" ON tickets;
CREATE POLICY "tickets_delete_member" ON tickets FOR DELETE
  TO authenticated USING (
    (SELECT is_super_admin FROM profiles WHERE id = auth.uid()) = true
    OR EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = tickets.organization_id AND om.user_id = auth.uid() AND om.role IN ('org_owner','org_admin'))
  );

-- WIDGET SETTINGS
CREATE TABLE IF NOT EXISTS widget_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
  primary_color text DEFAULT '#071A2F',
  accent_color text DEFAULT '#D4AF37',
  welcome_message text DEFAULT 'Hi there! How can we help you today?',
  offline_message text DEFAULT 'We are currently offline. Leave a message and we will get back to you.',
  widget_position text DEFAULT 'bottom-right',
  show_watermark boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE widget_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "widget_select_member" ON widget_settings;
CREATE POLICY "widget_select_member" ON widget_settings FOR SELECT
  TO authenticated USING (
    (SELECT is_super_admin FROM profiles WHERE id = auth.uid()) = true
    OR EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = widget_settings.organization_id AND om.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "widget_insert_member" ON widget_settings;
CREATE POLICY "widget_insert_member" ON widget_settings FOR INSERT
  TO authenticated WITH CHECK (
    (SELECT is_super_admin FROM profiles WHERE id = auth.uid()) = true
    OR EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = widget_settings.organization_id AND om.user_id = auth.uid() AND om.role IN ('org_owner','org_admin'))
  );

DROP POLICY IF EXISTS "widget_update_member" ON widget_settings;
CREATE POLICY "widget_update_member" ON widget_settings FOR UPDATE
  TO authenticated USING (
    (SELECT is_super_admin FROM profiles WHERE id = auth.uid()) = true
    OR EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = widget_settings.organization_id AND om.user_id = auth.uid() AND om.role IN ('org_owner','org_admin'))
  ) WITH CHECK (
    (SELECT is_super_admin FROM profiles WHERE id = auth.uid()) = true
    OR EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = widget_settings.organization_id AND om.user_id = auth.uid() AND om.role IN ('org_owner','org_admin'))
  );

DROP POLICY IF EXISTS "widget_delete_member" ON widget_settings;
CREATE POLICY "widget_delete_member" ON widget_settings FOR DELETE
  TO authenticated USING (
    (SELECT is_super_admin FROM profiles WHERE id = auth.uid()) = true
    OR EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = widget_settings.organization_id AND om.user_id = auth.uid() AND om.role IN ('org_owner'))
  );

-- Public read for widget config API (used by embedded widget)
DROP POLICY IF EXISTS "widget_public_read" ON widget_settings;
CREATE POLICY "widget_public_read" ON widget_settings FOR SELECT
  TO anon USING (true);

DROP POLICY IF EXISTS "widget_service_role" ON widget_settings;
CREATE POLICY "widget_service_role" ON widget_settings FOR ALL
  TO service_role USING (true) WITH CHECK (true);

-- AI SUGGESTIONS
CREATE TABLE IF NOT EXISTS ai_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  suggested_reply text NOT NULL,
  accepted boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_suggestions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ai_select_member" ON ai_suggestions;
CREATE POLICY "ai_select_member" ON ai_suggestions FOR SELECT
  TO authenticated USING (
    (SELECT is_super_admin FROM profiles WHERE id = auth.uid()) = true
    OR EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = ai_suggestions.organization_id AND om.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "ai_insert_member" ON ai_suggestions;
CREATE POLICY "ai_insert_member" ON ai_suggestions FOR INSERT
  TO authenticated WITH CHECK (
    (SELECT is_super_admin FROM profiles WHERE id = auth.uid()) = true
    OR EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = ai_suggestions.organization_id AND om.user_id = auth.uid() AND om.role IN ('org_owner','org_admin','agent'))
  );

DROP POLICY IF EXISTS "ai_update_member" ON ai_suggestions;
CREATE POLICY "ai_update_member" ON ai_suggestions FOR UPDATE
  TO authenticated USING (
    (SELECT is_super_admin FROM profiles WHERE id = auth.uid()) = true
    OR EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = ai_suggestions.organization_id AND om.user_id = auth.uid() AND om.role IN ('org_owner','org_admin','agent'))
  ) WITH CHECK (
    (SELECT is_super_admin FROM profiles WHERE id = auth.uid()) = true
    OR EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = ai_suggestions.organization_id AND om.user_id = auth.uid() AND om.role IN ('org_owner','org_admin','agent'))
  );

DROP POLICY IF EXISTS "ai_delete_member" ON ai_suggestions;
CREATE POLICY "ai_delete_member" ON ai_suggestions FOR DELETE
  TO authenticated USING (
    (SELECT is_super_admin FROM profiles WHERE id = auth.uid()) = true
  );

-- AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  actor_id uuid REFERENCES profiles(id),
  action text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_select_admin" ON audit_logs;
CREATE POLICY "audit_select_admin" ON audit_logs FOR SELECT
  TO authenticated USING (
    (SELECT is_super_admin FROM profiles WHERE id = auth.uid()) = true
    OR EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = audit_logs.organization_id AND om.user_id = auth.uid() AND om.role IN ('org_owner','org_admin'))
  );

DROP POLICY IF EXISTS "audit_insert_member" ON audit_logs;
CREATE POLICY "audit_insert_member" ON audit_logs FOR INSERT
  TO authenticated WITH CHECK (actor_id = auth.uid());

DROP POLICY IF EXISTS "audit_update_none" ON audit_logs;
DROP POLICY IF EXISTS "audit_delete_none" ON audit_logs;

DROP POLICY IF EXISTS "audit_service_role" ON audit_logs;
CREATE POLICY "audit_service_role" ON audit_logs FOR ALL
  TO service_role USING (true) WITH CHECK (true);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_org_id ON contacts(organization_id);
CREATE INDEX IF NOT EXISTS idx_conversations_org_id ON conversations(organization_id);
CREATE INDEX IF NOT EXISTS idx_conversations_contact_id ON conversations(contact_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_org_id ON messages(organization_id);
CREATE INDEX IF NOT EXISTS idx_tickets_org_id ON tickets(organization_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_org_id ON subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_conversation_id ON ai_suggestions(conversation_id);
