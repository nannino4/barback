import { Link } from 'react-router-dom';
import { Settings, Building2, User, HelpCircle, ChevronRight } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';
import { useOrganizations } from '@/hooks/useOrganizations';
import { PageContainer } from '@/components/layout/PageContainer';
import { Section } from '@/components/layout/Section';
import { Stack } from '@/components/layout/Stack';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { ROUTES } from '@/constants/routes';

interface MoreMenuItem
{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  to: string;
  show?: boolean;
}

/**
 * MorePage - Additional actions and settings (mobile)
 * 
 * This page provides quick access to:
 * - Organization settings (role-gated)
 * - User profile
 * - Help & support (future)
 * 
 * Acts as the "More" tab in mobile bottom navigation.
 */
export function MorePage()
{
  const { t } = useI18n();
  const { currentOrg } = useOrganizations();

  // Check if user can access org settings (owner or manager)
  const canAccessOrgSettings = currentOrg && 
    (currentOrg.role === 'OWNER' || currentOrg.role === 'MANAGER');

  const menuItems: MoreMenuItem[] = [
    {
      icon: Settings,
      label: t('nav.orgSettings'),
      description: t('more.orgSettingsDescription'),
      to: currentOrg 
        ? ROUTES.ORGS.DETAIL.replace(':orgId', currentOrg.org.id)
        : ROUTES.ORGS.ROOT,
      show: !!canAccessOrgSettings,
    },
    {
      icon: Building2,
      label: t('menu.myVenues'),
      description: t('more.myVenuesDescription'),
      to: ROUTES.ORGS.ROOT,
      show: true,
    },
    {
      icon: User,
      label: t('more.profile'),
      description: t('more.profileDescription'),
      to: ROUTES.USERS.ME,
      show: true,
    },
    {
      icon: HelpCircle,
      label: t('more.help'),
      description: t('more.helpDescription'),
      to: '#', // Future: link to help/support page
      show: true,
    },
  ];

  const visibleItems = menuItems.filter((item) => item.show);

  return (
    <PageContainer>
      <Section>
        <Stack space="md">
          <h1 className="font-heading text-2xl font-bold text-foreground">
            {t('nav.more')}
          </h1>

          <Stack space="sm">
            {visibleItems.map((item) =>
            {
              const ItemIcon = item.icon;
              return (
                <Link key={item.label} to={item.to} className="block">
                  <Card variant="bordered" className="hover:bg-muted/50 transition-colors">
                    <Stack direction="horizontal" space="md" align="center">
                      <Icon size="md" variant="muted">
                        <ItemIcon />
                      </Icon>
                      <Stack space="xs" className="flex-1 min-w-0">
                        <span className="font-medium">
                          {item.label}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {item.description}
                        </span>
                      </Stack>
                      <Icon mode="inline" size="sm" variant="muted">
                        <ChevronRight />
                      </Icon>
                    </Stack>
                  </Card>
                </Link>
              );
            })}
          </Stack>
        </Stack>
      </Section>
    </PageContainer>
  );
}
