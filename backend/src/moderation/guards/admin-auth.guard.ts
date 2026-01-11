import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * AdminAuthGuard
 * 
 * Enforces internal admin authentication
 * Checks admin session and role-based permissions
 */
@Injectable()
export class AdminAuthGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const session = (request as any).adminSession;

        // 1. Check if admin session exists
        if (!session || !session.adminId || !session.isAdmin) {
            throw new UnauthorizedException('ADMIN_ACCESS_REQUIRED');
        }

        // 2. Check if admin is active
        if (!session.isActive) {
            throw new ForbiddenException('ADMIN_ACCOUNT_INACTIVE');
        }

        // 3. Check role-based permissions (optional, via decorator)
        const requiredRole = this.reflector.get<string>('role', context.getHandler());

        if (requiredRole) {
            const adminRole = session.adminRole;

            // Role hierarchy: SUPER_ADMIN > ADMIN > MODERATOR
            const roleRank = {
                MODERATOR: 1,
                ADMIN: 2,
                SUPER_ADMIN: 3,
            };

            const requiredRank = roleRank[requiredRole as keyof typeof roleRank] || 0;
            const adminRank = roleRank[adminRole as keyof typeof roleRank] || 0;

            if (adminRank < requiredRank) {
                throw new ForbiddenException('INSUFFICIENT_PERMISSIONS');
            }
        }

        // 4. Attach admin context to request
        request.adminId = session.adminId;
        request.adminRole = session.adminRole;

        return true;
    }
}
