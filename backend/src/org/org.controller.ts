import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Query,
    UseGuards,
    NotFoundException,
    Param,
    Body,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmailVerifiedGuard } from '../auth/guards/email-verified.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../user/schemas/user.schema';
import { OrgService } from './org.service';
import { OrgRole } from './schemas/user-org-relation.schema';
import { UserOrgRelationService } from './user-org-relation.service';
import { OutUserOrgRelationDto } from './dto/out.user-org-relation';
import { OutOrgDto } from './dto/out.org.dto';
import { OutSubscriptionDto } from '../subscription/dto/out.subscription.dto';
import { OutSubscriptionStatusDto } from '../subscription/dto/out.subscription-status.dto';
import { UpdateOrganizationDto } from './dto/in.update-org.dto';
import { UpdateMemberRoleDto } from './dto/in.update-member-role.dto';
import { CreateOrgDto } from './dto/in.create-org.dto';
import { ValidateOrgNameDto } from './dto/in.validate-org-name.dto';
import { ObjectIdValidationPipe } from '../pipes/object-id-validation.pipe';
import { plainToInstance } from 'class-transformer';
import { OrgRolesGuard } from './guards/org-roles.guard';
import { OrgRoles } from './decorators/org-roles.decorator';
import { UserService } from '../user/user.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { SubscriptionStatus } from '../subscription/schemas/subscription.schema';
import { CustomLogger } from '../common/logger/custom.logger';
import { RequestId } from '../common/decorators/request-id.decorator';
import { maskEmail } from '../common/utils/mask-email';
import { 
    OrganizationNotFoundException, 
    SubscriptionNotActiveException, 
    SubscriptionOwnershipException,
    OwnerRoleAssignmentException,
    OwnerRoleModificationException,
    CorruptedUserOrgRelationException,
    OwnerCannotLeaveException,
    CannotRemoveOwnerException,
    CannotRemoveSelfException,
} from './exceptions/org.exceptions';

@Controller('orgs')
@UseGuards(JwtAuthGuard, EmailVerifiedGuard)
export class OrgController
{
    constructor(
        private readonly orgService: OrgService,
        private readonly userOrgRelationService: UserOrgRelationService,
        private readonly userService: UserService,
        private readonly subscriptionService: SubscriptionService,
        private readonly logger: CustomLogger,
    ) { }

    @Post()
    async createOrganization(
        @CurrentUser() user: User,
        @Body() createData: CreateOrgDto,
        @RequestId() requestId?: string,
    ): Promise<OutOrgDto>
    {
        this.logger.log(
            `Creating organization: ${createData.name} for user: ${maskEmail(user.email)} with Stripe subscription: ${createData.stripeSubscriptionId}`,
            'OrgController#createOrganization',
            requestId,
        );
        
        // Find subscription by Stripe subscription ID
        const subscription = await this.subscriptionService.findByStripeSubscriptionId(createData.stripeSubscriptionId, requestId);
        
        if (subscription.userId.toString() !== user.id)
        {
            this.logger.error(
                `Subscription ${createData.stripeSubscriptionId} does not belong to user: ${maskEmail(user.email)}`,
                undefined,
                'OrgController#createOrganization',
                requestId,
            );
            throw new SubscriptionOwnershipException(createData.stripeSubscriptionId);
        }

        // Allow org creation while subscription is pending in Stripe (INCOMPLETE) but block clearly failed states
        const allowedStatuses = new Set<SubscriptionStatus>([
            SubscriptionStatus.ACTIVE,
            SubscriptionStatus.TRIALING,
            SubscriptionStatus.INCOMPLETE,
        ]);

        if (!allowedStatuses.has(subscription.status))
        {
            this.logger.error(
                `Subscription is not in a creatable state (${subscription.status}): ${createData.stripeSubscriptionId}`,
                undefined,
                'OrgController#createOrganization',
                requestId,
            );
            throw new SubscriptionNotActiveException(createData.stripeSubscriptionId);
        }
        
        // Create the organization
        const org = await this.orgService.create(createData, user._id as Types.ObjectId, subscription._id as Types.ObjectId, requestId);
        
        this.logger.log(
            `Organization created successfully: ${org.name} with ID: ${org._id}`,
            'OrgController#createOrganization',
            requestId,
        );
        
        return plainToInstance(OutOrgDto, org.toObject(), { excludeExtraneousValues: true });
    }

