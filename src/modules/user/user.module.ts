import { Global, Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { ConfigService } from "@nestjs/config";
import { AuthModule } from "../../auth/auth.module";

@Global()
@Module({
  imports: [AuthModule],
  controllers: [UserController],
  providers: [UserService, ConfigService],
  exports: [UserService],
})
export class UserModule {}
