import { Injectable, PipeTransform } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { 
    ProfilePictureFileRequiredException, 
    InvalidProfilePictureFileTypeException, 
    ProfilePictureFileTooLargeException 
} from '../user/exceptions/user-profile-picture.exceptions';

// Default max file size (5MB) if not configured
const DEFAULT_MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

// Allowed MIME types for profile pictures
const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
];

// Allowed file extensions (case insensitive)
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

@Injectable()
export class ProfilePictureValidationPipe implements PipeTransform<Express.Multer.File, Express.Multer.File>
{
    private readonly maxFileSizeBytes: number;

    constructor(private readonly configService: ConfigService)
    {
        const configuredMaxSize = this.configService.get<number>('USER_PROFILE_PICTURE_MAX_BYTES');
        this.maxFileSizeBytes = configuredMaxSize || DEFAULT_MAX_FILE_SIZE_BYTES;
    }

    transform(file: Express.Multer.File): Express.Multer.File
    {
        // Check if file exists
        if (!file)
        {
            throw new ProfilePictureFileRequiredException();
        }

        // Validate MIME type
        if (!this.isValidMimeType(file.mimetype))
        {
            throw new InvalidProfilePictureFileTypeException();
        }

        // Validate file extension if original name is available
        if (file.originalname && !this.hasValidExtension(file.originalname))
        {
            throw new InvalidProfilePictureFileTypeException();
        }

        // Validate file size
        if (file.size > this.maxFileSizeBytes)
        {
            throw new ProfilePictureFileTooLargeException(this.maxFileSizeBytes);
        }

        return file;
    }

    private isValidMimeType(mimeType: string): boolean
    {
        return ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase());
    }

    private hasValidExtension(filename: string): boolean
    {
        const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
        return ALLOWED_EXTENSIONS.includes(ext);
    }
}
