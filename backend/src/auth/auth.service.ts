import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { User, AuthProvider } from '../user/schemas/user.schema';
import { Types } from 'mongoose';
import { AccessTokenPayloadDto } from './dto/access-token-payload.dto';
import { RefreshTokenPayloadDto } from './dto/refresh-token-payload.dto';
import { RegisterEmailDto } from './dto/in.register-email.dto';
import { CreateUserDto } from '../user/dto/in.create-user.dto';
import { OutTokensDto } from './dto/out.tokens.dto';
import { OutAuthResponseDto } from './dto/out.auth-response.dto';
import { OutUserDto } from '../user/dto/out.user.dto';
import { EmailService } from '../email/email.service';
import { plainToClass } from 'class-transformer';
import {
    JwtConfigurationException,
    TokenGenerationException,
    InvalidRefreshTokenException,
    InvalidCredentialsException,
    WrongAuthProviderException,
    PasswordHashingException,
} from './exceptions/auth.exceptions';
import { 
    UserNotFoundByEmailException, 
    EmailAlreadyVerifiedException,
    InvalidPasswordResetTokenException,
} from '../user/exceptions/user.exceptions';
import { CustomLogger } from '../common/logger/custom.logger';
import { isJwtExpiredError, parseJwtExpiration, type JwtExpiresIn } from '../common/utils/jwt-expiration';

