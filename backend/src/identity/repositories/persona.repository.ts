import { Injectable } from '@nestjs/common';
import { PrismaClient, Persona } from '@prisma/client';
import { IPersonaRepository } from './persona.repository.interface';

/**
 * Persona Repository Implementation
 * 
 * Public-facing identity layer
 * Safe to expose persona.id, NEVER expose accountabilityProfileId
 */
@Injectable()
export class PersonaRepository implements IPersonaRepository {
    constructor(private readonly prisma: PrismaClient) { }

    /**
     * Find persona by ID
     */
    async findById(id: string): Promise<Persona | null> {
        return this.prisma.persona.findUnique({
            where: { id },
        });
    }

    /**
     * Find active personas (is_active = true AND deleted_at = null)
     */
    async findActiveByAccountabilityProfileId(
        accountabilityProfileId: string
    ): Promise<Persona[]> {
        return this.prisma.persona.findMany({
            where: {
                accountabilityProfileId,
                isActive: true,
                deletedAt: null,
            },
        });
    }

    /**
     * Create new persona
     */
    async create(data: {
        accountabilityProfileId: string;
        displayName: string;
        avatarUrl?: string;
    }): Promise<Persona> {
        return this.prisma.persona.create({
            data: {
                accountabilityProfileId: data.accountabilityProfileId,
                displayName: data.displayName,
                avatarUrl: data.avatarUrl,
                isActive: true,
            },
        });
    }

    /**
     * Deactivate persona (sets is_active = false)
     * Used during rotation
     */
    async deactivate(id: string): Promise<Persona> {
        return this.prisma.persona.update({
            where: { id },
            data: { isActive: false },
        });
    }

    /**
     * Soft delete (sets deleted_at = now())
     * Hard delete happens async after retention period
     */
    async softDelete(id: string): Promise<Persona> {
        return this.prisma.persona.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }

    /**
     * Find recent persona by display name (for uniqueness check)
     * Prevents impersonation within time window
     */
    async findRecentByDisplayName(
        displayName: string,
        withinDays: number
    ): Promise<Persona | null> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - withinDays);

        return this.prisma.persona.findFirst({
            where: {
                displayName,
                createdAt: {
                    gte: cutoffDate,
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
}
