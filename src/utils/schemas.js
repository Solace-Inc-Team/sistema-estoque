import { z } from '../config/zod.js';

export const idParams = z.object({ id: z.coerce.number().int().positive() });

export const booleanQuery = z.enum(['true', 'false']).transform((v) => v === 'true');

export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida. Use o formato AAAA-MM-DD.');
