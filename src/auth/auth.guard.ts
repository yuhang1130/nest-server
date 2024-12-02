import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { CustomRequest } from "../middleware/session-store/session-dto";
import { IsAdmin, IsSvc, UserNamespace } from "../constants/user-constant";
import { Reflector } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { ErrorCode, ErrorMessage } from "../constants/errorCode-constant";
import { CustomException } from "../exceptions/custom.exception";
import { SessionDto } from "../modules/user/user.dto";
import { Logger } from "../logger/logger";

@Injectable()
export class AuthGuard implements CanActivate {
  logger = new Logger(AuthGuard.name);
  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}
  canActivate(context: ExecutionContext): boolean {
    const request: CustomRequest = context.switchToHttp().getRequest();
    const isSvc = this.reflector.get<boolean>(IsSvc, context.getHandler());
    const isAdmin = this.reflector.get<boolean>(IsAdmin, context.getHandler());
    if (isSvc) {
      if (
        this.configService.get("svcNotLimit") ||
        this.configService.get("svcHosts").includes(request.hostname)
      ) {
        return true;
      } else {
        this.logger.warn("AccessDenied Hostname: %s", request.hostname);
        throw new ForbiddenException({
          statusCode: 403,
          code: ErrorCode.AccessDenied,
          error: ErrorMessage[ErrorCode.AccessDenied],
        });
      }
    }

    const UserSession: SessionDto = request.session[UserNamespace];
    if (!UserSession) {
      throw new CustomException(ErrorCode.NoLogin);
    }

    // 只允许admin账号访问
    if (isAdmin && !UserSession.User?.isAdmin) {
      throw new CustomException(ErrorCode.NotAuth);
    }
    return true;
  }
}
