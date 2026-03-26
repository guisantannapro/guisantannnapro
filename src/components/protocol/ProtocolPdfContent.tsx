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

export function ProtocolPdfContent({
  protocolo,
  clientName,
  formattedDate,
  clientInfo,
  planInfo,
  wrapperId = "protocolo-content",
}: ProtocolPdfContentProps) {
  const planLabel = planInfo?.plan ? planLabels[planInfo.plan] || planInfo.plan : null;
  const durationLabel = planInfo?.duration ? durationLabels[planInfo.duration.toLowerCase()] || planInfo.duration : null;
  const planDisplay = planLabel ? `Plano ${planLabel}${durationLabel ? ` ${durationLabel}` : ""}` : null;

  return (
    <div id={wrapperId} className="pdf-protocol-wrapper">
      <div className="pdf-cover-header" data-pdf-section>
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
          <div className="pdf-cover-info-right">
            <div className="pdf-cover-meta">
              <span className="pdf-cover-label">TIPO</span>
              <span className="pdf-cover-value">
                {tipoProtocoloLabels[protocolo.tipo_protocolo] || protocolo.tipo_protocolo}
              </span>
            </div>
            {clientInfo?.idade && (
              <div className="pdf-cover-meta">
                <span className="pdf-cover-label">IDADE</span>
                <span className="pdf-cover-value">{clientInfo.idade}</span>
              </div>
            )}
            {clientInfo?.peso && (
              <div className="pdf-cover-meta">
                <span className="pdf-cover-label">PESO</span>
                <span className="pdf-cover-value">{clientInfo.peso}</span>
              </div>
            )}
            {clientInfo?.altura && (
              <div className="pdf-cover-meta">
                <span className="pdf-cover-label">ALTURA</span>
                <span className="pdf-cover-value">{clientInfo.altura}</span>
              </div>
            )}
            <div className="pdf-cover-meta">
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


      {protocolo.plano_alimentar && (
        <div className="pdf-section" data-pdf-section>
          <div className="pdf-section-header">
            <span className="pdf-section-icon">🍽</span>
            <h3 className="pdf-section-title">Plano Alimentar</h3>
          </div>
          <div className="pdf-section-body">{protocolo.plano_alimentar}</div>
        </div>
      )}

      {/* Observações Fixas */}
      <div className="pdf-section" data-pdf-section>
        <div className="pdf-section-header">
          <span className="pdf-section-icon">📋</span>
          <h3 className="pdf-section-title">Observações</h3>
        </div>
        <div className="pdf-section-body" style={{ whiteSpace: "pre-line" }}>
          {OBSERVACOES_FIXAS}
        </div>
      </div>

      {/* Suplementação */}
      {protocolo.suplementacao && (
        <div className="pdf-section" data-pdf-section>
          <div className="pdf-section-header">
            <span className="pdf-section-icon">💊</span>
            <h3 className="pdf-section-title">Suplementação</h3>
          </div>
          <div className="pdf-section-body" style={{ whiteSpace: "pre-line" }}>
            {protocolo.suplementacao}
          </div>
        </div>
      )}

      {/* Cardio */}
      {protocolo.cardio && (
        <div className="pdf-section pdf-page-break">
          <div className="pdf-section-header">
            <span className="pdf-section-icon">🏃</span>
            <h3 className="pdf-section-title">Cardio</h3>
          </div>
          <div className="pdf-section-body" style={{ whiteSpace: "pre-line" }}>
            {protocolo.cardio}
          </div>
        </div>
      )}

      {/* Treino */}
      {protocolo.treino && (
        <div className="pdf-section pdf-page-break">
          <div className="pdf-section-header">
            <span className="pdf-section-icon">🏋️</span>
            <h3 className="pdf-section-title">Treino</h3>
          </div>
          <div className="pdf-section-body" style={{ whiteSpace: "pre-line", marginBottom: "16px" }}>
            {TREINO_INTRO}
          </div>
          <div className="pdf-section-body">{protocolo.treino}</div>
        </div>
      )}

      {/* Observações extras do admin */}
      {protocolo.observacoes && (
        <div className="pdf-section pdf-page-break">
          <div className="pdf-section-header">
            <span className="pdf-section-icon">📝</span>
            <h3 className="pdf-section-title">Observações Adicionais</h3>
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
