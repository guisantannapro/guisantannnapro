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

    const sections = Array.from(
      element.querySelectorAll("[data-pdf-section]")
    ) as HTMLElement[];

    if (sections.length === 0) {
      // Fallback: render the whole element as one block
      sections.push(element);
    }

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];

      const canvas = await html2canvas(section, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: 700,
        windowWidth: 700,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const widthPx = canvas.width / 2;
      const heightPx = canvas.height / 2;
      const scaleFactor = CONTENT_WIDTH_MM / widthPx;
      const sectionHeightMM = heightPx * scaleFactor;

      // If section fits in remaining space, place it; otherwise new page
      const remainingSpace = CONTENT_HEIGHT_MM - (currentY - MARGIN_TOP_MM);

      if (sectionHeightMM > remainingSpace && currentY > MARGIN_TOP_MM) {
        pdf.addPage();
        currentY = MARGIN_TOP_MM;
      }

      // If the section is taller than a full page, we need to split it across pages
      if (sectionHeightMM > CONTENT_HEIGHT_MM) {
        // Split large section across multiple pages
        const totalPxHeight = canvas.height;
        const pxPerMM = totalPxHeight / sectionHeightMM;
        let remainingPxHeight = totalPxHeight;
        let srcY = 0;

        while (remainingPxHeight > 0) {
          const availableMM = CONTENT_HEIGHT_MM - (currentY - MARGIN_TOP_MM);
          const availablePx = availableMM * pxPerMM;
          const sliceHeight = Math.min(availablePx, remainingPxHeight);
          const sliceMM = sliceHeight / pxPerMM;

          // Create a temporary canvas for this slice
          const sliceCanvas = document.createElement("canvas");
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = Math.ceil(sliceHeight);
          const ctx = sliceCanvas.getContext("2d");
          if (ctx) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
            ctx.drawImage(
              canvas,
              0, srcY, canvas.width, Math.ceil(sliceHeight),
              0, 0, canvas.width, Math.ceil(sliceHeight)
            );
          }

          const sliceImg = sliceCanvas.toDataURL("image/jpeg", 0.95);
          pdf.addImage(sliceImg, "JPEG", MARGIN_MM, currentY, CONTENT_WIDTH_MM, sliceMM);

          srcY += sliceHeight;
          remainingPxHeight -= sliceHeight;
          
          if (remainingPxHeight > 0) {
            pdf.addPage();
            currentY = MARGIN_TOP_MM;
          } else {
            currentY += sliceMM + SECTION_GAP_MM;
          }
        }
      } else {
        pdf.addImage(imgData, "JPEG", MARGIN_MM, currentY, CONTENT_WIDTH_MM, sectionHeightMM);
        currentY += sectionHeightMM + SECTION_GAP_MM;
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
