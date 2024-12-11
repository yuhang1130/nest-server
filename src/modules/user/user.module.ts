import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { ConfigService } from "@nestjs/config";
import { AuthModule } from "../../auth/auth.module";
import { DatabaseModule } from "../../database/database.module";

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [UserController],
  providers: [UserService, ConfigService],
  exports: [UserService],
})
export class UserModule {}
