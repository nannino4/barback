import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import * as crypto from 'crypto';
import { GoogleUserInfoDto } from './dto/google-user-info.dto';
import { GoogleTokenResponseDto } from './dto/google-token-response.dto';
import { User, AuthProvider, UserLanguage } from '../user/schemas/user.schema';
import { UserService } from '../user/user.service';
import { OutGoogleAuthUrlDto } from './dto/out.google-auth-url.dto';
import { CustomLogger } from 'src/common/logger/custom.logger';
import { StorageService } from '../storage/storage.service';
import {
    GoogleConfigurationException,
    GoogleTokenExchangeException,
    GoogleUserInfoException,
    GoogleTokenInvalidException,
    GoogleEmailNotVerifiedException,
    GoogleAccountLinkingException,
    InvalidOAuthStateException,
} from './exceptions/oauth.exceptions';
import { isJwtExpiredError, parseJwtExpiration, type JwtExpiresIn } from '../common/utils/jwt-expiration';

const GOOGLE_PROFILE_PICTURE_MAX_BYTES = 5 * 1024 * 1024; // 5MB
const GOOGLE_PROFILE_PICTURE_TIMEOUT_MS = 5_000;

@Injectable()
export class GoogleService 
{
    private readonly googleOauthUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    private readonly clientId: string;
    private readonly clientSecret: string;
    private readonly redirectUri: string;
    private readonly oauthStateSecret: string;
    private readonly oauthStateExpiration: JwtExpiresIn;

    constructor(
        private readonly configService: ConfigService,
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly logger : CustomLogger,
        private readonly storageService: StorageService,
    ) 
    {
        this.clientId = this.configService.get<string>('GOOGLE_CLIENT_ID')!;
        this.clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET')!;
        this.redirectUri = this.configService.get<string>('GOOGLE_REDIRECT_URI')!;
        this.oauthStateSecret = this.configService.get<string>('JWT_OAUTH_STATE_SECRET')!;
        this.oauthStateExpiration = parseJwtExpiration(
            this.configService.get<string>('JWT_OAUTH_STATE_EXPIRATION_TIME')!,
        );

        // Validate configuration and throw specific exceptions
        if (!this.clientId) 
        {
            this.logger.error('Google OAuth configuration missing: GOOGLE_CLIENT_ID', 'GoogleService#constructor');
            throw new GoogleConfigurationException('GOOGLE_CLIENT_ID');
        }
        
        if (!this.clientSecret) 
        {
            this.logger.error('Google OAuth configuration missing: GOOGLE_CLIENT_SECRET', 'GoogleService#constructor');
            throw new GoogleConfigurationException('GOOGLE_CLIENT_SECRET');
        }
        
        if (!this.redirectUri) 
        {
            this.logger.error('Google OAuth configuration missing: GOOGLE_REDIRECT_URI', 'GoogleService#constructor');
            throw new GoogleConfigurationException('GOOGLE_REDIRECT_URI');
        }

        if (!this.oauthStateSecret)
        {
            this.logger.error('Google OAuth configuration missing: JWT_OAUTH_STATE_SECRET', 'GoogleService#constructor');
            throw new GoogleConfigurationException('JWT_OAUTH_STATE_SECRET');
        }

        if (!this.oauthStateExpiration)
        {
            this.logger.error('Google OAuth configuration missing: JWT_OAUTH_STATE_EXPIRATION_TIME', 'GoogleService#constructor');
            throw new GoogleConfigurationException('JWT_OAUTH_STATE_EXPIRATION_TIME');
        }

        this.logger.log('GoogleService initialized with valid configuration', 'GoogleService#constructor');
    }

