import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserRole, AuthProvider } from './schemas/user.schema';
import { CreateUserDto } from './dto/in.create-user.dto';
import { UpdateUserProfileDto } from './dto/in.update-user-profile.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { 
    EmailAlreadyExistsException,
    InvalidEmailVerificationTokenException,
    InvalidPasswordResetTokenException,
    EmailAlreadyVerifiedException,
    PasswordChangeNotAllowedException,
    UserNotFoundByIdException,
    PasswordConcurrentChangeException,
} from './exceptions/user.exceptions';
import { DatabaseOperationException } from '../common/exceptions/database.exceptions';
import { PasswordHashingException } from '../auth/exceptions/auth.exceptions';
import { CustomLogger } from '../common/logger/custom.logger';

@Injectable()
export class UserService
{
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        private readonly logger: CustomLogger,
    )
    {
        this.logger.log('UserService initialized', 'UserService#constructor');
    }

    async create(user: CreateUserDto, requestId?: string): Promise<User>
    {
        this.logger.debug(`Attempting to create user with email: ${user.email}`, 'UserService#create', requestId);
        const existingUser = await this.userModel.findOne({ email: user.email }).exec();
        if (existingUser)
        {
            this.logger.warn(`User with email "${user.email}" already exists`, 'UserService#create', requestId);
            throw new EmailAlreadyExistsException(user.email);
        }
        
        // Database operation with error handling
        try 
        {
            const createdUser = new this.userModel(user);
            await createdUser.save();
            this.logger.debug(`User created successfully: ${createdUser.email}`, 'UserService#create', requestId);
            return createdUser;
        }
        catch (error) 
        {
            const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`Database operation failed for user creation: ${user.email}`, errorStack, 'UserService#create', requestId);
            throw new DatabaseOperationException('user creation', errorMessage);
        }
    }

    async findAll(limit: number, offset: number, requestId?: string): Promise<User[]>
    {
        this.logger.debug(`Fetching all users with limit: ${limit}, offset: ${offset}`, 'UserService#findAll', requestId);
        const users = await this.userModel
            .find()
            .skip(offset)
            .limit(limit)
            .exec();
        this.logger.debug(`Found ${users.length} users`, 'UserService#findAll', requestId);
        return users;
    }

    async findById(id: Types.ObjectId, requestId?: string): Promise<User>
    {
        this.logger.debug(`Attempting to find user by ID: ${id}`, 'UserService#findById', requestId);
        
        let user: User | null;
        try 
        {
            user = await this.userModel.findById(id).exec();
        }
        catch (error)
        {
            const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`Database error while finding user by ID: ${id}`, errorStack, 'UserService#findById', requestId);
            throw new DatabaseOperationException('user lookup by ID', errorMessage);
        }
        
        if (!user)
        {
            this.logger.warn(`User with ID "${id}" not found`, 'UserService#findById', requestId);
            throw new UserNotFoundByIdException(id.toString());
        }
        
        this.logger.debug(`User found: ${user.id} with ID: ${id}`, 'UserService#findById', requestId);
        return user;
    }

    async findByEmail(email: string, requestId?: string): Promise<User | null>
    {
        this.logger.debug(`Attempting to find user by email: ${email}`, 'UserService#findByEmail', requestId);
        const user = await this.userModel.findOne({ email }).exec();
        if (!user)
        {
            this.logger.debug(`User with email "${email}" not found`, 'UserService#findByEmail', requestId);
            return null;
        }
        this.logger.debug(`User found: ${user.id}`, 'UserService#findByEmail', requestId);
        return user;
    }

    async findByGoogleId(googleId: string, requestId?: string): Promise<User | null>
    {
        this.logger.debug(`Attempting to find user by Google ID: ${googleId}`, 'UserService#findByGoogleId', requestId);
        const user = await this.userModel.findOne({ googleId }).exec();
        if (!user)
        {
            this.logger.debug(`User with Google ID "${googleId}" not found`, 'UserService#findByGoogleId', requestId);
            return null;
        }
        this.logger.debug(`User found with Google ID: ${googleId}`, 'UserService#findByGoogleId', requestId);
        return user;
    }

    async updateProfile(id: Types.ObjectId, updateData: UpdateUserProfileDto, requestId?: string): Promise<User>
    {
        this.logger.debug(`Attempting to update profile for user ID: ${id}`, 'UserService#updateProfile', requestId);
        
        try 
        {
            const user = await this.userModel.findByIdAndUpdate(
                id,
                { $set: updateData },
                { new: true, runValidators: true }
            ).exec();
            
            if (!user)
            {
                this.logger.warn(`User with ID "${id}" not found for profile update`, 'UserService#updateProfile', requestId);
                throw new UserNotFoundByIdException(id.toString());
            }
            
            this.logger.debug(`Profile updated successfully for user: ${user.id}`, 'UserService#updateProfile', requestId);
            return user;
        }
        catch (error)
        {
            if (error instanceof UserNotFoundByIdException)
            {
                throw error;
            }
            
            // Handle MongoDB validation errors
            if (error instanceof Error && error.name === 'ValidationError')
            {
                this.logger.warn(`Profile validation failed for user ID: ${id} - ${error.message}`, 'UserService#updateProfile', requestId);
                throw new DatabaseOperationException('profile update validation', error.message);
            }
            
            // Handle other database errors
            const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`Database operation failed for profile update: ${id}`, errorStack, 'UserService#updateProfile', requestId);
            throw new DatabaseOperationException('profile update', errorMessage);
        }
    }

    /**
     * Update user's profile picture URLs and keys
     * 
     * @param id User ID
     * @param pictureUrl URL of the main profile picture
     * @param pictureKey S3 key of the main profile picture
     * @param thumbnailUrl URL of the thumbnail
     * @param thumbnailKey S3 key of the thumbnail
     * @returns Updated user with old picture keys (for cleanup)
     */
    async updateProfilePicture(
        id: Types.ObjectId,
        pictureUrl: string,
        pictureKey: string,
        thumbnailUrl: string,
        thumbnailKey: string,
        requestId?: string
    ): Promise<{ user: User; oldPictureKey?: string; oldThumbnailKey?: string }>
    {
        this.logger.debug(`Attempting to update profile picture for user ID: ${id}`, 'UserService#updateProfilePicture', requestId);
        
        try
        {
            // First, get the current user to retrieve old picture keys
            const currentUser = await this.userModel.findById(id).exec();
            if (!currentUser)
            {
                this.logger.warn(`User with ID "${id}" not found for profile picture update`, 'UserService#updateProfilePicture', requestId);
                throw new UserNotFoundByIdException(id.toString());
            }

            const oldPictureKey = currentUser.profilePictureKey;
            const oldThumbnailKey = currentUser.profilePictureThumbnailKey;

            // Update with new picture data
            const user = await this.userModel.findByIdAndUpdate(
                id,
                {
                    $set: {
                        profilePictureUrl: pictureUrl,
                        profilePictureKey: pictureKey,
                        profilePictureThumbnailUrl: thumbnailUrl,
                        profilePictureThumbnailKey: thumbnailKey,
                    }
                },
                { new: true, runValidators: true }
            ).exec();
            
            if (!user)
            {
                this.logger.warn(`User with ID "${id}" not found for profile picture update`, 'UserService#updateProfilePicture', requestId);
                throw new UserNotFoundByIdException(id.toString());
            }
            
            this.logger.debug(`Profile picture updated successfully for user: ${user.id}`, 'UserService#updateProfilePicture', requestId);
            return { user, oldPictureKey, oldThumbnailKey };
        }
        catch (error)
        {
            if (error instanceof UserNotFoundByIdException)
            {
                throw error;
            }
            
            const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`Database operation failed for profile picture update: ${id}`, errorStack, 'UserService#updateProfilePicture', requestId);
            throw new DatabaseOperationException('profile picture update', errorMessage);
        }
    }

    async updateRole(id: Types.ObjectId, role: UserRole, requestId?: string): Promise<User>
    {
        this.logger.debug(`Attempting to update role for user ID: ${id} to role: ${role}`, 'UserService#updateRole', requestId);
        const user = await this.userModel.findByIdAndUpdate(
            id,
            { $set: { role } },
            { new: true, runValidators: true }
        ).exec();
        if (!user)
        {
            this.logger.warn(`User with ID "${id}" not found for role update`, 'UserService#updateRole', requestId);
            throw new UserNotFoundByIdException(id.toString());
        }

        this.logger.debug(`Role updated successfully for user: ${user.id} to role: ${role}`, 'UserService#updateRole', requestId);
        return user;
    }

    async updateStatus(id: Types.ObjectId, isActive: boolean, requestId?: string): Promise<User>
    {
        this.logger.debug(`Attempting to update status for user ID: ${id} to active: ${isActive}`, 'UserService#updateStatus', requestId);
        const user = await this.userModel.findByIdAndUpdate(
            id,
            { $set: { isActive } },
            { new: true, runValidators: true }
        ).exec();
        if (!user)
        {
            this.logger.warn(`User with ID "${id}" not found for status update`, 'UserService#updateStatus', requestId);
            throw new UserNotFoundByIdException(id.toString());
        }

        this.logger.debug(`Status updated successfully for user: ${user.id} to active: ${isActive}`, 'UserService#updateStatus', requestId);
        return user;
    }

    async remove(id: Types.ObjectId, requestId?: string): Promise<void>
    {
        this.logger.debug(`Attempting to remove user with ID: ${id}`, 'UserService#remove', requestId);
        
        
        // TODO: Add business logic validations here when org/subscription modules are implemented
        // Example validations:
        // - Check if user is the sole owner of any organizations
        // - Check if user has active subscriptions
        // - Check if user has pending payments
        // For now, we'll proceed with deletion
        
        try 
        {
            const result = await this.userModel.deleteOne({ _id: id }).exec();
            if (result.deletedCount === 0)
            {
                this.logger.warn(`No user was deleted for ID: ${id}`, 'UserService#remove', requestId);
                throw new UserNotFoundByIdException(id.toString());
            }
        }
        catch (error)
        {
            if (error instanceof UserNotFoundByIdException)
            {
                throw error;
            }
            
            const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`Database error while deleting user: ${id}`, errorStack, 'UserService#remove', requestId);
            throw new DatabaseOperationException('user deletion', errorMessage);
        }
        
        this.logger.debug(`User with ID "${id}" successfully deleted`, 'UserService#remove', requestId);
        return;
    }

    async changePassword(userId: Types.ObjectId, currentPassword: string, newPassword: string, requestId?: string): Promise<void>
    {
        this.logger.debug(`Attempting to change password for user ID: ${userId}`, 'UserService#changePassword', requestId);
        
        // Use findById to get user and handle not found error
        const user = await this.findById(userId, requestId);
        
        if (user.authProvider !== AuthProvider.EMAIL)
        {
            this.logger.warn(`User ${user.id} is not using EMAIL authentication`, 'UserService#changePassword', requestId);
            throw new PasswordChangeNotAllowedException(user.authProvider);
        }
        
        if (!user.hashedPassword || !(await bcrypt.compare(currentPassword, user.hashedPassword)))
        {
            this.logger.warn(`Invalid current password for user: ${user.id}`, 'UserService#changePassword', requestId);
            throw new UnauthorizedException('Current password is incorrect');
        }
        
        let hashedNewPassword: string;
        try 
        {
            const saltOrRounds = 10;
            hashedNewPassword = await bcrypt.hash(newPassword, saltOrRounds);
        }
        catch (error)
        {
            this.logger.error('Password hashing failed during password change', error instanceof Error ? error.stack : undefined, 'UserService#changePassword', requestId);
            throw new PasswordHashingException();
        }
        
        try 
        {
            // Atomic update with condition to prevent race condition
            // Only update if the current password still matches (hasn't been changed by another request)
            const result = await this.userModel.findOneAndUpdate(
                { 
                    _id: userId,
                    hashedPassword: user.hashedPassword,  // Condition: current password must match
                },
                { $set: { hashedPassword: hashedNewPassword } },
                { new: true, runValidators: true }
            ).exec();
            
            if (!result)
            {
                // Password was changed by another request or user was deleted
                this.logger.warn(`Password update failed - password changed concurrently for user: ${user.id}`, 'UserService#changePassword', requestId);
                throw new PasswordConcurrentChangeException();
            }
        }
        catch (error)
        {
            if (error instanceof PasswordConcurrentChangeException)
            {
                throw error;
            }
            
            const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`Database error while updating password for user: ${user.id}`, errorStack, 'UserService#changePassword', requestId);
            throw new DatabaseOperationException('password update', errorMessage);
        }
        
        this.logger.debug(`Password changed successfully for user: ${user.id}`, 'UserService#changePassword', requestId);
        return;
    }

    async updateStripeCustomerId(userId: Types.ObjectId, stripeCustomerId: string, requestId?: string): Promise<User>
    {
        this.logger.debug(`Updating Stripe customer ID for user: ${userId}`, 'UserService#updateStripeCustomerId', requestId);
        const user = await this.userModel.findByIdAndUpdate(
            userId,
            { $set: { stripeCustomerId } },
            { new: true, runValidators: true }
        ).exec();
        if (!user)
        {
            this.logger.warn(`User with ID "${userId}" not found for Stripe customer ID update`, 'UserService#updateStripeCustomerId', requestId);
            throw new UserNotFoundByIdException(userId.toString());
        }
        this.logger.debug(`Stripe customer ID updated successfully for user: ${user.id}`, 'UserService#updateStripeCustomerId', requestId);
        return user;
    }

    async findByStripeCustomerId(stripeCustomerId: string, requestId?: string): Promise<User | null>
    {
        this.logger.debug(`Finding user by Stripe customer ID: ${stripeCustomerId}`, 'UserService#findByStripeCustomerId', requestId);
        
        try 
        {
            const user = await this.userModel.findOne({ stripeCustomerId }).exec();
            
            if (!user) 
            {
                this.logger.warn(`User not found with Stripe customer ID: ${stripeCustomerId}`, 'UserService#findByStripeCustomerId', requestId);
                return null;
            }
            
            this.logger.debug(`User found with Stripe customer ID: ${stripeCustomerId}`, 'UserService#findByStripeCustomerId', requestId);
            return user;
        }
        catch (error)
        {
            const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
            this.logger.error(
                `Database error while finding user by Stripe customer ID: ${stripeCustomerId}`,
                error instanceof Error ? error.stack : undefined,
                'UserService#findByStripeCustomerId',
                requestId
            );
            throw new DatabaseOperationException('user lookup by Stripe customer ID', errorMessage);
        }
    }

    async generateEmailVerificationToken(userId: Types.ObjectId, requestId?: string): Promise<string>
    {
        this.logger.debug(`Generating email verification token for user ID: ${userId}`, 'UserService#generateEmailVerificationToken', requestId);
        
        try 
        {
            const token = crypto.randomBytes(32).toString('hex');
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours from now

            await this.userModel.findByIdAndUpdate(
                userId,
                { 
                    $set: { 
                        emailVerificationToken: token,
                        emailVerificationExpires: expiresAt,
                    },
                },
                { new: true, runValidators: true }
            ).exec();

            this.logger.debug(`Email verification token generated for user ID: ${userId}`, 'UserService#generateEmailVerificationToken', requestId);
            return token;
        }
        catch (error)
        {
            const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
            this.logger.error(`Failed to generate email verification token for user ID: ${userId}`, error instanceof Error ? error.stack : undefined, 'UserService#generateEmailVerificationToken', requestId);
            throw new DatabaseOperationException('email verification token generation', errorMessage);
        }
    }

    async verifyEmail(token: string, requestId?: string): Promise<User>
    {
        this.logger.debug('Attempting to verify email with token', 'UserService#verifyEmail', requestId);
        
        let user: User | null;
        try 
        {
            user = await this.userModel.findOne({
                emailVerificationToken: token,
                emailVerificationExpires: { $gt: new Date() },
            }).exec();
        }
        catch (error)
        {
            const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
            this.logger.error('Database error while finding user by verification token', error instanceof Error ? error.stack : undefined, 'UserService#verifyEmail', requestId);
            throw new DatabaseOperationException('email verification lookup', errorMessage);
        }

        if (!user)
        {
            this.logger.warn('Invalid or expired email verification token', 'UserService#verifyEmail', requestId);
            throw new InvalidEmailVerificationTokenException();
        }

        // Check if email is already verified (business logic validation)
        if (user.isEmailVerified)
        {
            this.logger.warn(`Email already verified for user: ${user.id}`, 'UserService#verifyEmail', requestId);
            throw new EmailAlreadyVerifiedException(user.email);
        }

        let updatedUser: User | null;
        try 
        {
            updatedUser = await this.userModel.findByIdAndUpdate(
                user.id,
                { 
                    $set: { 
                        isEmailVerified: true,
                    },
                    $unset: { 
                        emailVerificationToken: 1,
                        emailVerificationExpires: 1,
                    },
                },
                { new: true, runValidators: true }
            ).exec();
        }
        catch (error)
        {
            const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
            this.logger.error(`Database error while updating user verification status for user ID: ${user.id}`, error instanceof Error ? error.stack : undefined, 'UserService#verifyEmail', requestId);
            throw new DatabaseOperationException('email verification update', errorMessage);
        }

        if (!updatedUser)
        {
            this.logger.error(`Failed to update user after email verification for user ID: ${user.id}`, undefined, 'UserService#verifyEmail', requestId);
            throw new UserNotFoundByIdException(user.id.toString());
        }

        this.logger.debug(`Email verified successfully for user: ${updatedUser.email}`, 'UserService#verifyEmail', requestId);
        return updatedUser;
    }

    async findByEmailVerificationToken(token: string, requestId?: string): Promise<User | null>
    {
        this.logger.debug('Attempting to find user by email verification token', 'UserService#findByEmailVerificationToken', requestId);
        const user = await this.userModel.findOne({
            emailVerificationToken: token,
            emailVerificationExpires: { $gt: new Date() },
        }).exec();

        if (!user)
        {
            this.logger.debug('User not found with valid email verification token', 'UserService#findByEmailVerificationToken', requestId);
            return null;
        }

        this.logger.debug(`User found with email verification token: ${user.id}`, 'UserService#findByEmailVerificationToken', requestId);
        return user;
    }

    async generatePasswordResetToken(email: string, requestId?: string): Promise<string | null>
    {
        this.logger.debug(`Generating password reset token for email: ${email}`, 'UserService#generatePasswordResetToken', requestId);
        
        let user: User | null;
        try 
        {
            user = await this.userModel.findOne({ email }).exec();
        }
        catch (error)
        {
            const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
            this.logger.error(`Database error while finding user for password reset: ${email}`, error instanceof Error ? error.stack : undefined, 'UserService#generatePasswordResetToken', requestId);
            throw new DatabaseOperationException('password reset user lookup', errorMessage);
        }
        
        if (!user)
        {
            this.logger.debug(`User not found for password reset request: ${email}`, 'UserService#generatePasswordResetToken', requestId);
            return null; // Don't reveal if email exists
        }

        if (user.authProvider !== AuthProvider.EMAIL)
        {
            this.logger.debug(`User ${email} is not using EMAIL authentication for password reset`, 'UserService#generatePasswordResetToken', requestId);
            return null; // Don't reveal auth provider
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour from now

        try 
        {
            await this.userModel.findByIdAndUpdate(
                user.id,
                { 
                    $set: { 
                        passwordResetToken: token,
                        passwordResetExpires: expiresAt,
                    },
                },
                { new: true, runValidators: true }
            ).exec();
        }
        catch (error)
        {
            const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
            this.logger.error(`Database error while updating password reset token for user: ${user.id}`, error instanceof Error ? error.stack : undefined, 'UserService#generatePasswordResetToken', requestId);
            throw new DatabaseOperationException('password reset token update', errorMessage);
        }

        this.logger.debug(`Password reset token generated for user: ${user.id}`, 'UserService#generatePasswordResetToken', requestId);
        return token;
    }

    async resetPassword(token: string, newPassword: string, requestId?: string): Promise<User>
    {
        this.logger.debug('Attempting to reset password with token', 'UserService#resetPassword', requestId);
        
        let user: User | null;
        try 
        {
            user = await this.userModel.findOne({
                passwordResetToken: token,
                passwordResetExpires: { $gt: new Date() },
            }).exec();
        }
        catch (error)
        {
            const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
            this.logger.error('Database error while finding user by password reset token', error instanceof Error ? error.stack : undefined, 'UserService#resetPassword', requestId);
            throw new DatabaseOperationException('password reset token lookup', errorMessage);
        }

        if (!user)
        {
            this.logger.warn('Invalid or expired password reset token', 'UserService#resetPassword', requestId);
            throw new InvalidPasswordResetTokenException();
        }

        let hashedPassword: string;
        try 
        {
            const saltOrRounds = 10;
            hashedPassword = await bcrypt.hash(newPassword, saltOrRounds);
        }
        catch (error)
        {
            this.logger.error('Password hashing failed during reset', error instanceof Error ? error.stack : undefined, 'UserService#resetPassword', requestId);
            throw new PasswordHashingException();
        }

        let updatedUser: User | null;
        try 
        {
            updatedUser = await this.userModel.findByIdAndUpdate(
                user.id,
                { 
                    $set: { 
                        hashedPassword,
                    },
                    $unset: { 
                        passwordResetToken: 1,
                        passwordResetExpires: 1,
                    },
                },
                { new: true, runValidators: true }
            ).exec();
        }
        catch (error)
        {
            const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
            this.logger.error(`Database error while updating password for user ID: ${user.id}`, error instanceof Error ? error.stack : undefined, 'UserService#resetPassword', requestId);
            throw new DatabaseOperationException('password reset update', errorMessage);
        }

        if (!updatedUser)
        {
            this.logger.error(`Failed to update user after password reset for user ID: ${user.id}`, undefined, 'UserService#resetPassword', requestId);
            throw new UserNotFoundByIdException(user.id.toString());
        }

        this.logger.debug(`Password reset successfully for user: ${updatedUser.email}`, 'UserService#resetPassword', requestId);
        return updatedUser;
    }

    async findByPasswordResetToken(token: string, requestId?: string): Promise<User | null>
    {
        this.logger.debug('Attempting to find user by password reset token', 'UserService#findByPasswordResetToken', requestId);
        
        let user: User | null;
        try 
        {
            user = await this.userModel.findOne({
                passwordResetToken: token,
                passwordResetExpires: { $gt: new Date() },
            }).exec();
        }
        catch (error)
        {
            const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
            this.logger.error('Database error while finding user by password reset token', error instanceof Error ? error.stack : undefined, 'UserService#findByPasswordResetToken', requestId);
            throw new DatabaseOperationException('password reset token lookup', errorMessage);
        }

        if (!user)
        {
            this.logger.debug('User not found with valid password reset token', 'UserService#findByPasswordResetToken', requestId);
            return null;
        }

        this.logger.debug(`User found with password reset token: ${user.id}`, 'UserService#findByPasswordResetToken', requestId);
        return user;
    }

    async linkGoogleAccount(user: User, googleId: string, requestId?: string): Promise<User>
    {
        this.logger.debug(`Linking Google account to user: ${user.id}`, 'UserService#linkGoogleAccount', requestId);
        
        const updateData: { googleId: string; isEmailVerified: boolean } = {
            googleId: googleId,
            isEmailVerified: true, // Google accounts are always email verified
        };

        const updatedUser = await this.userModel.findByIdAndUpdate(
            user._id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).exec();

        if (!updatedUser) 
        {
            this.logger.warn(`User with ID "${user.id}" not found for Google account linking`, 'UserService#linkGoogleAccount', requestId);
            throw new UserNotFoundByIdException(user.id.toString());
        }

        this.logger.debug(`Google account linked successfully for user: ${updatedUser.email}`, 'UserService#linkGoogleAccount', requestId);
        return updatedUser;
    }
}
