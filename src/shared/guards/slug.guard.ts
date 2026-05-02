import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class SlugGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const params = request.params;
    const user = request.user;
    const { slug } = params;

    // 1. If no slug in params, skip (this guard is only for slug-based routes)
    if (!slug) {
      return true;
    }

    // 2. Identify Public Routes (Auth endpoints often allow 'p')
    // Logic: If slug is 'p', we only check if the user is a PROVIDER or if it's a public Auth route.
    if (slug === 'p') {
      const path = request.route.path;
      const method = request.method;

      // Allowed 'p' routes: Auth and Agency Setup/Verification
      const isAuthRoute = path.includes('/auth/');
      const isAgencySetup = path.includes('/agency') && method === 'PATCH';
      const isAgencyCheck = path.includes('/agency/check-slug');

      if (isAuthRoute || isAgencySetup || isAgencyCheck) {
        return true;
      }

      throw new ForbiddenException('Direct access to generic "p" route is restricted to setup and authentication');
    }

    // 3. For real slugs, validate against user's agency ownership
    if (!user) {
      // If it's a public route (e.g. check-slug) and slug !== 'p', it will be caught by logic above if needed.
      // But for identified providers, user should exist due to JwtAuthGuard.
      return true; 
    }

    if (user.role === 'SUPERADMIN') {
      return true;
    }

    if (user.agencySlug !== slug) {
      throw new ForbiddenException(`Access denied: You do not have permission to access agency "${slug}"`);
    }

    // 4. If slug is temporary (not setup), restrict access
    if (slug.startsWith('temp-')) {
      const path = request.route.path;
      const method = request.method;

      const isAuthRoute = path.includes('/auth/');
      const isAgencySetup = path.includes('/agency') && method === 'PATCH';
      const isAgencyCheck = path.includes('/agency/check-slug');

      if (!isAuthRoute && !isAgencySetup && !isAgencyCheck) {
        throw new ForbiddenException('Agency slug setup required. Please complete your profile first.');
      }
    }

    return true;
  }
}
