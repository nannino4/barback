import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { S3StorageService } from './s3-storage.service';
import { StorageService } from './storage.service';
import { CommonModule } from '../common/common.module';

@Module({
    imports: [
        ConfigModule,
        CommonModule,
    ],
    providers: [
        {
            provide: StorageService,
            useClass: S3StorageService,
        },
    ],
    exports: [StorageService],
})
export class StorageModule {}
