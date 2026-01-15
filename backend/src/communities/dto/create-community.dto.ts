import { IsString, IsEnum, IsOptional, MinLength, MaxLength, Matches } from 'class-validator';
import { CommunityType } from '@prisma/client';

export class CreateCommunityDto {
    @IsString()
    @MinLength(3, { message: 'Community name must be at least 3 characters' })
    @MaxLength(100, { message: 'Community name must not exceed 100 characters' })
    name: string;

    @IsString()
    @IsOptional()
    @MaxLength(500, { message: 'Description must not exceed 500 characters' })
    description?: string;

    @IsEnum(CommunityType, { message: 'Invalid community type' })
    type: CommunityType;

    @IsString()
    @IsOptional()
    @Matches(/^[a-z0-9-]+$/, {
        message: 'Slug must contain only lowercase letters, numbers, and hyphens',
    })
    @MinLength(3)
    @MaxLength(50)
    slug?: string; // Optional - will be auto-generated from name if not provided

    @IsString()
    @IsOptional()
    avatarUrl?: string;

    @IsString()
    @IsOptional()
    bannerUrl?: string;
}
