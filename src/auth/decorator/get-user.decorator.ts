import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    
    // Nếu không có user trong request, trả về undefined
    if (!request.user) {
      return undefined;
    }
    
    if (data) {
      return request.user[data];
    }
    return request.user;
  },
); 