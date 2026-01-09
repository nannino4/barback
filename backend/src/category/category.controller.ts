import { 
    Controller, 
    Get, 
    Post, 
    Put, 
    Delete, 
    Body, 
    Param, 
    UseGuards,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { CategoryService } from './category.service';
import { InCreateCategoryDto } from './dto/in.create-category.dto';
import { InUpdateCategoryDto } from './dto/in.update-category.dto';
import { OutCategoryDto } from './dto/out.category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmailVerifiedGuard } from '../auth/guards/email-verified.guard';
import { OrgRolesGuard } from '../org/guards/org-roles.guard';
import { OrgSubscriptionGuard } from '../org/guards/org-subscription.guard';
import { OrgRoles } from '../org/decorators/org-roles.decorator';
import { OrgRole } from '../org/schemas/user-org-relation.schema';
import { ObjectIdValidationPipe } from '../pipes/object-id-validation.pipe';
import { plainToInstance } from 'class-transformer';
import { CustomLogger } from '../common/logger/custom.logger';
import { RequestId } from '../common/decorators/request-id.decorator';

@Controller('orgs/:orgId/categories')
@UseGuards(JwtAuthGuard, EmailVerifiedGuard, OrgRolesGuard, OrgSubscriptionGuard)
export class CategoryController 
{
    constructor(
        private readonly categoryService: CategoryService,
        private readonly logger: CustomLogger,
    ) {}

    @Get()
    @OrgRoles(OrgRole.OWNER, OrgRole.MANAGER, OrgRole.STAFF)
    async getCategories(
        @Param('orgId', ObjectIdValidationPipe) orgId: Types.ObjectId,
        @RequestId() requestId?: string,
    ): Promise<OutCategoryDto[]> 
    {
        this.logger.debug(`Getting categories for org ${orgId}`, 'CategoryController#getCategories', requestId);
        
        const categories = await this.categoryService.findCategoriesByOrg(orgId, requestId);
        return plainToInstance(OutCategoryDto, categories, { excludeExtraneousValues: true });
    }

    @Get(':id')
    @OrgRoles(OrgRole.OWNER, OrgRole.MANAGER, OrgRole.STAFF)
    async getCategory(
        @Param('orgId', ObjectIdValidationPipe) orgId: Types.ObjectId,
        @Param('id', ObjectIdValidationPipe) categoryId: Types.ObjectId,
        @RequestId() requestId?: string,
    ): Promise<OutCategoryDto> 
    {
        this.logger.debug(`Getting category ${categoryId} for org ${orgId}`, 'CategoryController#getCategory', requestId);
        
        const category = await this.categoryService.findCategoryById(orgId, categoryId, requestId);
        return plainToInstance(OutCategoryDto, category, { excludeExtraneousValues: true });
    }

    @Post()
    @OrgRoles(OrgRole.OWNER, OrgRole.MANAGER)
    async createCategory(
        @Param('orgId', ObjectIdValidationPipe) orgId: Types.ObjectId,
        @Body() createCategoryDto: InCreateCategoryDto,
        @RequestId() requestId?: string,
    ): Promise<OutCategoryDto> 
    {
        this.logger.debug(`Creating category for org ${orgId}`, 'CategoryController#createCategory', requestId);
        
        const category = await this.categoryService.createCategory(orgId, createCategoryDto, requestId);
        return plainToInstance(OutCategoryDto, category, { excludeExtraneousValues: true });
    }

    @Put(':id')
    @OrgRoles(OrgRole.OWNER, OrgRole.MANAGER)
    async updateCategory(
        @Param('orgId', ObjectIdValidationPipe) orgId: Types.ObjectId,
        @Param('id', ObjectIdValidationPipe) categoryId: Types.ObjectId,
        @Body() updateCategoryDto: InUpdateCategoryDto,
        @RequestId() requestId?: string,
    ): Promise<OutCategoryDto> 
    {
        this.logger.debug(`Updating category ${categoryId} for org ${orgId}`, 'CategoryController#updateCategory', requestId);
        
        const category = await this.categoryService.updateCategory(orgId, categoryId, updateCategoryDto, requestId);
        return plainToInstance(OutCategoryDto, category, { excludeExtraneousValues: true });
    }

    @Delete(':id')
    @OrgRoles(OrgRole.OWNER, OrgRole.MANAGER)
    async deleteCategory(
        @Param('orgId', ObjectIdValidationPipe) orgId: Types.ObjectId,
        @Param('id', ObjectIdValidationPipe) categoryId: Types.ObjectId,
        @RequestId() requestId?: string,
    ): Promise<{ message: string }> 
    {
        this.logger.debug(`Deleting category ${categoryId} for org ${orgId}`, 'CategoryController#deleteCategory', requestId);
        
        await this.categoryService.deleteCategory(orgId, categoryId, requestId);
        return { message: 'Category deleted successfully' };
    }
}
