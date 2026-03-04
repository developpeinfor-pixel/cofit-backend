import { IsArray, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { MatchStatus } from '../../common/enums/match-status.enum';

export class CreateMatchDto {
  @IsString()
  @IsOptional()
  competition_id?: string;

  @IsString()
  @IsNotEmpty()
  home_team_id: string;

  @IsString()
  @IsNotEmpty()
  away_team_id: string;

  @IsString()
  @IsNotEmpty()
  match_date: string;

  @IsString()
  @IsNotEmpty()
  kickoff_time: string;

  @IsString()
  @IsNotEmpty()
  stadium: string;

  @IsString()
  @IsNotEmpty()
  ticket_price: string;

  @IsEnum(MatchStatus)
  @IsOptional()
  status?: MatchStatus;

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
