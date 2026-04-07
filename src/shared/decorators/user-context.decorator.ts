import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IUserContext } from '../utils/rest-api/types';

export const UserContext = createParamDecorator((data: unknown, ctx: ExecutionContext): IUserContext => {
  const request = ctx.switchToHttp().getRequest();
  const user = request.user;

  return {
    id: user.id,
    role: user.role,
    agencySlug: user.agencySlug,
  };
});
