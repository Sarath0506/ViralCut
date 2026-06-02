import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CampaignStatus, Prisma } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";
import type { CreateCampaignDto, UpdateCampaignDto } from "./dto/campaign.dto";
import type { ListCampaignsQueryDto } from "./dto/list-campaigns-query.dto";

@Injectable()
export class CampaignsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getBrandProfileId(userId: string): Promise<string> {
    const profile = await this.prisma.brandProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      throw new ForbiddenException({
        code: "FORBIDDEN",
        message: "Brand profile required",
      });
    }
    return profile.id;
  }

  async listLiveForCreators() {
    const campaigns = await this.prisma.campaign.findMany({
      where: { status: CampaignStatus.live },
      orderBy: { createdAt: "desc" },
    });
    return campaigns.map((c) => this.formatCampaign(c));
  }

  async getLiveForCreator(campaignId: string) {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id: campaignId, status: CampaignStatus.live },
    });
    if (!campaign) {
      throw new NotFoundException({
        code: "NOT_FOUND",
        message: "Campaign not found",
      });
    }
    return this.formatCampaign(campaign);
  }

  async listForBrand(userId: string, query: ListCampaignsQueryDto) {
    const brandProfileId = await this.getBrandProfileId(userId);
    const page = query.page ?? 1;
    const limit = query.limit ?? 6;
    const skip = (page - 1) * limit;

    const where = {
      brandProfileId,
      ...(query.status ? { status: query.status } : {}),
    };

    const [total, campaigns] = await this.prisma.$transaction([
      this.prisma.campaign.count({ where }),
      this.prisma.campaign.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          _count: { select: { submissions: true } },
        },
      }),
    ]);

    return {
      items: campaigns.map((c) => ({
        ...this.formatCampaign(c),
        submissionCount: c._count.submissions,
      })),
      total,
      page,
      limit,
    };
  }

  async getForBrand(userId: string, campaignId: string) {
    const brandProfileId = await this.getBrandProfileId(userId);
    const campaign = await this.prisma.campaign.findFirst({
      where: { id: campaignId, brandProfileId },
      include: {
        _count: { select: { submissions: true } },
      },
    });
    if (!campaign) {
      throw new NotFoundException({
        code: "NOT_FOUND",
        message: "Campaign not found",
      });
    }
    return {
      ...this.formatCampaign(campaign),
      submissionCount: campaign._count.submissions,
    };
  }

  async create(userId: string, dto: CreateCampaignDto) {
    const brandProfileId = await this.getBrandProfileId(userId);
    const status = dto.status ?? CampaignStatus.draft;
    const isLive = status === CampaignStatus.live;

    if (isLive) {
      this.assertPublishable(dto);
    }

    const platforms =
      dto.platforms && dto.platforms.length > 0
        ? dto.platforms
        : [dto.platform ?? "instagram_reels"];

    const brief = this.buildBrief(dto) || (isLive ? "" : "Draft campaign — complete before publishing.");
    if (isLive && !brief) {
      throw new BadRequestException({
        code: "VALIDATION_ERROR",
        message: "Campaign brief is required to publish",
      });
    }

    const campaign = await this.prisma.campaign.create({
      data: {
        brandProfileId,
        title: dto.title,
        category: dto.category,
        platform: platforms[0] ?? "instagram_reels",
        platforms,
        status,
        brief,
        briefHook: dto.briefHook,
        productFocus: dto.productFocus,
        toneOfVoice: dto.toneOfVoice ?? [],
        doRules: dto.doRules,
        avoidRules: dto.avoidRules,
        referenceAssets: dto.referenceAssets as Prisma.InputJsonValue | undefined,
        coverImageUrl: dto.coverImageUrl,
        productUrl: dto.productUrl,
        ratePer1kPaise: dto.ratePer1kPaise ?? 5_000,
        maxPayoutPaise: dto.maxPayoutPaise ?? 5_000_000,
        budgetPaise: dto.budgetPaise ?? 10_000_000,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
      } as Prisma.CampaignUncheckedCreateInput,
    });
    return this.formatCampaign(campaign);
  }

  async update(userId: string, campaignId: string, dto: UpdateCampaignDto) {
    const brandProfileId = await this.getBrandProfileId(userId);
    const existing = await this.prisma.campaign.findFirst({
      where: { id: campaignId, brandProfileId },
    });
    if (!existing) {
      throw new NotFoundException({
        code: "NOT_FOUND",
        message: "Campaign not found",
      });
    }

    const nextStatus = dto.status ?? existing.status;
    if (dto.status && dto.status !== existing.status) {
      this.assertStatusTransition(existing.status, dto.status);
    }
    if (nextStatus === CampaignStatus.live && existing.status !== CampaignStatus.live) {
      this.assertPublishable({
        title: dto.title ?? existing.title,
        briefHook: dto.briefHook ?? existing.briefHook ?? undefined,
        productFocus: dto.productFocus ?? existing.productFocus ?? undefined,
        ratePer1kPaise: dto.ratePer1kPaise ?? existing.ratePer1kPaise,
        maxPayoutPaise: dto.maxPayoutPaise ?? existing.maxPayoutPaise,
        budgetPaise: dto.budgetPaise ?? existing.budgetPaise,
        brief: dto.brief ?? existing.brief,
      });
    }

    const brief =
      dto.brief !== undefined
        ? dto.brief
        : this.buildBrief({
            briefHook: dto.briefHook ?? existing.briefHook ?? undefined,
            productFocus: dto.productFocus ?? existing.productFocus ?? undefined,
            toneOfVoice: dto.toneOfVoice ?? existing.toneOfVoice,
            doRules: dto.doRules ?? existing.doRules ?? undefined,
            avoidRules: dto.avoidRules ?? existing.avoidRules ?? undefined,
          }) || existing.brief;

    const campaign = await this.prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: dto.status,
        title: dto.title,
        category: dto.category,
        brief,
        briefHook: dto.briefHook,
        productFocus: dto.productFocus,
        toneOfVoice: dto.toneOfVoice,
        doRules: dto.doRules,
        avoidRules: dto.avoidRules,
        referenceAssets: dto.referenceAssets as Prisma.InputJsonValue | undefined,
        coverImageUrl: dto.coverImageUrl,
        platforms: dto.platforms,
        platform: dto.platforms?.[0],
        productUrl: dto.productUrl,
        ratePer1kPaise: dto.ratePer1kPaise,
        maxPayoutPaise: dto.maxPayoutPaise,
        budgetPaise: dto.budgetPaise,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      } as Prisma.CampaignUncheckedUpdateInput,
    });
    return this.formatCampaign(campaign);
  }

  async remove(userId: string, campaignId: string) {
    const brandProfileId = await this.getBrandProfileId(userId);
    const existing = await this.prisma.campaign.findFirst({
      where: { id: campaignId, brandProfileId },
      include: {
        _count: { select: { submissions: true } },
      },
    });
    if (!existing) {
      throw new NotFoundException({
        code: "NOT_FOUND",
        message: "Campaign not found",
      });
    }

    if (
      existing.status !== CampaignStatus.draft &&
      existing.status !== CampaignStatus.closed
    ) {
      throw new BadRequestException({
        code: "VALIDATION_ERROR",
        message: "End the campaign before deleting it",
      });
    }

    if (existing._count.submissions > 0) {
      throw new BadRequestException({
        code: "VALIDATION_ERROR",
        message: "Cannot delete a campaign that has creator submissions",
      });
    }

    await this.prisma.campaign.delete({ where: { id: campaignId } });
    return { deleted: true, id: campaignId };
  }

  private assertStatusTransition(
    from: CampaignStatus,
    to: CampaignStatus,
  ): void {
    if (from === to) return;

    const allowed: Record<CampaignStatus, CampaignStatus[]> = {
      [CampaignStatus.draft]: [CampaignStatus.live, CampaignStatus.closed],
      [CampaignStatus.live]: [CampaignStatus.paused, CampaignStatus.closed],
      [CampaignStatus.paused]: [CampaignStatus.live, CampaignStatus.closed],
      [CampaignStatus.closed]: [],
    };

    if (!allowed[from].includes(to)) {
      throw new BadRequestException({
        code: "VALIDATION_ERROR",
        message: `Cannot change campaign status from ${from} to ${to}`,
      });
    }
  }

  private assertPublishable(input: {
    title?: string;
    briefHook?: string;
    productFocus?: string;
    ratePer1kPaise?: number;
    maxPayoutPaise?: number;
    budgetPaise?: number;
    brief?: string;
  }): void {
    if (!input.title || input.title.trim().length < 3) {
      throw new BadRequestException({
        code: "VALIDATION_ERROR",
        message: "Campaign title is required to publish",
      });
    }
    if (!input.briefHook || input.briefHook.trim().length < 10) {
      throw new BadRequestException({
        code: "VALIDATION_ERROR",
        message: "Campaign hook must be at least 10 characters to publish",
      });
    }
    if (!input.productFocus || input.productFocus.trim().length < 10) {
      throw new BadRequestException({
        code: "VALIDATION_ERROR",
        message: "Product focus must be at least 10 characters to publish",
      });
    }
    if (!input.ratePer1kPaise || input.ratePer1kPaise < 1) {
      throw new BadRequestException({
        code: "VALIDATION_ERROR",
        message: "Rate per 1K views is required to publish",
      });
    }
    if (!input.maxPayoutPaise || input.maxPayoutPaise < 100) {
      throw new BadRequestException({
        code: "VALIDATION_ERROR",
        message: "Max payout is required to publish",
      });
    }
    if (!input.budgetPaise || input.budgetPaise < 100) {
      throw new BadRequestException({
        code: "VALIDATION_ERROR",
        message: "Campaign budget is required to publish",
      });
    }
    const briefText = input.brief?.trim() ?? "";
    if (briefText.length > 0 && briefText.length < 20) {
      throw new BadRequestException({
        code: "VALIDATION_ERROR",
        message: "Campaign brief is too short to publish",
      });
    }
  }

  private formatCampaign(c: {
    id: string;
    title: string;
    category: string | null;
    platform: string;
    platforms: string[];
    status: CampaignStatus;
    brief: string;
    briefHook: string | null;
    productFocus: string | null;
    toneOfVoice: string[];
    doRules: string | null;
    avoidRules: string | null;
    referenceAssets: unknown;
    coverImageUrl?: string | null;
    productUrl: string | null;
    ratePer1kPaise: number;
    maxPayoutPaise: number;
    budgetPaise: number;
    budgetUsedPaise: number;
    startDate: Date | null;
    endsAt: Date | null;
    createdAt: Date;
  }) {
    const poolPercent =
      c.budgetPaise > 0
        ? Math.round((c.budgetUsedPaise / c.budgetPaise) * 100)
        : 0;

    return {
      id: c.id,
      title: c.title,
      category: c.category,
      platform: c.platform,
      platforms: c.platforms,
      status: c.status,
      brief: c.brief,
      briefHook: c.briefHook,
      productFocus: c.productFocus,
      toneOfVoice: c.toneOfVoice,
      doRules: c.doRules,
      avoidRules: c.avoidRules,
      referenceAssets: c.referenceAssets,
      coverImageUrl: c.coverImageUrl,
      productUrl: c.productUrl,
      ratePer1kPaise: c.ratePer1kPaise,
      ratePer1kDisplay: `₹${c.ratePer1kPaise / 100} / 1K views`,
      maxPayoutPaise: c.maxPayoutPaise,
      budgetPaise: c.budgetPaise,
      budgetUsedPaise: c.budgetUsedPaise,
      poolPercent,
      poolRemainingPercent: 100 - poolPercent,
      startDate: c.startDate?.toISOString() ?? null,
      endsAt: c.endsAt?.toISOString() ?? null,
      createdAt: c.createdAt.toISOString(),
    };
  }

  private buildBrief(dto: {
    brief?: string;
    briefHook?: string;
    productFocus?: string;
    toneOfVoice?: string[];
    doRules?: string;
    avoidRules?: string;
  }): string {
    if (dto.brief && dto.brief.trim().length > 0) {
      return dto.brief.trim();
    }

    const composed = [
      dto.briefHook && `HOOK:\n${dto.briefHook}`,
      dto.productFocus && `\nPRODUCT FOCUS:\n${dto.productFocus}`,
      dto.toneOfVoice && dto.toneOfVoice.length > 0
        ? `\nTONE:\n${dto.toneOfVoice.join(", ")}`
        : "",
      dto.doRules && `\n\nDO:\n${dto.doRules}`,
      dto.avoidRules && `\n\nAVOID:\n${dto.avoidRules}`,
    ]
      .filter(Boolean)
      .join("")
      .trim();

    return composed;
  }
}
