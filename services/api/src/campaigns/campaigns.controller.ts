import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Get,
  UploadedFile,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseInterceptors,
  UseGuards,
} from "@nestjs/common";
import type { Request } from "express";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { UserRole } from "@prisma/client";

import {
  buildUploadedFileResponse,
  ensureUploadDir,
  finalizeUploadedFile,
  imageOnlyFileFilter,
  imageOrVideoFileFilter,
} from "./campaign-upload.util";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import type { AuthJwtPayload } from "../auth/auth.types";
import { CampaignsService } from "./campaigns.service";
import { CreateCampaignDto, UpdateCampaignDto } from "./dto/campaign.dto";
import { ListCampaignsQueryDto } from "./dto/list-campaigns-query.dto";

@ApiTags("campaigns")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.brand)
@Controller("campaigns")
export class CampaignsController {
  constructor(private readonly campaigns: CampaignsService) {}

  @Post("cover/upload")
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor("file", {
      dest: ensureUploadDir("cover-images"),
      limits: { fileSize: 3 * 1024 * 1024 },
      fileFilter: imageOnlyFileFilter,
    }),
  )
  uploadCoverImage(
    @UploadedFile()
    file: { filename: string; originalname: string; mimetype?: string } | undefined,
    @Req() req: Request,
  ) {
    if (!file) {
      throw new BadRequestException("File is required");
    }
    const saved = finalizeUploadedFile("cover-images", file);
    return buildUploadedFileResponse(req, "cover-images", saved);
  }

  @Post("reference-assets/upload")
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor("file", {
      dest: ensureUploadDir("reference-assets"),
      limits: { fileSize: 25 * 1024 * 1024 },
      fileFilter: imageOrVideoFileFilter,
    }),
  )
  uploadReferenceAsset(
    @UploadedFile()
    file: { filename: string; mimetype: string; originalname: string } | undefined,
    @Req() req: Request,
  ) {
    if (!file) {
      throw new BadRequestException("File is required");
    }
    const saved = finalizeUploadedFile("reference-assets", file);
    const type = file.mimetype.startsWith("image/") ? "image" : "video";
    return {
      ...buildUploadedFileResponse(req, "reference-assets", saved),
      type,
    };
  }

  @Get()
  list(@CurrentUser() user: AuthJwtPayload, @Query() query: ListCampaignsQueryDto) {
    return this.campaigns.listForBrand(user.sub, query);
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

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  remove(@CurrentUser() user: AuthJwtPayload, @Param("id") id: string) {
    return this.campaigns.remove(user.sub, id);
  }
}
