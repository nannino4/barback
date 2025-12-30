import { UserMenuDesktop } from './UserMenuDesktop';
import { UserMenuMobile } from './UserMenuMobile';

// Re-export for external use
export { OrganizationSwitcherPopover } from './OrganizationSwitcherPopover';
export { OrganizationSwitcherSheet } from './OrganizationSwitcherSheet';

/**
 * UserMenu - Responsive user menu component
 * 
 * Responsive Strategy:
 * - Mobile (< 768px): Sheet component with full-screen slide-out panel
 * - Desktop (>= 768px): DropdownMenu with compact hover interactions
 * - Breakpoint: md (768px) defined in Tailwind config
 * 
 * Menu Structure:
 * - User Info Header
 * - Current Venue (navigates to /organizations)
 * - Account (navigates to /account)
 * - Preferences (theme + language selection)
 * - Logout
 */
export const UserMenu: React.FC = () =>
{
  return (
    <>
      {/* Desktop: Hidden below md breakpoint */}
      <div className="hidden md:block">
        <UserMenuDesktop />
      </div>
      
      {/* Mobile: Hidden at md breakpoint and above */}
      <div className="block md:hidden">
        <UserMenuMobile />
      </div>
    </>
  );
};
