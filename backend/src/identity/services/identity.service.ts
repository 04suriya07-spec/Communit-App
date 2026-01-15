import { Injectable, ConflictException, UnauthorizedException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { AuthProfileRepository } from '../repositories/auth-profile.repository';
import { AccountabilityProfileRepository } from '../repositories/accountability-profile.repository';
import { PersonaRepository } from '../repositories/persona.repository';
import { TrustLevelRepository } from '../repositories/trust-level.repository';
import { EncryptionService } from '../../security/services/encryption.service';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

/**
 * Identity Service
 * 
 * Handles authentication and identity resolution
 * CRITICAL: Always hash emails before lookup
 */
@Injectable()
export class IdentityService {
    constructor(
        private readonly authProfileRepo: AuthProfileRepository,
        private readonly accountabilityRepo: AccountabilityProfileRepository,
        private readonly personaRepo: PersonaRepository,
        private readonly trustLevelRepo: TrustLevelRepository,
        private readonly encryptionService: EncryptionService,
    ) { }

    /**
     * Register new user
     * Creates: auth_profile → accountability_profile → persona → trust_level
     * CRITICAL: Always hash email before storing, hash password with bcrypt
     */
    async register(data: {
        email: string;
        password: string;
        initialDisplayName: string;
    }): Promise<{
        personaId: string;
        displayName: string;
        passwordHash: string; // Return to store in auth system
        _internal: {
            accountabilityProfileId: string;
            trustLevel: 'NEW' | 'REGULAR' | 'TRUSTED';
            riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
        };
    }> {
        // 1. Validate password strength
        if (!data.password || data.password.length < 6) {
            throw new BadRequestException('Password must be at least 6 characters');
        }

        // 2. Hash email for lookup
        const emailHash = await this.hashEmail(data.email);

        // 3. Encrypt email for recovery
        const emailEncrypted = await this.encryptEmail(data.email);

        // 4. Check if already registered
        const existing = await this.authProfileRepo.findByEmailHash(emailHash);
        if (existing) {
            throw new ConflictException('EMAIL_ALREADY_EXISTS');
        }

        // 5. Hash password with bcrypt (salt rounds: 12)
        const passwordHash = await bcrypt.hash(data.password, 12);

        // 6. Create auth profile with password hash
        const authProfile = await this.authProfileRepo.create({
            emailEncrypted,
            emailHash,
            authProvider: 'email', // Changed from 'firebase' to 'email'
            passwordHash, // Store hashed password
        });

        // 7. Create accountability profile
        const accountabilityProfile = await this.accountabilityRepo.create({
            authProfileId: authProfile.id,
        });

        // 8. Create initial persona
        const persona = await this.personaRepo.create({
            accountabilityProfileId: accountabilityProfile.id,
            displayName: data.initialDisplayName,
        });

        // 9. Create trust level (default NEW)
        const trustLevel = await this.trustLevelRepo.create({
            personaId: persona.id,
            level: 'NEW',
        });

        // 10. Return public data + internal session data
        return {
            personaId: persona.id,
            displayName: persona.displayName,
            passwordHash, // Return for verification (not sent to client)
            _internal: {
                accountabilityProfileId: accountabilityProfile.id,
                trustLevel: trustLevel.level as 'NEW' | 'REGULAR' | 'TRUSTED',
                riskLevel: accountabilityProfile.riskLevel as 'LOW' | 'MEDIUM' | 'HIGH',
            },
        };
    }

    /**
     * Login user
     * CRITICAL: Always query by email_hash, verify password with bcrypt
     */
    async login(data: {
        email: string;
        password: string;
    }): Promise<{
        personaId: string;
        displayName: string;
        // Internal session data (not returned to client)
        _internal: {
            accountabilityProfileId: string;
            trustLevel: 'NEW' | 'REGULAR' | 'TRUSTED';
            riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
        };
    }> {
        // 1. Hash email for lookup
        const emailHash = await this.hashEmail(data.email);

        // 2. Find auth profile
        const authProfile = await this.authProfileRepo.findByEmailHash(emailHash);
        if (!authProfile) {
            throw new UnauthorizedException('INVALID_CREDENTIALS');
        }

        // 3. Verify password
        if (!authProfile.passwordHash) {
            throw new UnauthorizedException('INVALID_AUTH_METHOD');
        }

        const isPasswordValid = await bcrypt.compare(data.password, authProfile.passwordHash);
        if (!isPasswordValid) {
            throw new UnauthorizedException('INVALID_CREDENTIALS');
        }

        // 4. Get accountability profile
        const accountabilityProfile = await this.accountabilityRepo.findByAuthProfileId(
            authProfile.id
        );

        if (!accountabilityProfile) {
            throw new InternalServerErrorException('IDENTITY_CONTEXT_CORRUPT');
        }

        // 5. Get active personas
        const personas = await this.personaRepo.findActiveByAccountabilityProfileId(
            accountabilityProfile.id
        );

        // 6. Select first active persona (or prompt user to create)
        const activePersona = personas[0];
        if (!activePersona) {
            throw new BadRequestException('NO_ACTIVE_PERSONA');
        }

        // 7. Get trust level
        const trustLevel = await this.trustLevelRepo.findByPersonaId(activePersona.id);

        if (!trustLevel) {
            throw new InternalServerErrorException('IDENTITY_CONTEXT_CORRUPT');
        }

        // 8. Return public + internal session data
        return {
            personaId: activePersona.id,
            displayName: activePersona.displayName,
            _internal: {
                accountabilityProfileId: accountabilityProfile.id,
                trustLevel: trustLevel.level as 'NEW' | 'REGULAR' | 'TRUSTED',
                riskLevel: accountabilityProfile.riskLevel as 'LOW' | 'MEDIUM' | 'HIGH',
            },
        };
    }

    /**
     * Resolve accountability profile from session
     * Used by other services to check abuse scores, risk levels
     */
    async getAccountabilityContext(personaId: string): Promise<{
        accountabilityProfileId: string;
        riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
        globalAbuseScore: number;
    }> {
        const persona = await this.personaRepo.findById(personaId);

        if (!persona) {
            throw new InternalServerErrorException('IDENTITY_CONTEXT_CORRUPT');
        }

        const accountability = await this.accountabilityRepo.findById(
            persona.accountabilityProfileId
        );

        // Defensive guard: corruption here means serious state violation
        if (!accountability) {
            throw new InternalServerErrorException('IDENTITY_CONTEXT_CORRUPT');
        }

        return {
            accountabilityProfileId: accountability.id,
            riskLevel: accountability.riskLevel as 'LOW' | 'MEDIUM' | 'HIGH',
            globalAbuseScore: accountability.globalAbuseScore,
        };
    }

    /**
     * Email hashing (always use for lookups)
     * CRITICAL: This must be deterministic (same email = same hash)
     */
    private async hashEmail(email: string): Promise<string> {
        return crypto.createHash('sha256').update(email.toLowerCase()).digest('hex');
    }

    /**
     * Email encryption (for recovery flows only)
     * CRITICAL: This is for recovery, never for lookup
     * Phase C3: Real AES-256-GCM encryption with per-record IV
     */
    private async encryptEmail(email: string): Promise<string> {
        return this.encryptionService.encryptEmail(email);
    }
}
