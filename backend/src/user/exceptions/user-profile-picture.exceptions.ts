import { BadRequestException, PayloadTooLargeException } from '@nestjs/common';

export class ProfilePictureFileRequiredException extends BadRequestException
{
    constructor()
    {
        super({
            message: 'Profile picture file is required',
            error: 'PROFILE_PICTURE_FILE_REQUIRED',
            statusCode: 400,
        });
    }
}

export class InvalidProfilePictureFileTypeException extends BadRequestException
{
    constructor()
    {
        super({
            message: 'Invalid file type. Only jpeg/png/webp are allowed.',
            error: 'INVALID_PROFILE_PICTURE_FILE_TYPE',
            statusCode: 400,
        });
    }
}

export class ProfilePictureFileTooLargeException extends PayloadTooLargeException
{
    constructor(maxBytes: number)
    {
        super({
            message: `Profile picture file is too large. Max size is ${maxBytes} bytes`,
            error: 'PROFILE_PICTURE_FILE_TOO_LARGE',
            statusCode: 413,
        });
    }
}