    @Get()
    async getUserOrgs(
        @CurrentUser() user: User,
        @Query('orgRole') orgRole?: OrgRole,
        @RequestId() requestId?: string,
    ): Promise<OutUserOrgRelationDto[]>
    {
        this.logger.debug(`Getting organizations for user: ${user.email} with role filter: ${orgRole}`, 'OrgController#getUserOrgs', requestId);
        const userOrgRelations = await this.userOrgRelationService.findAll(user._id as Types.ObjectId, orgRole, undefined, requestId);
        const result: OutUserOrgRelationDto[] = [];
        
        for (const relation of userOrgRelations) 
        {
            // Validate populated data
            if (!relation.orgId || !relation.userId) 
            {
                this.logger.warn(`Corrupted relation found: ${relation.id}`, 'OrgController#getUserOrgs', requestId);
                throw new CorruptedUserOrgRelationException(relation.id, !relation.orgId ? 'organization' : 'user');
            }
            result.push(plainToInstance(OutUserOrgRelationDto, relation.toObject(), { excludeExtraneousValues: true }));
        }
        this.logger.debug(`Returning ${result.length} organization relationships for user`, 'OrgController#getUserOrgs', requestId);
        return result;
    }

    @Get(':id')
    @UseGuards(OrgRolesGuard)
    @OrgRoles(OrgRole.OWNER, OrgRole.MANAGER, OrgRole.STAFF)
    async getOrganization(
        @CurrentUser() user: User,
        @Param('id', ObjectIdValidationPipe) orgId: Types.ObjectId,
        @RequestId() requestId?: string,
    ): Promise<OutOrgDto>
    {
        this.logger.debug(`Getting organization: ${orgId} by user: ${user.email}`, 'OrgController#getOrganization', requestId);
        
        const org = await this.orgService.findById(orgId, requestId);
        if (!org) 
        {
            this.logger.warn(`Organization not found: ${orgId}`, 'OrgController#getOrganization', requestId);
            throw new OrganizationNotFoundException(orgId.toString());
        }
        
        this.logger.debug(`Returning organization: ${org.name}`, 'OrgController#getOrganization', requestId);
        return plainToInstance(OutOrgDto, org.toObject(), { excludeExtraneousValues: true });
    }

    @Get(':id/members')
    @UseGuards(OrgRolesGuard)
    @OrgRoles(OrgRole.OWNER, OrgRole.MANAGER, OrgRole.STAFF)
    async getOrgMembers(
        @CurrentUser() user: User,
        @Param('id', ObjectIdValidationPipe) orgId: Types.ObjectId,
        @RequestId() requestId?: string,
    ): Promise<OutUserOrgRelationDto[]>
    {
        this.logger.debug(`Getting members for organization: ${orgId} by user: ${user.email}`, 'OrgController#getOrgMembers', requestId);
        
        // Verify organization exists (guards already checked access)
        const org = await this.orgService.findById(orgId, requestId);
        if (!org) 
        {
            this.logger.warn(`Organization not found: ${orgId}`, 'OrgController#getOrgMembers', requestId);
            throw new OrganizationNotFoundException(orgId.toString());
        }
        
        // Get all populated user-org relations for this organization
        const orgRelations = await this.userOrgRelationService.findAll(undefined, undefined, orgId, requestId);

        const result: OutUserOrgRelationDto[] = [];
        for (const relation of orgRelations) 
        {
            // Validate populated data
            if (!relation.userId || !relation.orgId) 
            {
                this.logger.warn(`Corrupted relation found: ${relation.id}`, 'OrgController#getOrgMembers', requestId);
                throw new CorruptedUserOrgRelationException(relation.id, !relation.userId ? 'user' : 'organization');
            }
            result.push(plainToInstance(OutUserOrgRelationDto, relation.toObject(), { excludeExtraneousValues: true }));
        }
        
        this.logger.debug(`Returning ${result.length} members for organization: ${orgId}`, 'OrgController#getOrgMembers', requestId);
        return result;
    }

    @Get(':id/subscription/status')
    @UseGuards(OrgRolesGuard)
    @OrgRoles(OrgRole.OWNER, OrgRole.MANAGER, OrgRole.STAFF)
    async getOrgSubscriptionStatus(
        @CurrentUser() user: User,
        @Param('id', ObjectIdValidationPipe) orgId: Types.ObjectId,
        @RequestId() requestId?: string,
    ): Promise<OutSubscriptionStatusDto>
    {
        this.logger.debug(`Getting subscription status for organization: ${orgId} by user: ${user.email}`, 'OrgController#getOrgSubscriptionStatus', requestId);
        
        // Get organization (guards already checked access)
        const org = await this.orgService.findById(orgId, requestId);
        if (!org) 
        {
            this.logger.warn(`Organization not found: ${orgId}`, 'OrgController#getOrgSubscriptionStatus', requestId);
            throw new OrganizationNotFoundException(orgId.toString());
        }
        
        // Get the subscription by ID from org
        const subscription = await this.subscriptionService.findById(org.subscriptionId, requestId);
        
        this.logger.debug(`Returning subscription status for organization: ${orgId}`, 'OrgController#getOrgSubscriptionStatus', requestId);
        return plainToInstance(OutSubscriptionStatusDto, subscription.toObject(), { excludeExtraneousValues: true });
    }

