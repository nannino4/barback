import { useState } from 'react';
import { 
  LogOut, 
  Building2, 
  ChevronRight, 
  User as UserIcon,
  Settings,
  Check,
  Monitor,
  Sun,
  Moon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/hooks/useI18n';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useThemeStore } from '@/stores/themeStore';
import { cn } from '@/lib/utils';

/**
 * UserMenu - Responsive user menu component
 * 
 * Responsive Strategy:
 * - Mobile (< 768px): Sheet component with full-screen slide-out panel
 * - Desktop (>= 768px): DropdownMenu with compact hover interactions
 * - Breakpoint: md (768px) defined in Tailwind config
 * 
 * Desktop (md+): Dropdown menu with compact organization/preferences submenus
 * Mobile: Full-page slide-out sheet with expanded sections
 * 
 * Menu Structure:
 * - User Info Header
 * - Current Venue (navigates to /organizations)
 * - Account (navigates to /account)
 * - Preferences (submenu for theme + language)
 * - Logout
 */
export const UserMenu: React.FC = () =>
{
  const { user, logout } = useAuth();
  const { t, changeLanguage, currentLanguage } = useI18n();
  const navigate = useNavigate();
  const { currentOrg } = useOrganizations();
  const { theme, setTheme } = useThemeStore();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [mobileView, setMobileView] = useState<'main' | 'preferences'>('main');

  if (!user)
  {
    return null;
  }

  const userInitials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  const userFullName = `${user.firstName} ${user.lastName}`;

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') =>
  {
    setTheme(newTheme);
  };

  const handleNavigate = (path: string) =>
  {
    setSheetOpen(false);
    void navigate(path);
  };

  const handleLogout = () =>
  {
    setSheetOpen(false);
    logout();
  };

  // Reset mobile view when sheet closes
  const handleSheetOpenChange = (open: boolean) =>
  {
    setSheetOpen(open);
    if (!open)
    {
      setMobileView('main');
    }
  };

  // Render user avatar button (shared between mobile and desktop)
  const renderUserAvatar = () => (
    <Button
      variant="ghost"
      size="sm"
      className="gap-2"
      aria-label={t('menu.openUserMenu')}
    >
      {user.profilePictureUrl ? (
        <img
          src={user.profilePictureUrl}
          alt={userInitials}
          className="h-8 w-8 rounded-full object-cover"
        />
      ) : (
        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
          <span className="text-sm font-semibold text-primary-foreground">
            {userInitials}
          </span>
        </div>
      )}
      <span className="text-sm font-medium hidden sm:inline-block">
        {user.firstName}
      </span>
    </Button>
  );

  // Desktop view - Dropdown menu (md+)
  return (
    <>
      {/* Desktop Menu (hidden on mobile) */}
      <div className="hidden md:block">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {renderUserAvatar()}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            {/* User Info Header */}
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1 font-normal">
                <p className="text-sm font-medium leading-none">{userFullName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            {/* Current Organization Info - Clickable */}
            {currentOrg ? (
              <DropdownMenuItem
                onClick={() => handleNavigate('/organizations')}
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
            ) : (
              <DropdownMenuItem
                onClick={() => handleNavigate('/organizations')}
                className="cursor-pointer"
                aria-label={t('menu.viewOrganizations')}
              >
                <Building2 className="mr-2 h-4 w-4" />
                <span className="text-sm text-muted-foreground">
                  {t('organizations.noOrganizations')}
                </span>
                <ChevronRight className="ml-auto h-4 w-4" />
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              {/* Account */}
              <DropdownMenuItem
                onClick={() => handleNavigate('/account')}
                className="cursor-pointer"
                aria-label={t('menu.viewAccount')}
              >
                <UserIcon className="mr-2 h-4 w-4" />
                <span>{t('menu.account')}</span>
              </DropdownMenuItem>

              {/* Preferences Submenu */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger aria-label={t('menu.openPreferences')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{t('menu.preferences')}</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-56">
                  {/* Theme Selection */}
                  <DropdownMenuLabel>{t('preferences.theme.title')}</DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => handleThemeChange('light')}
                    className="cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      <span>{t('preferences.theme.light')}</span>
                    </div>
                    {theme === 'light' && <Check className="h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleThemeChange('dark')}
                    className="cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      <span>{t('preferences.theme.dark')}</span>
                    </div>
                    {theme === 'dark' && <Check className="h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleThemeChange('system')}
                    className="cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      <span>{t('preferences.theme.system')}</span>
                    </div>
                    {theme === 'system' && <Check className="h-4 w-4" />}
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {/* Language Selection */}
                  <DropdownMenuLabel>{t('preferences.language.title')}</DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => changeLanguage('en')}
                    className="cursor-pointer flex items-center justify-between"
                  >
                    <span>{t('preferences.language.english')}</span>
                    {currentLanguage === 'en' && <Check className="h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => changeLanguage('it')}
                    className="cursor-pointer flex items-center justify-between"
                  >
                    <span>{t('preferences.language.italian')}</span>
                    {currentLanguage === 'it' && <Check className="h-4 w-4" />}
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* Logout */}
            <DropdownMenuItem
              onClick={logout}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>{t('nav.logout')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile Menu (hidden on desktop) */}
      <div className="block md:hidden">
        <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
          <SheetTrigger asChild>
            {renderUserAvatar()}
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle className="sr-only">
                {mobileView === 'main' ? t('menu.userMenu') : t('menu.preferences')}
              </SheetTitle>
              <SheetDescription className="sr-only">
                {mobileView === 'main' 
                  ? t('menu.userMenuDescription')
                  : t('menu.preferencesDescription')
                }
              </SheetDescription>
            </SheetHeader>

            {/* Main Menu View */}
            {mobileView === 'main' && (
              <div className="flex flex-col h-full pt-6">
                {/* User Info Header */}
                <div className="flex items-center gap-4 pb-6 border-b border-border">
                  {user.profilePictureUrl ? (
                    <img
                      src={user.profilePictureUrl}
                      alt={userInitials}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-xl font-semibold text-primary-foreground">
                        {userInitials}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-semibold truncate">{userFullName}</p>
                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>

                {/* Current Organization - Clickable */}
                <button
                  type="button"
                  onClick={() => handleNavigate('/organizations')}
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
                      <p className="text-sm text-muted-foreground flex-1 text-left">
                        {t('organizations.noOrganizations')}
                      </p>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </button>

                {/* Menu Items */}
                <nav className="flex-1 py-4 space-y-1">
                  {/* Account */}
                  <button
                    type="button"
                    onClick={() => handleNavigate('/account')}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-lg",
                      "hover:bg-muted transition-colors text-left",
                    )}
                    aria-label={t('menu.viewAccount')}
                  >
                    <UserIcon className="h-5 w-5" />
                    <span className="flex-1 font-medium">{t('menu.account')}</span>
                  </button>

                  {/* Preferences */}
                  <button
                    type="button"
                    onClick={() => setMobileView('preferences')}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-lg",
                      "hover:bg-muted transition-colors text-left",
                    )}
                    aria-label={t('menu.openPreferences')}
                  >
                    <Settings className="h-5 w-5" />
                    <span className="flex-1 font-medium">{t('menu.preferences')}</span>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </button>
                </nav>

                {/* Logout Button */}
                <div className="pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-lg",
                      "hover:bg-destructive/10 transition-colors text-left",
                      "text-destructive",
                    )}
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="flex-1 font-medium">{t('nav.logout')}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Preferences View */}
            {mobileView === 'preferences' && (
              <div className="flex flex-col h-full py-6">
                {/* Back Button */}
                <button
                  type="button"
                  onClick={() => setMobileView('main')}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
                >
                  <ChevronRight className="h-4 w-4 rotate-180" />
                  <span>{t('common.back')}</span>
                </button>

                <div className="space-y-6">
                  {/* Theme Selection */}
                  <div>
                    <p className="text-sm font-medium mb-3">
                      {t('preferences.theme.title')}
                    </p>
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => handleThemeChange('light')}
                        className={cn(
                          "w-full flex items-center justify-between px-4 py-3 rounded-lg",
                          "hover:bg-muted transition-colors text-left",
                          theme === 'light' && "bg-muted",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Sun className="h-5 w-5" />
                          <span>{t('preferences.theme.light')}</span>
                        </div>
                        {theme === 'light' && <Check className="h-5 w-5 text-primary" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleThemeChange('dark')}
                        className={cn(
                          "w-full flex items-center justify-between px-4 py-3 rounded-lg",
                          "hover:bg-muted transition-colors text-left",
                          theme === 'dark' && "bg-muted",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Moon className="h-5 w-5" />
                          <span>{t('preferences.theme.dark')}</span>
                        </div>
                        {theme === 'dark' && <Check className="h-5 w-5 text-primary" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleThemeChange('system')}
                        className={cn(
                          "w-full flex items-center justify-between px-4 py-3 rounded-lg",
                          "hover:bg-muted transition-colors text-left",
                          theme === 'system' && "bg-muted",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Monitor className="h-5 w-5" />
                          <span>{t('preferences.theme.system')}</span>
                        </div>
                        {theme === 'system' && <Check className="h-5 w-5 text-primary" />}
                      </button>
                    </div>
                  </div>

                  {/* Language Selection */}
                  <div>
                    <p className="text-sm font-medium mb-3">
                      {t('preferences.language.title')}
                    </p>
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => changeLanguage('en')}
                        className={cn(
                          "w-full flex items-center justify-between px-4 py-3 rounded-lg",
                          "hover:bg-muted transition-colors text-left",
                          currentLanguage === 'en' && "bg-muted",
                        )}
                      >
                        <span>{t('preferences.language.english')}</span>
                        {currentLanguage === 'en' && <Check className="h-5 w-5 text-primary" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => changeLanguage('it')}
                        className={cn(
                          "w-full flex items-center justify-between px-4 py-3 rounded-lg",
                          "hover:bg-muted transition-colors text-left",
                          currentLanguage === 'it' && "bg-muted",
                        )}
                      >
                        <span>{t('preferences.language.italian')}</span>
                        {currentLanguage === 'it' && <Check className="h-5 w-5 text-primary" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};
