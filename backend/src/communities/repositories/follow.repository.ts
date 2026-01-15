import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Follow } from '@prisma/client';
import { IFollowRepository } from './follow.repository.interface';

@Injectable()
export class FollowRepository implements IFollowRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(userId: string, communityId: string): Promise<Follow> {
        return this.prisma.follow.create({
            data: {
                userId,
                communityId,
            },
        });
    }

    async delete(userId: string, communityId: string): Promise<void> {
        await this.prisma.follow.delete({
            where: {
                userId_communityId: {
                    userId,
                    communityId,
                },
            },
        });
    }

    async findByUserAndCommunity(
        userId: string,
        communityId: string,
    ): Promise<Follow | null> {
        return this.prisma.follow.findUnique({
            where: {
                userId_communityId: {
                    userId,
                    communityId,
                },
            },
        });
    }

    async findByUser(userId: string): Promise<Follow[]> {
        return this.prisma.follow.findMany({
            where: { userId },
            include: { community: true },
            orderBy: { followedAt: 'desc' },
        });
    }

    async findByCommunity(communityId: string): Promise<Follow[]> {
        return this.prisma.follow.findMany({
            where: { communityId },
            orderBy: { followedAt: 'desc' },
        });
    }

    async isFollowing(userId: string, communityId: string): Promise<boolean> {
        const follow = await this.findByUserAndCommunity(userId, communityId);
        return follow !== null;
    }
}
