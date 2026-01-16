export interface StorageUploadResult
{
    url: string;
    key: string;
}

export interface UpdateProfilePictureInput
{
    userId: string;
    contentType: string;
    bytes: Buffer;
    oldPictureKey?: string;
    oldThumbnailKey?: string;
}

export interface UploadUserProfilePictureResult
{
    picture: StorageUploadResult;
    thumbnail: StorageUploadResult;
}

export abstract class StorageService
{
    /**
     * Updates a user's profile picture and deletes the old files.
     * If deletion fails, the new upload still succeeds and is returned.
     * 
     * @param input - The input containing userId, contentType, image bytes, and optional old keys
     * @returns Upload results for both the picture and the thumbnail
     */
    abstract updateProfilePicture(input: UpdateProfilePictureInput, requestId?: string): Promise<UploadUserProfilePictureResult>;

    /**
     * Deletes files from storage by their keys.
     * 
     * @param keys - The storage keys to delete
     */
    abstract deleteFiles(keys: string[], requestId?: string): Promise<void>;
}
