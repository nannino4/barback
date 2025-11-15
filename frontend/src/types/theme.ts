/**
 * Theme Types
 * Shared type definitions for the theme system
 */

export type Theme = 'light' | 'dark' | 'system'

/**
 * Resolved theme type
 * Represents the actual applied theme (never 'system')
 */
export type ResolvedTheme = Exclude<Theme, 'system'>
