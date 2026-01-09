import {
    Controller,
    Get,
    Put,
    Delete,
    Param,
    Body,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { UserService } from '../user/user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmailVerifiedGuard } from '../auth/guards/email-verified.guard';
import { UserRolesGuard } from '../auth/guards/user-roles.guard';
import { UserRoles } from '../auth/decorators/user-roles.decorator';
import { UserRole } from '../user/schemas/user.schema';
import { UpdateUserProfileDto } from '../user/dto/in.update-user-profile.dto';
import { UpdateUserRoleDto } from './dto/in.update-user-role.dto';
import { UpdateUserStatusDto } from './dto/in.update-user-status.dto';
import { OutAdminUserDto } from './dto/out.admin-user.dto';
import { ObjectIdValidationPipe } from '../pipes/object-id-validation.pipe';
import { plainToInstance } from 'class-transformer';
import { CustomLogger } from '../common/logger/custom.logger';
import { RequestId } from '../common/decorators/request-id.decorator';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, EmailVerifiedGuard, UserRolesGuard)
@UserRoles(UserRole.ADMIN)
export class AdminController
{
    constructor(
        private readonly userService: UserService,
        private readonly logger: CustomLogger,
    )
    {
        this.logger.log('AdminController initialized', 'AdminController#constructor');
    }

    @Get()
    async getAllUsers(
        @Query('limit') limit: string = '10',
        @Query('offset') offset: string = '0'
        ,
        @RequestId() requestId?: string,
    ): Promise<OutAdminUserDto[]>
    {
        this.logger.debug(`Admin fetching all users with limit: ${limit}, offset: ${offset}`, 'AdminController#getAllUsers', requestId);
        const limitNum = parseInt(limit, 10);
        const offsetNum = parseInt(offset, 10);
        
        const users = await this.userService.findAll(limitNum, offsetNum, requestId);
        this.logger.debug(`Admin found ${users.length} users`, 'AdminController#getAllUsers', requestId);
        return users.map(user => plainToInstance(OutAdminUserDto, user.toObject(), { excludeExtraneousValues: true }));
    }

    @Get(':id')
    async getUserById(
        @Param('id', ObjectIdValidationPipe) id: Types.ObjectId,
        @RequestId() requestId?: string,
    ): Promise<OutAdminUserDto>
    {
        this.logger.debug(`Admin fetching user by ID: ${id}`, 'AdminController#getUserById', requestId);
        const user = await this.userService.findById(id, requestId);
        this.logger.debug(`Admin found user: ${user.id}`, 'AdminController#getUserById', requestId);
        return plainToInstance(OutAdminUserDto, user.toObject(), { excludeExtraneousValues: true });
    }

    @Put(':id/profile')
    async updateUserProfile(
        @Param('id', ObjectIdValidationPipe) id: Types.ObjectId,
        @Body() updateData: UpdateUserProfileDto,
        @RequestId() requestId?: string,
    ): Promise<OutAdminUserDto>
    {
        this.logger.log(`Admin updating user profile for ID: ${id}`, 'AdminController#updateUserProfile', requestId);
        const user = await this.userService.updateProfile(id, updateData, requestId);
        this.logger.log(`Admin updated user profile userId=${user.id}`, 'AdminController#updateUserProfile', requestId);
        return plainToInstance(OutAdminUserDto, user.toObject(), { excludeExtraneousValues: true });
    }

    @Put(':id/role')
    async updateUserRole(
        @Param('id', ObjectIdValidationPipe) id: Types.ObjectId,
        @Body() updateData: UpdateUserRoleDto,
        @RequestId() requestId?: string,
    ): Promise<OutAdminUserDto>
    {
        this.logger.log(`Admin updating user role for ID: ${id} to role: ${updateData.role}`, 'AdminController#updateUserRole', requestId);
        const user = await this.userService.updateRole(id, updateData.role, requestId);
        this.logger.log(`Admin updated user role userId=${user.id} role=${user.role}`, 'AdminController#updateUserRole', requestId);
        return plainToInstance(OutAdminUserDto, user.toObject(), { excludeExtraneousValues: true });
    }

    @Put(':id/status')
    async updateUserStatus(
        @Param('id', ObjectIdValidationPipe) id: Types.ObjectId,
        @Body() updateData: UpdateUserStatusDto,
        @RequestId() requestId?: string,
    ): Promise<OutAdminUserDto>
    {
        this.logger.log(`Admin updating user status for ID: ${id} to active: ${updateData.isActive}`, 'AdminController#updateUserStatus', requestId);
        const user = await this.userService.updateStatus(id, updateData.isActive, requestId);
        this.logger.log(`Admin updated user status userId=${user.id} isActive=${user.isActive}`, 'AdminController#updateUserStatus', requestId);
        return plainToInstance(OutAdminUserDto, user.toObject(), { excludeExtraneousValues: true });
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async deleteUser(
        @Param('id', ObjectIdValidationPipe) id: Types.ObjectId,
        @RequestId() requestId?: string,
    )
    {
        this.logger.log(`Admin attempting to delete user with ID: ${id}`, 'AdminController#deleteUser', requestId);
        const result = await this.userService.remove(id, requestId);
        this.logger.log(`Admin deleted user userId=${id.toString()}`, 'AdminController#deleteUser', requestId);
        this.logger.debug(`Admin user deletion result: ${JSON.stringify(result)}`, 'AdminController#deleteUser', requestId);
        return ;
    }
}
