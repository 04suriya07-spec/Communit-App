import { Injectable } from '@nestjs/common';
import { PrismaClient, AuthProfile } from '@prisma/client';
import { IAuthProfileRepository } from './auth-profile.repository.interface';

/**
 * AuthProfile Repository Implementation
 * 
 * CRITICAL SECURITY RULES:
 * 1. ALWAYS query by email_hash, NEVER by email_encrypted
 * 2. email_encrypted is for recovery flows only
 * 3. All lookups must use deterministic hash
 */
@Injectable()
export class AuthProfileRepository implements IAuthProfileRepository {
    constructor(private readonly prisma: PrismaClient) { }

    /**
     * Find by email hash (ONLY lookup method)
     * WARNING: Never expose a method to query by emailEncrypted
     */
    async findByEmailHash(emailHash: string): Promise<AuthProfile | null> {
        return this.prisma.authProfile.findUnique({
            where: { emailHash },
        });
    }

    /**
     * Create auth profile
     * Stores both encrypted (recovery) and hash (lookup)
     */
    async create(data: {
        emailEncrypted: string;
        emailHash: string;
        authProvider: string;
    }): Promise<AuthProfile> {
        return this.prisma.authProfile.create({
            data: {
                emailEncrypted: data.emailEncrypted,
                emailHash: data.emailHash,
                authProvider: data.authProvider,
            },
        });
    }

    /**
     * Hard delete (GDPR deletion only)
     * Should only be called after legal hold verification
     */
    async hardDelete(id: string): Promise<void> {
        await this.prisma.authProfile.delete({
            where: { id },
        });
    }
}