    @Get(':id/subscription')
    @UseGuards(OrgRolesGuard)
    @OrgRoles(OrgRole.OWNER)
    async getOrgSubscription(
        @CurrentUser() user: User,
        @Param('id', ObjectIdValidationPipe) orgId: Types.ObjectId,
        @RequestId() requestId?: string,
    ): Promise<OutSubscriptionDto>
    {
        this.logger.debug(`Getting subscription for organization: ${orgId} by user: ${user.email}`, 'OrgController#getOrgSubscription', requestId);
        
        // Get organization (guards already checked access)
        const org = await this.orgService.findById(orgId, requestId);
        if (!org) 
        {
            this.logger.warn(`Organization not found: ${orgId}`, 'OrgController#getOrgSubscription', requestId);
            throw new OrganizationNotFoundException(orgId.toString());
        }
        
        // Get the subscription by ID from org
        const subscription = await this.subscriptionService.findById(org.subscriptionId, requestId);
        
        this.logger.debug(`Returning subscription for organization: ${orgId}`, 'OrgController#getOrgSubscription', requestId);
        return plainToInstance(OutSubscriptionDto, subscription.toObject(), { excludeExtraneousValues: true });
    }

    @Put(':id')
    @UseGuards(OrgRolesGuard)
    @OrgRoles(OrgRole.OWNER)
    async updateOrg(
        @CurrentUser() user: User,
        @Param('id', ObjectIdValidationPipe) orgId: Types.ObjectId,
        @Body() updateData: UpdateOrganizationDto,
        @RequestId() requestId?: string,
    ): Promise<OutOrgDto>
    {
        this.logger.log(`Updating organization: ${orgId} by user: ${user.id}`, 'OrgController#updateOrganization', requestId);
        const updatedOrg = await this.orgService.update(orgId, updateData, requestId);
        this.logger.log(`Organization updated successfully: ${updatedOrg.name}`, 'OrgController#updateOrganization', requestId);
        return plainToInstance(OutOrgDto, updatedOrg.toObject(), { excludeExtraneousValues: true });
    }

    @Put(':id/members/:userId/role')
    @UseGuards(OrgRolesGuard)
    @OrgRoles(OrgRole.OWNER, OrgRole.MANAGER)
    async updateMemberRole(
        @CurrentUser() user: User,
        @Param('id', ObjectIdValidationPipe) orgId: Types.ObjectId,
        @Param('userId', ObjectIdValidationPipe) userId: Types.ObjectId,
        @Body() updateData: UpdateMemberRoleDto,
        @RequestId() requestId?: string,
    ): Promise<OutUserOrgRelationDto>
    {
        this.logger.log(`Updating member role for user: ${userId} in org: ${orgId} to role: ${updateData.role} by user: ${user.id}`, 'OrgController#updateMemberRole', requestId);
        
        // Prevent assignment of OWNER role through role updates
        if (updateData.role === OrgRole.OWNER)
        {
            this.logger.warn(`Attempt to assign OWNER role to user: ${userId} in org: ${orgId} by user: ${user.id}`, 'OrgController#updateMemberRole', requestId);
            throw new OwnerRoleAssignmentException();
        }
        
        // Verify the target user is a member of the organization
        const targetMember = await this.userOrgRelationService.findOne(userId, orgId, requestId);
        if (!targetMember)
        {
            this.logger.warn(`Target user: ${userId} not found in organization: ${orgId}`, 'OrgController#updateMemberRole', requestId);
            throw new NotFoundException('User is not a member of this organization');
        }
        
        // Prevent modification of OWNER role
        if (targetMember.orgRole === OrgRole.OWNER)
        {
            this.logger.warn(`Attempt to modify OWNER role of user: ${userId} in org: ${orgId} by user: ${user.email}`, 'OrgController#updateMemberRole', requestId);
            throw new OwnerRoleModificationException();
        }
        
        // Update the role
        const updatedRelation = await this.userOrgRelationService.updateRole(userId, orgId, updateData.role, requestId);
        
        // Get populated relation data for response
        const populatedRelations = await this.userOrgRelationService.findAll(userId, undefined, orgId, requestId);
        if (!populatedRelations.length)
        {
            this.logger.error(`Failed to get populated relation data for response`, undefined, 'OrgController#updateMemberRole', requestId);
            throw new CorruptedUserOrgRelationException(updatedRelation.id, 'organization');
        }
        
        const populatedRelation = populatedRelations[0];
        if (!populatedRelation.userId || !populatedRelation.orgId)
        {
            this.logger.error(`Populated relation missing user or org data`, undefined, 'OrgController#updateMemberRole', requestId);
            throw new CorruptedUserOrgRelationException(updatedRelation.id, !populatedRelation.userId ? 'user' : 'organization');
        }
        
        this.logger.log(`Member role updated successfully for user: ${userId} in org: ${orgId} to role: ${updateData.role}`, 'OrgController#updateMemberRole', requestId);
        
        return plainToInstance(OutUserOrgRelationDto, populatedRelation.toObject(), { excludeExtraneousValues: true });
    }

