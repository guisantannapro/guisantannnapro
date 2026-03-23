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

  // Force dark background on all elements before capture
  const allElements = element.querySelectorAll("*");
  allElements.forEach((el) => {
    const htmlEl = el as HTMLElement;
    const computed = window.getComputedStyle(htmlEl);
    if (computed.backgroundColor === "rgba(0, 0, 0, 0)" || computed.backgroundColor === "transparent") {
      htmlEl.style.backgroundColor = "inherit";
    }
  });

  const opt = {
    margin: [10, 10, 10, 10] as [number, number, number, number],
    filename,
    image: { type: "jpeg" as const, quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      backgroundColor: "#0D0D0D",
      logging: false,
      onclone: (clonedDoc: Document) => {
        const clonedEl = clonedDoc.getElementById(elementId);
        if (clonedEl) {
          clonedEl.style.backgroundColor = "#0D0D0D";
          clonedEl.style.color = "#fff";
          clonedEl.querySelectorAll("*").forEach((child) => {
            const h = child as HTMLElement;
            const bg = window.getComputedStyle(h).backgroundColor;
            if (bg === "rgba(0, 0, 0, 0)" || bg === "transparent") {
              h.style.backgroundColor = "inherit";
            }
          });
        }
        clonedDoc.body.style.backgroundColor = "#0D0D0D";
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
