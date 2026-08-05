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
