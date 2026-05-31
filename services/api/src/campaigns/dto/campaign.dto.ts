import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CampaignStatus } from "@prisma/client";
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

export class CreateCampaignDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(60)
  category?: string;

  @ApiPropertyOptional({ default: "instagram_reels" })
  @IsOptional()
  @IsString()
  platform?: string;

  @ApiProperty()
  @IsString()
  @MinLength(20)
  brief!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  productUrl?: string;

  @ApiProperty({ description: "₹ per 1K views in paise (5000 = ₹50)" })
  @IsInt()
  @Min(1)
  ratePer1kPaise!: number;

  @ApiProperty()
  @IsInt()
  @Min(100)
  maxPayoutPaise!: number;

  @ApiProperty()
  @IsInt()
  @Min(100)
  budgetPaise!: number;

  @ApiPropertyOptional()
  @IsOptional()
  endsAt?: string;
}

export class UpdateCampaignDto {
  @ApiPropertyOptional({ enum: CampaignStatus })
  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brief?: string;
}
