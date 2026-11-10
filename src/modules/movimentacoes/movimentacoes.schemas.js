import { z } from '../../config/zod.js';
import { dateSchema } from '../../utils/schemas.js';

const id = z.coerce.number().int().positive();

export const registrarMovimentacaoBody = z
  .object({
    produto_id: id,
    tipo: z.enum(['ENTRADA', 'SAIDA', 'AJUSTE']),
    // ENTRADA/SAIDA: quantidade movimentada. AJUSTE: saldo contado no inventário.
    quantidade: z.number().int().min(0),
    motivo: z.string().trim().max(200).optional(),
  })
  .refine((d) => d.tipo === 'AJUSTE' || d.quantidade > 0, {
    path: ['quantidade'],
    message: 'A quantidade deve ser maior que zero.',
  });

export const listarMovimentacoesQuery = z.object({
  produto_id: id.optional(),
  tipo: z.enum(['ENTRADA', 'SAIDA', 'AJUSTE']).optional(),
  de: dateSchema.optional(),
  ate: dateSchema.optional(),
  limite: z.coerce.number().int().min(1).max(500).default(100),
});