    @Post('validate-name')
    async validateOrgName(
        @CurrentUser() user: User,
        @Body() validateData: ValidateOrgNameDto,
        @RequestId() requestId?: string,
    ): Promise<{ available: boolean }>
    {
        this.logger.debug(`Validating organization name: "${validateData.name}" for user: ${user.email}`, 'OrgController#validateOrgName', requestId);
        
        const available = await this.orgService.isNameAvailable(validateData.name, user._id as Types.ObjectId, requestId);
        
        this.logger.debug(`Organization name "${validateData.name}" availability: ${available}`, 'OrgController#validateOrgName', requestId);
        
        return { available };
    }

    @Post(':id/leave')
    @UseGuards(OrgRolesGuard)
    @OrgRoles(OrgRole.OWNER, OrgRole.MANAGER, OrgRole.STAFF)
    async leaveOrganization(
        @CurrentUser() user: User,
        @Param('id', ObjectIdValidationPipe) orgId: Types.ObjectId,
        @RequestId() requestId?: string,
    ): Promise<void>
    {
        this.logger.log(`User: ${user.id} attempting to leave organization: ${orgId}`, 'OrgController#leaveOrganization', requestId);
        
        // Verify organization exists
        const org = await this.orgService.findById(orgId, requestId);
        if (!org) 
        {
            this.logger.warn(`Organization not found: ${orgId}`, 'OrgController#leaveOrganization', requestId);
            throw new OrganizationNotFoundException(orgId.toString());
        }
        
        // Get the user's membership
        const membership = await this.userOrgRelationService.findOne(user._id as Types.ObjectId, orgId, requestId);
        if (!membership)
        {
            this.logger.warn(`User: ${user.email} is not a member of organization: ${orgId}`, 'OrgController#leaveOrganization', requestId);
            throw new NotFoundException('User is not a member of this organization');
        }
        
        // Prevent owner from leaving
        if (membership.orgRole === OrgRole.OWNER)
        {
            this.logger.warn(`Owner: ${user.email} attempted to leave organization: ${orgId}`, 'OrgController#leaveOrganization', requestId);
            throw new OwnerCannotLeaveException();
        }
        
        // Remove the membership
        await this.userOrgRelationService.remove(user._id as Types.ObjectId, orgId, requestId);
        
        this.logger.log(`User: ${user.id} successfully left organization: ${orgId}`, 'OrgController#leaveOrganization', requestId);
    }

    @Delete(':id/members/:userId')
    @UseGuards(OrgRolesGuard)
    @OrgRoles(OrgRole.OWNER, OrgRole.MANAGER)
    async removeMember(
        @CurrentUser() user: User,
        @Param('id', ObjectIdValidationPipe) orgId: Types.ObjectId,
        @Param('userId', ObjectIdValidationPipe) userId: Types.ObjectId,
        @RequestId() requestId?: string,
    ): Promise<void>
    {
        this.logger.debug(`User: ${user.email} attempting to remove member: ${userId} from organization: ${orgId}`, 'OrgController#removeMember', requestId);
        
        // Verify organization exists
        const org = await this.orgService.findById(orgId, requestId);
        if (!org) 
        {
            this.logger.warn(`Organization not found: ${orgId}`, 'OrgController#removeMember', requestId);
            throw new OrganizationNotFoundException(orgId.toString());
        }
        
        // Prevent removing self (use leave endpoint instead)
        if (user.id === userId.toString())
        {
            this.logger.warn(`User: ${user.email} attempted to remove themselves via remove endpoint`, 'OrgController#removeMember', requestId);
            throw new CannotRemoveSelfException();
        }
        
        // Get the target member's membership
        const targetMembership = await this.userOrgRelationService.findOne(userId, orgId, requestId);
        if (!targetMembership)
        {
            this.logger.warn(`Target user: ${userId} is not a member of organization: ${orgId}`, 'OrgController#removeMember', requestId);
            throw new NotFoundException('User is not a member of this organization');
        }
        
        // Prevent removing the owner
        if (targetMembership.orgRole === OrgRole.OWNER)
        {
            this.logger.warn(`User: ${user.email} attempted to remove owner from organization: ${orgId}`, 'OrgController#removeMember', requestId);
            throw new CannotRemoveOwnerException();
        }
        
        // Remove the membership
        await this.userOrgRelationService.remove(userId, orgId, requestId);
        
        this.logger.debug(`Member: ${userId} successfully removed from organization: ${orgId} by user: ${user.email}`, 'OrgController#removeMember', requestId);
    }

}
