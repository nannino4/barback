import { useState, useEffect } from 'react';

/**
 * Custom hook for managing cooldown timers with localStorage persistence
 * @param storageKey - Unique key for localStorage persistence
 * @param durationMs - Cooldown duration in milliseconds
 * @returns Object with cooldown state and control functions
 */
export const useCooldown = (storageKey: string, durationMs: number) =>
{
  /**
   * Get initial cooldown from localStorage if it exists and is still valid
   */
  const getInitialCooldown = (): number =>
  {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return 0;

    try
    {
      const data = JSON.parse(stored) as { expiresAt: number };
      const remaining = Math.max(0, Math.ceil((data.expiresAt - Date.now()) / 1000));
      return remaining;
    }
    catch
    {
      return 0;
    }
  };

  const [seconds, setSeconds] = useState(getInitialCooldown());

  /**
   * Start or restart the cooldown timer
   * @param customDuration - Optional custom duration in milliseconds (defaults to durationMs)
   */
  const startCooldown = (customDuration?: number) =>
  {
    const duration = customDuration ?? durationMs;
    setSeconds(Math.ceil(duration / 1000));
  };

  /**
   * Check if cooldown is currently active
   */
  const isActive = seconds > 0;

  /**
   * Cooldown timer effect with localStorage persistence
   */
  useEffect(() =>
  {
    if (seconds > 0)
    {
      // Save cooldown expiration to localStorage
      const expiresAt = Date.now() + (seconds * 1000);
      localStorage.setItem(storageKey, JSON.stringify({ expiresAt }));

      const timer = setTimeout(() =>
      {
        setSeconds(seconds - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }
    else
    {
      // Clear localStorage when cooldown reaches 0
      localStorage.removeItem(storageKey);
    }
  }, [seconds, storageKey]);

  return {
    seconds,
    isActive,
    startCooldown,
  };
};
