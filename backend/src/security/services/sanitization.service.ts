import { Injectable, BadRequestException } from '@nestjs/common';
import * as validator from 'validator';

/**
 * Input Sanitization Service
 * 
 * Server-side validation and sanitization
 * REJECT malicious input, don't auto-fix
 */
@Injectable()
export class SanitizationService {
    private readonly DISPLAY_NAME_MIN_LENGTH = 2;
    private readonly DISPLAY_NAME_MAX_LENGTH = 50;

    // Dangerous patterns that indicate malicious intent
    private readonly MALICIOUS_PATTERNS = [
        /<script/i,           // Script tags
        /javascript:/i,       // JavaScript protocol
        /on\w+\s*=/i,        // Event handlers (onclick, etc)
        /<iframe/i,          // Iframes
        /<embed/i,           // Embeds
        /<object/i,          // Objects
        /data:text\/html/i,  // Data URLs
        /vbscript:/i,        // VBScript
    ];

    /**
     * Validate and sanitize display name
     * REJECT if malicious, don't attempt to fix
     */
    validateDisplayName(displayName: string): string {
        // Check for null/undefined
        if (!displayName || typeof displayName !== 'string') {
            throw new BadRequestException('DISPLAY_NAME_REQUIRED');
        }

        // Trim whitespace
        const trimmed = displayName.trim();

        // Check length
        if (trimmed.length < this.DISPLAY_NAME_MIN_LENGTH) {
            throw new BadRequestException('DISPLAY_NAME_TOO_SHORT');
        }

        if (trimmed.length > this.DISPLAY_NAME_MAX_LENGTH) {
            throw new BadRequestException('DISPLAY_NAME_TOO_LONG');
        }

        // Check for malicious patterns - REJECT, don't sanitize
        for (const pattern of this.MALICIOUS_PATTERNS) {
            if (pattern.test(trimmed)) {
                throw new BadRequestException('DISPLAY_NAME_INVALID_CHARACTERS');
            }
        }

        // Check for excessive special characters (more than 30%)
        const specialCharCount = (trimmed.match(/[^a-zA-Z0-9\s]/g) || []).length;
        if (specialCharCount / trimmed.length > 0.3) {
            throw new BadRequestException('DISPLAY_NAME_TOO_MANY_SPECIAL_CHARS');
        }

        // Check for only whitespace or special chars
        if (!/[a-zA-Z0-9]/.test(trimmed)) {
            throw new BadRequestException('DISPLAY_NAME_MUST_CONTAIN_ALPHANUMERIC');
        }

        // Passed all checks - return trimmed version
        return trimmed;
    }

    /**
     * Validate post body
     * REJECT malicious HTML/scripts
     */
    validatePostBody(body: string): string {
        if (!body || typeof body !== 'string') {
            throw new BadRequestException('POST_BODY_REQUIRED');
        }

        const trimmed = body.trim();

        // Check for malicious patterns
        for (const pattern of this.MALICIOUS_PATTERNS) {
            if (pattern.test(trimmed)) {
                throw new BadRequestException('POST_BODY_CONTAINS_MALICIOUS_CONTENT');
            }
        }

        return trimmed;
    }

    /**
     * Sanitize email (canonical form)
     */
    sanitizeEmail(email: string): string {
        if (!email || typeof email !== 'string') {
            throw new BadRequestException('EMAIL_REQUIRED');
        }

        const trimmed = email.trim().toLowerCase();

        // Validate email format
        if (!validator.isEmail(trimmed)) {
            throw new BadRequestException('EMAIL_INVALID_FORMAT');
        }

        return trimmed;
    }
}
