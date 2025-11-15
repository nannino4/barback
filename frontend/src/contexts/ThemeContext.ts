import { createContext } from 'react';
import type { ResolvedTheme } from '@/types/theme';

/**
 * Context to expose the resolved theme ('light' or 'dark')
 * to components that need to know the actual applied theme
 */
export const ResolvedThemeContext = createContext<ResolvedTheme>('dark');
