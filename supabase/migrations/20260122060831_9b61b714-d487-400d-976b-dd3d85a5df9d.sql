-- Drop the overly permissive INSERT policy
DROP POLICY "Authenticated users can create organizations" ON public.organizations;

-- Drop the restrictive member insert policy (we'll handle this via function)
DROP POLICY "Org admins can add members" ON public.organization_members;

-- Create a secure function to create an organization with the creator as owner
CREATE OR REPLACE FUNCTION public.create_organization_with_owner(
  org_name TEXT,
  org_slug TEXT,
  org_plan subscription_plan DEFAULT 'free'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_org_id UUID;
  current_user_id UUID;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Create the organization
  INSERT INTO public.organizations (name, slug, plan)
  VALUES (org_name, org_slug, org_plan)
  RETURNING id INTO new_org_id;
  
  -- Add the creator as owner
  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (new_org_id, current_user_id, 'owner');
  
  RETURN new_org_id;
END;
$$;

-- Create a secure function to add members (only callable by admins)
CREATE OR REPLACE FUNCTION public.add_organization_member(
  org_id UUID,
  member_user_id UUID,
  member_role member_role DEFAULT 'member'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_member_id UUID;
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Check if current user is admin/owner of the org
  IF NOT public.is_org_admin(org_id) THEN
    RAISE EXCEPTION 'Only admins can add members';
  END IF;
  
  -- Prevent self-invitation
  IF member_user_id = current_user_id THEN
    RAISE EXCEPTION 'Cannot add yourself';
  END IF;
  
  -- Prevent creating owners via this function
  IF member_role = 'owner' THEN
    RAISE EXCEPTION 'Cannot assign owner role via this function';
  END IF;
  
  -- Add the member
  INSERT INTO public.organization_members (organization_id, user_id, role, invited_by)
  VALUES (org_id, member_user_id, member_role, current_user_id)
  RETURNING id INTO new_member_id;
  
  RETURN new_member_id;
END;
$$;

-- Now we need a policy that allows the security definer functions to work
-- The function runs with definer privileges, so we just need to prevent direct inserts
CREATE POLICY "No direct organization inserts"
  ON public.organizations FOR INSERT
  TO authenticated
  WITH CHECK (false);

CREATE POLICY "No direct member inserts"
  ON public.organization_members FOR INSERT
  TO authenticated
  WITH CHECK (false);