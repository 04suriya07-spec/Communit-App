import { Injectable } from '@nestjs/common';
import { PrismaClient, InternalAdmin } from '@prisma/client';
import { IInternalAdminRepository } from './internal-admin.repository.interface';

/**
 * InternalAdmin Repository Implementation
 * 
 * Manages internal admin/moderator accounts
 */
@Injectable()
export class InternalAdminRepository implements IInternalAdminRepository {
    constructor(private readonly prisma: PrismaClient) { }

    /**
     * Find admin by ID
     */
    async findById(id: string): Promise<InternalAdmin | null> {
        return this.prisma.internalAdmin.findUnique({
            where: { id },
        });
    }

    /**
     * Find admin by email
     */
    async findByEmail(email: string): Promise<InternalAdmin | null> {
        return this.prisma.internalAdmin.findUnique({
            where: { email },
        });
    }

    /**
     * Find all admins with optional filters
     */
    async findAll(filters?: {
        role?: string;
        isActive?: boolean;
    }): Promise<InternalAdmin[]> {
        return this.prisma.internalAdmin.findMany({
            where: {
                ...(filters?.role && { role: filters.role }),
                ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    /**
     * Create admin (for setup/provisioning)
     */
    async create(data: {
        email: string;
        role: string;
        isActive?: boolean;
    }): Promise<InternalAdmin> {
        return this.prisma.internalAdmin.create({
            data: {
                email: data.email,
                role: data.role,
                isActive: data.isActive ?? true,
            },
        });
    }

    /**
     * Update admin status
     */
    async updateStatus(id: string, isActive: boolean): Promise<InternalAdmin> {
        return this.prisma.internalAdmin.update({
            where: { id },
            data: { isActive },
        });
    }
}
