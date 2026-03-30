import { forwardRef, type ReactNode } from "react";
import logoGS from "@/assets/logo-gs.png";

type ProtocolPdfData = {
  nome: string;
  tipo_protocolo: string;
  plano_alimentar?: string | null;
  treino?: string | null;
  observacoes?: string | null;
  suplementacao?: string | null;
  cardio?: string | null;
};

type ClientInfo = {
  idade?: string;
  peso?: string;
  altura?: string;
};

type PlanInfo = {
  plan?: string;
  duration?: string;
};

type ProtocolPdfContentProps = {
  protocolo: ProtocolPdfData;
  clientName: string;
  formattedDate: string;
  clientInfo?: ClientInfo;
  planInfo?: PlanInfo;
  wrapperId?: string;
};

type ProtocolPdfSectionProps = {
  icon: string;
  title: string;
  children: ReactNode;
};

const tipoProtocoloLabels: Record<string, string> = {
  bulking: "Bulking",
  cutting: "Cutting",
  recomp: "Recomposição Corporal",
};

const planLabels: Record<string, string> = {
  base: "Base",
  transformacao: "Transformação",
  elite: "Elite",
};

const durationLabels: Record<string, string> = {
  mensal: "Mensal",
  monthly: "Mensal",
  trimestral: "Trimestral",
  quarterly: "Trimestral",
  semestral: "Semestral",
  semiannual: "Semestral",
};

const OBSERVACOES_FIXAS = `Alimentos pesados todos preparados

Prepare os alimentos sem adição de temperos prontos, óleos, e conservantes/corantes

Utilize no preparo dos alimentos temperos naturais (orégano, cominho, páprica, alho, curry, chimichuri…)

Ketchup e mostarda zero de mercado liberado com moderação

Os refrigerantes zero, suco clight, gelatina zero, café preto s/açúcar liberado com moderação`;

const TREINO_INTRO = `Técnica: Execute todos os exercícios com a máxima técnica possível. Priorize a forma sobre a carga.

Progressão de Carga: Aumente a carga quando sugerido, sem comprometer a execução.

Descanso: Descanse entre 1-5 minutos (2 a 5 minutos em séries pesadas e 1 a 2 minutos em séries normais).

Aquecimento: Antes do primeiro exercício de cada músculo, faça 2 a 3 séries de aquecimento com 15-20 repetições (30% da carga final pretendida).

Feeder Sets: Antes do primeiro (depois de aquecer) e segundo exercícios de cada músculo, faça 2-3 feeder sets (séries de adaptação, 4-8 repetições com 70-80% da carga final pretendida). Antes dos outros exercícios para cada músculo, faça 1 feeder set seguindo o esquema acima.

• Repetição na Reserva (RIR): Repetições que antecedem a falha. Ex: 1 RIR significa que você falharia na repetição 11, então finalize na repetição 10.`;

