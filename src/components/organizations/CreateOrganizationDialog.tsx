import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Organization, SubscriptionPlan } from '@/types/organization';
import { Building2 } from 'lucide-react';

interface CreateOrganizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; slug: string; plan: SubscriptionPlan }) => void;
  editingOrg?: Organization | null;
  isSubmitting?: boolean;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function CreateOrganizationDialog({
  open,
  onOpenChange,
  onSubmit,
  editingOrg,
  isSubmitting = false,
}: CreateOrganizationDialogProps) {
  const [name, setName] = useState(editingOrg?.name || '');
  const [slug, setSlug] = useState(editingOrg?.slug || '');
  const [plan, setPlan] = useState<SubscriptionPlan>(editingOrg?.plan || 'free');

  const isEditing = !!editingOrg;

  const handleNameChange = (value: string) => {
    setName(value);
    if (!isEditing) {
      setSlug(generateSlug(value));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, slug, plan });
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setName('');
      setSlug('');
      setPlan('free');
    }
    onOpenChange(newOpen);
  };

  // Update form when editingOrg changes
  if (editingOrg && name !== editingOrg.name) {
    setName(editingOrg.name);
    setSlug(editingOrg.slug);
    setPlan(editingOrg.plan);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-lg bg-primary/10">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <DialogTitle>{isEditing ? 'Edit Organization' : 'Create Organization'}</DialogTitle>
                <DialogDescription className="mt-0.5">
                  {isEditing
                    ? 'Update organization settings and plan.'
                    : 'Add a new organization to manage.'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name</Label>
              <Input
                id="name"
                placeholder="Acme Corporation"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">/</span>
                <Input
                  id="slug"
                  placeholder="acme-corp"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  disabled={isEditing}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan">Subscription Plan</Label>
              <Select value={plan} onValueChange={(value) => setPlan(value as SubscriptionPlan)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">
                    <div className="flex items-center gap-2">
                      <span>Free</span>
                      <span className="text-xs text-muted-foreground">5 users, 3 projects</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="pro">
                    <div className="flex items-center gap-2">
                      <span>Pro</span>
                      <span className="text-xs text-muted-foreground">25 users, 20 projects</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="enterprise">
                    <div className="flex items-center gap-2">
                      <span>Enterprise</span>
                      <span className="text-xs text-muted-foreground">Unlimited</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !name || !slug}>
              {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Organization'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
