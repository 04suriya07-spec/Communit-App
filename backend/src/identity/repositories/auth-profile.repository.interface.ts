import { AuthProfile } from '@prisma/client';

/**
 * AuthProfile Repository Interface
 * 
 * CRITICAL: Always query by email_hash, NEVER by email_encrypted
 */
export interface IAuthProfileRepository {
    /**
     * Find auth profile by email hash
     * WARNING: This is the ONLY lookup method - never query by emailEncrypted
     */
    findByEmailHash(emailHash: string): Promise<AuthProfile | null>;

    /**
     * Create new auth profile
     * Stores both encrypted email (for recovery) and hash (for lookup)
     */
    create(data: {
        emailEncrypted: string;
        emailHash: string;
        authProvider: string;
    }): Promise<AuthProfile>;

    /**
     * Hard delete (GDPR deletion only)
     * Should only be called after legal hold check
     */
    hardDelete(id: string): Promise<void>;
}
