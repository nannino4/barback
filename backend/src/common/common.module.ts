import { Module, Global } from '@nestjs/common';
import { CustomLogger } from './logger/custom.logger';
import { ThrottlerExceptionFilter } from './filters/throttler-exception.filter';

@Global() // Makes this module available globally without importing
@Module({
    providers: [
        CustomLogger,
        ThrottlerExceptionFilter,
    ],
    exports: [
        CustomLogger,
        ThrottlerExceptionFilter,
    ],
})
export class CommonModule {}
