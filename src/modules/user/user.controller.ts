import {
  Controller,
  Post,
  Body,
  SetMetadata,
  UseGuards,
  Res,
  Get,
  Query,
} from "@nestjs/common";
import { Response } from "express";
import { UserService } from "./user.service";
import { CreateUserDto, LoginUserDto, PartialUser } from "./user.dto";
import { IsAdmin } from "../../constants/user-constant";
import { AuthGuard } from "../../auth/auth.guard";
import { UserEntity } from "./entities/user.entity";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("register")
  async register(@Body() data: CreateUserDto): Promise<UserEntity> {
    return await this.userService.register(data);
  }

  @Post("login")
  async login(@Body() data: LoginUserDto): Promise<{ token: string }> {
    return await this.userService.login(data);
  }

  @UseGuards(AuthGuard)
  @Post("logout")
  async logout(@Res() res: Response): Promise<boolean> {
    res.clearCookie("cookie");
    await this.userService.logout();

    res.end(
      JSON.stringify({
        data: true,
        code: 0,
      }),
    );

    return true;
  }

  @SetMetadata(IsAdmin, true)
  @UseGuards(AuthGuard)
  @Post("info")
  async info(): Promise<PartialUser> {
    return await this.userService.info();
  }

  @Get("captcha")
  async captcha(@Query() param: { sid: string }, @Res() res: Response) {
    const captcha_data = await this.userService.captcha(param);
    res.end(
      JSON.stringify({
        data: captcha_data,
        code: 0,
      }),
    );
    return true;
  }
}
