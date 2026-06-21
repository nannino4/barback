import { Controller, Get, Post, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmailVerifiedGuard } from '../auth/guards/email-verified.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../user/schemas/user.schema';
import { PaymentService } from './payment.service';
import { InAddPaymentMethodDto } from './dto/in.add-payment-method.dto';
import { InSetDefaultPaymentMethodDto } from './dto/in.set-default-payment-method.dto';
import { OutPaymentMethodDto } from './dto/out.payment-method.dto';
import { OutSetupIntentDto } from './dto/out.setup-intent.dto';
import { plainToInstance } from 'class-transformer';
import { CustomLogger } from '../common/logger/custom.logger';
import { RequestId } from '../common/decorators/request-id.decorator';

@Controller('payment')
@UseGuards(JwtAuthGuard, EmailVerifiedGuard)
export class PaymentController 
{
    constructor(
        private readonly paymentService: PaymentService,
        private readonly logger: CustomLogger,
    ) {}

    @Post('setup-intent')
    async createSetupIntent(
        @CurrentUser() user: User,
        @RequestId() requestId?: string,
    ): Promise<OutSetupIntentDto>
    {
        this.logger.debug(`Creating setup intent for user: ${user.id}`, 'PaymentController#createSetupIntent', requestId);
        const result = await this.paymentService.createSetupIntent(user.id, requestId);
        return plainToInstance(OutSetupIntentDto, result, { excludeExtraneousValues: true });
    }

    @Get('methods')
    async getPaymentMethods(
        @CurrentUser() user: User,
        @RequestId() requestId?: string,
    ): Promise<OutPaymentMethodDto[]> 
    {
        this.logger.debug(`Getting payment methods for user: ${user.id}`, 'PaymentController#getPaymentMethods', requestId);
        const paymentMethods = await this.paymentService.getPaymentMethods(user.id, requestId);
        return plainToInstance(OutPaymentMethodDto, paymentMethods, { excludeExtraneousValues: true });
    }

    @Post('methods')
    async addPaymentMethod(
        @CurrentUser() user: User,
        @Body() addPaymentMethodDto: InAddPaymentMethodDto,
        @RequestId() requestId?: string,
    ): Promise<OutPaymentMethodDto> 
    {
        this.logger.debug(`Adding payment method for user: ${user.id}`, 'PaymentController#addPaymentMethod', requestId);
        const paymentMethod = await this.paymentService.addPaymentMethod(user.id, addPaymentMethodDto.paymentMethodId, requestId);
        return plainToInstance(OutPaymentMethodDto, paymentMethod, { excludeExtraneousValues: true });
    }

    @Delete('methods/:paymentMethodId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async removePaymentMethod(
        @CurrentUser() user: User,
        @Param('paymentMethodId') paymentMethodId: string,
        @RequestId() requestId?: string,
    ): Promise<void> 
    {
        this.logger.debug(`Removing payment method ${paymentMethodId} for user: ${user.id}`, 'PaymentController#removePaymentMethod', requestId);
        await this.paymentService.removePaymentMethod(user.id, paymentMethodId, requestId);
    }

    @Post('methods/default')
    @HttpCode(HttpStatus.NO_CONTENT)
    async setDefaultPaymentMethod(
        @CurrentUser() user: User,
        @Body() setDefaultPaymentMethodDto: InSetDefaultPaymentMethodDto,
        @RequestId() requestId?: string,
    ): Promise<void> 
    {
        this.logger.debug(`Setting default payment method for user: ${user.id}`, 'PaymentController#setDefaultPaymentMethod', requestId);
        await this.paymentService.setDefaultPaymentMethod(user.id, setDefaultPaymentMethodDto.paymentMethodId, requestId);
    }
}
