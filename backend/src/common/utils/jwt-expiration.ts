import type { StringValue } from 'ms';

export type JwtExpiresIn = number | StringValue;

export function parseJwtExpiration(expiresIn: string): JwtExpiresIn 
{
    const trimmed = expiresIn.trim();
    if (trimmed.length === 0) 
    {
        return expiresIn as unknown as StringValue;
    }

    if (/^\d+$/.test(trimmed)) 
    {
        return Number(trimmed);
    }

    return trimmed as unknown as StringValue;
}

export function isJwtExpiredError(error: unknown): boolean 
{
    if (!error || typeof error !== 'object') 
    {
        return false;
    }

    const name = (error as { name?: unknown }).name;
    return name === 'TokenExpiredError';
}