@Injectable()
export class AuthService
{
    private readonly jwtAccessTokenSecret: string;
    private readonly jwtAccessTokenExpiration: JwtExpiresIn;
    private readonly jwtRefreshTokenSecret: string;
    private readonly jwtRefreshTokenExpiration: JwtExpiresIn;

    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly emailService: EmailService,
        private readonly logger: CustomLogger,
    )
    {
        
        // Validate JWT configuration on startup
        const accessSecret = this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET');
        if (!accessSecret)
        {
            throw new JwtConfigurationException('JWT_ACCESS_TOKEN_SECRET');
        }
        this.jwtAccessTokenSecret = accessSecret;

        const accessExpiration = this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION_TIME');
        if (!accessExpiration)
        {
            throw new JwtConfigurationException('JWT_ACCESS_TOKEN_EXPIRATION_TIME');
        }
        this.jwtAccessTokenExpiration = parseJwtExpiration(accessExpiration);

        const refreshSecret = this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET');
        if (!refreshSecret)
        {
            throw new JwtConfigurationException('JWT_REFRESH_TOKEN_SECRET');
        }
        this.jwtRefreshTokenSecret = refreshSecret;

        const refreshExpiration = this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION_TIME');
        if (!refreshExpiration)
        {
            throw new JwtConfigurationException('JWT_REFRESH_TOKEN_EXPIRATION_TIME');
        }
        this.jwtRefreshTokenExpiration = parseJwtExpiration(refreshExpiration);

        this.logger.debug('AuthService initialized with valid JWT configuration', 'AuthService#constructor');
    }

    async generateTokens(user: User, requestId?: string): Promise<OutTokensDto>
    {
        this.logger.debug(`Generating tokens for user: ${user.email}`, 'AuthService#generateTokens', requestId);
        
        try
        {
            const accessTokenPayload: AccessTokenPayloadDto = {
                sub: user.id,
                type: 'access',
            };
            const refreshTokenPayload: RefreshTokenPayloadDto = {
                sub: user.id,
                type: 'refresh',
            };
            
            const accessToken = this.jwtService.sign(accessTokenPayload, {
                secret: this.jwtAccessTokenSecret,
                expiresIn: this.jwtAccessTokenExpiration,
            });
            
            const refreshToken = this.jwtService.sign(refreshTokenPayload, {
                secret: this.jwtRefreshTokenSecret,
                expiresIn: this.jwtRefreshTokenExpiration,
            });
            
            this.logger.debug(`Tokens generated successfully for user: ${user.email}`, 'AuthService#generateTokens', requestId);
            return { access_token: accessToken, refresh_token: refreshToken };
        }
        catch (error)
        {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Token generation failed for user ${user.email}: ${errorMessage}`, undefined, 'AuthService#generateTokens', requestId);
            throw new TokenGenerationException(errorMessage);
        }
    }

    async generateAuthResponse(user: User, requestId?: string): Promise<OutAuthResponseDto>
    {
        this.logger.debug(`Generating auth response for user: ${user.email}`, 'AuthService#generateAuthResponse', requestId);
        const tokens = await this.generateTokens(user, requestId);
        const userDto = plainToClass(OutUserDto, user, { excludeExtraneousValues: true });
        
        const response: OutAuthResponseDto = {
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            user: userDto,
        };
        
        this.logger.debug(`Auth response generated successfully for user: ${user.email}`, 'AuthService#generateAuthResponse', requestId);
        return response;
    }

    async validateRefreshToken(refreshTokenString: string, requestId?: string) : Promise<OutAuthResponseDto>
    {
        this.logger.debug('Refresh token process started', 'AuthService#validateRefreshToken', requestId);
        
        let user: User;
        try
        {
            // Verify JWT token
            const payload = await this.jwtService.verifyAsync<RefreshTokenPayloadDto>(
                refreshTokenString,
                {
                    secret: this.jwtRefreshTokenSecret,
                },
            );
            
            // Validate token type
            if (payload.type !== 'refresh')
            {
                throw new Error('Invalid token type');
            }
            
            // Find user (throws if not found)
            user = await this.userService.findById(new Types.ObjectId(payload.sub), requestId);
            if (!user)
            {
                throw new Error('User not found');
            }
        }
        catch (error)
        {
            // Convert all token validation errors to InvalidRefreshTokenException for security
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            if (isJwtExpiredError(error))
            {
                this.logger.warn(`Refresh Token Expired: ${errorMessage}`, 'AuthService#validateRefreshToken', requestId);
            }
            else
            {
                this.logger.error(
                    `Refresh Token Error: ${errorMessage}`,
                    error instanceof Error ? error.stack : undefined,
                    'AuthService#validateRefreshToken',
                    requestId,
                );
            }
            throw new InvalidRefreshTokenException();
        }
        
        // Generate response (outside try block - let TokenGenerationException bubble up)
        this.logger.debug(`User ${user.email} validated for token refresh`, 'AuthService#validateRefreshToken', requestId);
        const response = await this.generateAuthResponse(user, requestId);
        this.logger.debug(`Tokens refreshed for user: ${user.email}`, 'AuthService#validateRefreshToken', requestId);
        return response;
    }

    async loginEmail(email: string, pass: string, requestId?: string): Promise<OutAuthResponseDto>
    {
        this.logger.debug(`Authenticating user: ${email}`, 'AuthService#loginEmail', requestId);
        const user = await this.userService.findByEmail(email, requestId);
        if (!user)
        {
            this.logger.warn(`User not found: ${email}`, 'AuthService#loginEmail', requestId);
            throw new InvalidCredentialsException();
        }
        if (user.authProvider !== AuthProvider.EMAIL)
        {
            this.logger.warn(`User ${email} is not using EMAIL authentication`, 'AuthService#loginEmail', requestId);
            throw new WrongAuthProviderException(user.authProvider);
        }
        if (!pass || !user.hashedPassword || !(await bcrypt.compare(pass, user.hashedPassword)))
        {
            this.logger.warn(`Invalid password for user: ${email}`, 'AuthService#loginEmail', requestId);
            throw new InvalidCredentialsException();
        }
        const response = await this.generateAuthResponse(user, requestId);
        this.logger.debug(`User ${email} authenticated successfully`, 'AuthService#loginEmail', requestId);
        return response;
    }

    async registerEmail(registerUserDto: RegisterEmailDto, requestId?: string): Promise<OutAuthResponseDto>
    {
        this.logger.debug(`Registration process started for user: ${registerUserDto.email}`, 'AuthService#registerEmail', requestId);
        
        // Prepare user data
        const userData: CreateUserDto = new CreateUserDto();
        
        // Hash password with error handling
        try
        {
            const saltOrRounds = 10;
            userData.hashedPassword = await bcrypt.hash(registerUserDto.password, saltOrRounds);
        }
        catch (error)
        {
            this.logger.error('Password hashing failed during registration', undefined, 'AuthService#registerEmail', requestId);
            throw new PasswordHashingException();
        }
        
        userData.email = registerUserDto.email;
        userData.firstName = registerUserDto.firstName;
        userData.lastName = registerUserDto.lastName;
        if (registerUserDto.phoneNumber)
        {
            userData.phoneNumber = registerUserDto.phoneNumber;
        }
        
        const newUser = await this.userService.create(userData, requestId);
        this.logger.debug(`New user created: ${newUser.email}`, 'AuthService#registerEmail', requestId);
        
        // Send verification email
        try 
        {
            await this.sendVerificationEmail(newUser.email, requestId);
        } 
        catch (error) 
        {
            this.logger.warn(`Failed to send verification email to ${newUser.email}`, 'AuthService#registerEmail', requestId);
            // Don't fail registration if email sending fails
        }
        
        const response = await this.generateAuthResponse(newUser, requestId);
        this.logger.debug(`Auth response generated for new user: ${newUser.email}`, 'AuthService#registerEmail', requestId);
        return response;
    }

    async sendVerificationEmail(email: string, requestId?: string): Promise<void>
    {
        this.logger.debug(`Sending verification email to: ${email}`, 'AuthService#sendVerificationEmail', requestId);
        const user = await this.userService.findByEmail(email, requestId);
        if (!user)
        {
            this.logger.warn(`User not found for email verification: ${email}`, 'AuthService#sendVerificationEmail', requestId);
            throw new UserNotFoundByEmailException(email);
        }

        if (user.isEmailVerified)
        {
            this.logger.debug(`User ${email} is already verified`, 'AuthService#sendVerificationEmail', requestId);
            throw new EmailAlreadyVerifiedException(email);
        }

        const token = await this.userService.generateEmailVerificationToken(user._id as Types.ObjectId, requestId);
        const emailOptions = this.emailService.generateVerificationEmail(email, token);
        
        await this.emailService.sendEmail(emailOptions);
        this.logger.debug(`Verification email sent to: ${email}`, 'AuthService#sendVerificationEmail', requestId);
    }

    async verifyEmail(token: string, requestId?: string): Promise<void>
    {
        this.logger.debug('Processing email verification', 'AuthService#verifyEmail', requestId);
        await this.userService.verifyEmail(token, requestId);
        this.logger.debug('Email verification completed successfully', 'AuthService#verifyEmail', requestId);
    }

    async forgotPassword(email: string, requestId?: string): Promise<void>
    {
        this.logger.debug(`Processing forgot password request for: ${email}`, 'AuthService#forgotPassword', requestId);
        
        try 
        {
            const token = await this.userService.generatePasswordResetToken(email, requestId);
            
            if (token)
            {
                const emailOptions = this.emailService.generatePasswordResetEmail(email, token);
                await this.emailService.sendEmail(emailOptions);
                this.logger.debug(`Password reset email sent to: ${email}`, 'AuthService#forgotPassword', requestId);
            }
            else
            {
                this.logger.debug(`No valid user found for password reset: ${email}`, 'AuthService#forgotPassword', requestId);
            }
        }
        catch (error)
        {
            // Log the error but don't expose details to prevent information leakage
            this.logger.error(`Failed to process password reset request for: ${email}`, error instanceof Error ? error.stack : undefined, 'AuthService#forgotPassword', requestId);
            
            // For security, we still return success even if email sending fails
            // This prevents enumeration attacks but logs the actual error for debugging
        }
        
        // Always return success to prevent email enumeration
    }

    async resetPassword(token: string, newPassword: string, requestId?: string): Promise<void>
    {
        this.logger.debug('Processing password reset', 'AuthService#resetPassword', requestId);
        await this.userService.resetPassword(token, newPassword, requestId);
        this.logger.debug('Password reset completed successfully', 'AuthService#resetPassword', requestId);
    }

    async validatePasswordResetToken(token: string, requestId?: string): Promise<void>
    {
        this.logger.debug('Validating password reset token', 'AuthService#validatePasswordResetToken', requestId);
        const user = await this.userService.findByPasswordResetToken(token, requestId);
        
        if (!user)
        {
            this.logger.warn('Invalid or expired password reset token', 'AuthService#validatePasswordResetToken', requestId);
            throw new InvalidPasswordResetTokenException();
        }
        
        this.logger.debug('Password reset token is valid', 'AuthService#validatePasswordResetToken', requestId);
    }
}
