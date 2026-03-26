import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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

  const A4_WIDTH_MM = 210;
  const A4_HEIGHT_MM = 297;
  const MARGIN_MM = 12;
  const MARGIN_TOP_MM = 10;
  const MARGIN_BOTTOM_MM = 10;
  const CONTENT_WIDTH_MM = A4_WIDTH_MM - MARGIN_MM * 2;
  const CONTENT_HEIGHT_MM = A4_HEIGHT_MM - MARGIN_TOP_MM - MARGIN_BOTTOM_MM;
  const SECTION_GAP_MM = 3;

  element.classList.add("pdf-export-light");

  try {
    await waitForImages(element);
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    let currentY = MARGIN_TOP_MM;

    const sections = Array.from(element.querySelectorAll("[data-pdf-section]")) as HTMLElement[];
    if (sections.length === 0) {
      sections.push(element);
    }

    for (const section of sections) {
      const canvas = await html2canvas(section, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: 700,
        windowWidth: 700,
      });

      const renderedWidthPx = canvas.width / 2;
      const renderedHeightPx = canvas.height / 2;
      const sectionHeightMM = (renderedHeightPx * CONTENT_WIDTH_MM) / renderedWidthPx;

      const remainingSpaceMM = CONTENT_HEIGHT_MM - (currentY - MARGIN_TOP_MM);
      if (sectionHeightMM > remainingSpaceMM && currentY > MARGIN_TOP_MM) {
        pdf.addPage();
        currentY = MARGIN_TOP_MM;
      }

      if (sectionHeightMM <= CONTENT_HEIGHT_MM) {
        const imgData = canvas.toDataURL("image/png");
        pdf.addImage(imgData, "PNG", MARGIN_MM, currentY, CONTENT_WIDTH_MM, sectionHeightMM);
        currentY += sectionHeightMM + SECTION_GAP_MM;
        continue;
      }

      const pxPerMM = canvas.height / sectionHeightMM;
      let remainingPxHeight = canvas.height;
      let sourceY = 0;

      while (remainingPxHeight > 0) {
        const availableMM = CONTENT_HEIGHT_MM - (currentY - MARGIN_TOP_MM);
        const availablePx = Math.max(1, Math.floor(availableMM * pxPerMM));
        const sliceHeightPx = Math.min(availablePx, remainingPxHeight);
        const sliceHeightMM = sliceHeightPx / pxPerMM;

        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = sliceHeightPx;

        const ctx = sliceCanvas.getContext("2d");
        if (!ctx) {
          throw new Error("Não foi possível processar o canvas do PDF");
        }

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
        ctx.drawImage(
          canvas,
          0,
          sourceY,
          canvas.width,
          sliceHeightPx,
          0,
          0,
          sliceCanvas.width,
          sliceCanvas.height
        );

        const sliceImgData = sliceCanvas.toDataURL("image/png");
        pdf.addImage(sliceImgData, "PNG", MARGIN_MM, currentY, CONTENT_WIDTH_MM, sliceHeightMM);

        sourceY += sliceHeightPx;
        remainingPxHeight -= sliceHeightPx;

        if (remainingPxHeight > 0) {
          pdf.addPage();
          currentY = MARGIN_TOP_MM;
        } else {
          currentY += sliceHeightMM + SECTION_GAP_MM;
        }
      }
    }

    pdf.save(filename);
    return true;
  } catch (err) {
    console.error("Erro ao gerar PDF:", err);
    return false;
  } finally {
    element.classList.remove("pdf-export-light");
  }
}
