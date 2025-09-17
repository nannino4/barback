import React from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageToggle } from '@/components/LanguageToggle';
import { cn } from '@/lib/utils';

interface AuthLayoutProps
{
    children: React.ReactNode;
    className?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  className, 
}) =>
{
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      {/* Header Controls */}
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        <LanguageToggle />
        <ThemeToggle />
      </div>
            
      <div className={cn("w-full max-w-md space-y-8", className)}>
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="font-heading text-4xl font-semibold text-foreground">
                        Barback
          </h1>
          <p className="font-body text-sm text-muted-foreground">
                        Inventory management for cocktail bars
          </p>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
};
