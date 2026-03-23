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
    margin: [10, 10, 10, 10] as [number, number, number, number],
    filename,
    image: { type: "jpeg" as const, quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      onclone: (clonedDoc: Document) => {
        clonedDoc.body.style.backgroundColor = "#ffffff";
        const wrapper = clonedDoc.getElementById(elementId);
        if (!wrapper) return;
        // White ebook style overrides
        wrapper.style.background = "#ffffff";
        wrapper.style.color = "#1a1a1a";
        // Cover header
        const cover = wrapper.querySelector(".pdf-cover-header") as HTMLElement;
        if (cover) cover.style.background = "linear-gradient(135deg, #fafaf7, #f5f0e6)";
        // Brand name
        const brand = wrapper.querySelector(".pdf-brand-name") as HTMLElement;
        if (brand) { brand.style.background = "none"; brand.style.webkitTextFillColor = "unset"; brand.style.color = "#8B6914"; }
        // Brand sub
        const sub = wrapper.querySelector(".pdf-brand-sub") as HTMLElement;
        if (sub) sub.style.color = "#888";
        // Cover title
        const title = wrapper.querySelector(".pdf-cover-title") as HTMLElement;
        if (title) title.style.color = "#1a1a1a";
        // Cover values
        wrapper.querySelectorAll(".pdf-cover-value").forEach(el => { (el as HTMLElement).style.color = "#555"; });
        // Sections
        wrapper.querySelectorAll(".pdf-section").forEach(el => {
          const s = el as HTMLElement;
          s.style.background = "#ffffff";
          s.style.borderColor = "#e5e5e5";
          s.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)";
        });
        wrapper.querySelectorAll(".pdf-section-header").forEach(el => {
          (el as HTMLElement).style.borderBottomColor = "#e5e5e5";
        });
        wrapper.querySelectorAll(".pdf-section-body").forEach(el => {
          (el as HTMLElement).style.color = "#333";
        });
        // Footer
        wrapper.querySelectorAll(".pdf-footer-text").forEach(el => { (el as HTMLElement).style.color = "#999"; });
        wrapper.querySelectorAll(".pdf-footer-disclaimer").forEach(el => { (el as HTMLElement).style.color = "#bbb"; });
      },
    },
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
