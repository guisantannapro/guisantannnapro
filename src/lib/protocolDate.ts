/**
 * Data exibida de um protocolo.
 * Prioriza `data_inicio` (definida manualmente pelo admin).
 * Se não existir, cai no comportamento antigo (updated_at || created_at).
 */
type ProtocolLike = {
  data_inicio?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
};

export const getProtocolDate = (protocolo: ProtocolLike | null | undefined): Date | null => {
  if (!protocolo) return null;

  if (protocolo.data_inicio) {
    // "YYYY-MM-DD" -> data local (evita deslocamento de fuso)
    const [y, m, d] = protocolo.data_inicio.split("-").map(Number);
    if (y && m && d) return new Date(y, m - 1, d);
  }

  const fallback = protocolo.updated_at || protocolo.created_at;
  return fallback ? new Date(fallback) : null;
};

export const formatProtocolDate = (protocolo: ProtocolLike | null | undefined): string => {
  const date = getProtocolDate(protocolo);
  return date ? date.toLocaleDateString("pt-BR") : "--";
};

/** Meses de duração a partir do rótulo do período contratado. */
export const getPlanMonths = (period?: string | null): number | null => {
  const p = (period || "").toLowerCase();
  if (p === "monthly" || p === "mensal") return 1;
  if (p === "quarterly" || p === "trimestral") return 3;
  if (p === "semiannual" || p === "semestral") return 6;
  return null;
};

/**
 * Vencimento do plano.
 * Prioridade: data de início do protocolo (data_inicio) + duração contratada
 * → plan_expires_at do perfil → data do cadastro + duração.
 */
export const resolvePlanExpiry = (args: {
  protocolo?: ProtocolLike | null;
  period?: string | null;
  planExpiresAt?: string | null;
  fallbackDate?: string | Date | null;
}): Date | null => {
  const months = getPlanMonths(args.period);
  const startRaw = args.protocolo?.data_inicio;

  if (startRaw && months) {
    const [y, m, d] = startRaw.split("-").map(Number);
    if (y && m && d) {
      const expiry = new Date(y, m - 1, d, 12, 0, 0);
      expiry.setMonth(expiry.getMonth() + months);
      return expiry;
    }
  }

  if (args.planExpiresAt) return new Date(args.planExpiresAt);

  if (args.fallbackDate && months) {
    const base = args.fallbackDate instanceof Date ? new Date(args.fallbackDate) : new Date(args.fallbackDate);
    if (!isNaN(base.getTime())) {
      base.setMonth(base.getMonth() + months);
      return base;
    }
  }

  return null;
};
