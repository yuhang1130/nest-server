import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import {
  AlsGetRequestId,
  AlsGetRequestIp,
} from "src/async-storage/async-storage";
import { SkipLogController } from "src/constants/system-constant";
import { Logger } from "../../logger/logger";

export interface Response<T> {
  code: number;
  message: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T>implements NestInterceptor<T, Response<T>> {
  logger = new Logger(TransformInterceptor.name);
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const requestId = AlsGetRequestId();
    const ip = AlsGetRequestIp();
    const controller = context.getClass().name;

    return next.handle().pipe(
      map((data) => {
        if (!SkipLogController.includes(controller)) {
          this.logger.info("Response Data RequestId: %s; IP: %s; Response data: %j",requestId, ip, data);
        }

        // 对列表接口字段做转换
        if (data?.hasOwnProperty("page")) {
          const { items, total = 0, page = 1, size = 20 } = data || {};
          return {
            code: 0,
            message: "success",
            data: {
              list: items || [],
              page_info: {
                page,
                page_size: size,
                total_number: total,
                total_page: Math.ceil(total / size),
              },
            },
            request_id: requestId,
          };
        }

        return {
          code: 0,
          message: "success",
          data,
          request_id: requestId,
        };
      }),
    );
  }
}
