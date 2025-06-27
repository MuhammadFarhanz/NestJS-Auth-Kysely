import { createZodDto } from 'nestjs-zod';
import { BaseUser } from 'src/users/schemas/user.schema';
import { z } from 'zod';

const Username = z.string().min(3).max(100);
const Email = z.string().email();
const Password = z.string().min(3).max(100);
const Id = z.number();

export const AuthUser = BaseUser.extend({
  password: Password,
});

export const RegisterUser = z.object({
  username: Username,
  email: Email,
  password: Password,
});

export const LoginUser = z.object({
  email: Email,
  password: Password,
});

export const UserResponse = z.object({
  id: Id,
  email: Email,
  username: Username,
});

export const LoginResponse = z.object({
  accessToken: z.string(),
  refreshToken: z.string().min(10).max(300),
});

export const JwtPayloadSchema = z.object({
  sub: z.number().int().positive(),
  iat: z.number(),
  exp: z.number(),
  jti: z.string(),
});

export const RefreshTokenSchema = z.object({
  userId: z.number().int().positive(),
  value: z.string().min(10).max(300),
  expiresAt: z.date(),
});

export const RefreshTokenValue = z.object({
  refreshToken: z.string().min(10).max(300),
});

export const LogoutSchema = z.object({
  refreshToken: z.string().min(10).max(300),
  all: z.boolean(),
});

export const ResetPassword = z.object({
  oldPassword: Password,
  newPassword: Password,
});

// DTO
export class RegisterUserDto extends createZodDto(RegisterUser) {}
export class LoginUserDto extends createZodDto(LoginUser) {}
export class LoginResponseDto extends createZodDto(LoginResponse) {}
export class RefreshTokenDto extends createZodDto(RefreshTokenValue) {}
export class LogoutDto extends createZodDto(LogoutSchema) {}
export class UserResponseDto extends createZodDto(UserResponse) {}
export class ResetPasswordDto extends createZodDto(ResetPassword) {}

// TYPES
export type User = z.infer<typeof BaseUser>;
export type ResetPassword = z.infer<typeof ResetPassword>;
export type AuthUser = z.infer<typeof AuthUser>;
export type RegisterUser = z.infer<typeof RegisterUser>;
export type UserResponse = z.infer<typeof UserResponse>;
export type LoginUser = z.infer<typeof LoginUser>;
export type LoginResponse = z.infer<typeof LoginResponse>;
export type RefreshToken = z.infer<typeof RefreshTokenSchema>;
export type JwtPayload = z.infer<typeof JwtPayloadSchema>;
