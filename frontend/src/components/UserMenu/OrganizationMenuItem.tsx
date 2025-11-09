import { Building2, ChevronRight } from 'lucide-react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useI18n } from '@/hooks/useI18n';
import type { OrganizationMembership } from '@/types/organization';

interface OrganizationMenuItemProps {
  currentOrg: OrganizationMembership | null;
  onClick: () => void;
  variant: 'dropdown' | 'mobile';
}

/**
 * OrganizationMenuItem - Displays current organization or "no organizations" state
 * 
 * Shows the current organization name with a link to /organizations page,
 * or displays a message if no organizations are available.
 */
export const OrganizationMenuItem: React.FC<OrganizationMenuItemProps> = ({ 
  currentOrg, 
  onClick,
  variant,
}) =>
{
  const { t } = useI18n();

  if (variant === 'dropdown')
  {
    if (currentOrg)
    {
      return (
        <DropdownMenuItem
          onClick={onClick}
          className="cursor-pointer"
          aria-label={t('menu.viewOrganizations')}
        >
          <Building2 className="mr-2 h-4 w-4" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">
              {t('menu.currentVenue')}
            </p>
            <p className="text-sm font-medium truncate">
              {currentOrg.org.name}
            </p>
          </div>
          <ChevronRight className="ml-2 h-4 w-4" />
        </DropdownMenuItem>
      );
    }

    return (
      <DropdownMenuItem
        onClick={onClick}
        className="cursor-pointer"
        aria-label={t('menu.viewOrganizations')}
      >
        <Building2 className="mr-2 h-4 w-4" />
        <span className="text-sm text-muted-foreground">
          {t('organizations.noOrganizations')}
        </span>
        <ChevronRight className="ml-auto h-4 w-4" />
      </DropdownMenuItem>
    );
  }

  // Mobile variant
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full py-4 border-b border-border hover:bg-muted/50 transition-colors"
      aria-label={t('menu.viewOrganizations')}
    >
      {currentOrg ? (
        <div className="flex items-center gap-3 px-2 py-2">
          <Building2 className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1 min-w-0 text-left">
            <p className="text-xs text-muted-foreground">
              {t('menu.currentVenue')}
            </p>
            <p className="text-sm font-medium truncate">
              {currentOrg.org.name}
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      ) : (
        <div className="flex items-center gap-3 px-2 py-2">
          <Building2 className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground flex-1 text-left">
            {t('organizations.noOrganizations')}
          </span>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
    </button>
  );
};