    generateAuthUrl(requestId?: string): OutGoogleAuthUrlDto
    {
        // Generate signed JWT as state for stateless CSRF protection
        const statePayload = {
            purpose: 'google_oauth',
            timestamp: Date.now(),
            nonce: crypto.randomBytes(16).toString('hex'),
        };
        
        const state = this.jwtService.sign(statePayload, {
            secret: this.oauthStateSecret,
            expiresIn: this.oauthStateExpiration,
        });
        
        const params = new URLSearchParams({
            client_id: this.clientId,
            redirect_uri: this.redirectUri,
            response_type: 'code',
            scope: 'openid email profile',
            state: state,
        });

        const authUrl = `${this.googleOauthUrl}?${params.toString()}`;
        
        this.logger.debug('Generated Google OAuth URL with signed state', 'GoogleService#generateAuthUrl', requestId);
        return { authUrl, state };
    }

    async validateOAuthState(state: string, requestId?: string): Promise<void>
    {
        this.logger.debug('Validating OAuth state parameter', 'GoogleService#validateOAuthState', requestId);
        
        try 
        {
            const statePayload = await this.jwtService.verifyAsync(state, {
                secret: this.oauthStateSecret,
            });
            
            // Verify it's for OAuth purpose
            if (statePayload.purpose !== 'google_oauth') 
            {
                this.logger.warn('Invalid OAuth state: wrong purpose', 'GoogleService#validateOAuthState', requestId);
                throw new Error('Invalid state purpose');
            }
            
            this.logger.debug('OAuth state validated successfully', 'GoogleService#validateOAuthState', requestId);
        } 
        catch (error) 
        {
            if (isJwtExpiredError(error))
            {
                this.logger.warn('OAuth state JWT expired', 'GoogleService#validateOAuthState', requestId);
            }
            else
            {
                this.logger.error(
                    'OAuth state validation failed',
                    error instanceof Error ? error.stack : undefined,
                    'GoogleService#validateOAuthState',
                    requestId,
                );
            }
            throw new InvalidOAuthStateException();
        }
    }

