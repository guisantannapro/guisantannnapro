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

async function waitForFonts() {
  if (!('fonts' in document)) return;
  try {
    await document.fonts.ready;
  } catch {
    // Ignora falha de fonte para não bloquear a geração
  }
}

function getBestBreakRow(
  canvas: HTMLCanvasElement,
  preferredEndY: number,
  minEndY: number,
  maxEndY: number
): number {
  const clampedPreferred = Math.max(minEndY, Math.min(preferredEndY, maxEndY));

  try {
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx || maxEndY - minEndY < 8) {
      return clampedPreferred;
    }

    const SEARCH_WINDOW_PX = 48;
    const ROW_BAND_HEIGHT = 2;
    const STEP_PX = 2;

    const searchStart = Math.max(minEndY, clampedPreferred - SEARCH_WINDOW_PX);
    const searchEnd = Math.min(maxEndY, clampedPreferred + SEARCH_WINDOW_PX);

    const sampleX = Math.min(12, Math.max(0, Math.floor(canvas.width * 0.05)));
    const sampleWidth = Math.max(1, canvas.width - sampleX * 2);

    let bestY = clampedPreferred;
    let bestInkScore = Number.POSITIVE_INFINITY;

    for (let y = searchStart; y <= searchEnd; y += STEP_PX) {
      const sampleY = Math.max(0, Math.min(canvas.height - ROW_BAND_HEIGHT, y));
      const data = ctx.getImageData(sampleX, sampleY, sampleWidth, ROW_BAND_HEIGHT).data;

      let inkScore = 0;
      for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3];
        if (alpha < 16) continue;

        const luminance = (data[i] * 299 + data[i + 1] * 587 + data[i + 2] * 114) / 1000;
        if (luminance < 245) {
          inkScore++;
        }
      }

      if (inkScore < bestInkScore) {
        bestInkScore = inkScore;
        bestY = y;
      }
    }

    return Math.max(minEndY, Math.min(bestY, maxEndY));
  } catch {
    return clampedPreferred;
  }
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
  const MARGIN_BOTTOM_MM = 5;
  const CONTENT_WIDTH_MM = A4_WIDTH_MM - MARGIN_MM * 2;
  const CONTENT_HEIGHT_MM = A4_HEIGHT_MM - MARGIN_TOP_MM - MARGIN_BOTTOM_MM;
  const SECTION_GAP_MM = 0.5;
  const CANVAS_SCALE = 1.5;
  const JPEG_QUALITY = 0.85;

  element.classList.add("pdf-export-light");

  try {
    await waitForFonts();
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

      const sectionHeightMM = (canvas.height * CONTENT_WIDTH_MM) / canvas.width;
      let remainingSpaceMM = CONTENT_HEIGHT_MM - (currentY - MARGIN_TOP_MM);

      if (sectionHeightMM <= remainingSpaceMM) {
        const imgData = canvas.toDataURL("image/png");
        pdf.addImage(imgData, "PNG", MARGIN_MM, currentY, CONTENT_WIDTH_MM, sectionHeightMM);
        currentY += sectionHeightMM + SECTION_GAP_MM;
        continue;
      }

      const sectionFitsSinglePage = sectionHeightMM <= CONTENT_HEIGHT_MM;

      if (sectionFitsSinglePage && currentY > MARGIN_TOP_MM) {
        pdf.addPage();
        currentY = MARGIN_TOP_MM;
        remainingSpaceMM = CONTENT_HEIGHT_MM;
      }

      if (sectionFitsSinglePage) {
        const imgData = canvas.toDataURL("image/png");
        pdf.addImage(imgData, "PNG", MARGIN_MM, currentY, CONTENT_WIDTH_MM, sectionHeightMM);
        currentY += sectionHeightMM + SECTION_GAP_MM;
        continue;
      }

      const pxPerMM = canvas.height / sectionHeightMM;
      const SLICE_OVERLAP_PX = 12;
      const MIN_FIRST_SLICE_MM = 36;
      const MIN_SLICE_MM = 5;
      const MIN_SLICE_PX = 120;
      let sourceY = 0;

      while (sourceY < canvas.height) {
        const availableMM = CONTENT_HEIGHT_MM - (currentY - MARGIN_TOP_MM);

        if (sourceY === 0 && availableMM < MIN_FIRST_SLICE_MM && currentY > MARGIN_TOP_MM) {
          pdf.addPage();
          currentY = MARGIN_TOP_MM;
          continue;
        }

        if (availableMM < MIN_SLICE_MM && currentY > MARGIN_TOP_MM) {
          pdf.addPage();
          currentY = MARGIN_TOP_MM;
          continue;
        }

        const preferredSlicePx = Math.max(1, Math.floor(availableMM * pxPerMM));
        const remainingPxHeight = canvas.height - sourceY;

        let sliceHeightPx = Math.min(preferredSlicePx, remainingPxHeight);

        const wouldFinishSection = sourceY + sliceHeightPx >= canvas.height;
        if (!wouldFinishSection) {
          const maxSlicePx = Math.min(preferredSlicePx, remainingPxHeight);
          const minSlicePx = Math.min(maxSlicePx, Math.max(MIN_SLICE_PX, Math.floor(6 * pxPerMM)));

          const preferredEndY = sourceY + sliceHeightPx;
          const minEndY = sourceY + minSlicePx;
          const maxEndY = sourceY + maxSlicePx;

          const bestBreakY = getBestBreakRow(canvas, preferredEndY, minEndY, maxEndY);
          sliceHeightPx = Math.max(1, bestBreakY - sourceY);
        }

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

        const isLastSlice = sourceY + sliceHeightPx >= canvas.height;
        if (isLastSlice) {
          currentY += sliceHeightMM + SECTION_GAP_MM;
          break;
        }

        sourceY += sliceHeightPx;
        if (sliceHeightPx > SLICE_OVERLAP_PX + 1) {
          sourceY -= SLICE_OVERLAP_PX;
        }

        pdf.addPage();
        currentY = MARGIN_TOP_MM;
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
