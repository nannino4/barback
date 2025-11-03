/**
 * i18next Type Declarations
 * 
 * This file provides full type safety for i18next translations.
 * It enables autocomplete and compile-time error checking for translation keys.
 * 
 * How it works:
 * - Imports the English translation file as the source of truth
 * - Extends i18next's module with our translation types
 * - Makes TypeScript aware of all valid translation keys
 * 
 * Benefits:
 * ✅ Autocomplete for all translation keys (t('auth.login.success'))
 * ✅ TypeScript errors for invalid keys (t('auth.invalid.key'))
 * ✅ Type-safe interpolation parameters
 * ✅ Catches typos at compile time, not runtime
 * 
 * Note: If you add new translation keys, restart your TypeScript server:
 * - VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"
 * - Or just restart your dev server
 */

import 'i18next';

// Import our English translations as the type source
// English is the default language and should always be complete
import type enTranslation from '@/locales/en/translation.json';

declare module 'i18next' {
  // Extend the CustomTypeOptions interface
  interface CustomTypeOptions {
    // Specify that we have a 'translation' namespace
    // and its type is derived from our English translation file
    resources: {
      translation: typeof enTranslation;
    };
    
    // Make translation keys strictly typed
    // Setting to false means TypeScript will enforce exact key names
    defaultNS: 'translation';
    
    // Disable returning null - t() always returns a string
    returnNull: false;
    
    // Disable returning objects - only allow leaf values
    returnObjects: false;
    
    // Enable strict mode - no fallback to key name
    // This ensures we catch missing translations at compile time
    returnEmptyString: false;
  }
}
