import { ServiceUnavailableException, InternalServerErrorException, BadRequestException } from '@nestjs/common';

/**
 * Custom exception thrown when storage configuration is invalid or missing.
 */
export class StorageConfigurationException extends InternalServerErrorException
{
    constructor(details: string)
    {
        super({
            message: `Storage configuration error: ${details}`,
            error: 'STORAGE_CONFIGURATION_ERROR',
            statusCode: 500,
        });
    }
}

/**
 * Custom exception thrown when the storage service is unavailable or not configured.
 */
export class StorageServiceUnavailableException extends ServiceUnavailableException
{
    constructor(details?: string)
    {
        super({
            message: details
                ? `Storage service is unavailable: ${details}`
                : 'Storage service is temporarily unavailable. Please try again later.',
            error: 'STORAGE_SERVICE_UNAVAILABLE',
            statusCode: 503,
        });
    }
}

/**
 * Custom exception thrown when a storage operation fails.
 */
export class StorageOperationException extends InternalServerErrorException
{
    constructor(operation: string, details?: string)
    {
        super({
            message: `Storage operation failed: ${operation}${details ? ` - ${details}` : ''}`,
            error: 'STORAGE_OPERATION_FAILED',
            statusCode: 500,
        });
    }
}

/**
 * Custom exception thrown when a profile picture upload input is invalid.
 */
export class InvalidProfilePictureUploadException extends BadRequestException
{
    constructor(details: string)
    {
        super({
            message: details,
            error: 'INVALID_PROFILE_PICTURE_UPLOAD',
            statusCode: 400,
        });
    }
}
