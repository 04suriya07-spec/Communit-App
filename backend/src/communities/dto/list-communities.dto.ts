import { IsEnum, IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { CommunityType } from '@prisma/client';

export class ListCommunitiesDto {
    @IsEnum(CommunityType)
    @IsOptional()
    type?: CommunityType;

    @IsString()
    @IsOptional()
    search?: string;

    @IsInt()
    @Type(() => Number)
    @Min(1)
    @Max(100)
    @IsOptional()
    limit?: number = 20;

    @IsString()
    @IsOptional()
    cursor?: string;
}
