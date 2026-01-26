import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product } from './schemas/product.schema';
import { InCreateProductDto } from './dto/in.create-product.dto';
import { InUpdateProductDto } from './dto/in.update-product.dto';
import { CategoryService } from '../category/category.service';
import { CustomLogger } from '../common/logger/custom.logger';
import { DatabaseOperationException } from '../common/exceptions/database.exceptions';
import { CategoryNotFoundException } from '../category/exceptions/category.exceptions';
import { 
    ProductNotFoundException, 
    ProductNameConflictException,
    InvalidProductCategoryException,
} from './exceptions/product.exceptions';

@Injectable()
export class ProductService 
{
    constructor(
        @InjectModel(Product.name) private readonly productModel: Model<Product>,
        private readonly categoryService: CategoryService,
        private readonly logger: CustomLogger,
    ) {}

    async createProduct(orgId: Types.ObjectId, createProductDto: InCreateProductDto, requestId?: string): Promise<Product> 
    {
        this.logger.debug(`Creating product for org ${orgId}`, 'ProductService#createProduct', requestId);
        
        // Validate categories exist and belong to the same org
        if (createProductDto.categoryIds && createProductDto.categoryIds.length > 0) 
        {
            await this.validateCategories(orgId, createProductDto.categoryIds, requestId);
        }

        // Check if product name already exists in this org
        const existingProduct = await this.productModel.findOne({ 
            orgId, 
            name: createProductDto.name, 
        });
        
        if (existingProduct) 
        {
            throw new ProductNameConflictException(createProductDto.name);
        }

        const product = new this.productModel({
            ...createProductDto,
            categoryIds: createProductDto.categoryIds?.map(id => new Types.ObjectId(id)) || [],
            currentQuantity: createProductDto.currentQuantity ?? 0, // Use provided value or default to 0
            orgId,
        });

        try 
        {
            const savedProduct = await product.save();
            this.logger.debug(
                `Product created with id: ${savedProduct._id}, name=${savedProduct.name}`,
                'ProductService#createProduct',
                requestId,
            );
            return savedProduct;
        } 
        catch (error) 
        {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(
                `Error creating product for org ${orgId}: ${errorMessage}`,
                undefined,
                'ProductService#createProduct',
                requestId,
            );
            throw new DatabaseOperationException('product creation', errorMessage);
        }
    }

    async findProductsByOrg(orgId: Types.ObjectId, requestId?: string): Promise<Product[]> 
    {
        this.logger.debug(
            `Finding products for org ${orgId}`,
            'ProductService#findProductsByOrg',
            requestId,
        );
        
        const filter = { orgId };

        this.logger.debug(
            `Query filter: ${JSON.stringify(filter)}`,
            'ProductService#findProductsByOrg',
            requestId,
        );

        try 
        {
            const products = await this.productModel
                .find(filter)
                .sort({ name: 1 })
                .exec();
            
            this.logger.debug(
                `Found ${products.length} products for org ${orgId}`,
                'ProductService#findProductsByOrg',
                requestId,
            );
            
            return products;
        } 
        catch (error) 
        {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(
                `Error finding products for org ${orgId}: ${errorMessage}`,
                undefined,
                'ProductService#findProductsByOrg',
                requestId,
            );
            throw new DatabaseOperationException('product retrieval', errorMessage);
        }
    }

    async findProductById(orgId: Types.ObjectId, productId: Types.ObjectId, requestId?: string): Promise<Product> 
    {
        this.logger.debug(`Finding product ${productId} for org ${orgId}`, 'ProductService#findProductById', requestId);
        
        let product: Product | null;
        try 
        {
            product = await this.productModel
                .findOne({ _id: productId, orgId })
                .exec();
        } 
        catch (error) 
        {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(
                `Error finding product ${productId} for org ${orgId}: ${errorMessage}`,
                undefined,
                'ProductService#findProductById',
                requestId,
            );
            throw new DatabaseOperationException('product retrieval', errorMessage);
        }

        if (!product) 
        {
            this.logger.warn(
                `Product ${productId} not found for org ${orgId}`,
                'ProductService#findProductById',
                requestId,
            );
            throw new ProductNotFoundException(productId.toString());
        }

        this.logger.debug(
            `Found product ${productId}: name=${product.name}, qty=${product.currentQuantity}`,
            'ProductService#findProductById',
            requestId,
        );

        return product;
    }

