import { z } from '../../config/zod.js';
import { booleanQuery } from '../../utils/schemas.js';

const campos = {
  sku: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9._-]{2,30}$/, 'Use de 2 a 30 caracteres: letras, números, ponto, hífen ou sublinhado.'),
  nome: z.string().trim().min(2).max(120),
  categoria: z.string().trim().min(2).max(60),
  unidade: z.string().trim().min(1).max(10),
  preco_custo_centavos: z.number().int().min(0),
  estoque_minimo: z.number().int().min(0),
};

export const criarProdutoBody = z.object({
  ...campos,
  categoria: campos.categoria.default('Geral'),
  unidade: campos.unidade.default('un'),
  preco_custo_centavos: campos.preco_custo_centavos.default(0),
  estoque_minimo: campos.estoque_minimo.default(0),
  estoque_inicial: z.number().int().min(0).default(0),
});

export const atualizarProdutoBody = z.object(campos).partial().extend({
  ativo: z.boolean().optional(),
});

export const listarProdutosQuery = z.object({
  q: z.string().trim().max(60).optional(),
  categoria: z.string().trim().max(60).optional(),
  abaixo_minimo: booleanQuery.optional(),
  ativos: booleanQuery.optional(),
});
