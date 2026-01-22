import { Organization } from '@/types/organization';
import { OrganizationAvatar } from './OrganizationAvatar';
import { PlanBadge } from './PlanBadge';
import { StatusBadge } from './StatusBadge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Pencil, Trash2, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface OrganizationTableProps {
  organizations: Organization[];
  onView: (org: Organization) => void;
  onEdit: (org: Organization) => void;
  onDelete: (org: Organization) => void;
  onManageMembers?: (org: Organization) => void;
}

export function OrganizationTable({
  organizations,
  onView,
  onEdit,
  onDelete,
  onManageMembers,
}: OrganizationTableProps) {
  return (
    <div className="rounded-lg border bg-card shadow-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/50 hover:bg-secondary/50">
            <TableHead className="font-semibold">Organization</TableHead>
            <TableHead className="font-semibold">Plan</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Members</TableHead>
            <TableHead className="font-semibold">Created</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {organizations.map((org, index) => (
            <TableRow
              key={org.id}
              className="cursor-pointer transition-colors hover:bg-secondary/30 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => onView(org)}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <OrganizationAvatar name={org.name} logo={org.logo_url ?? undefined} size="sm" />
                  <div>
                    <p className="font-medium">{org.name}</p>
                    <p className="text-xs text-muted-foreground">/{org.slug}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <PlanBadge plan={org.plan} />
              </TableCell>
              <TableCell>
                <StatusBadge status={org.status} />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{org.member_count ?? 0}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {formatDistanceToNow(new Date(org.created_at), { addSuffix: true })}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(org); }}>
                      <Eye className="mr-2 h-4 w-4" />
                      View details
                    </DropdownMenuItem>
                    {onManageMembers && (
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onManageMembers(org); }}>
                        <Users className="mr-2 h-4 w-4" />
                        Manage members
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(org); }}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={(e) => { e.stopPropagation(); onDelete(org); }}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
