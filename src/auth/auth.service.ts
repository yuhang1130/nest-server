import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Logger } from "../logger/logger";

export interface AuthJwtToken {
  id: string;
}

@Injectable()
export class AuthService {
  logger = new Logger(AuthService.name);
  constructor(private jwtService: JwtService) {}

  signIn(payload: AuthJwtToken): string {
    return this.jwtService.sign(payload);
  }

  decode(token: string): AuthJwtToken | null {
    try {
      return this.jwtService.decode(token) as AuthJwtToken | null;
    } catch (e) {
      this.logger.error("decode error. msg: %s", e?.message);
    }

    return null;
  }
}
