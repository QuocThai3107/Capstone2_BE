import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorator/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Bỏ qua xác thực hoàn toàn - luôn trả về true để cho phép mọi request
    return true;
    
    // Code xác thực cũ (đã bị vô hiệu hóa)
    /*
    // Kiểm tra xem route này có được đánh dấu là public không
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // Nếu là public route, bỏ qua xác thực
    if (isPublic) {
      return true;
    }
    
    // Nếu không phải public route, thực hiện xác thực JWT
    return super.canActivate(context);
    */
  }

  // Bỏ qua hoàn toàn handleRequest để không sửa đổi request
  // Điều này sẽ không thêm user giả vào request
} 