import html2pdf from "html2pdf.js";

export async function generateProtocolPdf(
  elementId = "protocolo-content",
  filename = "protocolo.pdf"
): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error("Elemento não encontrado:", elementId);
    return false;
  }

  const opt = {
    margin: [10, 10, 10, 10],
    filename,
    image: { type: "jpeg" as const, quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: "#0D0D0D" },
    jsPDF: { unit: "mm" as const, format: "a4" as const, orientation: "portrait" as const },
    pagebreak: { mode: ["css", "legacy"] as string[] },
  };

  try {
    await html2pdf().from(element).set(opt).save();
    return true;
  } catch (err) {
    console.error("Erro ao gerar PDF:", err);
    return false;
  }
}
