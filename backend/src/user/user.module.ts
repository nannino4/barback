import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User, UserSchema } from './schemas/user.schema';
import { AuthGuardModule } from '../auth/auth-guard.module';
import { StorageModule } from '../storage/storage.module';
import { ProfilePictureValidationPipe } from '../pipes/profile-picture-validation.pipe';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        AuthGuardModule,
        StorageModule,
        ConfigModule,
    ],
    controllers: [UserController],
    providers: [UserService, ProfilePictureValidationPipe],
    exports: [UserService],
})
export class UserModule { }
