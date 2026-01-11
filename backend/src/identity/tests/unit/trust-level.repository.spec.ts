import { describe, it, expect, beforeEach } from '@jest/globals';
import { ITrustLevelRepository } from '../trust-level.repository.interface';
import { TrustLevelRepository } from '../trust-level.repository';
import { PrismaClient, TrustLevel as TrustLevelEnum } from '@prisma/client';

describe('TrustLevelRepository', () => {
    let repository: ITrustLevelRepository;
    let prisma: PrismaClient;
    let testPersonaId: string;

    beforeEach(async () => {
        prisma = new PrismaClient();
        repository = new TrustLevelRepository(prisma);

        // Create test persona
        const authProfile = await prisma.authProfile.create({
            data: {
                emailEncrypted: 'test-encrypted',
                emailHash: `test-hash-${Date.now()}`,
                authProvider: 'firebase',
            },
        });

        const accountabilityProfile = await prisma.accountabilityProfile.create({
            data: {
                authProfileId: authProfile.id,
            },
        });

        const persona = await prisma.persona.create({
            data: {
                accountabilityProfileId: accountabilityProfile.id,
                displayName: `TestUser-${Date.now()}`,
            },
        });

        testPersonaId = persona.id;
    });

    describe('create', () => {
        it('should create trust level with default NEW level', async () => {
            const created = await repository.create({
                personaId: testPersonaId,
                level: 'NEW',
            });

            expect(created.id).toBeDefined();
            expect(created.personaId).toBe(testPersonaId);
            expect(created.level).toBe(TrustLevelEnum.NEW);
            expect(created.grantedAt).toBeInstanceOf(Date);
        });

        it('should create trust level with REGULAR level', async () => {
            const created = await repository.create({
                personaId: testPersonaId,
                level: 'REGULAR',
            });

            expect(created.level).toBe(TrustLevelEnum.REGULAR);
        });
    });

    describe('findByPersonaId', () => {
        it('should return trust level for persona', async () => {
            const created = await repository.create({
                personaId: testPersonaId,
                level: 'NEW',
            });

            const found = await repository.findByPersonaId(testPersonaId);

            expect(found).not.toBeNull();
            expect(found?.id).toBe(created.id);
            expect(found?.level).toBe(TrustLevelEnum.NEW);
        });

        it('should return null if not found', async () => {
            const found = await repository.findByPersonaId('nonexistent-persona-id');

            expect(found).toBeNull();
        });
    });

    describe('update', () => {
        it('should correctly change trust level (manual promotion)', async () => {
            await repository.create({
                personaId: testPersonaId,
                level: 'NEW',
            });

            const updated = await repository.update(testPersonaId, 'TRUSTED');

            expect(updated.level).toBe(TrustLevelEnum.TRUSTED);
        });

        it('should update from REGULAR to TRUSTED', async () => {
            await repository.create({
                personaId: testPersonaId,
                level: 'REGULAR',
            });

            const updated = await repository.update(testPersonaId, 'TRUSTED');

            expect(updated.level).toBe(TrustLevelEnum.TRUSTED);
        });
    });

    // Phase 1: Manual promotion only
    describe('Phase 1 constraints', () => {
        it('should have no auto-promotion methods', () => {
            expect(repository).not.toHaveProperty('autoPromote');
            expect(repository).not.toHaveProperty('evaluatePromotion');
        });
    });
});