    async updateProduct(
        orgId: Types.ObjectId, 
        productId: Types.ObjectId, 
        updateProductDto: InUpdateProductDto,
        requestId?: string,
    ): Promise<Product> 
    {
        this.logger.debug(`Updating product ${productId} for org ${orgId}`, 'ProductService#updateProduct', requestId);
        
        // Validate categories exist and belong to the same org
        if (updateProductDto.categoryIds && updateProductDto.categoryIds.length > 0) 
        {
            await this.validateCategories(orgId, updateProductDto.categoryIds, requestId);
        }

        // Check if product name already exists in this org (excluding current product)
        if (updateProductDto.name) 
        {
            const existingProduct = await this.productModel.findOne({ 
                orgId, 
                name: updateProductDto.name,
                _id: { $ne: productId },
            });
            
            if (existingProduct) 
            {
                throw new ProductNameConflictException(updateProductDto.name);
            }
        }

        const updateData: any = { ...updateProductDto };
        if (updateProductDto.categoryIds) 
        {
            updateData.categoryIds = updateProductDto.categoryIds.map(id => new Types.ObjectId(id));
        }

        let updatedProduct: Product | null;
        try 
        {
            updatedProduct = await this.productModel
                .findOneAndUpdate(
                    { _id: productId, orgId },
                    updateData,
                    { new: true }
                )
                .exec();
        } 
        catch (error) 
        {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(
                `Error updating product ${productId} for org ${orgId}: ${errorMessage}`,
                undefined,
                'ProductService#updateProduct',
                requestId,
            );
            throw new DatabaseOperationException('product update', errorMessage);
        }

        if (!updatedProduct) 
        {
            this.logger.warn(
                `Product ${productId} not found for update in org ${orgId}`,
                'ProductService#updateProduct',
                requestId,
            );
            throw new ProductNotFoundException(productId.toString());
        }

        this.logger.debug(
            `Product ${productId} updated successfully: name=${updatedProduct.name}`,
            'ProductService#updateProduct',
            requestId,
        );
        return updatedProduct;
    }

    async deleteProduct(orgId: Types.ObjectId, productId: Types.ObjectId, requestId?: string): Promise<void> 
    {
        this.logger.debug(`Deleting product ${productId} for org ${orgId}`, 'ProductService#deleteProduct', requestId);
        
        let deletedProduct: Product | null;
        try 
        {
            deletedProduct = await this.productModel
                .findOneAndDelete({ _id: productId, orgId })
                .exec();
        } 
        catch (error) 
        {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(
                `Error deleting product ${productId} for org ${orgId}: ${errorMessage}`,
                undefined,
                'ProductService#deleteProduct',
                requestId,
            );
            throw new DatabaseOperationException('product deletion', errorMessage);
        }

        if (!deletedProduct) 
        {
            this.logger.warn(
                `Product ${productId} not found for deletion in org ${orgId}`,
                'ProductService#deleteProduct',
                requestId,
            );
            throw new ProductNotFoundException(productId.toString());
        }

        this.logger.debug(
            `Product ${productId} deleted successfully: name=${deletedProduct.name}`,
            'ProductService#deleteProduct',
            requestId,
        );
    }

    /**
     * Validates that all provided category IDs exist and belong to the organization
     */
    private async validateCategories(orgId: Types.ObjectId, categoryIds: string[], requestId?: string): Promise<void> 
    {
        this.logger.debug(
            `Validating ${categoryIds.length} categories for org ${orgId}: [${categoryIds.join(', ')}]`,
            'ProductService#validateCategories',
            requestId,
        );
        
        for (const categoryId of categoryIds) 
        {
            try 
            {
                await this.categoryService.findCategoryById(orgId, new Types.ObjectId(categoryId), requestId);
            } 
            catch (error) 
            {
                if (error instanceof CategoryNotFoundException) 
                {
                    this.logger.warn(
                        `Category ${categoryId} not found for org ${orgId}`,
                        'ProductService#validateCategories',
                        requestId,
                    );
                    throw new InvalidProductCategoryException(categoryId);
                }
                throw error;
            }
        }
        
        this.logger.debug(
            `All ${categoryIds.length} categories validated successfully`,
            'ProductService#validateCategories',
            requestId,
        );
    }
}
