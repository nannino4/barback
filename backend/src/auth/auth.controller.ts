import { Controller, Post, Body, UnauthorizedException, HttpCode, HttpStatus, Get, Param, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginEmailDto } from './dto/in.login-email.dto';
import { RefreshTokenDto } from './dto/in.refresh-token.dto';
import { RegisterEmailDto } from './dto/in.register-email.dto';
import { VerifyEmailDto } from './dto/in.verify-email.dto';
import { ForgotPasswordDto } from './dto/in.forgot-password.dto';
import { ResetPasswordDto } from './dto/in.reset-password.dto';
import { OutAuthResponseDto } from './dto/out.auth-response.dto';
import { OutGoogleAuthUrlDto } from './dto/out.google-auth-url.dto';
import { GoogleCallbackDto } from './dto/in.google-callback.dto';
import { GoogleService } from './google.service';
import { CustomLogger } from 'src/common/logger/custom.logger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { SkipEmailVerification } from './decorators/skip-email-verification.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../user/schemas/user.schema';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { RequestId } from '../common/decorators/request-id.decorator';
import { maskEmail } from '../common/utils/mask-email';

@Controller('auth')
export class AuthController
{

    constructor(
        private readonly authService: AuthService,
        private readonly googleService: GoogleService,
        private readonly logger: CustomLogger,
    ) {}

