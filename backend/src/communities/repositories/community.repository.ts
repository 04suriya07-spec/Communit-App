import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Community, CommunityType, Prisma } from '@prisma/client';
import {
    ICommunityRepository,
    ListCommunitiesOptions,
} from './community.repository.interface';

@Injectable()
export class CommunityRepository implements ICommunityRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(data: {
        slug: string;
        name: string;
        description?: string;
        type: CommunityType;
        creatorId: string;
        avatarUrl?: string;
        bannerUrl?: string;
    }): Promise<Community> {
        return this.prisma.community.create({
            data: {
                slug: data.slug,
                name: data.name,
                description: data.description,
                type: data.type,
                creatorId: data.creatorId,
                avatarUrl: data.avatarUrl,
                bannerUrl: data.bannerUrl,
                memberCount: 1, // Creator is first member
            },
        });
    }

    async findById(id: string): Promise<Community | null> {
        return this.prisma.community.findFirst({
            where: {
                id,
                deletedAt: null,
            },
        });
    }

    async findBySlug(slug: string): Promise<Community | null> {
        return this.prisma.community.findFirst({
            where: {
                slug,
                deletedAt: null,
            },
        });
    }

    async list(options: ListCommunitiesOptions): Promise<{
        communities: Community[];
        total: number;
        hasMore: boolean;
    }> {
        const limit = options.limit || 20;
        const where: Prisma.CommunityWhereInput = {
            deletedAt: null,
        };

        // Filter by type
        if (options.type) {
            where.type = options.type;
        }

        // Search by name or description
        if (options.search) {
            where.OR = [
                { name: { contains: options.search, mode: 'insensitive' } },
                { description: { contains: options.search, mode: 'insensitive' } },
            ];
        }

        // Cursor-based pagination
        const cursorOptions: Prisma.CommunityFindManyArgs = {
            where,
            take: limit + 1, // Fetch one extra to check if there are more
            orderBy: { createdAt: 'desc' },
        };

        if (options.cursor) {
            cursorOptions.cursor = { id: options.cursor };
            cursorOptions.skip = 1; // Skip the cursor itself
        }

        const communities = await this.prisma.community.findMany(cursorOptions);

        const hasMore = communities.length > limit;
        if (hasMore) {
            communities.pop(); // Remove the extra item
        }

        const total = await this.prisma.community.count({ where });

        return {
            communities,
            total,
            hasMore,
        };
    }

    async update(id: string, data: Partial<Community>): Promise<Community> {
        return this.prisma.community.update({
            where: { id },
            data: {
                ...data,
                updatedAt: new Date(),
            },
        });
    }

    async delete(id: string): Promise<void> {
        await this.prisma.community.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }

    async incrementMemberCount(id: string): Promise<void> {
        await this.prisma.community.update({
            where: { id },
            data: { memberCount: { increment: 1 } },
        });
    }

    async decrementMemberCount(id: string): Promise<void> {
        await this.prisma.community.update({
            where: { id },
            data: { memberCount: { decrement: 1 } },
        });
    }

    async incrementFollowerCount(id: string): Promise<void> {
        await this.prisma.community.update({
            where: { id },
            data: { followerCount: { increment: 1 } },
        });
    }

    async decrementFollowerCount(id: string): Promise<void> {
        await this.prisma.community.update({
            where: { id },
            data: { followerCount: { decrement: 1 } },
        });
    }
}
