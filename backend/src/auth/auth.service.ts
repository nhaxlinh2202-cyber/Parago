import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  private validateEmailDomain(email: string) {
    const allowedDomains = (process.env.ALLOWED_EMAIL_DOMAINS || 'hust.edu.vn,vnu.edu.vn,neu.edu.vn').split(',');
    const domain = email.split('@')[1];
    if (!allowedDomains.includes(domain)) {
      throw new BadRequestException('Email domain not allowed. Must be a supported university email.');
    }
  }

  async register(dto: RegisterDto) {
    this.validateEmailDomain(dto.email);

    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      university: dto.university,
      faculty: dto.faculty,
    });

    // Mock sending email
    console.log(`[Mock] Verification email sent to ${user.email}`);

    return { message: 'Registration successful. Please verify your email.' };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user.id, user.email);
  }

  async refresh(dto: RefreshTokenDto) {
    try {
      const decoded = this.jwtService.verify(dto.refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'parago-super-secret-refresh-key',
      });

      const user = await this.usersService.findById(decoded.sub);
      if (!user || !user.refreshTokenHash) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const isMatch = await bcrypt.compare(dto.refreshToken, user.refreshTokenHash);
      if (!isMatch) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(user.id, user.email);
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string) {
    await this.usersService.update(userId, { refreshTokenHash: null });
    return { message: 'Logged out successfully' };
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'parago-super-secret-refresh-key',
      expiresIn: '7d',
    });

    // Hash and store refresh token
    const salt = await bcrypt.genSalt(10);
    const refreshTokenHash = await bcrypt.hash(refreshToken, salt);
    await this.usersService.update(userId, { refreshTokenHash });

    return {
      accessToken,
      refreshToken,
    };
  }
}