function ProtocolPdfSection({ icon, title, children }: ProtocolPdfSectionProps) {
  return (
    <section className="pdf-section" data-pdf-section>
      <div className="pdf-section-header">
        <span className="pdf-section-icon">{icon}</span>
        <h3 className="pdf-section-title">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function renderFormattedContent(content: string) {
  const blocks = content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  if (blocks.length <= 1) {
    return content;
  }

  return blocks.map((block, index) => (
    <p key={`${block.slice(0, 20)}-${index}`} style={{ marginTop: index === 0 ? 0 : 12, whiteSpace: "pre-line" }}>
      {block}
    </p>
  ));
}

export const ProtocolPdfContent = forwardRef<HTMLDivElement, ProtocolPdfContentProps>(function ProtocolPdfContent({
  protocolo,
  clientName,
  formattedDate,
  clientInfo,
  planInfo,
  wrapperId = "protocolo-content",
}, ref) {
  const planLabel = planInfo?.plan ? planLabels[planInfo.plan] || planInfo.plan : null;
  const durationLabel = planInfo?.duration ? durationLabels[planInfo.duration.toLowerCase()] || planInfo.duration : null;
  const planDisplay = planLabel ? `Plano ${planLabel}${durationLabel ? ` ${durationLabel}` : ""}` : null;

  return (
    <div ref={ref} id={wrapperId} className="pdf-protocol-wrapper">
      <div data-pdf-section>
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
              <span className="pdf-cover-title">{clientName}</span>
            </div>
            <div className="pdf-cover-info-right" style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
              <div className="pdf-cover-meta" style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span className="pdf-cover-label">TIPO</span>
                <span className="pdf-cover-value">
                  {tipoProtocoloLabels[protocolo.tipo_protocolo] || protocolo.tipo_protocolo}
                </span>
              </div>
              <div className="pdf-cover-meta" style={{ display: clientInfo?.idade ? "flex" : "none", flexDirection: "column", gap: "2px" }}>
                <span className="pdf-cover-label">IDADE</span>
                <span className="pdf-cover-value">{clientInfo?.idade || "--"}</span>
              </div>
              <div className="pdf-cover-meta" style={{ display: clientInfo?.peso ? "flex" : "none", flexDirection: "column", gap: "2px" }}>
                <span className="pdf-cover-label">PESO</span>
                <span className="pdf-cover-value">{clientInfo?.peso || "--"}</span>
              </div>
              <div className="pdf-cover-meta" style={{ display: clientInfo?.altura ? "flex" : "none", flexDirection: "column", gap: "2px" }}>
                <span className="pdf-cover-label">ALTURA</span>
                <span className="pdf-cover-value">{clientInfo?.altura || "--"}</span>
              </div>
              <div className="pdf-cover-meta" style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span className="pdf-cover-label">DATA</span>
                <span className="pdf-cover-value">{formattedDate}</span>
              </div>
            </div>
          </div>
          {planDisplay && (
            <div className="pdf-plan-banner">
              <span className="pdf-plan-banner-text">{planDisplay}</span>
            </div>
          )}
        </div>
      </div>

      {protocolo.plano_alimentar && (
        <ProtocolPdfSection icon="🍽" title="Plano Alimentar">
          <div className="pdf-section-body">{renderFormattedContent(protocolo.plano_alimentar)}</div>
        </ProtocolPdfSection>
      )}

      <ProtocolPdfSection icon="📋" title="Observações">
        <div className="pdf-section-body">{renderFormattedContent(OBSERVACOES_FIXAS)}</div>
      </ProtocolPdfSection>

      {protocolo.suplementacao && (
        <ProtocolPdfSection icon="💊" title="Suplementação">
          <div className="pdf-section-body">{renderFormattedContent(protocolo.suplementacao)}</div>
        </ProtocolPdfSection>
      )}

      {protocolo.cardio && (
        <ProtocolPdfSection icon="🏃" title="Cardio">
          <div className="pdf-section-body">{renderFormattedContent(protocolo.cardio)}</div>
        </ProtocolPdfSection>
      )}

      {protocolo.treino && (
        <>
          <ProtocolPdfSection icon="📌" title="Diretrizes de Treino">
            <div className="pdf-section-body">{renderFormattedContent(TREINO_INTRO)}</div>
          </ProtocolPdfSection>

          <ProtocolPdfSection icon="🏋️" title="Treino">
            <div className="pdf-section-body">{renderFormattedContent(protocolo.treino)}</div>
          </ProtocolPdfSection>
        </>
      )}

      {protocolo.observacoes && (
        <ProtocolPdfSection icon="📝" title="Observações Adicionais">
          <div className="pdf-section-body">{renderFormattedContent(protocolo.observacoes)}</div>
        </ProtocolPdfSection>
      )}

      <div className="pdf-footer" data-pdf-section>
        <div className="pdf-footer-divider" />
        <p className="pdf-footer-text">Protocolo exclusivo — Guilherme Sant'Anna Consultoria Esportiva</p>
        <p className="pdf-footer-text pdf-footer-disclaimer">
          Este documento é pessoal e intransferível. Proibida a reprodução sem autorização.
        </p>
      </div>
    </div>
  );
});
