import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class UpsertStandingDto {
  @IsString()
  @IsNotEmpty()
  competition_id: string;

  @IsString()
  @IsNotEmpty()
  team_id: string;

  @IsInt()
  @Min(0)
  played: number;

  @IsInt()
  @Min(0)
  won: number;

  @IsInt()
  @Min(0)
  draw: number;

  @IsInt()
  @Min(0)
  lost: number;

  @IsInt()
  @Min(0)
  goals_for: number;

  @IsInt()
  @Min(0)
  goals_against: number;

  @IsInt()
  @Min(0)
  points: number;
}
