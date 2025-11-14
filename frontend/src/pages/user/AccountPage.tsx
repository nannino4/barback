import { PageContainer } from '@/components/layout/PageContainer';
import { Section } from '@/components/layout/Section';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/hooks/useI18n';
import { User, Mail, Phone } from 'lucide-react';

/**
 * AccountPage - User account information display
 * 
 * Shows basic user information from the auth store.
 * This is a placeholder page for future account management features.
 */
export function AccountPage()
{
  const { user } = useAuth();
  const { t } = useI18n();

  if (!user)
  {
    return null;
  }

  const userFullName = `${user.firstName} ${user.lastName}`;

  return (
    <PageContainer>
      <Section>
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                {t('account.title')}
              </CardTitle>
              <CardDescription>
                {t('account.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture / Avatar */}
              <div className="flex items-center gap-4">
                {user.profilePictureUrl ? (
                  <img
                    src={user.profilePictureUrl}
                    alt={userFullName}
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-2xl font-semibold text-primary-foreground">
                      {`${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-semibold">{userFullName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('account.personalInformation')}
                  </p>
                </div>
              </div>

              {/* User Information */}
              <div className="space-y-4">
                {/* Name */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-muted-foreground">
                      {t('account.fullName')}
                    </p>
                    <p className="text-base">{userFullName}</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-muted-foreground">
                      {t('account.email')}
                    </p>
                    <p className="text-base break-all">{user.email}</p>
                    {user.isEmailVerified && (
                      <p className="text-xs text-success mt-1">
                        {t('account.emailVerified')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Phone Number */}
                {user.phoneNumber && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-muted-foreground">
                        {t('account.phoneNumber')}
                      </p>
                      <p className="text-base">{user.phoneNumber}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Future Features Notice */}
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground text-center">
                  {t('account.futureFeatures')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>
    </PageContainer>
  );
}
