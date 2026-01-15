import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CommunityMember, MemberRole } from '@prisma/client';
import { ICommunityMemberRepository } from './community-member.repository.interface';

@Injectable()
export class CommunityMemberRepository implements ICommunityMemberRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(data: {
        communityId: string;
        userId: string;
        role: MemberRole;
        invitedBy?: string;
    }): Promise<CommunityMember> {
        return this.prisma.communityMember.create({
            data: {
                communityId: data.communityId,
                userId: data.userId,
                role: data.role,
                invitedBy: data.invitedBy,
            },
        });
    }

    async findByCommunityAndUser(
        communityId: string,
        userId: string,
    ): Promise<CommunityMember | null> {
        return this.prisma.communityMember.findUnique({
            where: {
                communityId_userId: {
                    communityId,
                    userId,
                },
            },
        });
    }

    async findByCommunity(communityId: string): Promise<CommunityMember[]> {
        return this.prisma.communityMember.findMany({
            where: { communityId },
            orderBy: { joinedAt: 'asc' },
        });
    }

    async getUserRole(communityId: string, userId: string): Promise<MemberRole | null> {
        const member = await this.findByCommunityAndUser(communityId, userId);
        return member?.role || null;
    }

    async updateRole(
        communityId: string,
        userId: string,
        role: MemberRole,
    ): Promise<CommunityMember> {
        return this.prisma.communityMember.update({
            where: {
                communityId_userId: {
                    communityId,
                    userId,
                },
            },
            data: { role },
        });
    }

    async remove(communityId: string, userId: string): Promise<void> {
        await this.prisma.communityMember.delete({
            where: {
                communityId_userId: {
                    communityId,
                    userId,
                },
            },
        });
    }

    async isMember(communityId: string, userId: string): Promise<boolean> {
        const member = await this.findByCommunityAndUser(communityId, userId);
        return member !== null;
    }
}
