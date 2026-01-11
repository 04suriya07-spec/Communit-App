import { describe, it, expect, beforeEach } from '@jest/globals';
import { IAuthProfileRepository } from '../auth-profile.repository.interface';
import { AuthProfileRepository } from '../auth-profile.repository';
import { PrismaClient } from '@prisma/client';

describe('AuthProfileRepository', () => {
    let repository: IAuthProfileRepository;
    let prisma: PrismaClient;

    beforeEach(() => {
        prisma = new PrismaClient();
        repository = new AuthProfileRepository(prisma);
    });

    describe('findByEmailHash', () => {
        it('should return auth profile when hash exists', async () => {
            const emailHash = 'test-hash-123';
            const created = await repository.create({
                emailEncrypted: 'encrypted-test@example.com',
                emailHash,
                authProvider: 'firebase',
            });

            const found = await repository.findByEmailHash(emailHash);

            expect(found).not.toBeNull();
            expect(found?.id).toBe(created.id);
            expect(found?.emailHash).toBe(emailHash);
        });

        it('should return null when hash does not exist', async () => {
            const found = await repository.findByEmailHash('nonexistent-hash');

            expect(found).toBeNull();
        });
    });

    describe('create', () => {
        it('should create auth profile with both encrypted email and hash', async () => {
            const data = {
                emailEncrypted: 'encrypted-test@example.com',
                emailHash: 'hash-abc123',
                authProvider: 'firebase',
            };

            const created = await repository.create(data);

            expect(created.id).toBeDefined();
            expect(created.emailEncrypted).toBe(data.emailEncrypted);
            expect(created.emailHash).toBe(data.emailHash);
            expect(created.authProvider).toBe('firebase');
            expect(created.createdAt).toBeInstanceOf(Date);
        });

        it('should enforce unique email hash constraint', async () => {
            const data = {
                emailEncrypted: 'encrypted-test@example.com',
                emailHash: 'duplicate-hash',
                authProvider: 'firebase',
            };

            await repository.create(data);

            // Attempting to create with same hash should fail
            await expect(repository.create(data)).rejects.toThrow();
        });
    });

    describe('hardDelete', () => {
        it('should permanently delete auth profile', async () => {
            const created = await repository.create({
                emailEncrypted: 'encrypted-test@example.com',
                emailHash: 'to-be-deleted',
                authProvider: 'firebase',
            });

            await repository.hardDelete(created.id);

            const found = await repository.findByEmailHash('to-be-deleted');
            expect(found).toBeNull();
        });
    });

    // CRITICAL: No method exists to query by emailEncrypted
    // This test verifies that the interface does not expose this dangerous method
    describe('security: email lookup enforcement', () => {
        it('should not have a method to query by emailEncrypted', () => {
            expect(repository).not.toHaveProperty('findByEmailEncrypted');
            expect(repository).not.toHaveProperty('findByEmail');
        });
    });
});
