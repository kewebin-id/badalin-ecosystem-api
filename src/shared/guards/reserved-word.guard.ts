import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class ReservedWordGuard implements CanActivate {
  private readonly reservedWords = ['admin', 'p', 'auth', 'api', 'visa', 'shared'];

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const slug = request.params.slug;
    const path = request.route.path;

    const isInitialSetupFlow = slug?.toLowerCase() === 'p' && path.includes('/auth/');

    if (isInitialSetupFlow) {
      return true;
    }

    if (slug && this.reservedWords.includes(slug.toLowerCase())) {
      throw new ForbiddenException(
        `The slug "${slug}" is reserved for system use and cannot be accessed as an agency portal.`,
      );
    }

    return true;
  }
}
