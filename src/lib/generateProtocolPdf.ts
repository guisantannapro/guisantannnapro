import html2pdf from "html2pdf.js";

async function waitForImages(root: HTMLElement) {
  const images = Array.from(root.querySelectorAll("img"));
  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve();
            return;
          }
          img.onload = () => resolve();
          img.onerror = () => resolve();
        })
    )
  );
}

export async function generateProtocolPdf(
  elementId = "protocolo-content",
  filename = "protocolo.pdf"
): Promise<boolean> {
  const element = document.getElementById(elementId) as HTMLElement | null;
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
    },
    jsPDF: { unit: "mm" as const, format: "a4" as const, orientation: "portrait" as const },
    pagebreak: { mode: ["css", "legacy"] as string[] },
  };

  element.classList.add("pdf-export-light");

  try {
    await waitForImages(element);
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    await html2pdf().from(element).set(opt).save();
    return true;
  } catch (err) {
    console.error("Erro ao gerar PDF:", err);
    return false;
  } finally {
    element.classList.remove("pdf-export-light");
  }
}
