import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/hooks/useI18n';
import type { OrgRole } from '@/types/organization';

interface OrganizationFiltersProps
{
  searchQuery: string;
  onSearchChange: (query: string) => void;
  roleFilter: OrgRole | 'all';
  onRoleFilterChange: (role: OrgRole | 'all') => void;
}

/**
 * OrganizationFilters - Search and filter controls for organization list
 * 
 * Features:
 * - Search input with debounce
 * - Role filter dropdown (All, Owner, Manager, Staff)
 * - Clear filters button
 * - Active filter indicators
 */
export const OrganizationFilters: React.FC<OrganizationFiltersProps> = ({
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
}) =>
{
  const { t } = useI18n();

  const hasActiveFilters = searchQuery.length > 0 || roleFilter !== 'all';

  const getRoleLabel = (role: OrgRole | 'all'): string =>
  {
    if (role === 'all')
    {
      return t('organizations.role.all');
    }
    const roleKey = role.toLowerCase() as 'owner' | 'manager' | 'staff';
    return t(`organizations.role.${roleKey}`);
  };

  const handleClearFilters = () =>
  {
    onSearchChange('');
    onRoleFilterChange('all');
  };

  const roleOptions: Array<OrgRole | 'all'> = ['all', 'OWNER', 'MANAGER', 'STAFF'];

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={t('organizations.filters.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 pr-9"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Role Filter Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full sm:w-auto justify-between gap-2"
          >
            {getRoleLabel(roleFilter)}
            {roleFilter !== 'all' && (
              <Badge variant="secondary" className="ml-1">
                1
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {roleOptions.map((role) => (
            <DropdownMenuItem
              key={role}
              onClick={() => onRoleFilterChange(role)}
              className="cursor-pointer"
            >
              <span className="flex-1">{getRoleLabel(role)}</span>
              {role === roleFilter && (
                <Badge variant="secondary" className="ml-2">
                  ✓
                </Badge>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearFilters}
          className="w-full sm:w-auto"
        >
          <X className="w-4 h-4 mr-1" />
          {t('organizations.filters.clearFilters')}
        </Button>
      )}
    </div>
  );
};
