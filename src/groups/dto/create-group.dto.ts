import { ArrayMinSize, IsArray, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  competition_id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  phase?: string;

  @IsInt()
  @Min(1)
  team_count: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  team_ids: string[];
}
