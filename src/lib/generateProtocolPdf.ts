import html2pdf from "html2pdf.js";

export function generateProtocolPdf(elementId = "protocolo-content", filename = "protocolo.pdf"): boolean {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error("Elemento não encontrado:", elementId);
    return false;
  }

  const opt = {
    margin: 10,
    filename,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
  };

  html2pdf().from(element).set(opt).save();
  return true;
}
