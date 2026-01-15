import { JoinRequest, RequestStatus } from '@prisma/client';

export interface IJoinRequestRepository {
    /**
     * Create a join request
     */
    create(data: {
        communityId: string;
        userId: string;
        message?: string;
    }): Promise<JoinRequest>;

    /**
     * Find join request by ID
     */
    findById(id: string): Promise<JoinRequest | null>;

    /**
     * Find join requests by community
     */
    findByCommunity(
        communityId: string,
        status?: RequestStatus,
    ): Promise<JoinRequest[]>;

    /**
     * Find join requests by user
     */
    findByUser(userId: string): Promise<JoinRequest[]>;

    /**
     * Find pending request for user and community
     */
    findPendingRequest(
        userId: string,
        communityId: string,
    ): Promise<JoinRequest | null>;

    /**
     * Approve a join request
     */
    approve(id: string, reviewerId: string): Promise<JoinRequest>;

    /**
     * Reject a join request
     */
    reject(id: string, reviewerId: string): Promise<JoinRequest>;

    /**
     * Delete a join request
     */
    delete(id: string): Promise<void>;
}
