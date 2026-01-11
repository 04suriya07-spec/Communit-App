import { InternalAdmin } from '@prisma/client';

/**
 * InternalAdmin Repository Interface
 * 
 * Manages internal admin/moderator accounts
 */
export interface IInternalAdminRepository {
    /**
     * Find admin by ID
     */
    findById(id: string): Promise<InternalAdmin | null>;

    /**
     * Find admin by email
     */
    findByEmail(email: string): Promise<InternalAdmin | null>;

    /**
     * Find all admins with optional filters
     */
    findAll(filters?: {
        role?: string;
        isActive?: boolean;
    }): Promise<InternalAdmin[]>;

    /**
     * Create admin (for setup/provisioning)
     */
    create(data: {
        email: string;
        role: string;
        isActive?: boolean;
    }): Promise<InternalAdmin>;

    /**
     * Update admin status
     */
    updateStatus(id: string, isActive: boolean): Promise<InternalAdmin>;
}
