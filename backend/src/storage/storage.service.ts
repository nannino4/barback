export interface StorageUploadResult
{
    url: string;
    key: string;
}

export interface UploadUserProfilePictureInput
{
    userId: string;
    contentType: string;
    bytes: Buffer;
}

export interface UploadUserProfilePictureResult
{
    picture: StorageUploadResult;
    thumbnail: StorageUploadResult;
}

export abstract class StorageService
{
    /**
     * Uploads a user's profile picture and generates a thumbnail.
     * Both the processed image and thumbnail are stored.
     * Uses deterministic keys based on userId, so re-uploading automatically
     * replaces the old files.
     * 
     * @param input - The input containing userId, contentType, and image bytes
     * @returns Upload results for both the picture and thumbnail
     */
    abstract uploadUserProfilePicture(input: UploadUserProfilePictureInput): Promise<UploadUserProfilePictureResult>;
}
