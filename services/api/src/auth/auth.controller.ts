import { Body, Controller, Post } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";

import { AuthService } from "./auth.service";
import { OtpService } from "./otp.service";
import {
  BrandForgotPasswordDto,
  BrandLoginDto,
  BrandRegisterDto,
  BrandResetPasswordDto,
  RefreshTokenDto,
} from "./dto/brand-auth.dto";
import { CreatorOtpRequestDto, CreatorOtpVerifyDto } from "./dto/creator-auth.dto";
import { AuthResponseDto } from "./dto/auth-response.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly otp: OtpService,
  ) {}

  @Post("brand/register")
  @ApiOkResponse({ type: AuthResponseDto })
  registerBrand(@Body() dto: BrandRegisterDto) {
    return this.auth.registerBrand(dto);
  }

  @Post("brand/login")
  @ApiOkResponse({ type: AuthResponseDto })
  loginBrand(@Body() dto: BrandLoginDto) {
    return this.auth.loginBrand(dto);
  }

  @Post("brand/forgot-password")
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  forgotPassword(@Body() dto: BrandForgotPasswordDto) {
    return this.auth.forgotBrandPassword(dto.email);
  }

  @Post("brand/reset-password")
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  resetPassword(@Body() dto: BrandResetPasswordDto) {
    return this.auth.resetBrandPassword(dto.token, dto.password);
  }

  @Post("creator/otp/request")
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  requestCreatorOtp(@Body() dto: CreatorOtpRequestDto) {
    return this.otp.requestOtp(dto.phone);
  }

  @Post("creator/otp/verify")
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOkResponse({ type: AuthResponseDto })
  verifyCreatorOtp(@Body() dto: CreatorOtpVerifyDto) {
    return this.auth.verifyCreatorOtp(dto);
  }

  @Post("refresh")
  @ApiOkResponse({ type: AuthResponseDto })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.auth.refresh(dto.refreshToken);
  }

  @Post("logout")
  logout(@Body() dto: RefreshTokenDto) {
    return this.auth.logout(dto.refreshToken);
  }
}
