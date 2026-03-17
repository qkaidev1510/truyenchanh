import { IsString, IsEnum, IsOptional, IsUrl, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MangaStatus } from '../../generated/prisma/client';

export class CreateMangaDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  slug: string;

  @ApiPropertyOptional()
  @IsUrl()
  @IsOptional()
  coverUrl?: string;

  @ApiPropertyOptional({ enum: MangaStatus })
  @IsEnum(MangaStatus)
  @IsOptional()
  status?: MangaStatus;
}

export class UpdateMangaDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsUrl()
  @IsOptional()
  coverUrl?: string;

  @ApiPropertyOptional({ enum: MangaStatus })
  @IsEnum(MangaStatus)
  @IsOptional()
  status?: MangaStatus;
}

export class MangaQueryDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  q?: string;

  @ApiPropertyOptional({ enum: MangaStatus })
  @IsEnum(MangaStatus)
  @IsOptional()
  status?: MangaStatus;

  @ApiPropertyOptional()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  pageSize?: number;
}
