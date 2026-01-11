/**
 * Log Context Interface
 * 
 * Standard fields for structured logging
 */
export interface LogContext {
    correlationId?: string;
    service?: string;
    method?: string;
    endpoint?: string;
    accountabilityId?: string;
    personaId?: string;
    statusCode?: number;
    duration?: number;
    [key: string]: any;
}
