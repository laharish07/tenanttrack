import { useState } from 'react';
import { Organization, SubscriptionPlan } from '@/types/organization';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useAuth } from '@/hooks/useAuth';
import { AuthForm } from '@/components/auth/AuthForm';
import { StatsCards } from '@/components/organizations/StatsCards';
import { OrganizationTable } from '@/components/organizations/OrganizationTable';
import { CreateOrganizationDialog } from '@/components/organizations/CreateOrganizationDialog';
import { OrganizationDetailsSheet } from '@/components/organizations/OrganizationDetailsSheet';
import { DeleteOrganizationDialog } from '@/components/organizations/DeleteOrganizationDialog';
import { MemberManagementSheet } from '@/components/organizations/MemberManagementSheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Building2, LogOut, Loader2 } from 'lucide-react';

const Index = () => {
  const { isAuthenticated, isLoading: authLoading, user, signOut } = useAuth();
  const { organizations, isLoading, createOrganization, updateOrganization, deleteOrganization } = useOrganizations();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [viewingOrg, setViewingOrg] = useState<Organization | null>(null);
  const [deletingOrg, setDeletingOrg] = useState<Organization | null>(null);
  const [managingMembersOrg, setManagingMembersOrg] = useState<Organization | null>(null);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthForm />;
  }

  const filteredOrganizations = organizations.filter(
    (org) =>
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateOrUpdate = async (data: { name: string; slug: string; plan: SubscriptionPlan }) => {
    if (editingOrg) {
      await updateOrganization.mutateAsync({ 
        id: editingOrg.id,
        name: data.name,
        plan: data.plan,
      });
      setEditingOrg(null);
    } else {
      await createOrganization.mutateAsync(data);
    }
    setCreateDialogOpen(false);
  };

  const handleDelete = async (org: Organization) => {
    await deleteOrganization.mutateAsync(org.id);
  };

  const handleView = (org: Organization) => {
    setViewingOrg(org);
  };

  const handleEdit = (org: Organization) => {
    setEditingOrg(org);
    setCreateDialogOpen(true);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary">
                <Building2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">TenantTrack</h1>
                <p className="text-sm text-muted-foreground">Manage your tenants and subscriptions</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden sm:block">{user?.email}</span>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Organization
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats */}
        <StatsCards organizations={organizations} />

        {/* Search & Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search organizations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredOrganizations.length > 0 ? (
          <OrganizationTable
            organizations={filteredOrganizations}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={setDeletingOrg}
            onManageMembers={setManagingMembersOrg}
          />
        ) : (
          <div className="text-center py-16 bg-card rounded-lg border">
            <Building2 className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-1">No organizations found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? 'Try adjusting your search terms'
                : 'Get started by creating your first organization'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Organization
              </Button>
            )}
          </div>
        )}
      </main>

      {/* Dialogs */}
      <CreateOrganizationDialog
        open={createDialogOpen}
        onOpenChange={(open) => {
          setCreateDialogOpen(open);
          if (!open) setEditingOrg(null);
        }}
        onSubmit={handleCreateOrUpdate}
        editingOrg={editingOrg}
        isSubmitting={createOrganization.isPending || updateOrganization.isPending}
      />

      <OrganizationDetailsSheet
        organization={viewingOrg}
        open={!!viewingOrg}
        onOpenChange={(open) => !open && setViewingOrg(null)}
        onEdit={handleEdit}
        onDelete={setDeletingOrg}
        onManageMembers={setManagingMembersOrg}
      />

      <DeleteOrganizationDialog
        organization={deletingOrg}
        open={!!deletingOrg}
        onOpenChange={(open) => !open && setDeletingOrg(null)}
        onConfirm={handleDelete}
      />

      <MemberManagementSheet
        organization={managingMembersOrg}
        open={!!managingMembersOrg}
        onOpenChange={(open) => !open && setManagingMembersOrg(null)}
      />
    </div>
  );
};

export default Index;
