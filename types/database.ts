export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          avatar_url: string | null;
          is_super_admin: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          is_super_admin?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: [];
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          owner_id: string | null;
          status: string;
          industry: string | null;
          country: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          owner_id?: string | null;
          status?: string;
          industry?: string | null;
          country?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['organizations']['Insert']>;
        Relationships: [];
      };
      organization_members: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          role: 'org_owner' | 'org_admin' | 'agent' | 'viewer';
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id: string;
          role: 'org_owner' | 'org_admin' | 'agent' | 'viewer';
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['organization_members']['Insert']>;
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          organization_id: string;
          plan: string;
          subscription_status: 'trialing' | 'active' | 'past_due' | 'expired' | 'cancelled';
          trial_starts_at: string | null;
          trial_ends_at: string | null;
          current_period_end: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          plan?: string;
          subscription_status?: 'trialing' | 'active' | 'past_due' | 'expired' | 'cancelled';
          trial_starts_at?: string | null;
          trial_ends_at?: string | null;
          current_period_end?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>;
        Relationships: [];
      };
      contacts: {
        Row: {
          id: string;
          organization_id: string;
          name: string | null;
          email: string | null;
          phone: string | null;
          source: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name?: string | null;
          email?: string | null;
          phone?: string | null;
          source?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['contacts']['Insert']>;
        Relationships: [];
      };
      conversations: {
        Row: {
          id: string;
          organization_id: string;
          contact_id: string | null;
          status: string;
          channel: string;
          assigned_to: string | null;
          last_message_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          contact_id?: string | null;
          status?: string;
          channel?: string;
          assigned_to?: string | null;
          last_message_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['conversations']['Insert']>;
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          organization_id: string;
          conversation_id: string;
          sender_type: 'visitor' | 'agent' | 'ai' | 'system';
          sender_id: string | null;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          conversation_id: string;
          sender_type: 'visitor' | 'agent' | 'ai' | 'system';
          sender_id?: string | null;
          body: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['messages']['Insert']>;
        Relationships: [];
      };
      tickets: {
        Row: {
          id: string;
          organization_id: string;
          conversation_id: string | null;
          title: string;
          status: string;
          priority: string;
          assigned_to: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          conversation_id?: string | null;
          title: string;
          status?: string;
          priority?: string;
          assigned_to?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['tickets']['Insert']>;
        Relationships: [];
      };
      widget_settings: {
        Row: {
          id: string;
          organization_id: string;
          primary_color: string;
          accent_color: string;
          welcome_message: string;
          offline_message: string | null;
          widget_position: string;
          show_watermark: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          primary_color?: string;
          accent_color?: string;
          welcome_message?: string;
          offline_message?: string | null;
          widget_position?: string;
          show_watermark?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['widget_settings']['Insert']>;
        Relationships: [];
      };
      ai_suggestions: {
        Row: {
          id: string;
          organization_id: string;
          conversation_id: string;
          suggested_reply: string;
          accepted: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          conversation_id: string;
          suggested_reply: string;
          accepted?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['ai_suggestions']['Insert']>;
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          organization_id: string | null;
          actor_id: string | null;
          action: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string | null;
          actor_id?: string | null;
          action: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['audit_logs']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
