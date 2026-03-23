import { jsPDF } from "jspdf";
import { saveAs } from "file-saver";

interface ProtocolData {
  nome: string;
  tipo_protocolo: string;
  plano_alimentar?: string;
  treino?: string;
  observacoes?: string;
  updated_at?: string;
  created_at?: string;
}

const tipoLabels: Record<string, string> = {
  bulking: "Bulking",
  cutting: "Cutting",
  recomp: "Recomposição Corporal",
};

// Colors from design system (dark gold theme)
const GOLD = [197, 155, 39] as const; // hsl(43, 74%, 49%)
const DARK_BG = [13, 13, 13] as const; // hsl(0, 0%, 5%)
const TEXT_LIGHT = [242, 242, 242] as const; // hsl(0, 0%, 95%)
const TEXT_MUTED = [153, 153, 153] as const; // hsl(0, 0%, 60%)
const SECTION_BG = [31, 31, 31] as const; // hsl(0, 0%, 12%)

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 20;
const CONTENT_W = PAGE_W - MARGIN * 2;

function addFooter(doc: jsPDF, clientName: string) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(...DARK_BG);
    doc.rect(0, PAGE_H - 15, PAGE_W, 15, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(`Uso exclusivo para ${clientName}`, PAGE_W / 2, PAGE_H - 6, { align: "center" });
    doc.text(`${i} / ${pageCount}`, PAGE_W - MARGIN, PAGE_H - 6, { align: "right" });
  }
}

function drawPageBg(doc: jsPDF) {
  doc.setFillColor(...DARK_BG);
  doc.rect(0, 0, PAGE_W, PAGE_H, "F");
}

function addSectionTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFillColor(...GOLD);
  doc.rect(MARGIN, y, 4, 8, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...GOLD);
  doc.text(title.toUpperCase(), MARGIN + 10, y + 6);

  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y + 12, PAGE_W - MARGIN, y + 12);

  return y + 18;
}

function addWrappedText(doc: jsPDF, text: string, startY: number, fontSize = 9): number {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(fontSize);
  doc.setTextColor(...TEXT_LIGHT);

  const lines = doc.splitTextToSize(text, CONTENT_W - 6);
  let y = startY;
  const lineHeight = fontSize * 0.45;

  for (const line of lines) {
    if (y > PAGE_H - 25) {
      doc.addPage();
      drawPageBg(doc);
      y = MARGIN + 5;
    }
    doc.text(line, MARGIN + 3, y);
    y += lineHeight;
  }

  return y + 4;
}

function addSectionBlock(doc: jsPDF, title: string, content: string, startY: number): number {
  let y = startY;

  if (y > PAGE_H - 50) {
    doc.addPage();
    drawPageBg(doc);
    y = MARGIN + 5;
  }

  doc.setFillColor(...SECTION_BG);
  doc.roundedRect(MARGIN, y - 2, CONTENT_W, 14, 2, 2, "F");

  y = addSectionTitle(doc, title, y);
  y += 2;

  y = addWrappedText(doc, content, y);
  y += 6;

  return y;
}

export function generateProtocolPdf(protocol: ProtocolData, clientName: string): boolean {
  try {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    const tipo = tipoLabels[protocol.tipo_protocolo] || protocol.tipo_protocolo;
    const date = new Date(protocol.updated_at || protocol.created_at || Date.now()).toLocaleDateString("pt-BR");

    drawPageBg(doc);

    doc.setFillColor(...GOLD);
    doc.rect(0, 0, PAGE_W, 3, "F");

    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, 30, MARGIN + 25, 30);
    doc.line(MARGIN, 30, MARGIN, 55);
    doc.line(PAGE_W - MARGIN - 25, PAGE_H - 45, PAGE_W - MARGIN, PAGE_H - 45);
    doc.line(PAGE_W - MARGIN, PAGE_H - 45, PAGE_W - MARGIN, PAGE_H - 70);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.setTextColor(...GOLD);
    doc.text("PROTOCOLO", PAGE_W / 2, 100, { align: "center" });

    doc.setFontSize(22);
    doc.setTextColor(...TEXT_LIGHT);
    doc.text("PERSONALIZADO", PAGE_W / 2, 112, { align: "center" });

    doc.setFillColor(...GOLD);
    doc.rect(PAGE_W / 2 - 30, 122, 60, 1, "F");

    doc.setFillColor(...GOLD);
    const badgeW = doc.getTextWidth(tipo.toUpperCase()) * 0.5 + 16;
    doc.roundedRect(PAGE_W / 2 - badgeW / 2, 132, badgeW, 10, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...DARK_BG);
    doc.text(tipo.toUpperCase(), PAGE_W / 2, 138.5, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.setTextColor(...TEXT_LIGHT);
    doc.text(protocol.nome, PAGE_W / 2, 158, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(...TEXT_MUTED);
    doc.text("Preparado para", PAGE_W / 2, 185, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...TEXT_LIGHT);
    doc.text(clientName, PAGE_W / 2, 195, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(date, PAGE_W / 2, 210, { align: "center" });

    doc.setFillColor(...GOLD);
    doc.rect(0, PAGE_H - 3, PAGE_W, 3, "F");

    doc.addPage();
    drawPageBg(doc);

    let y = 40;

    doc.setFillColor(...GOLD);
    doc.rect(MARGIN, y, 4, 12, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(...GOLD);
    doc.text("INTRODUÇÃO", MARGIN + 10, y + 9);
    y += 25;

    const introText = `Este protocolo foi elaborado de forma exclusiva e personalizada para ${clientName}, levando em consideração seus objetivos, biotipo, rotina e preferências individuais.\n\nCada detalhe — desde as refeições até os treinos — foi cuidadosamente planejado para maximizar seus resultados de forma segura e sustentável.\n\nSiga as orientações com consistência e disciplina. Em caso de dúvidas, entre em contato com seu consultor.\n\nBons treinos e boa alimentação!`;

    y = addWrappedText(doc, introText, y, 10);

    if (protocol.plano_alimentar) {
      doc.addPage();
      drawPageBg(doc);
      y = MARGIN + 10;
      y = addSectionBlock(doc, "Plano Alimentar", protocol.plano_alimentar, y);
    }

    if (protocol.treino) {
      doc.addPage();
      drawPageBg(doc);
      y = MARGIN + 10;
      y = addSectionBlock(doc, "Treinamento", protocol.treino, y);
    }

    if (protocol.observacoes) {
      doc.addPage();
      drawPageBg(doc);
      y = MARGIN + 10;
      y = addSectionBlock(doc, "Observações", protocol.observacoes, y);
    }

    addFooter(doc, clientName);

    const rawName = `protocolo-${protocol.nome || "personalizado"}.pdf`;
    const fileName = rawName.replace(/[\\/:*?"<>|]/g, "-");
    const blob = doc.output("blob");

    saveAs(blob, fileName);

    return true;
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    return false;
  }
}
