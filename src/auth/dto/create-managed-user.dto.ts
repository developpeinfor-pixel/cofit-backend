import { IsEmail, IsIn, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Role } from '../../common/enums/role.enum';

export class CreateManagedUserDto {
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsNotEmpty()
  last_name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsIn([Role.ADMIN_GENERAL, Role.ADMIN_SENIOR, Role.ADMIN_JUNIOR])
  role: Role.ADMIN_GENERAL | Role.ADMIN_SENIOR | Role.ADMIN_JUNIOR;
}