    async exchangeCodeForTokens(code: string, requestId?: string): Promise<GoogleTokenResponseDto> 
    {
        this.logger.debug('Exchanging authorization code for tokens', 'GoogleService#exchangeCodeForTokens', requestId);
        
        try 
        {
            const response = await axios.post('https://oauth2.googleapis.com/token', {
                client_id: this.clientId,
                client_secret: this.clientSecret,
                code: code,
                grant_type: 'authorization_code',
                redirect_uri: this.redirectUri,
            }, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            this.logger.debug('Successfully exchanged code for tokens', 'GoogleService#exchangeCodeForTokens', requestId);
            return response.data;
        } 
        catch (error) 
        {
            this.logger.error('Failed to exchange authorization code for tokens', error instanceof Error ? error.stack : undefined, 'GoogleService#exchangeCodeForTokens', requestId);
            throw new GoogleTokenExchangeException();
        }
    }

    async getUserInfo(accessToken: string, requestId?: string): Promise<GoogleUserInfoDto> 
    {
        this.logger.debug('Fetching user info from Google', 'GoogleService#getUserInfo', requestId);

        let userInfo: GoogleUserInfoDto;
        
        try 
        {
            const response = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            userInfo = response.data as GoogleUserInfoDto;
            this.logger.debug(`Successfully fetched user info for: ${userInfo.email}`, 'GoogleService#getUserInfo', requestId);
        } 
        catch (error) 
        {
            if (axios.isAxiosError(error) && error.response?.status === 401) 
            {
                this.logger.warn('Invalid or expired Google access token', 'GoogleService#getUserInfo', requestId);
                throw new GoogleTokenInvalidException();
            }
            
            this.logger.error('Failed to fetch user info from Google', error instanceof Error ? error.stack : undefined, 'GoogleService#getUserInfo', requestId);
            throw new GoogleUserInfoException();
        }

        // Business validation - separate from HTTP error handling
        if (!userInfo.verified_email) 
        {
            this.logger.warn('Google user email is not verified', 'GoogleService#getUserInfo', requestId);
            throw new GoogleEmailNotVerifiedException();
        }

        return userInfo;
    }

    async findOrCreateUser(googleUserInfo: GoogleUserInfoDto, requestId?: string): Promise<User> 
    {
        this.logger.debug(`Finding or creating user for Google ID: ${googleUserInfo.id}`, 'GoogleService#findOrCreateUser', requestId);
        
        // First, try to find user by Google ID
        let user = await this.userService.findByGoogleId(googleUserInfo.id, requestId);
        if (user) 
        {
            this.logger.debug(`User found by Google ID userId=${user.id}`, 'GoogleService#findOrCreateUser', requestId);
            return await this.importGoogleProfilePictureIfNeeded(user, googleUserInfo.picture, requestId);
        }

        // Try to find user by email
        const existingUserByEmail = await this.userService.findByEmail(googleUserInfo.email, requestId);
        
        if (existingUserByEmail) 
        {
            // Handle existing user with different auth provider
            if (existingUserByEmail.authProvider !== AuthProvider.EMAIL) 
            {
                this.logger.warn(
                    `User exists with different auth provider userId=${existingUserByEmail.id} authProvider=${existingUserByEmail.authProvider}`,
                    'GoogleService#findOrCreateUser',
                    requestId,
                );
                throw new GoogleAccountLinkingException(existingUserByEmail.authProvider);
            }

            // Link Google account to existing email user
            this.logger.debug(
                `Linking Google account to existing user userId=${existingUserByEmail.id}`,
                'GoogleService#findOrCreateUser',
                requestId,
            );
            
            user = await this.userService.linkGoogleAccount(
                existingUserByEmail, 
                googleUserInfo.id, 
                requestId,
            );

            this.logger.log(
                `Google account linked userId=${user.id} googleId=${googleUserInfo.id}`,
                'GoogleService#findOrCreateUser',
                requestId,
            );
            return await this.importGoogleProfilePictureIfNeeded(user, googleUserInfo.picture, requestId);
        }

        // Create new user
        this.logger.debug(`Creating new Google user googleId=${googleUserInfo.id}`, 'GoogleService#findOrCreateUser', requestId);
        user = await this.userService.create({
            googleId: googleUserInfo.id,
            email: googleUserInfo.email,
            firstName: googleUserInfo.given_name || googleUserInfo.name?.split(' ')[0] || 'User',
            lastName: googleUserInfo.family_name || googleUserInfo.name?.split(' ').slice(1).join(' ') || '',
            authProvider: AuthProvider.GOOGLE,
            isEmailVerified: true, // Google emails are pre-verified
            language: googleUserInfo.locale?.toLowerCase().startsWith('en') ? UserLanguage.EN : UserLanguage.IT,
        }, requestId);

        this.logger.log(
            `User created via Google OAuth userId=${user.id} googleId=${googleUserInfo.id}`,
            'GoogleService#findOrCreateUser',
            requestId,
        );
        return await this.importGoogleProfilePictureIfNeeded(user, googleUserInfo.picture, requestId);
    }

    /**
     * Attempts to import and upload a Google profile picture for the user if needed.
     * Logging is performed at method entry, on all early returns, and on completion.
     * This method never throws; login flow is never blocked by avatar import failure.
     */
    private async importGoogleProfilePictureIfNeeded(user: User, pictureUrl?: string, requestId?: string): Promise<User>
    {
        this.logger.debug(
            `Checking if Google profile picture import is needed for user: ${user.email}`,
            'GoogleService#importGoogleProfilePictureIfNeeded',
            requestId,
        );

        if (!this.shouldImportGoogleProfilePicture(user, pictureUrl))
        {
            this.logger.debug(
                `No import needed for user: ${user.email}`,
                'GoogleService#importGoogleProfilePictureIfNeeded',
                requestId,
            );
            return user;
        }

        const safeUrl: string | null = this.normalizeAndValidateGooglePictureUrl(pictureUrl!);
        if (!safeUrl)
        {
            this.logger.warn(
                `Skipping profile picture import due to unsafe/unsupported URL for user: ${user.email}`,
                'GoogleService#importGoogleProfilePictureIfNeeded',
                requestId,
            );
            return user;
        }

        try
        {
            this.logger.debug(
                `Attempting to download and upload Google profile picture for user: ${user.email}`,
                'GoogleService#importGoogleProfilePictureIfNeeded',
                requestId,
            );

            const { bytes, contentType }: { bytes: Buffer; contentType: string } = await this.downloadImageFromUrl(safeUrl);

            const uploadResult = await this.storageService.updateProfilePicture({
                userId: user.id,
                contentType,
                bytes,
                oldPictureKey: user.profilePictureKey,
                oldThumbnailKey: user.profilePictureThumbnailKey,
            }, requestId);

            const updated = await this.userService.updateProfilePicture(
                user._id,
                uploadResult.picture.url,
                uploadResult.picture.key,
                uploadResult.thumbnail.url,
                uploadResult.thumbnail.key,
                requestId,
            );

            this.logger.debug(
                `Google profile picture imported and uploaded for user: ${user.email}`,
                'GoogleService#importGoogleProfilePictureIfNeeded',
                requestId,
            );
            return updated.user;
        }
        catch (error)
        {
            const errorMessage: string = error instanceof Error ? error.message : 'Unknown error';
            this.logger.warn(
                `Failed to import Google profile picture for user: ${user.email} - ${errorMessage}`,
                'GoogleService#importGoogleProfilePictureIfNeeded',
                requestId,
            );
            return user;
        }
    }

    /**
     * Determines if a Google profile picture should be imported for the user.
     * Returns true only if:
     *   - pictureUrl is present
     *   - user has no uploaded profile picture keys
     *   - user has no different profilePictureUrl set
     */
    private shouldImportGoogleProfilePicture(user: User, pictureUrl?: string): boolean
    {
        if (!pictureUrl)
        {
            return false;
        }

        if (user.profilePictureKey || user.profilePictureThumbnailKey)
        {
            return false;
        }

        if (user.profilePictureUrl && user.profilePictureUrl !== pictureUrl)
        {
            const normalizedExistingUrl: string | null = this.normalizeAndValidateGooglePictureUrl(user.profilePictureUrl);
            if (!normalizedExistingUrl)
            {
                return false;
            }
        }

        return true;
    }

    /**
     * Validates and normalizes a Google profile picture URL.
     * Only allows HTTPS URLs from googleusercontent.com.
     * Returns the normalized URL string or null if invalid.
     */
    private normalizeAndValidateGooglePictureUrl(url: string): string | null
    {
        try
        {
            const parsed: URL = new URL(url);
            if (parsed.protocol !== 'https:')
            {
                return null;
            }

            const hostname: string = parsed.hostname.toLowerCase();
            if (!hostname.endsWith('googleusercontent.com'))
            {
                return null;
            }

            return parsed.toString();
        }
        catch
        {
            return null;
        }
    }

    /**
     * Downloads an image from a given URL, enforcing content type and size limits.
     * Throws on network, type, or size errors. Returns image bytes and content type.
     */
    private async downloadImageFromUrl(url: string): Promise<{ bytes: Buffer; contentType: string }>
    {
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            timeout: GOOGLE_PROFILE_PICTURE_TIMEOUT_MS,
            maxContentLength: GOOGLE_PROFILE_PICTURE_MAX_BYTES,
            validateStatus: (status: number) => status >= 200 && status < 300,
        });

        const contentTypeHeader: unknown = response.headers?.['content-type'];
        const contentType: string = typeof contentTypeHeader === 'string' ? contentTypeHeader : 'application/octet-stream';
        if (!contentType.toLowerCase().startsWith('image/'))
        {
            throw new Error(`Unexpected content-type: ${contentType}`);
        }

        const bytes: Buffer = Buffer.isBuffer(response.data) ? response.data : Buffer.from(response.data);
        if (bytes.length === 0)
        {
            throw new Error('Empty image response');
        }
        if (bytes.length > GOOGLE_PROFILE_PICTURE_MAX_BYTES)
        {
            throw new Error('Image exceeds maximum allowed size');
        }

        return { bytes, contentType };
    }

}
