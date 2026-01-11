import { describe, it, expect, beforeEach } from '@jest/globals';
import { IAccountabilityProfileRepository } from '../accountability-profile.repository.interface';
import { AccountabilityProfileRepository } from '../accountability-profile.repository';
import { PrismaClient, RiskLevel } from '@prisma/client';

describe('AccountabilityProfileRepository', () => {
    let repository: IAccountabilityProfileRepository;
    let prisma: PrismaClient;
    let testAuthProfileId: string;

    beforeEach(async () => {
        prisma = new PrismaClient();
        repository = new AccountabilityProfileRepository(prisma);

        // Create test auth profile
        const authProfile = await prisma.authProfile.create({
            data: {
                emailEncrypted: 'test-encrypted',
                emailHash: `test-hash-${Date.now()}`,
                authProvider: 'firebase',
            },
        });
        testAuthProfileId = authProfile.id;
    });

    describe('create', () => {
        it('should create accountability profile with default values', async () => {
            const created = await repository.create({
                authProfileId: testAuthProfileId,
            });

            expect(created.id).toBeDefined();
            expect(created.authProfileId).toBe(testAuthProfileId);
            expect(created.globalAbuseScore).toBe(0.0);
            expect(created.riskLevel).toBe(RiskLevel.LOW);
            expect(created.isVerified).toBe(false);
        });

        it('should create accountability profile with custom values', async () => {
            const created = await repository.create({
                authProfileId: testAuthProfileId,
                globalAbuseScore: 0.5,
                riskLevel: RiskLevel.MEDIUM,
            });

            expect(created.globalAbuseScore).toBe(0.5);
            expect(created.riskLevel).toBe(RiskLevel.MEDIUM);
        });
    });

    describe('findByAuthProfileId', () => {
        it('should return accountability profile for auth profile', async () => {
            const created = await repository.create({
                authProfileId: testAuthProfileId,
            });

            const found = await repository.findByAuthProfileId(testAuthProfileId);

            expect(found).not.toBeNull();
            expect(found?.id).toBe(created.id);
        });

        it('should return null if not found', async () => {
            const found = await repository.findByAuthProfileId('nonexistent-id');

            expect(found).toBeNull();
        });
    });

    describe('updateRiskLevel', () => {
        it('should correctly update risk level', async () => {
            const created = await repository.create({
                authProfileId: testAuthProfileId,
            });

            const updated = await repository.updateRiskLevel(created.id, RiskLevel.HIGH);

            expect(updated.riskLevel).toBe(RiskLevel.HIGH);
        });
    });

    describe('updateAbuseScore', () => {
        it('should correctly update abuse score', async () => {
            const created = await repository.create({
                authProfileId: testAuthProfileId,
            });

            const updated = await repository.updateAbuseScore(created.id, 0.75);

            expect(updated.globalAbuseScore).toBe(0.75);
        });
    });

    describe('findById', () => {
        it('should return accountability profile by ID', async () => {
            const created = await repository.create({
                authProfileId: testAuthProfileId,
            });

            const found = await repository.findById(created.id);

            expect(found).not.toBeNull();
            expect(found?.id).toBe(created.id);
        });
    });
});
