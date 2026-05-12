import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  IsStrongPassword,
  Min,
  MinLength,
} from 'class-validator';

export class SignUpDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsOptional()
  @IsInt()
  @Min(12)
  age?: number;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @IsStrongPassword({
    minLength: 6,
    minLowercase: 1,
    minSymbols: 1,
    minNumbers: 1,
    minUppercase: 1,
  })
  password: string;
}
