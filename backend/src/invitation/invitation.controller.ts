import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    UseGuards,
    NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmailVerifiedGuard } from '../auth/guards/email-verified.guard';
import { OrgRolesGuard } from '../org/guards/org-roles.guard';
import { OrgSubscriptionGuard } from '../org/guards/org-subscription.guard';
import { OrgRoles } from '../org/decorators/org-roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { InvitationService } from './invitation.service';
import { OrgService } from '../org/org.service';
import { InCreateInvitationDto } from './dto/in.create-invitation.dto';
import { OutInvitationDto } from './dto/out.invitation.dto';
import { OrgRole } from '../org/schemas/user-org-relation.schema';
import { ObjectIdValidationPipe } from '../pipes/object-id-validation.pipe';
import { User } from '../user/schemas/user.schema';
import { plainToInstance } from 'class-transformer';
import { Types } from 'mongoose';
import { CustomLogger } from '../common/logger/custom.logger';
import { RequestId } from '../common/decorators/request-id.decorator';
import { maskEmail } from '../common/utils/mask-email';

/**
 * Controller for organization owners and managers to manage invitations.
 * Provides endpoints for sending, viewing, and revoking organization invitations.
 * All endpoints require authentication and appropriate organization roles.
 */
@Controller()
@UseGuards(JwtAuthGuard, EmailVerifiedGuard, OrgRolesGuard)
export class InvitationController 
{
    constructor(
        private readonly invitationService: InvitationService,
        private readonly orgService: OrgService,
        private readonly logger: CustomLogger,
    ) {}

    /**
     * Send a new invitation to join the organization.
     * Only organization owners and managers can send invitations.
     * @param orgId - The organization ID
     * @param createInviteDto - Invitation details (email and role)
     * @param user - The authenticated user sending the invitation
     * @returns The created invitation
     */
    @Post('orgs/:orgId/invitations')
    @UseGuards(OrgSubscriptionGuard)
    @OrgRoles(OrgRole.OWNER, OrgRole.MANAGER)
    async sendInvitation(
        @Param('orgId', ObjectIdValidationPipe) orgId: Types.ObjectId,
        @Body() createInviteDto: InCreateInvitationDto,
        @CurrentUser() user: User,
        @RequestId() requestId?: string,
    ): Promise<OutInvitationDto> 
    {
        this.logger.log(
            `User ${user._id} sending invitation to ${maskEmail(createInviteDto.invitedEmail)} for org ${orgId}`,
            'InvitationController#sendInvitation',
            requestId,
        );

        // Get organization name for the email
        const organization = await this.orgService.findById(orgId);
        if (!organization) 
        {
            throw new NotFoundException('Organization not found');
        }
        
        const invitation = await this.invitationService.createInvitation(
            orgId,
            user,
            createInviteDto,
            organization.name,
            requestId,
        );
        this.logger.log(
            `Invitation ${(invitation._id as Types.ObjectId).toString()} created for email=${maskEmail(invitation.invitedEmail)} orgId=${orgId.toString()} role=${invitation.role}`,
            'InvitationController#sendInvitation',
            requestId,
        );
        return plainToInstance(OutInvitationDto, invitation.toObject(), { excludeExtraneousValues: true });
    }

    /**
     * Get all pending invitations for the organization.
     * Only organization owners and managers can view invitations.
     * Returns populated data showing who sent each invitation.
     * @param orgId - The organization ID
     * @returns List of pending invitations with populated inviter info
     */
    @Get('orgs/:orgId/invitations')
    @UseGuards(OrgSubscriptionGuard)
    @OrgRoles(OrgRole.OWNER, OrgRole.MANAGER)
    async getOrganizationInvitations(
        @Param('orgId', ObjectIdValidationPipe) orgId: Types.ObjectId,
        @RequestId() requestId?: string,
    ): Promise<OutInvitationDto[]> 
    {
        this.logger.debug(`Getting invitations for organization ${orgId}`, 'InvitationController#getOrganizationInvitations', requestId);
        
        const invitations = await this.invitationService.findPendingInvitationsByOrg(orgId, requestId);
        this.logger.debug(
            `Found ${invitations.length} pending invitations for orgId=${orgId.toString()}`,
            'InvitationController#getOrganizationInvitations',
            requestId,
        );
        return invitations.map(invitation => 
            plainToInstance(OutInvitationDto, invitation.toObject(), { excludeExtraneousValues: true }),
        );
    }

