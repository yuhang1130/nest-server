import { HttpException, HttpStatus } from "@nestjs/common";
import { ErrorCode, ErrorMessage } from "../constants/errorCode-constant";

export class CustomException extends HttpException {
  constructor(errCode: ErrorCode, message?: string, param?: any[]) {
    if (!message) {
      message = ErrorMessage[errCode];
    }

    if (param?.length && message?.match(/({\$\d+})/)) {
      message = message.replace(/({\$(\d+)})/g, (text, p1, p2) => {
        return String(param[p2] || text);
      });
    }

    super(
      { code: errCode, message: message || "Internal Server Error" },
      HttpStatus.OK,
    );
  }
}
