import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AuthCardProps
{
    title: string;
    description?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
}

export const AuthCard: React.FC<AuthCardProps> = ({ 
  title, 
  description, 
  children, 
  footer,
  className, 
}) =>
{
  return (
    <Card className={cn('w-full max-w-md mx-auto bg-card border-border', className)}>
      <CardHeader className="text-center space-y-2">
        <CardTitle className="font-heading text-2xl font-semibold text-foreground">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="font-body text-sm text-muted-foreground">
            {description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {children}
        {footer && (
          <div className="text-center">
            {footer}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface AuthFooterLinkProps
{
    text: string;
    linkText: string;
    linkTo: string;
}

export const AuthFooterLink: React.FC<AuthFooterLinkProps> = ({ 
  text, 
  linkText, 
  linkTo, 
}) =>
{
  return (
    <p className="font-body text-sm text-muted-foreground">
      {text}{' '}
      <Link
        to={linkTo}
        className="text-primary hover:text-primary/80 font-medium transition-colors"
      >
        {linkText}
      </Link>
    </p>
  );
};
