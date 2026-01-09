import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const REQUEST_ID_HEADER = 'x-request-id';

/**
 * Extracts the request id from the inbound HTTP headers.
 *
 * Frontend is responsible for sending `x-request-id` on every request.
 */
export const RequestId = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext): string | undefined =>
    {
        const request = ctx.switchToHttp().getRequest();
        const headerValue = request?.headers?.[REQUEST_ID_HEADER];

        if (Array.isArray(headerValue))
        {
            return headerValue[0];
        }

        if (typeof headerValue === 'string')
        {
            return headerValue;
        }

        return undefined;
    },
);
