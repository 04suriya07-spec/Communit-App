import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { validate as isUUID } from 'uuid';

/**
 * UUID Validation Pipe
 * 
 * Validates that route parameters are valid UUIDs before hitting the controller.
 * Returns 400 Bad Request if invalid UUID format.
 * 
 * Usage:
 * @Param('id', ParseUUIDPipe) id: string
 */
@Injectable()
export class ParseUUIDPipe implements PipeTransform<string, string> {
    transform(value: string): string {
        if (!isUUID(value)) {
            throw new BadRequestException({
                error: 'INVALID_UUID',
                message: `Invalid UUID format: ${value}`,
            });
        }
        return value;
    }
}
