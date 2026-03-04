import {
  IsArray,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { MatchStatus } from '../../common/enums/match-status.enum';

export class UpdateMatchDto {
  @IsString()
  @IsOptional()
  competition_id?: string;

  @IsString()
  @IsOptional()
  home_team_id?: string;

  @IsString()
  @IsOptional()
  away_team_id?: string;

  @IsString()
  @IsOptional()
  match_date?: string;

  @IsString()
  @IsOptional()
  kickoff_time?: string;

  @IsString()
  @IsOptional()
  stadium?: string;

  @IsString()
  @IsOptional()
  ticket_price?: string;

  @IsEnum(MatchStatus)
  @IsOptional()
  status?: MatchStatus;

  @IsInt()
  @Min(0)
  @IsOptional()
  home_score?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  away_score?: number;

  @IsString()
  @IsOptional()
  round?: string;

  @IsObject()
  @IsOptional()
  referees?: Record<string, unknown>;

  @IsObject()
  @IsOptional()
  lineup_home?: Record<string, unknown>;

  @IsObject()
  @IsOptional()
  lineup_away?: Record<string, unknown>;

  @IsObject()
  @IsOptional()
  match_stats?: Record<string, unknown>;

  @IsObject()
  @IsOptional()
  man_of_the_match?: Record<string, unknown>;

  @IsArray()
  @IsOptional()
  incidents?: Array<Record<string, unknown>>;
}
