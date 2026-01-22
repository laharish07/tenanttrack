import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Organization, PLAN_LIMITS } from '@/types/organization';
import { OrganizationAvatar } from './OrganizationAvatar';
import { PlanBadge } from './PlanBadge';
import { StatusBadge } from './StatusBadge';
import { format } from 'date-fns';
import { Pencil, Trash2, Users, FolderKanban, Check } from 'lucide-react';

interface OrganizationDetailsSheetProps {
  organization: Organization | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (org: Organization) => void;
  onDelete: (org: Organization) => void;
  onManageMembers: (org: Organization) => void;
}

export function OrganizationDetailsSheet({
  organization,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  onManageMembers,
}: OrganizationDetailsSheetProps) {
  if (!organization) return null;

  const planLimits = PLAN_LIMITS[organization.plan];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <OrganizationAvatar name={organization.name} logo={organization.logo_url ?? undefined} size="lg" />
              <div>
                <SheetTitle className="text-xl">{organization.name}</SheetTitle>
                <SheetDescription className="mt-0.5">/{organization.slug}</SheetDescription>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PlanBadge plan={organization.plan} />
            <StatusBadge status={organization.status} />
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-secondary/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">Members</span>
              </div>
              <p className="text-2xl font-bold">{organization.member_count ?? 0}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                of {organization.max_users === -1 ? 'unlimited' : organization.max_users}
              </p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <FolderKanban className="w-4 h-4" />
                <span className="text-sm font-medium">Projects</span>
              </div>
              <p className="text-2xl font-bold">—</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                max {organization.max_projects === -1 ? 'unlimited' : organization.max_projects}
              </p>
            </div>
          </div>

          <Separator />

          {/* Plan Features */}
          <div>
            <h3 className="font-semibold mb-3">Plan Features</h3>
            <ul className="space-y-2">
              {planLimits.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <div className="p-0.5 rounded-full bg-primary/10">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <Separator />

          {/* Timestamps */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Created</span>
              <span className="font-medium">
                {format(new Date(organization.created_at), 'MMM d, yyyy')}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Last updated</span>
              <span className="font-medium">
                {format(new Date(organization.updated_at), 'MMM d, yyyy')}
              </span>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                onManageMembers(organization);
                onOpenChange(false);
              }}
            >
              <Users className="w-4 h-4 mr-2" />
              Manage Members
            </Button>
            <Button
              className="w-full"
              onClick={() => {
                onEdit(organization);
                onOpenChange(false);
              }}
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit Settings
            </Button>
            <Button
              variant="outline"
              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => {
                onDelete(organization);
                onOpenChange(false);
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Organization
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
