import { Organization } from '@/types/organization';
import { Building2, Users, Crown, AlertTriangle } from 'lucide-react';

interface StatsCardsProps {
  organizations: Organization[];
}

export function StatsCards({ organizations }: StatsCardsProps) {
  const totalOrgs = organizations.length;
  const totalMembers = organizations.reduce((sum, org) => sum + (org.member_count ?? 0), 0);
  const enterpriseOrgs = organizations.filter((org) => org.plan === 'enterprise').length;
  const suspendedOrgs = organizations.filter((org) => org.status === 'suspended').length;

  const stats = [
    {
      label: 'Total Organizations',
      value: totalOrgs,
      icon: Building2,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Total Members',
      value: totalMembers,
      icon: Users,
      color: 'text-plan-enterprise',
      bgColor: 'bg-plan-enterprise/10',
    },
    {
      label: 'Enterprise',
      value: enterpriseOrgs,
      icon: Crown,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      label: 'Suspended',
      value: suspendedOrgs,
      icon: AlertTriangle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className="bg-card rounded-lg border p-5 shadow-card animate-slide-up transition-shadow hover:shadow-card-hover"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">{stat.value.toLocaleString()}</p>
            </div>
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
