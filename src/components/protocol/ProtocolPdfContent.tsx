import logoGS from "@/assets/logo-gs.png";

type ProtocolPdfData = {
  nome: string;
  tipo_protocolo: string;
  plano_alimentar?: string | null;
  treino?: string | null;
  observacoes?: string | null;
};

type ProtocolPdfContentProps = {
  protocolo: ProtocolPdfData;
  clientName: string;
  formattedDate: string;
  wrapperId?: string;
};

const tipoProtocoloLabels: Record<string, string> = {
  bulking: "Bulking",
  cutting: "Cutting",
  recomp: "Recomposição Corporal",
};

export function ProtocolPdfContent({
  protocolo,
  clientName,
  formattedDate,
  wrapperId = "protocolo-content",
}: ProtocolPdfContentProps) {
  return (
    <div id={wrapperId} className="pdf-protocol-wrapper">
      <div className="pdf-cover-header">
        <div className="pdf-cover-logo-row">
          <img src={logoGS} alt="GS" className="pdf-cover-logo" crossOrigin="anonymous" />
          <div className="pdf-cover-brand">
            <span className="pdf-brand-name">GUILHERME SANT'ANNA</span>
            <span className="pdf-brand-sub">CONSULTORIA ESPORTIVA</span>
          </div>
        </div>
        <div className="pdf-cover-divider" />
        <div className="pdf-cover-info">
          <div className="pdf-cover-info-left">
            <span className="pdf-cover-label">PROTOCOLO</span>
            <span className="pdf-cover-title">{protocolo.nome}</span>
          </div>
          <div className="pdf-cover-info-right">
            <div className="pdf-cover-meta">
              <span className="pdf-cover-label">CLIENTE</span>
              <span className="pdf-cover-value">{clientName}</span>
            </div>
            <div className="pdf-cover-meta">
              <span className="pdf-cover-label">TIPO</span>
              <span className="pdf-cover-value">
                {tipoProtocoloLabels[protocolo.tipo_protocolo] || protocolo.tipo_protocolo}
              </span>
            </div>
            <div className="pdf-cover-meta">
              <span className="pdf-cover-label">DATA</span>
              <span className="pdf-cover-value">{formattedDate}</span>
            </div>
          </div>
        </div>
      </div>

      {protocolo.plano_alimentar && (
        <div className="pdf-section">
          <div className="pdf-section-header">
            <span className="pdf-section-icon">🍽</span>
            <h3 className="pdf-section-title">Plano Alimentar</h3>
          </div>
          <div className="pdf-section-body">{protocolo.plano_alimentar}</div>
        </div>
      )}

      {protocolo.treino && (
        <div className="pdf-section pdf-page-break">
          <div className="pdf-section-header">
            <span className="pdf-section-icon">🏋️</span>
            <h3 className="pdf-section-title">Treino</h3>
          </div>
          <div className="pdf-section-body">{protocolo.treino}</div>
        </div>
      )}

      {protocolo.observacoes && (
        <div className="pdf-section pdf-page-break">
          <div className="pdf-section-header">
            <span className="pdf-section-icon">📋</span>
            <h3 className="pdf-section-title">Observações</h3>
          </div>
          <div className="pdf-section-body">{protocolo.observacoes}</div>
        </div>
      )}

      <div className="pdf-footer">
        <div className="pdf-footer-divider" />
        <p className="pdf-footer-text">Protocolo exclusivo — Guilherme Sant'Anna Consultoria Esportiva</p>
        <p className="pdf-footer-text pdf-footer-disclaimer">
          Este documento é pessoal e intransferível. Proibida a reprodução sem autorização.
        </p>
      </div>
    </div>
  );
}
