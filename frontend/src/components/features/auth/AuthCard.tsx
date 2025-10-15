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
    <Card className={cn('w-full max-w-md mx-auto', className)}>
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-2xl">
          {title}
        </CardTitle>
        {description && (
          <CardDescription>
            {description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent>
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
    <p className="text-sm">
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
