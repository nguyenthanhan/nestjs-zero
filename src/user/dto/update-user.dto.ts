import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsString, IsEmail, IsOptional } from 'class-validator';

// PartialType makes all properties of CreateUserDto optional
export class UpdateUserDto extends PartialType(CreateUserDto) {
  // You can override or add specific validation for updates if needed
  @IsString()
  @IsOptional() // Make name optional for updates
  name?: string;

  @IsEmail()
  @IsOptional() // Make email optional for updates
  email?: string;
}
