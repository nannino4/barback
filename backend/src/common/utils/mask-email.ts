export function maskEmail(email: string): string
{
    const atIndex = email.indexOf('@');
    if (atIndex <= 0)
    {
        return '***';
    }

    const local = email.slice(0, atIndex);
    const domain = email.slice(atIndex + 1);
    const visible = local.length > 0 ? local[0] : '*';

    return `${visible}***@${domain || '*'}`;
}
