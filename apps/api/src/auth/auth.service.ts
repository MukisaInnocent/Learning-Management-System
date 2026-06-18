import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already in use');

    let organization = await this.prisma.organization.findUnique({
      where: { id: dto.organizationId },
    });

    if (!organization) {
      if (!dto.organizationName || !dto.organizationSlug) {
        throw new BadRequestException(
          'organizationName and organizationSlug required for new org',
        );
      }
      organization = await this.prisma.organization.create({
        data: {
          id: dto.organizationId,
          name: dto.organizationName,
          slug: dto.organizationSlug,
        },
      });
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        passwordHash,
        role: dto.role,
        organizationId: organization.id,
      },
      include: { organization: true },
    });

    await this.prisma.organizationMember.create({
      data: {
        userId: user.id,
        organizationId: organization.id,
        role: dto.role,
      },
    });

    const tokens = this.generateTokens(
      user.id,
      user.email,
      user.role,
      user.organizationId,
    );
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    const { passwordHash: _, ...userSafe } = user;
    return { user: userSafe, tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { organization: true },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const tokens = this.generateTokens(
      user.id,
      user.email,
      user.role,
      user.organizationId,
    );
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    const { passwordHash: _, ...userSafe } = user;
    return { user: userSafe, tokens };
  }

  async refresh(refreshToken: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revoked: true },
    });

    const tokens = this.generateTokens(
      stored.user.id,
      stored.user.email,
      stored.user.role,
      stored.user.organizationId,
    );
    await this.saveRefreshToken(stored.user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true },
    });
    if (!user) throw new UnauthorizedException();
    const { passwordHash: _, ...userSafe } = user;
    return userSafe;
  }

  private generateTokens(
    userId: string,
    email: string,
    role: Role,
    organizationId: string,
  ) {
    const payload = { sub: userId, email, role, organizationId };
    const secret = process.env.JWT_SECRET || 'jwt-secret-change-in-production';

    const accessToken = this.jwtService.sign(payload, {
      secret,
      expiresIn: '15m',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret,
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(userId: string, token: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await this.prisma.refreshToken.create({
      data: { token, userId, expiresAt },
    });
  }
}
