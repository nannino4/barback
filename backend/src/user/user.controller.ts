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
import { RequestId } from '../common/decorators/request-id.decorator';

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
    async getCurrentUser(
        @CurrentUser() user: User,
        @RequestId() requestId?: string,
    ): Promise<OutUserDto>
    {
        this.logger.debug(`User fetching own profile: ${user.email}`, 'UserController#getCurrentUser', requestId);
        return plainToInstance(OutUserDto, user.toObject(), { excludeExtraneousValues: true });
    }

    @Put('me')
    async updateCurrentUserProfile(
        @CurrentUser() user: User,
        @Body() updateData: UpdateUserProfileDto,
        @RequestId() requestId?: string,
    ): Promise<OutUserDto>
    {
        this.logger.log(`User updating own profile: ${user.id}`, 'UserController#updateCurrentUserProfile', requestId);
        const updatedUser = await this.userService.updateProfile(user.id, updateData, requestId);
        this.logger.log(`User profile updated successfully: ${updatedUser.id}`, 'UserController#updateCurrentUserProfile', requestId);
        return plainToInstance(OutUserDto, updatedUser.toObject(), { excludeExtraneousValues: true });
    }

    @Put('me/profile-picture')
    @UseInterceptors(FileInterceptor('file'))
    async uploadProfilePicture(
        @CurrentUser() user: User,
        @UploadedFile(ProfilePictureValidationPipe) file: Express.Multer.File,
        @RequestId() requestId?: string,
    ): Promise<OutUserDto>
    {
        this.logger.log(`User uploading profile picture: ${user.id}`, 'UserController#uploadProfilePicture', requestId);

        // Upload to storage (processes image, generates thumbnail, deletes old files)
        const uploadResult = await this.storageService.updateProfilePicture({
            userId: user.id.toString(),
            contentType: file.mimetype,
            bytes: file.buffer,
            oldPictureKey: user.profilePictureKey,
            oldThumbnailKey: user.profilePictureThumbnailKey,
        }, requestId);

        // Update user with new picture URLs and keys
        const { user: updatedUser } = await this.userService.updateProfilePicture(
            user.id,
            uploadResult.picture.url,
            uploadResult.picture.key,
            uploadResult.thumbnail.url,
            uploadResult.thumbnail.key
            ,
            requestId,
        );

        // File storage success stays debug (handled in storage layer); profile update is an info-level business event.
        this.logger.log(`User profile picture updated: ${updatedUser.id}`, 'UserController#uploadProfilePicture', requestId);
        return plainToInstance(OutUserDto, updatedUser.toObject(), { excludeExtraneousValues: true });
    }

    @Put('me/password')
    @HttpCode(HttpStatus.OK)
    async changeCurrentUserPassword(
        @CurrentUser() user: User,
        @Body() changePasswordDto: ChangePasswordDto,
        @RequestId() requestId?: string,
    ): Promise<void>
    {
        this.logger.log(`User attempting to change password: ${user.id}`, 'UserController#changeCurrentUserPassword', requestId);
        await this.userService.changePassword(
            user.id,
            changePasswordDto.currentPassword,
            changePasswordDto.newPassword
            ,
            requestId,
        );
        this.logger.log(`Password changed successfully for user: ${user.id}`, 'UserController#changeCurrentUserPassword', requestId);
    }

    @Delete('me')
    @HttpCode(HttpStatus.OK)
    async deleteCurrentUser(
        @CurrentUser() user: User,
        @RequestId() requestId?: string,
    ): Promise<void>
    {
        this.logger.log(`User attempting to delete own account: ${user.id}`, 'UserController#deleteCurrentUser', requestId);
        const result = await this.userService.remove(user.id, requestId);
        this.logger.log(`User account deletion result: ${JSON.stringify(result)}`, 'UserController#deleteCurrentUser', requestId);
    }
}
