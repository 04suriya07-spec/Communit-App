import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * HTTP Exception Filter
 * 
 * Standardizes all error responses to follow consistent format:
 * {
 *   "error": "ERROR_CODE",
 *   "message": "Human readable explanation"
 * }
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = exception.getStatus();
        const exceptionResponse = exception.getResponse();

        // If response is already in standard format, use it
        if (
            typeof exceptionResponse === 'object' &&
            'error' in exceptionResponse &&
            'message' in exceptionResponse
        ) {
            response.status(status).json(exceptionResponse);
            return;
        }

        // Otherwise, format it
        const error = this.getErrorCode(status);
        const message =
            typeof exceptionResponse === 'string'
                ? exceptionResponse
                : (exceptionResponse as any).message || exception.message;

        response.status(status).json({
            error,
            message,
        });
    }

    private getErrorCode(status: number): string {
        switch (status) {
            case HttpStatus.BAD_REQUEST:
                return 'BAD_REQUEST';
            case HttpStatus.UNAUTHORIZED:
                return 'UNAUTHORIZED';
            case HttpStatus.FORBIDDEN:
                return 'FORBIDDEN';
            case HttpStatus.NOT_FOUND:
                return 'NOT_FOUND';
            case HttpStatus.CONFLICT:
                return 'CONFLICT';
            case HttpStatus.INTERNAL_SERVER_ERROR:
                return 'INTERNAL_SERVER_ERROR';
            default:
                return 'ERROR';
        }
    }
}
