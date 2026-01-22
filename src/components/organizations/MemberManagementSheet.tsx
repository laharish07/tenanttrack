import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Organization, MemberRole } from '@/types/organization';
import { useOrganizationMembers } from '@/hooks/useOrganizationMembers';
import { useAuth } from '@/hooks/useAuth';
import { 
  Users, 
  UserPlus, 
  MoreHorizontal, 
  Crown, 
  Shield, 
  User, 
  Trash2,
  Mail,
  Clock,
  X,
  Loader2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface MemberManagementSheetProps {
  organization: Organization | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const roleIcons: Record<MemberRole, React.ReactNode> = {
  owner: <Crown className="w-3.5 h-3.5" />,
  admin: <Shield className="w-3.5 h-3.5" />,
  member: <User className="w-3.5 h-3.5" />,
};

const roleColors: Record<MemberRole, string> = {
  owner: 'bg-warning/10 text-warning border-warning/20',
  admin: 'bg-primary/10 text-primary border-primary/20',
  member: 'bg-secondary text-muted-foreground border-border',
};

export function MemberManagementSheet({
  organization,
  open,
  onOpenChange,
}: MemberManagementSheetProps) {
  const { user } = useAuth();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<MemberRole>('member');
  
  const {
    members,
    invitations,
    isLoading,
    inviteMember,
    updateRole,
    removeMember,
    cancelInvitation,
  } = useOrganizationMembers(organization?.id ?? null);

  const currentUserMember = members.find((m) => m.user_id === user?.id);
  const isAdmin = currentUserMember?.role === 'owner' || currentUserMember?.role === 'admin';

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    await inviteMember.mutateAsync({ email: inviteEmail, role: inviteRole });
    setInviteEmail('');
    setInviteRole('member');
  };

  if (!organization) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <SheetTitle>Team Members</SheetTitle>
              <SheetDescription>{organization.name}</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Invite Form */}
          {isAdmin && (
            <>
              <form onSubmit={handleInvite} className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <UserPlus className="w-4 h-4" />
                  Invite New Member
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as MemberRole)}>
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={inviteMember.isPending || !inviteEmail}
                >
                  {inviteMember.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <UserPlus className="w-4 h-4 mr-2" />
                  )}
                  Send Invitation
                </Button>
              </form>
              <Separator />
            </>
          )}

          {/* Pending Invitations */}
          {invitations.length > 0 && (
            <>
              <div>
                <div className="flex items-center gap-2 text-sm font-medium mb-3">
                  <Mail className="w-4 h-4" />
                  Pending Invitations
                </div>
                <div className="space-y-2">
                  {invitations.map((invitation: any) => (
                    <div
                      key={invitation.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 animate-fade-in"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{invitation.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Expires {formatDistanceToNow(new Date(invitation.expires_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn('text-xs', roleColors[invitation.role as MemberRole])}>
                          {invitation.role}
                        </Badge>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => cancelInvitation.mutate(invitation.id)}
                            disabled={cancelInvitation.isPending}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Members List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Users className="w-4 h-4" />
                Members ({members.length})
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-2">
                {members.map((member, index) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-card border animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        {(member.profile?.display_name || member.profile?.email || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {member.profile?.display_name || member.profile?.email}
                          {member.user_id === user?.id && (
                            <span className="ml-1 text-xs text-muted-foreground">(you)</span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">{member.profile?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={cn('text-xs flex items-center gap-1', roleColors[member.role])}
                      >
                        {roleIcons[member.role]}
                        {member.role}
                      </Badge>

                      {isAdmin && member.role !== 'owner' && member.user_id !== user?.id && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => updateRole.mutate({
                                memberId: member.id,
                                role: member.role === 'admin' ? 'member' : 'admin',
                              })}
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              {member.role === 'admin' ? 'Demote to Member' : 'Promote to Admin'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => removeMember.mutate(member.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
