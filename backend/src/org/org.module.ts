import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrgController } from './org.controller';
import { OrgService } from './org.service';
import { OrgSeedService } from './org-seed.service';
import { UserOrgRelationService } from './user-org-relation.service';
import { Org, OrgSchema } from './schemas/org.schema';
import {
    UserOrgRelation,
    UserOrgRelationSchema,
} from './schemas/user-org-relation.schema';
import { Category, CategorySchema } from '../category/schemas/category.schema';
import { Product, ProductSchema } from '../product/schemas/product.schema';
import { SubscriptionModule } from '../subscription/subscription.module';
import { EmailModule } from '../email/email.module';
import { AuthGuardModule } from '../auth/auth-guard.module';
import { OrgRolesGuard } from './guards/org-roles.guard';
import { OrgSubscriptionGuard } from './guards/org-subscription.guard';
import { UserModule } from 'src/user/user.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Org.name, schema: OrgSchema },
            { name: UserOrgRelation.name, schema: UserOrgRelationSchema },
            { name: Category.name, schema: CategorySchema },
            { name: Product.name, schema: ProductSchema },
        ]),
        AuthGuardModule, // Provides guards for controllers
        UserModule,
        SubscriptionModule, // Used for org subscription management
        EmailModule, // Used for notifications
    ],
    controllers: [OrgController],
    providers: [OrgService, OrgSeedService, UserOrgRelationService, OrgRolesGuard, OrgSubscriptionGuard],
    exports: [
        OrgService, 
        UserOrgRelationService, 
        OrgRolesGuard, 
        OrgSubscriptionGuard,
        SubscriptionModule, // Re-export to make SubscriptionService available to modules using OrgSubscriptionGuard
    ],
})
export class OrgModule { }