    /**
     * Revoke a pending invitation.
     * Only organization owners and managers can revoke invitations.
     * @param orgId - The organization ID
     * @param invitationId - The invitation ID to revoke
     * @returns Success message
     */
    @Delete('orgs/:orgId/invitations/:invitationId')
    @UseGuards(OrgSubscriptionGuard)
    @OrgRoles(OrgRole.OWNER, OrgRole.MANAGER)
    async revokeInvitation(
        @Param('orgId', ObjectIdValidationPipe) orgId: Types.ObjectId,
        @Param('invitationId', ObjectIdValidationPipe) invitationId: Types.ObjectId,
        @RequestId() requestId?: string,
    ): Promise<OutInvitationDto> 
    {
        this.logger.debug(
            `Revoking invitation ${invitationId} for organization ${orgId}`,
            'InvitationController#revokeInvitation',
            requestId,
        );
        
        const invitation = await this.invitationService.revokeInvitation(invitationId, orgId, requestId);
        this.logger.debug(
            `Invitation ${(invitation._id as Types.ObjectId).toString()} revoked (status=${invitation.status})`,
            'InvitationController#revokeInvitation',
            requestId,
        );
        return plainToInstance(OutInvitationDto, invitation.toObject(), { excludeExtraneousValues: true });
    }

    /**
     * Get all pending invitations for the current user.
     * Returns populated data with organization and inviter details.
     * @param user - The authenticated user
     * @returns List of pending invitations with populated fields
     */
    @Get('invites')
    async getUserPendingInvitations(
        @CurrentUser() user: User,
        @RequestId() requestId?: string,
    ): Promise<OutInvitationDto[]> 
    {
        this.logger.debug(`Getting pending invitations for user ${user._id}`, 'InvitationController#getUserPendingInvitations', requestId);
        
        const invitations = await this.invitationService.findPendingInvitationsByEmail(user.email, requestId);
        this.logger.debug(
            `Found ${invitations.length} pending invitations for userId=${(user._id as Types.ObjectId).toString()}`,
            'InvitationController#getUserPendingInvitations',
            requestId,
        );
        return invitations.map(invitation => 
            plainToInstance(OutInvitationDto, invitation.toObject(), { excludeExtraneousValues: true }),
        );
    }

    /**
     * Accept an invitation as an authenticated user.
     * @param invitationId - The invitation id
     * @param user - The authenticated user
     * @returns Success message
     */
    @Post('invites/:invitationId/accept')
    async acceptInvitation(
        @Param('invitationId', ObjectIdValidationPipe) invitationId: Types.ObjectId,
        @CurrentUser() user: User,
        @RequestId() requestId?: string,
    ): Promise<OutInvitationDto> 
    {
        this.logger.log(`User ${user._id} accepting invitation ${invitationId}`, 'InvitationController#acceptInvitation', requestId);
        
        const invitation = await this.invitationService.acceptInvitation(invitationId, user._id as Types.ObjectId, requestId);
        this.logger.log(
            `Invitation ${(invitation._id as Types.ObjectId).toString()} accepted by user ${(user._id as Types.ObjectId).toString()} orgId=${String(invitation.orgId)}`,
            'InvitationController#acceptInvitation',
            requestId,
        );
        return plainToInstance(OutInvitationDto, invitation.toObject(), { excludeExtraneousValues: true });
    }

    /**
     * Decline an invitation as an authenticated user.
     * @param invitationId - The invitation id
     * @returns Success message
     */
    @Post('invites/:invitationId/decline')
    async declineInvitation(
        @Param('invitationId', ObjectIdValidationPipe) invitationId: Types.ObjectId,
        @RequestId() requestId?: string,
    ): Promise<OutInvitationDto> 
    {
        this.logger.log(`Declining invitation ${invitationId}`, 'InvitationController#declineInvitation', requestId);
        
        const invitation = await this.invitationService.declineInvitation(invitationId, requestId);
        this.logger.log(
            `Invitation ${(invitation._id as Types.ObjectId).toString()} declined (status=${invitation.status})`,
            'InvitationController#declineInvitation',
            requestId,
        );
        return plainToInstance(OutInvitationDto, invitation.toObject(), { excludeExtraneousValues: true });
    }
}
