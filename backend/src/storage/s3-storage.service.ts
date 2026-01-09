import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as sharp from 'sharp';
import { 
    StorageService, 
    UploadUserProfilePictureInput, 
    UploadUserProfilePictureResult,
    StorageUploadResult,
} from './storage.service';
import { CustomLogger } from '../common/logger/custom.logger';
import { 
    StorageConfigurationException, 
    StorageOperationException,
} from '../common/exceptions/storage.exceptions';

// Image processing constants
const PROFILE_PICTURE_MAX_WIDTH = 800;
const PROFILE_PICTURE_MAX_HEIGHT = 800;
const THUMBNAIL_WIDTH = 150;
const THUMBNAIL_HEIGHT = 150;
const IMAGE_QUALITY = 85;

@Injectable()
export class S3StorageService extends StorageService
{
    private readonly s3Client: S3Client;
    private readonly bucket: string;
    private readonly publicBaseUrl: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly logger: CustomLogger,
    )
    {
        super();
        
        // Validate required configuration
        const region = this.configService.get<string>('S3_REGION');
        const bucket = this.configService.get<string>('S3_BUCKET');
        const accessKeyId = this.configService.get<string>('S3_ACCESS_KEY_ID');
        const secretAccessKey = this.configService.get<string>('S3_SECRET_ACCESS_KEY');
        const publicBaseUrl = this.configService.get<string>('S3_PUBLIC_BASE_URL');
        
        if (!region)
        {
            this.logger.error('S3_REGION is not configured', undefined, 'S3StorageService#constructor');
            throw new StorageConfigurationException('S3_REGION is not configured');
        }
        if (!bucket)
        {
            this.logger.error('S3_BUCKET is not configured', undefined, 'S3StorageService#constructor');
            throw new StorageConfigurationException('S3_BUCKET is not configured');
        }
        if (!accessKeyId)
        {
            this.logger.error('S3_ACCESS_KEY_ID is not configured', undefined, 'S3StorageService#constructor');
            throw new StorageConfigurationException('S3_ACCESS_KEY_ID is not configured');
        }
        if (!secretAccessKey)
        {
            this.logger.error('S3_SECRET_ACCESS_KEY is not configured', undefined, 'S3StorageService#constructor');
            throw new StorageConfigurationException('S3_SECRET_ACCESS_KEY is not configured');
        }
        if (!publicBaseUrl)
        {
            this.logger.error('S3_PUBLIC_BASE_URL is not configured', undefined, 'S3StorageService#constructor');
            throw new StorageConfigurationException('S3_PUBLIC_BASE_URL is not configured');
        }

        this.bucket = bucket;
        this.publicBaseUrl = publicBaseUrl.replace(/\/$/, ''); // Remove trailing slash if present

        // Optional configuration for S3-compatible providers
        const endpoint = this.configService.get<string>('S3_ENDPOINT');
        const forcePathStyle = this.configService.get<string>('S3_FORCE_PATH_STYLE') === 'true';

        try
        {
            this.s3Client = new S3Client({
                region,
                credentials: {
                    accessKeyId,
                    secretAccessKey,
                },
                ...(endpoint && { endpoint }),
                forcePathStyle,
            });
        }
        catch (error)
        {
            const errorMessage = error instanceof Error ? error.message : 'Unknown S3 initialization error';
            this.logger.error(
                `Failed to initialize S3 client: ${errorMessage}`,
                error instanceof Error ? error.stack : undefined,
                'S3StorageService#constructor'
            );
            throw new StorageConfigurationException(`Failed to initialize S3 client: ${errorMessage}`);
        }

        this.logger.debug('S3StorageService initialized', 'S3StorageService#constructor');
    }

    async uploadUserProfilePicture(input: UploadUserProfilePictureInput, requestId?: string): Promise<UploadUserProfilePictureResult>
    {
        this.logger.debug(
            `Uploading profile picture for user: ${input.userId}`,
            'S3StorageService#uploadUserProfilePicture',
            requestId,
        );

        try
        {
            // Process images in parallel
            const [processedImage, thumbnailImage] = await Promise.all([
                this.processProfilePicture(input.bytes),
                this.generateThumbnail(input.bytes),
            ]);

            // Generate S3 keys
            const pictureKey = this.generateProfilePictureKey(input.userId);
            const thumbnailKey = this.generateThumbnailKey(input.userId);

            // Upload both images in parallel
            const [pictureResult, thumbnailResult] = await Promise.all([
                this.uploadToS3(pictureKey, processedImage, 'image/webp'),
                this.uploadToS3(thumbnailKey, thumbnailImage, 'image/webp'),
            ]);

            this.logger.debug(
                `Profile picture uploaded successfully for user: ${input.userId}`,
                'S3StorageService#uploadUserProfilePicture',
                requestId,
            );

            return {
                picture: pictureResult,
                thumbnail: thumbnailResult,
            };
        }
        catch (error)
        {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(
                `Failed to upload profile picture for user ${input.userId}: ${errorMessage}`,
                error instanceof Error ? error.stack : undefined,
                'S3StorageService#uploadUserProfilePicture',
                requestId,
            );

            if (error instanceof StorageOperationException)
            {
                throw error;
            }

            throw new StorageOperationException('upload profile picture', errorMessage);
        }
    }

    /**
     * Process the profile picture: resize if needed and convert to WebP
     */
    private async processProfilePicture(imageBuffer: Buffer): Promise<Buffer>
    {
        try
        {
            return await sharp(imageBuffer)
                .resize(PROFILE_PICTURE_MAX_WIDTH, PROFILE_PICTURE_MAX_HEIGHT, {
                    fit: 'inside',
                    withoutEnlargement: true,
                })
                .webp({ quality: IMAGE_QUALITY })
                .toBuffer();
        }
        catch (error)
        {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new StorageOperationException('process profile picture', errorMessage);
        }
    }

    /**
     * Generate a square thumbnail from the image
     */
    private async generateThumbnail(imageBuffer: Buffer): Promise<Buffer>
    {
        try
        {
            return await sharp(imageBuffer)
                .resize(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, {
                    fit: 'cover',
                    position: 'centre',
                })
                .webp({ quality: IMAGE_QUALITY })
                .toBuffer();
        }
        catch (error)
        {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new StorageOperationException('generate thumbnail', errorMessage);
        }
    }

    /**
     * Generate S3 key for profile picture
     * Using a consistent key allows automatic replacement of old images
     */
    private generateProfilePictureKey(userId: string): string
    {
        return `users/${userId}/profile-picture.webp`;
    }

    /**
     * Generate S3 key for profile picture thumbnail
     */
    private generateThumbnailKey(userId: string): string
    {
        return `users/${userId}/profile-picture-thumb.webp`;
    }

    /**
     * Upload a buffer to S3
     */
    private async uploadToS3(key: string, body: Buffer, contentType: string): Promise<StorageUploadResult>
    {
        try
        {
            const command = new PutObjectCommand({
                Bucket: this.bucket,
                Key: key,
                Body: body,
                ContentType: contentType,
                CacheControl: 'public, max-age=31536000', // 1 year cache for immutable content
            });

            await this.s3Client.send(command);

            return {
                key,
                url: `${this.publicBaseUrl}/${key}`,
            };
        }
        catch (error)
        {
            const errorMessage = error instanceof Error ? error.message : 'Unknown S3 error';
            throw new StorageOperationException(`upload to S3 (key: ${key})`, errorMessage);
        }
    }
}
