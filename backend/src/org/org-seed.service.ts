import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category } from '../category/schemas/category.schema';
import { Product } from '../product/schemas/product.schema';
import { CustomLogger } from '../common/logger/custom.logger';

/**
 * Sample inventory seeded into a newly created organization so the inventory is
 * not empty on first login. Authored in Italian (first target market).
 *
 * Categories are created first; each product references its category by name.
 */
const SAMPLE_CATEGORIES: readonly string[] = [
    'Distillati',
    'Miscelatori',
    'Guarnizioni',
];

interface SampleProduct
{
    name: string;
    category: string;
    defaultUnit: string;
    brand?: string;
    currentQuantity: number;
}

const SAMPLE_PRODUCTS: readonly SampleProduct[] = [
    { name: 'Gin', category: 'Distillati', defaultUnit: 'bottiglia', currentQuantity: 6 },
    { name: 'Vodka', category: 'Distillati', defaultUnit: 'bottiglia', currentQuantity: 4 },
    { name: 'Rum bianco', category: 'Distillati', defaultUnit: 'bottiglia', currentQuantity: 3 },
    { name: 'Acqua tonica', category: 'Miscelatori', defaultUnit: 'bottiglia', currentQuantity: 24 },
    { name: 'Succo di lime', category: 'Miscelatori', defaultUnit: 'bottiglia', currentQuantity: 8 },
    { name: 'Lime', category: 'Guarnizioni', defaultUnit: 'pezzo', currentQuantity: 30 },
    { name: 'Menta fresca', category: 'Guarnizioni', defaultUnit: 'mazzo', currentQuantity: 5 },
];

@Injectable()
export class OrgSeedService
{
    constructor(
        @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
        @InjectModel(Product.name) private readonly productModel: Model<Product>,
        private readonly logger: CustomLogger,
    ) {}

    /**
     * Seed a freshly created organization with Italian sample categories and
     * products. Best-effort: any failure is logged and swallowed so it never
     * affects organization creation.
     */
    async seedSampleInventory(orgId: Types.ObjectId, requestId?: string): Promise<void>
    {
        this.logger.debug(`Seeding sample inventory for org: ${orgId}`, 'OrgSeedService#seedSampleInventory', requestId);

        try
        {
            const createdCategories = await this.categoryModel.insertMany(
                SAMPLE_CATEGORIES.map((name) => ({ orgId, name })),
            );

            const categoryIdByName = new Map<string, Types.ObjectId>(
                createdCategories.map((category) => [category.name, category._id as Types.ObjectId]),
            );

            await this.productModel.insertMany(
                SAMPLE_PRODUCTS.map((product) => ({
                    orgId,
                    name: product.name,
                    defaultUnit: product.defaultUnit,
                    brand: product.brand,
                    currentQuantity: product.currentQuantity,
                    categoryIds: categoryIdByName.has(product.category)
                        ? [categoryIdByName.get(product.category)]
                        : [],
                })),
            );

            this.logger.debug(
                `Seeded ${createdCategories.length} categories and ${SAMPLE_PRODUCTS.length} products for org: ${orgId}`,
                'OrgSeedService#seedSampleInventory',
                requestId,
            );
        }
        catch (error)
        {
            // Best-effort: never fail organization creation because of seeding.
            this.logger.error(
                `Failed to seed sample inventory for org: ${orgId}`,
                error instanceof Error ? error.stack : undefined,
                'OrgSeedService#seedSampleInventory',
                requestId,
            );
        }
    }
}
