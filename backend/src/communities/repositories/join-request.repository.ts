import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JoinRequest, RequestStatus } from '@prisma/client';
import { IJoinRequestRepository } from './join-request.repository.interface';

@Injectable()
export class JoinRequestRepository implements IJoinRequestRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(data: {
        communityId: string;
        userId: string;
        message?: string;
    }): Promise<JoinRequest> {
        return this.prisma.joinRequest.create({
            data: {
                communityId: data.communityId,
                userId: data.userId,
                message: data.message,
                status: RequestStatus.pending,
            },
        });
    }

    async findById(id: string): Promise<JoinRequest | null> {
        return this.prisma.joinRequest.findUnique({
            where: { id },
        });
    }

    async findByCommunity(
        communityId: string,
        status?: RequestStatus,
    ): Promise<JoinRequest[]> {
        return this.prisma.joinRequest.findMany({
            where: {
                communityId,
                ...(status && { status }),
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findByUser(userId: string): Promise<JoinRequest[]> {
        return this.prisma.joinRequest.findMany({
            where: { userId },
            include: { community: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findPendingRequest(
        userId: string,
        communityId: string,
    ): Promise<JoinRequest | null> {
        return this.prisma.joinRequest.findFirst({
            where: {
                userId,
                communityId,
                status: RequestStatus.pending,
            },
        });
    }

    async approve(id: string, reviewerId: string): Promise<JoinRequest> {
        return this.prisma.joinRequest.update({
            where: { id },
            data: {
                status: RequestStatus.approved,
                reviewedBy: reviewerId,
                reviewedAt: new Date(),
            },
        });
    }

    async reject(id: string, reviewerId: string): Promise<JoinRequest> {
        return this.prisma.joinRequest.update({
            where: { id },
            data: {
                status: RequestStatus.rejected,
                reviewedBy: reviewerId,
                reviewedAt: new Date(),
            },
        });
    }

    async delete(id: string): Promise<void> {
        await this.prisma.joinRequest.delete({
            where: { id },
        });
    }
}
