import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, Types } from 'mongoose';
import { OrgRole, UserOrgRelation } from './schemas/user-org-relation.schema';
import { CustomLogger } from '../common/logger/custom.logger';
import { DatabaseOperationException } from '../common/exceptions/database.exceptions';
import { UserNotMemberException } from './exceptions/org.exceptions';

@Injectable()
export class UserOrgRelationService 
{
    constructor(
        @InjectModel(UserOrgRelation.name) private readonly userOrgRelationModel: Model<UserOrgRelation>,
        private readonly logger: CustomLogger,
    ) {}


    async findAll(userId?: Types.ObjectId, orgRole?: OrgRole, orgId?: Types.ObjectId, requestId?: string): Promise<UserOrgRelation[]>
    {
        this.logger.debug(`Finding user-org relations with userId: ${userId}, orgRole: ${orgRole}, orgId: ${orgId}`, 'UserOrgRelationService#findAll', requestId);
        
        try 
        {
            const query: FilterQuery<UserOrgRelation> = {};
            
            if (userId !== null && userId !== undefined)
            {
                query.userId = userId;
            }
            
            if (orgRole !== null && orgRole !== undefined)
            {
                query.orgRole = orgRole;
            }
            
            if (orgId !== null && orgId !== undefined)
            {
                query.orgId = orgId;
            }
            
            const userOrgRelations = await this.userOrgRelationModel
                .find(query)
                .populate('userId', 'id email firstName lastName profilePictureUrl')
                .populate({
                    path: 'orgId',
                    populate: {
                        path: 'ownerId',
                        select: 'id email firstName lastName profilePictureUrl',
                    },
                })
                .exec();
            this.logger.debug(`Found ${userOrgRelations.length} user-org relations`, 'UserOrgRelationService#findAll', requestId);
            return userOrgRelations;
        }
        catch (error)
        {
            const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`Database error during user-org relations lookup`, errorStack, 'UserOrgRelationService#findAll', requestId);
            throw new DatabaseOperationException('user-org relations lookup', errorMessage);
        }
    }

    async findOne(userId: Types.ObjectId, orgId: Types.ObjectId, requestId?: string): Promise<UserOrgRelation | null>
    {
        this.logger.debug(`Finding user-org relationship for user: ${userId} in org: ${orgId}`, 'UserOrgRelationService#findOne', requestId);
        
        try 
        {
            const relationship = await this.userOrgRelationModel
                .findOne({ 
                    userId: userId, 
                    orgId: orgId, 
                })
                .exec();
            if (!relationship) 
            {
                this.logger.warn(`No relationship found for user: ${userId} in org: ${orgId}`, 'UserOrgRelationService#findOne', requestId);
            }
            else 
            {
                this.logger.debug(`Found relationship: ${relationship.orgRole} for user: ${userId} in org: ${orgId}`, 'UserOrgRelationService#findOne', requestId);
            }
            return relationship;
        }
        catch (error)
        {
            const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`Database error during user-org relationship lookup: user ${userId} in org ${orgId}`, errorStack, 'UserOrgRelationService#findOne', requestId);
            throw new DatabaseOperationException('user-org relationship lookup', errorMessage);
        }
    }

    async updateRole(userId: Types.ObjectId, orgId: Types.ObjectId, newRole: OrgRole, requestId?: string): Promise<UserOrgRelation>
    {
        this.logger.debug(`Attempting to update role for user: ${userId} in org: ${orgId} to role: ${newRole}`, 'UserOrgRelationService#updateRole', requestId);
        
        try 
        {
            const relationship = await this.userOrgRelationModel.findOneAndUpdate(
                { userId: userId, orgId: orgId },
                { $set: { orgRole: newRole } },
                { new: true, runValidators: true },
            ).exec();
            
            if (!relationship)
            {
                this.logger.warn(`User-org relationship not found for user: ${userId} in org: ${orgId}`, 'UserOrgRelationService#updateRole', requestId);
                throw new UserNotMemberException(userId.toString(), orgId.toString());
            }
            
            this.logger.debug(`Role updated successfully for user: ${userId} in org: ${orgId} to role: ${newRole}`, 'UserOrgRelationService#updateRole', requestId);
            return relationship;
        }
        catch (error)
        {
            if (error instanceof UserNotMemberException)
            {
                throw error;
            }
            const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`Database error during role update: user ${userId} in org ${orgId}`, errorStack, 'UserOrgRelationService#updateRole', requestId);
            throw new DatabaseOperationException('user-org role update', errorMessage);
        }
    }

    async remove(userId: Types.ObjectId, orgId: Types.ObjectId, requestId?: string): Promise<void>
    {
        this.logger.debug(`Attempting to remove user: ${userId} from org: ${orgId}`, 'UserOrgRelationService#remove', requestId);
        
        try 
        {
            const result = await this.userOrgRelationModel.findOneAndDelete({
                userId: userId,
                orgId: orgId,
            }).exec();
            
            if (!result)
            {
                this.logger.warn(`User-org relationship not found for user: ${userId} in org: ${orgId}`, 'UserOrgRelationService#remove', requestId);
                throw new UserNotMemberException(userId.toString(), orgId.toString());
            }
            
            this.logger.debug(`Successfully removed user: ${userId} from org: ${orgId}`, 'UserOrgRelationService#remove', requestId);
        }
        catch (error)
        {
            if (error instanceof UserNotMemberException)
            {
                throw error;
            }
            const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`Database error during user removal from org: user ${userId} in org ${orgId}`, errorStack, 'UserOrgRelationService#remove', requestId);
            throw new DatabaseOperationException('user-org relationship removal', errorMessage);
        }
    }
}
