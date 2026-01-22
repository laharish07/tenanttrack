-- Create invitations table for pending invites
CREATE TABLE public.organization_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role member_role NOT NULL DEFAULT 'member',
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  UNIQUE(organization_id, email, status)
);

-- Enable RLS
ALTER TABLE public.organization_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invitations
CREATE POLICY "Org members can view invitations"
  ON public.organization_invitations FOR SELECT
  USING (public.is_org_member(organization_id));

CREATE POLICY "Invited users can view their invitations"
  ON public.organization_invitations FOR SELECT
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "No direct invitation inserts"
  ON public.organization_invitations FOR INSERT
  TO authenticated
  WITH CHECK (false);

CREATE POLICY "Org admins can update invitations"
  ON public.organization_invitations FOR UPDATE
  USING (public.is_org_admin(organization_id));

CREATE POLICY "Invited users can update their own invitations"
  ON public.organization_invitations FOR UPDATE
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Org admins can delete invitations"
  ON public.organization_invitations FOR DELETE
  USING (public.is_org_admin(organization_id));

-- Create index for faster lookups
CREATE INDEX idx_org_invitations_email ON public.organization_invitations(email);
CREATE INDEX idx_org_invitations_org_id ON public.organization_invitations(organization_id);

-- Create function to invite a member by email
CREATE OR REPLACE FUNCTION public.invite_organization_member(
  org_id UUID,
  invite_email TEXT,
  invite_role member_role DEFAULT 'member'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
  existing_user_id UUID;
  result JSONB;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Check if current user is admin/owner of the org
  IF NOT public.is_org_admin(org_id) THEN
    RAISE EXCEPTION 'Only admins can invite members';
  END IF;
  
  -- Prevent inviting as owner
  IF invite_role = 'owner' THEN
    RAISE EXCEPTION 'Cannot invite as owner';
  END IF;
  
  -- Check if user already exists
  SELECT id INTO existing_user_id FROM auth.users WHERE email = invite_email;
  
  IF existing_user_id IS NOT NULL THEN
    -- Check if already a member
    IF EXISTS (SELECT 1 FROM organization_members WHERE organization_id = org_id AND user_id = existing_user_id) THEN
      RAISE EXCEPTION 'User is already a member of this organization';
    END IF;
    
    -- Add directly as member
    INSERT INTO organization_members (organization_id, user_id, role, invited_by)
    VALUES (org_id, existing_user_id, invite_role, current_user_id);
    
    result := jsonb_build_object('status', 'added', 'message', 'User added to organization');
  ELSE
    -- Check for existing pending invitation
    IF EXISTS (SELECT 1 FROM organization_invitations WHERE organization_id = org_id AND email = invite_email AND status = 'pending') THEN
      RAISE EXCEPTION 'Invitation already pending for this email';
    END IF;
    
    -- Create invitation
    INSERT INTO organization_invitations (organization_id, email, role, invited_by)
    VALUES (org_id, invite_email, invite_role, current_user_id);
    
    result := jsonb_build_object('status', 'invited', 'message', 'Invitation sent');
  END IF;
  
  RETURN result;
END;
$$;

-- Create function to accept an invitation
CREATE OR REPLACE FUNCTION public.accept_invitation(invitation_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
  inv RECORD;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Get invitation
  SELECT * INTO inv FROM organization_invitations 
  WHERE id = invitation_id AND status = 'pending';
  
  IF inv IS NULL THEN
    RAISE EXCEPTION 'Invitation not found or already processed';
  END IF;
  
  -- Verify email matches
  IF inv.email != (SELECT email FROM auth.users WHERE id = current_user_id) THEN
    RAISE EXCEPTION 'This invitation is for a different email address';
  END IF;
  
  -- Check if already expired
  IF inv.expires_at < now() THEN
    UPDATE organization_invitations SET status = 'expired' WHERE id = invitation_id;
    RAISE EXCEPTION 'Invitation has expired';
  END IF;
  
  -- Add as member
  INSERT INTO organization_members (organization_id, user_id, role, invited_by)
  VALUES (inv.organization_id, current_user_id, inv.role, inv.invited_by);
  
  -- Update invitation status
  UPDATE organization_invitations SET status = 'accepted' WHERE id = invitation_id;
  
  RETURN jsonb_build_object('status', 'accepted', 'organization_id', inv.organization_id);
END;
$$;

-- Create function to update member role
CREATE OR REPLACE FUNCTION public.update_member_role(
  member_id UUID,
  new_role member_role
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
  member_record RECORD;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Get member record
  SELECT * INTO member_record FROM organization_members WHERE id = member_id;
  
  IF member_record IS NULL THEN
    RAISE EXCEPTION 'Member not found';
  END IF;
  
  -- Check if current user is admin
  IF NOT public.is_org_admin(member_record.organization_id) THEN
    RAISE EXCEPTION 'Only admins can update roles';
  END IF;
  
  -- Cannot change owner role
  IF member_record.role = 'owner' THEN
    RAISE EXCEPTION 'Cannot change owner role';
  END IF;
  
  -- Cannot assign owner role
  IF new_role = 'owner' THEN
    RAISE EXCEPTION 'Cannot assign owner role';
  END IF;
  
  -- Update role
  UPDATE organization_members SET role = new_role WHERE id = member_id;
END;
$$;

-- Create function to remove a member
CREATE OR REPLACE FUNCTION public.remove_organization_member(member_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
  member_record RECORD;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Get member record
  SELECT * INTO member_record FROM organization_members WHERE id = member_id;
  
  IF member_record IS NULL THEN
    RAISE EXCEPTION 'Member not found';
  END IF;
  
  -- Check if current user is admin
  IF NOT public.is_org_admin(member_record.organization_id) THEN
    RAISE EXCEPTION 'Only admins can remove members';
  END IF;
  
  -- Cannot remove owner
  IF member_record.role = 'owner' THEN
    RAISE EXCEPTION 'Cannot remove the owner';
  END IF;
  
  -- Cannot remove self
  IF member_record.user_id = current_user_id THEN
    RAISE EXCEPTION 'Cannot remove yourself';
  END IF;
  
  -- Remove member
  DELETE FROM organization_members WHERE id = member_id;
END;
$$;