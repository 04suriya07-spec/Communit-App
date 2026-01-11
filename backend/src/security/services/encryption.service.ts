import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

/**
 * Encryption Service
 * 
 * Provides AES-256-GCM encryption for sensitive data (emails)
 * Phase C3: Production-grade encryption with per-record IV
 */
@Injectable()
export class EncryptionService {
    private readonly algorithm = 'aes-256-gcm';
    private readonly key: Buffer;

    constructor() {
        // Get encryption key from environment
        const keyString = process.env.EMAIL_ENCRYPTION_KEY;

        if (!keyString) {
            throw new Error('EMAIL_ENCRYPTION_KEY environment variable is required');
        }

        // Key must be 32 bytes for AES-256
        this.key = Buffer.from(keyString, 'base64');

        if (this.key.length !== 32) {
            throw new Error('EMAIL_ENCRYPTION_KEY must be 32 bytes (base64 encoded)');
        }
    }

    /**
     * Encrypt email with AES-256-GCM
     * Returns: base64(iv:authTag:ciphertext)
     */
    encryptEmail(email: string): string {
        // Generate random IV (12 bytes for GCM)
        const iv = crypto.randomBytes(12);

        // Create cipher
        const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

        // Encrypt
        let encrypted = cipher.update(email, 'utf8', 'base64');
        encrypted += cipher.final('base64');

        // Get auth tag (GCM authentication)
        const authTag = cipher.getAuthTag();

        // Combine: iv:authTag:ciphertext (all base64)
        const result = [
            iv.toString('base64'),
            authTag.toString('base64'),
            encrypted,
        ].join(':');

        return result;
    }

    /**
     * Decrypt email with AES-256-GCM
     * Input: base64(iv:authTag:ciphertext)
     */
    decryptEmail(encryptedEmail: string): string {
        try {
            // Split combined string
            const parts = encryptedEmail.split(':');

            if (parts.length !== 3) {
                throw new Error('Invalid encrypted email format');
            }

            const iv = Buffer.from(parts[0], 'base64');
            const authTag = Buffer.from(parts[1], 'base64');
            const encrypted = parts[2];

            // Create decipher
            const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
            decipher.setAuthTag(authTag);

            // Decrypt
            let decrypted = decipher.update(encrypted, 'base64', 'utf8');
            decrypted += decipher.final('utf8');

            return decrypted;
        } catch (error: any) {
            throw new Error(`Decryption failed: ${error.message}`);
        }
    }

    /**
     * Generate encryption key for .env
     * Usage: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
     */
    static generateKey(): string {
        return crypto.randomBytes(32).toString('base64');
    }
}