    @Post('register/email')
    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 3, ttl: 300000 } }) // 3 requests per 5 minutes
    @HttpCode(HttpStatus.CREATED)
    async register(
        @Body() registerUserDto: RegisterEmailDto,
        @RequestId() requestId?: string,
    ): Promise<OutAuthResponseDto>
    {
        this.logger.debug(`Registration attempt for user: ${maskEmail(registerUserDto.email)}`, 'AuthController#register', requestId);
        const response = await this.authService.registerEmail(registerUserDto, requestId);
        this.logger.log(`User signed up userId=${response.user.id}`, 'AuthController#register', requestId);
        return response;
    }

    @Post('login/email')
    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
    @HttpCode(HttpStatus.OK)
    async emailLogin(
        @Body() loginDto: LoginEmailDto,
        @RequestId() requestId?: string,
    ): Promise<OutAuthResponseDto>
    {
        this.logger.debug(`Login attempt for user: ${loginDto.email}`, 'AuthController#emailLogin', requestId);
        const response = await this.authService.loginEmail(loginDto.email, loginDto.password, requestId);
        this.logger.debug(`User ${loginDto.email} authenticated successfully`, 'AuthController#emailLogin', requestId);
        return response;
    }

    @Post('refresh-token')
    @HttpCode(HttpStatus.OK)
    async validateRefreshToken(
        @Body() refreshTokenDto: RefreshTokenDto,
        @RequestId() requestId?: string,
    ): Promise<OutAuthResponseDto>
    {
        this.logger.debug('Refresh token attempt', 'AuthController#refreshToken', requestId);
        if (!refreshTokenDto.refresh_token)
        {
            this.logger.warn('Refresh token is missing', 'AuthController#refreshToken', requestId);
            throw new UnauthorizedException('Refresh token is missing');
        }
        const response = await this.authService.validateRefreshToken(refreshTokenDto.refresh_token, requestId);
        this.logger.debug('Token refreshed successfully', 'AuthController#refreshToken', requestId);
        return response;
    }

    @Post('send-verification-email')
    @UseGuards(JwtAuthGuard, ThrottlerGuard)
    @SkipEmailVerification()
    @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 requests per minute
    @HttpCode(HttpStatus.OK)
    async sendVerificationEmail(
        @CurrentUser() user: User,
        @RequestId() requestId?: string,
    ): Promise<void>
    {
        this.logger.debug(`Sending verification email to: ${maskEmail(user.email)}`, 'AuthController#sendVerificationEmail', requestId);
        await this.authService.sendVerificationEmail(user.email, requestId);
        this.logger.debug(`Verification email sent to: ${maskEmail(user.email)}`, 'AuthController#sendVerificationEmail', requestId);
    }

    @Post('verify-email')
    @HttpCode(HttpStatus.OK)
    async verifyEmail(
        @Body() verifyEmailDto: VerifyEmailDto,
        @RequestId() requestId?: string,
    ): Promise<void>
    {
        this.logger.log('Email verification attempt', 'AuthController#verifyEmail', requestId);
        await this.authService.verifyEmail(verifyEmailDto.token, requestId);
        this.logger.log('Email verification successful', 'AuthController#verifyEmail', requestId);
    }

    @Get('verify-email/:token')
    @HttpCode(HttpStatus.OK)
    async verifyEmailByLink(
        @Param('token') token: string,
        @RequestId() requestId?: string,
    ): Promise<void>
    {
        this.logger.log('Email verification by link attempt', 'AuthController#verifyEmailByLink', requestId);
        await this.authService.verifyEmail(token, requestId);
        this.logger.log('Email verification by link successful', 'AuthController#verifyEmailByLink', requestId);
    }

    @Post('forgot-password')
    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 requests per minute
    @HttpCode(HttpStatus.OK)
    async forgotPassword(
        @Body() forgotPasswordDto: ForgotPasswordDto,
        @RequestId() requestId?: string,
    ): Promise<void>
    {
        this.logger.log(`Password reset request for: ${maskEmail(forgotPasswordDto.email)}`, 'AuthController#forgotPassword', requestId);
        await this.authService.forgotPassword(forgotPasswordDto.email, requestId);
        this.logger.log(`Password reset request processed for: ${maskEmail(forgotPasswordDto.email)}`, 'AuthController#forgotPassword', requestId);
    }

    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    async resetPassword(
        @Body() resetPasswordDto: ResetPasswordDto,
        @RequestId() requestId?: string,
    ): Promise<void>
    {
        this.logger.log('Password reset attempt', 'AuthController#resetPassword', requestId);
        await this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.newPassword, requestId);
        this.logger.log('Password reset successful', 'AuthController#resetPassword', requestId);
    }

    @Get('reset-password/:token')
    @HttpCode(HttpStatus.OK)
    async validateResetToken(
        @Param('token') token: string,
        @RequestId() requestId?: string,
    ): Promise<void>
    {
        this.logger.log('Validating password reset token', 'AuthController#validateResetToken', requestId);
        await this.authService.validatePasswordResetToken(token, requestId);
        this.logger.log('Password reset token is valid', 'AuthController#validateResetToken', requestId);
    }

    // Google OAuth Endpoints
    @Get('oauth/google')
    @HttpCode(HttpStatus.OK)
    getGoogleAuthUrl(@RequestId() requestId?: string): OutGoogleAuthUrlDto
    {
        this.logger.debug('Generating Google OAuth URL', 'AuthController#getGoogleAuthUrl', requestId);
        const result = this.googleService.generateAuthUrl(requestId);
        this.logger.debug('Google OAuth URL generated successfully', 'AuthController#getGoogleAuthUrl', requestId);
        return result;
    }

    @Post('oauth/google/callback')
    @HttpCode(HttpStatus.OK)
    async googleCallback(
        @Body() body: GoogleCallbackDto,
        @RequestId() requestId?: string,
    ): Promise<OutAuthResponseDto>
    {
        this.logger.debug('Processing Google OAuth POST callback', 'AuthController#googleCallback', requestId);
        
        await this.googleService.validateOAuthState(body.state, requestId);
        const tokens = await this.googleService.exchangeCodeForTokens(body.code, requestId);
        const googleUserInfo = await this.googleService.getUserInfo(tokens.access_token, requestId);
        const user = await this.googleService.findOrCreateUser(googleUserInfo, requestId);
        const authResponse = await this.authService.generateAuthResponse(user, requestId);

        this.logger.debug('Google OAuth POST callback processed successfully', 'AuthController#googleCallback', requestId);
        return authResponse;
    }
}
