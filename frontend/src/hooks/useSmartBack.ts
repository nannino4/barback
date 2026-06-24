import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { To } from 'react-router-dom';

/**
 * Returns a "smart back" handler:
 * - If the app can go back in history, it uses `navigate(-1)` (preserves scroll via ScrollRestoration).
 * - Otherwise, it navigates to `fallback` (using replace by default).
 */
export function useSmartBack(fallback: To, options?: { replace?: boolean })
{
  const navigate = useNavigate();

  return useCallback(() =>
  {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;

    if (idx > 0)
    {
      void navigate(-1);
      return;
    }

    void navigate(fallback, { replace: options?.replace ?? true });
  }, [navigate, fallback, options?.replace]);
}
