import { IsArray, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class UpdateGroupDto {
  @IsString()
  @IsOptional()
  competition_id?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phase?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  team_count?: number;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  team_ids?: string[];
}
