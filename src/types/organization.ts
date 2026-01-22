export type SubscriptionPlan = 'free' | 'pro' | 'enterprise';
export type OrganizationStatus = 'active' | 'inactive' | 'suspended';
export type MemberRole = 'owner' | 'admin' | 'member';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  plan: SubscriptionPlan;
  status: OrganizationStatus;
  primary_color?: string | null;
  max_users: number;
  max_projects: number;
  created_at: string;
  updated_at: string;
  member_count?: number;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: MemberRole;
  invited_by?: string | null;
  created_at: string;
  updated_at: string;
  profile?: {
    email: string;
    display_name?: string | null;
    avatar_url?: string | null;
  };
}

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  display_name?: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export const PLAN_LIMITS: Record<SubscriptionPlan, { maxUsers: number; maxProjects: number; features: string[] }> = {
  free: {
    maxUsers: 5,
    maxProjects: 3,
    features: ['Basic analytics', 'Email support'],
  },
  pro: {
    maxUsers: 25,
    maxProjects: 20,
    features: ['Advanced analytics', 'Priority support', 'API access', 'Custom integrations'],
  },
  enterprise: {
    maxUsers: -1,
    maxProjects: -1,
    features: ['Unlimited everything', 'Dedicated support', 'SSO/SAML', 'Custom contracts', 'SLA'],
  },
};
