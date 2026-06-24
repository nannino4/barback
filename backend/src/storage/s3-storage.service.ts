import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import * as crypto from 'crypto';
import * as sharp from 'sharp';
import { 
    StorageService, 
    UploadUserProfilePictureResult,
    UpdateProfilePictureInput,
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
                'S3StorageService#constructor',
            );
            throw new StorageConfigurationException(`Failed to initialize S3 client: ${errorMessage}`);
        }

        this.logger.log('S3StorageService initialized', 'S3StorageService#constructor');
    }

    async updateProfilePicture(input: UpdateProfilePictureInput, requestId?: string): Promise<UploadUserProfilePictureResult>
    {
        this.logger.debug(
            `Updating profile picture for user: ${input.userId}`,
            'S3StorageService#updateProfilePicture',
            requestId,
        );

        try
        {
            const [processedImage, thumbnailImage] = await Promise.all([
                this.processProfilePicture(input.bytes),
                this.generateThumbnail(input.bytes),
            ]);

            const keySuffix = this.generateKeySuffix();
            const pictureKey = this.generateProfilePictureKey(input.userId, keySuffix);
            const thumbnailKey = this.generateThumbnailKey(input.userId, keySuffix);

            const [pictureResult, thumbnailResult] = await Promise.all([
                this.uploadToS3(pictureKey, processedImage, 'image/webp'),
                this.uploadToS3(thumbnailKey, thumbnailImage, 'image/webp'),
            ]);

            try
            {
                await this.deleteFiles(
                    [input.oldPictureKey, input.oldThumbnailKey].filter(Boolean) as string[],
                    requestId,
                );
            }
            catch (error)
            {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                this.logger.error(
                    `Failed to delete old profile picture files for user ${input.userId}: ${errorMessage}`,
                    error instanceof Error ? error.stack : undefined,
                    'S3StorageService#updateProfilePicture',
                    requestId,
                );
            }

            return {
                picture: pictureResult,
                thumbnail: thumbnailResult,
            };
        }
        catch (error)
        {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(
                `Failed to update profile picture for user ${input.userId}: ${errorMessage}`,
                error instanceof Error ? error.stack : undefined,
                'S3StorageService#updateProfilePicture',
                requestId,
            );

            if (error instanceof StorageOperationException)
            {
                throw error;
            }

            throw new StorageOperationException('update profile picture', errorMessage);
        }
    }

    async deleteFiles(keys: string[], requestId?: string): Promise<void>
    {
        const filteredKeys = Array.from(new Set(keys.filter((key) => !!key)));

        if (filteredKeys.length === 0)
        {
            return;
        }

        this.logger.debug(
            `Deleting ${filteredKeys.length} files from storage`,
            'S3StorageService#deleteFiles',
            requestId,
        );

        try
        {
            await Promise.all(filteredKeys.map((key) => this.deleteFromS3(key)));
        }
        catch (error)
        {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new StorageOperationException('delete files', errorMessage);
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
     */
    private generateProfilePictureKey(userId: string, keySuffix: string): string
    {
        return `users/${userId}/profile-picture-${keySuffix}.webp`;
    }

    /**
     * Generate S3 key for profile picture thumbnail
     */
    private generateThumbnailKey(userId: string, keySuffix: string): string
    {
        return `users/${userId}/profile-picture-thumb-${keySuffix}.webp`;
    }

    private generateKeySuffix(): string
    {
        const timestamp = Date.now();
        const random = crypto.randomBytes(3).toString('hex');
        return `${timestamp}-${random}`;
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

    private async deleteFromS3(key: string): Promise<void>
    {
        try
        {
            const command = new DeleteObjectCommand({
                Bucket: this.bucket,
                Key: key,
            });

            await this.s3Client.send(command);
        }
        catch (error)
        {
            const errorMessage = error instanceof Error ? error.message : 'Unknown S3 error';
            throw new StorageOperationException(`delete from S3 (key: ${key})`, errorMessage);
        }
    }
}
