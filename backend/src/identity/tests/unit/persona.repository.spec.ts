import { describe, it, expect, beforeEach } from '@jest/globals';
import { IPersonaRepository } from '../persona.repository.interface';
import { PersonaRepository } from '../persona.repository';
import { PrismaClient } from '@prisma/client';

describe('PersonaRepository', () => {
    let repository: IPersonaRepository;
    let prisma: PrismaClient;
    let testAccountabilityProfileId: string;

    beforeEach(async () => {
        prisma = new PrismaClient();
        repository = new PersonaRepository(prisma);

        // Create test auth + accountability profiles
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

        testAccountabilityProfileId = accountabilityProfile.id;
    });

    describe('create', () => {
        it('should create persona with is_active = true', async () => {
            const created = await repository.create({
                accountabilityProfileId: testAccountabilityProfileId,
                displayName: 'TestUser123',
            });

            expect(created.id).toBeDefined();
            expect(created.displayName).toBe('TestUser123');
            expect(created.isActive).toBe(true);
            expect(created.deletedAt).toBeNull();
        });

        it('should create persona with avatar URL', async () => {
            const created = await repository.create({
                accountabilityProfileId: testAccountabilityProfileId,
                displayName: 'TestUser456',
                avatarUrl: 'https://example.com/avatar.png',
            });

            expect(created.avatarUrl).toBe('https://example.com/avatar.png');
        });
    });

    describe('findActiveByAccountabilityProfileId', () => {
        it('should return only active personas', async () => {
            // Create active persona
            const active = await repository.create({
                accountabilityProfileId: testAccountabilityProfileId,
                displayName: 'ActiveUser',
            });

            // Create then deactivate another
            const toDeactivate = await repository.create({
                accountabilityProfileId: testAccountabilityProfileId,
                displayName: 'InactiveUser',
            });
            await repository.deactivate(toDeactivate.id);

            const actives = await repository.findActiveByAccountabilityProfileId(
                testAccountabilityProfileId
            );

            expect(actives).toHaveLength(1);
            expect(actives[0].id).toBe(active.id);
        });

        it('should exclude deleted personas', async () => {
            const persona = await repository.create({
                accountabilityProfileId: testAccountabilityProfileId,
                displayName: 'ToBeDeleted',
            });

            await repository.softDelete(persona.id);

            const actives = await repository.findActiveByAccountabilityProfileId(
                testAccountabilityProfileId
            );

            expect(actives).toHaveLength(0);
        });
    });

    describe('deactivate', () => {
        it('should set is_active = false', async () => {
            const persona = await repository.create({
                accountabilityProfileId: testAccountabilityProfileId,
                displayName: 'ToDeactivate',
            });

            const deactivated = await repository.deactivate(persona.id);

            expect(deactivated.isActive).toBe(false);
        });
    });

    describe('softDelete', () => {
        it('should set deleted_at timestamp', async () => {
            const persona = await repository.create({
                accountabilityProfileId: testAccountabilityProfileId,
                displayName: 'ToDelete',
            });

            const deleted = await repository.softDelete(persona.id);

            expect(deleted.deletedAt).not.toBeNull();
            expect(deleted.deletedAt).toBeInstanceOf(Date);
        });
    });

    describe('findRecentByDisplayName', () => {
        it('should find persona created within time window', async () => {
            await repository.create({
                accountabilityProfileId: testAccountabilityProfileId,
                displayName: 'RecentName',
            });

            const found = await repository.findRecentByDisplayName('RecentName', 30);

            expect(found).not.toBeNull();
            expect(found?.displayName).toBe('RecentName');
        });

        it('should enforce 30-day uniqueness', async () => {
            const displayName = 'UniqueFor30Days';

            await repository.create({
                accountabilityProfileId: testAccountabilityProfileId,
                displayName,
            });

            const recent = await repository.findRecentByDisplayName(displayName, 30);

            expect(recent).not.toBeNull();
        });
    });

    describe('findById', () => {
        it('should return persona by ID', async () => {
            const created = await repository.create({
                accountabilityProfileId: testAccountabilityProfileId,
                displayName: 'FindableUser',
            });

            const found = await repository.findById(created.id);

            expect(found).not.toBeNull();
            expect(found?.id).toBe(created.id);
        });
    });
});
