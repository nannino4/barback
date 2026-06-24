import { Toaster } from 'react-hot-toast';

/**
 * AppToaster
 *
 * Central place for toast UX/styling.
 *
 * Notes:
 * - Keep visual styling aligned with theme tokens (bg-card, border-border, etc.).
 * - Default to a mobile-friendly position.
 */
export function AppToaster()
{
  return (
    <Toaster
      position="bottom-center"
      toastOptions={{
        duration: 4000,
        className:
          'bg-card text-card-foreground border border-border rounded-lg ' +
          'font-body text-sm px-4 py-3',
      }}
      containerStyle={{
        paddingLeft: '12px',
        paddingRight: '12px',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)',
      }}
    />
  );
}
