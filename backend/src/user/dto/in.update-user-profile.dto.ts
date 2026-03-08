import { IsString, MinLength, MaxLength, ValidateIf, IsNotEmpty, IsMobilePhone, Matches, IsEnum } from 'class-validator';
import { UserLanguage } from '../schemas/user.schema';

export class UpdateUserProfileDto
{
    @ValidateIf((o, value) => value !== undefined)
    @IsNotEmpty({ message: 'validation.firstName.required' })
    @IsString({ message: 'validation.firstName.mustBeString' })
    @MinLength(1, { message: 'validation.firstName.minLength' })
    @MaxLength(100, { message: 'validation.firstName.maxLength' })
    firstName?: string;

    @ValidateIf((o, value) => value !== undefined)
    @IsNotEmpty({ message: 'validation.lastName.required' })
    @IsString({ message: 'validation.lastName.mustBeString' })
    @MinLength(1, { message: 'validation.lastName.minLength' })
    @MaxLength(100, { message: 'validation.lastName.maxLength' })
    lastName?: string;

    @ValidateIf((o, value) => value !== undefined)
    @IsNotEmpty({ message: 'validation.phoneNumber.required' })
    @IsMobilePhone(undefined, {}, { message: 'validation.phoneNumber.invalid' })
    phoneNumber?: string;

    @ValidateIf((o, value) => value !== undefined)
    @IsString({ message: 'validation.timezone.mustBeString' })
    @Matches(/^[A-Za-z_]+(?:\/[A-Za-z0-9_+\-]+)+$|^auto$/, { message: 'validation.timezone.invalidFormat' })
    timezone?: string;

    @ValidateIf((o, value) => value !== undefined)
    @IsEnum(UserLanguage, { message: 'validation.language.invalid' })
    language?: UserLanguage;
}
