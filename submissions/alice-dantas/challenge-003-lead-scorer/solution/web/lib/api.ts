// Cliente da API: toda resposta passa pela validação gerada do contrato antes de chegar à tela.
import type { ZodType } from "zod";

import { CONTRACT_ERROR, errorText, httpError, networkError } from "@/copy/pt-BR";
import type { Meta, SellerList, SellerPipeline } from "@/lib/contract";
import { zErrorBody, zMeta, zSellerList, zSellerPipeline } from "@/lib/contract/zod.gen";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiError extends Error {}

/** Busca e valida. O tipo de retorno é o do contrato: o schema zod foi gerado do mesmo openapi.json. */
async function getJson<T>(path: string, schema: ZodType): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`);
  } catch {
    throw new ApiError(networkError(API_URL));
  }
  const body: unknown = await response.json().catch(() => undefined);
  if (!response.ok) {
    const error = zErrorBody.safeParse(body);
    throw new ApiError(error.success ? errorText(error.data) : httpError(response.status));
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new ApiError(CONTRACT_ERROR);
  return parsed.data as T;
}

export const api = {
  sellers: () => getJson<SellerList>("/api/sellers", zSellerList),
  meta: () => getJson<Meta>("/api/meta", zMeta),
  sellerPipeline: (seller: string) =>
    getJson<SellerPipeline>(`/api/sellers/${encodeURIComponent(seller)}/pipeline`, zSellerPipeline),
};
