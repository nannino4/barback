import React from 'react';
import { Building2, Settings, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InlineSpinner } from '@/components/ui/spinner';
import { Icon } from '@/components/ui/icon';
import { Stack } from '@/components/layout';
import { UserInfo } from '@/components/user';
import { OrgRoleBadge } from './OrgRoleBadge';
import { useI18n } from '@/hooks/useI18n';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import type { OrganizationMembership } from '@/types/organization';

interface OrganizationCardProps
{
  organization: OrganizationMembership;
  onSelect: (org: OrganizationMembership) => void;
  isSelected?: boolean;
  isLoading?: boolean;
}

export const OrganizationCard: React.FC<OrganizationCardProps> = ({
  organization,
  onSelect,
  isSelected = false,
  isLoading = false,
}) =>
{
  const { t } = useI18n();
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);

  const canManage = currentUser?.id === organization.org.owner.id;

  const handleManageClick = () =>
  {
    void navigate(`/org/${organization.org.id}/manage`);
  };

  const handleSelectClick = () =>
  {
    if (!isSelected && !isLoading)
    {
      onSelect(organization);
    }
  };

  return (
    <Card
      variant={isSelected ? 'primary' : 'default'}
      className={cn(isLoading && 'opacity-60')}
    >
      <CardContent>
        <Stack 
          direction="horizontal" 
          justify="between" 
          align="center"
          className="min-h-11"
        >
          <OrgRoleBadge role={organization.role} />
          {canManage && (
            <Button
              variant="muted"
              onClick={handleManageClick}
            >
              <Settings />
              {t('organizations.manage')}
            </Button>
          )}
        </Stack>
        <Stack direction="horizontal" space="md" align="center">
          <Icon
            size="lg"
            variant='muted'
          >
            <Building2 />
          </Icon>
          <Stack space='sm'>
            <CardTitle className="font-heading text-xl md:text-2xl truncate">
              {organization.org.name}
            </CardTitle>
            <CardDescription>
              <UserInfo 
                user={organization.org.owner} 
                size="sm"
              />
            </CardDescription>
          </Stack>
        </Stack>
      </CardContent>

      <CardFooter>
        <Button
          variant='ghost'
          className="w-full text-primary"
          disabled={isLoading || isSelected}
          onClick={handleSelectClick}
        >
          {isLoading ? (
            <>
              <InlineSpinner />
              {t('common.loading')}
            </>
          ) : isSelected ? (
            <>
              <Check />
              {t('organizations.selected')}
            </>
          ) : (
            t('organizations.select')
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
