// import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const Username = z.string().min(3).max(100);
const Email = z.string().email();
// const Password = z.string().min(3).max(100);
const Id = z.number();

// SCHEMAS
export const BaseUser = z.object({
  id: Id,
  email: Email,
  username: Username,
});

// DTOs

// TYPES
export type User = z.infer<typeof BaseUser>;
