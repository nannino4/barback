import { 
    Controller, 
    Get, 
    UseGuards, 
    Delete, 
    HttpCode, 
    HttpStatus, 
    Put, 
    Body,
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmailVerifiedGuard } from '../auth/guards/email-verified.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateUserProfileDto } from './dto/in.update-user-profile.dto';
import { ChangePasswordDto } from './dto/in.change-password.dto';
import { User } from './schemas/user.schema';
import { OutUserDto } from './dto/out.user.dto';
import { plainToInstance } from 'class-transformer';
import { CustomLogger } from '../common/logger/custom.logger';
import { StorageService } from '../storage/storage.service';
import { ProfilePictureValidationPipe } from '../pipes/profile-picture-validation.pipe';

@Controller('users')
@UseGuards(JwtAuthGuard, EmailVerifiedGuard)
export class UserController
{
    constructor(
        private readonly userService: UserService,
        private readonly storageService: StorageService,
        private readonly logger: CustomLogger,
    ) { }

    // User Self-Profile Management Endpoints
    
    @Get('me')
    async getCurrentUser(@CurrentUser() user: User): Promise<OutUserDto>
    {
        this.logger.debug(`User fetching own profile: ${user.email}`, 'UserController#getCurrentUser');
        return plainToInstance(OutUserDto, user.toObject(), { excludeExtraneousValues: true });
    }

    @Put('me')
    async updateCurrentUserProfile(
        @CurrentUser() user: User,
        @Body() updateData: UpdateUserProfileDto
    ): Promise<OutUserDto>
    {
        this.logger.debug(`User updating own profile: ${user.email}`, 'UserController#updateCurrentUserProfile');
        const updatedUser = await this.userService.updateProfile(user.id, updateData);
        this.logger.debug(`User profile updated successfully: ${updatedUser.email}`, 'UserController#updateCurrentUserProfile');
        return plainToInstance(OutUserDto, updatedUser.toObject(), { excludeExtraneousValues: true });
    }

    @Put('me/profile-picture')
    @UseInterceptors(FileInterceptor('file'))
    async uploadProfilePicture(
        @CurrentUser() user: User,
        @UploadedFile(ProfilePictureValidationPipe) file: Express.Multer.File
    ): Promise<OutUserDto>
    {
        this.logger.debug(`User uploading profile picture: ${user.email}`, 'UserController#uploadProfilePicture');

        // Upload to storage (processes image and generates thumbnail)
        const uploadResult = await this.storageService.uploadUserProfilePicture({
            userId: user.id.toString(),
            contentType: file.mimetype,
            bytes: file.buffer,
        });

        // Update user with new picture URLs and keys
        // Note: S3 keys are deterministic based on userId, so uploading with
        // the same key automatically replaces the old object - no deletion needed.
        const { user: updatedUser } = await this.userService.updateProfilePicture(
            user.id,
            uploadResult.picture.url,
            uploadResult.picture.key,
            uploadResult.thumbnail.url,
            uploadResult.thumbnail.key
        );

        this.logger.debug(`Profile picture uploaded successfully for user: ${updatedUser.email}`, 'UserController#uploadProfilePicture');
        return plainToInstance(OutUserDto, updatedUser.toObject(), { excludeExtraneousValues: true });
    }

    @Put('me/password')
    @HttpCode(HttpStatus.OK)
    async changeCurrentUserPassword(
        @CurrentUser() user: User,
        @Body() changePasswordDto: ChangePasswordDto
    ): Promise<void>
    {
        this.logger.debug(`User attempting to change password: ${user.email}`, 'UserController#changeCurrentUserPassword');
        await this.userService.changePassword(
            user.id,
            changePasswordDto.currentPassword,
            changePasswordDto.newPassword
        );
        this.logger.debug(`Password changed successfully for user: ${user.email}`, 'UserController#changeCurrentUserPassword');
    }

    @Delete('me')
    @HttpCode(HttpStatus.OK)
    async deleteCurrentUser(@CurrentUser() user: User): Promise<void>
    {
        this.logger.debug(`User attempting to delete own account: ${user.email}`, 'UserController#deleteCurrentUser');
        const result = await this.userService.remove(user.id);
        this.logger.debug(`User account deletion result: ${JSON.stringify(result)}`, 'UserController#deleteCurrentUser');
    }
}
