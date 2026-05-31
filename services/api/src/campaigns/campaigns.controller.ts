import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";

import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import type { AuthJwtPayload } from "../auth/auth.types";
import { CampaignsService } from "./campaigns.service";
import { CreateCampaignDto, UpdateCampaignDto } from "./dto/campaign.dto";

@ApiTags("campaigns")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.brand)
@Controller("campaigns")
export class CampaignsController {
  constructor(private readonly campaigns: CampaignsService) {}

  @Get()
  list(@CurrentUser() user: AuthJwtPayload) {
    return this.campaigns.listForBrand(user.sub);
  }

  @Get(":id")
  get(@CurrentUser() user: AuthJwtPayload, @Param("id") id: string) {
    return this.campaigns.getForBrand(user.sub, id);
  }

  @Post()
  create(@CurrentUser() user: AuthJwtPayload, @Body() dto: CreateCampaignDto) {
    return this.campaigns.create(user.sub, dto);
  }

  @Patch(":id")
  update(
    @CurrentUser() user: AuthJwtPayload,
    @Param("id") id: string,
    @Body() dto: UpdateCampaignDto,
  ) {
    return this.campaigns.update(user.sub, id, dto);
  }
}
