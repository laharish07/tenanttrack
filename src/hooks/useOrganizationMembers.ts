import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { OrganizationMember, MemberRole } from '@/types/organization';
import { toast } from 'sonner';

export function useOrganizationMembers(organizationId: string | null) {
  const queryClient = useQueryClient();

  const { data: members = [], isLoading, error } = useQuery({
    queryKey: ['organization-members', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          *,
          profile:profiles!organization_members_user_id_fkey(email, display_name, avatar_url)
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return (data || []).map((member: any) => ({
        ...member,
        profile: member.profile || { email: 'Unknown', display_name: null, avatar_url: null },
      })) as OrganizationMember[];
    },
    enabled: !!organizationId,
  });

  const { data: invitations = [], isLoading: invitationsLoading } = useQuery({
    queryKey: ['organization-invitations', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from('organization_invitations')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!organizationId,
  });

  const inviteMember = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: MemberRole }) => {
      const { data, error } = await supabase.rpc('invite_organization_member', {
        org_id: organizationId,
        invite_email: email,
        invite_role: role,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['organization-members', organizationId] });
      queryClient.invalidateQueries({ queryKey: ['organization-invitations', organizationId] });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      
      if (data?.status === 'added') {
        toast.success('Member added to organization');
      } else {
        toast.success('Invitation sent successfully');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateRole = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: MemberRole }) => {
      const { error } = await supabase.rpc('update_member_role', {
        member_id: memberId,
        new_role: role,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-members', organizationId] });
      toast.success('Member role updated');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const removeMember = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase.rpc('remove_organization_member', {
        member_id: memberId,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-members', organizationId] });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success('Member removed from organization');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const cancelInvitation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from('organization_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-invitations', organizationId] });
      toast.success('Invitation cancelled');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    members,
    invitations,
    isLoading: isLoading || invitationsLoading,
    error,
    inviteMember,
    updateRole,
    removeMember,
    cancelInvitation,
  };
}
