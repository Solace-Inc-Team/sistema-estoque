import { z } from '../../config/zod.js';
import { dateSchema } from '../../utils/schemas.js';

export const periodoQuery = z.object({
  de: dateSchema.optional(),
  ate: dateSchema.optional(),
});
