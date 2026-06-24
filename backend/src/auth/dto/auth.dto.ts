import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Nguyễn Văn A' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'student@hust.edu.vn' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'ĐH Bách Khoa Hà Nội' })
  @IsString()
  @IsNotEmpty()
  university: string;

  @ApiProperty({ example: 'CNTT' })
  @IsString()
  @IsNotEmpty()
  faculty: string;
}

export class LoginDto {
  @ApiProperty({ example: 'student@hust.edu.vn' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({ example: 'refresh_token_here' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
