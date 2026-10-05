import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { ChapterSlideDeck, SlideItem } from '../types';

/**
 * Generate a QR code data URL for sharing links or classroom slide decks
 */
export async function generateQrCodeDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 320,
      margin: 1.5,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });
  } catch (err) {
    console.error('Error generating QR code', err);
    return '';
  }
}

/**
 * Render a single slide onto a canvas with Greek text, diagrams, formulas and styling.
 * Using Canvas2D guarantees flawless Greek Unicode rendering and exact visual fidelity.
 */
function renderSlideToCanvas(
  slide: SlideItem,
  deck: ChapterSlideDeck,
  slideIndex: number,
  totalSlides: number
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  // High-resolution 16:9 canvas (1920x1080) for crisp PDF output
  canvas.width = 1920;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Background
  const gradient = ctx.createLinearGradient(0, 0, 1920, 1080);
  gradient.addColorStop(0, '#ffffff');
  gradient.addColorStop(1, '#f8fafc');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1920, 1080);

  // Outer border accent
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 16;
  ctx.strokeRect(8, 8, 1904, 1064);

  // Top header bar
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(16, 16, 1888, 130);

  // Top header text
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('ΑΡΧΕΣ ΗΛΕΚΤΡΟΝΙΚΗΣ (ΘΕΩΡΙΑ) • Α\' ΤΑΞΗ ΕΠΑΛ', 60, 62);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
  ctx.fillText(deck.chapterTitle, 60, 104);

  // Slide number pill (top right)
  ctx.fillStyle = '#0284c7';
  ctx.beginPath();
  ctx.roundRect(1650, 48, 200, 52, 12);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`Διαφάνεια ${slideIndex + 1} / ${totalSlides}`, 1750, 83);
  ctx.textAlign = 'left';

  // Slide Title
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 44px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
  ctx.fillText(slide.title, 60, 210);

  // Slide Subtitle
  if (slide.subtitle) {
    ctx.fillStyle = '#0284c7';
    ctx.font = 'bold 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
    ctx.fillText(slide.subtitle, 60, 255);
  }

  // Divider line under title
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(60, 280);
  ctx.lineTo(1860, 280);
  ctx.stroke();

  // Left column: Bullet Points (width: 1100px)
  let y = 330;
  ctx.fillStyle = '#1e293b';
  ctx.font = '24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

  for (const bp of slide.bulletPoints) {
    // Bullet marker
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(75, y - 8, 8, 0, Math.PI * 2);
    ctx.fill();

    // Wrap text into multiple lines if needed
    ctx.fillStyle = '#334155';
    const words = bp.split(' ');
    let line = '';
    const maxLineWidth = 1040;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxLineWidth && n > 0) {
        ctx.fillText(line, 100, y);
        line = words[n] + ' ';
        y += 36;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 100, y);
    y += 50;
  }

  // Right column card: Key Formulas & Key Takeaway (width: 660px, left: 1200px)
  const cardX = 1200;
  const cardY = 320;
  const cardWidth = 660;

  // Formula box if present
  let currentCardY = cardY;
  if (slide.formulaOrFormulae && slide.formulaOrFormulae.length > 0) {
    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.roundRect(cardX, currentCardY, cardWidth, 180, 16);
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
    ctx.fillText('📐 Βασικές Σχέσεις & Τύποι:', cardX + 24, currentCardY + 40);

    ctx.fillStyle = '#0369a1';
    ctx.font = '600 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
    let formY = currentCardY + 80;
    for (const f of slide.formulaOrFormulae) {
      ctx.fillText(`• ${f}`, cardX + 24, formY);
      formY += 34;
    }
    currentCardY += 205;
  }

  // Key Takeaway box
  ctx.fillStyle = '#f0fdf4';
  ctx.beginPath();
  ctx.roundRect(cardX, currentCardY, cardWidth, 160, 16);
  ctx.fill();
  ctx.strokeStyle = '#86efac';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#166534';
  ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('💡 Βασικό Συμπέρασμα:', cardX + 24, currentCardY + 40);

  ctx.fillStyle = '#14532d';
  ctx.font = '500 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
  
  // Wrap takeaway
  const takeWords = slide.keyTakeaway.split(' ');
  let takeLine = '';
  let takeY = currentCardY + 76;
  for (let m = 0; m < takeWords.length; m++) {
    const testLine = takeLine + takeWords[m] + ' ';
    if (ctx.measureText(testLine).width > cardWidth - 50 && m > 0) {
      ctx.fillText(takeLine, cardX + 24, takeY);
      takeLine = takeWords[m] + ' ';
      takeY += 32;
    } else {
      takeLine = testLine;
    }
  }
  ctx.fillText(takeLine, cardX + 24, takeY);

  currentCardY += 180;

  // Teacher Notes box (if space allows)
  if (slide.teacherNotes) {
    ctx.fillStyle = '#fffbeb';
    ctx.beginPath();
    ctx.roundRect(cardX, currentCardY, cardWidth, 150, 16);
    ctx.fill();
    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#92400e';
    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
    ctx.fillText('👨‍🏫 Σημείωση Τάξης / Διδασκαλίας:', cardX + 24, currentCardY + 36);

    ctx.fillStyle = '#78350f';
    ctx.font = '18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
    const noteWords = slide.teacherNotes.split(' ');
    let noteLine = '';
    let noteY = currentCardY + 70;
    for (let k = 0; k < noteWords.length; k++) {
      const test = noteLine + noteWords[k] + ' ';
      if (ctx.measureText(test).width > cardWidth - 50 && k > 0) {
        ctx.fillText(noteLine, cardX + 24, noteY);
        noteLine = noteWords[k] + ' ';
        noteY += 28;
      } else {
        noteLine = test;
      }
    }
    ctx.fillText(noteLine, cardX + 24, noteY);
  }

  // Footer bar
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(16, 1020, 1888, 44);

  ctx.fillStyle = '#475569';
  ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
  ctx.fillText(`Διδακτική Ενότητα: ${deck.chapterTitle} | ${deck.bookRef}`, 40, 1048);

  ctx.textAlign = 'right';
  ctx.fillText('Διαδραστικό Εργαλείο Εκμάθησης & Προσομοιώσεων • ΕΠΑΛ', 1880, 1048);
  ctx.textAlign = 'left';

  return canvas;
}

/**
 * Render a Cover Slide for the PDF
 */
function renderCoverSlideToCanvas(deck: ChapterSlideDeck): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 1920;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Rich Dark Gradient Background for Cover
  const gradient = ctx.createLinearGradient(0, 0, 1920, 1080);
  gradient.addColorStop(0, '#0f172a');
  gradient.addColorStop(0.5, '#1e293b');
  gradient.addColorStop(1, '#0c4a6e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1920, 1080);

  // Geometric tech grid / accents
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
  ctx.lineWidth = 1;
  for (let x = 0; x < 1920; x += 80) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1080);
    ctx.stroke();
  }
  for (let y = 0; y < 1080; y += 80) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1920, y);
    ctx.stroke();
  }

  // Outer neon frame
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 12;
  ctx.strokeRect(20, 20, 1880, 1040);

  // Institution badge
  ctx.fillStyle = 'rgba(2, 132, 199, 0.3)';
  ctx.beginPath();
  ctx.roundRect(120, 100, 680, 60, 30);
  ctx.fill();
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('🎓 ΕΠΑΛ • ΤΟΜΕΑΣ ΗΛΕΚΤΡΟΛΟΓΙΑΣ & ΗΛΕΚΤΡΟΝΙΚΗΣ', 150, 140);

  // Main Subject Title
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 68px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('ΑΡΧΕΣ ΗΛΕΚΤΡΟΝΙΚΗΣ', 120, 280);

  ctx.fillStyle = '#7dd3fc';
  ctx.font = 'bold 44px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('ΔΙΑΦΑΝΕΙΕΣ ΠΑΡΟΥΣΙΑΣΗΣ & ΥΛΙΚΟ ΔΙΔΑΣΚΑΛΙΑΣ ΤΑΞΗΣ', 120, 350);

  // Chapter Box
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.beginPath();
  ctx.roundRect(120, 440, 1680, 380, 24);
  ctx.fill();
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
  ctx.fillText(deck.chapterTitle, 160, 520);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = '30px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
  
  // Wrap description
  const descWords = deck.description.split(' ');
  let dLine = '';
  let dY = 590;
  for (let i = 0; i < descWords.length; i++) {
    const test = dLine + descWords[i] + ' ';
    if (ctx.measureText(test).width > 1580 && i > 0) {
      ctx.fillText(dLine, 160, dY);
      dLine = descWords[i] + ' ';
      dY += 46;
    } else {
      dLine = test;
    }
  }
  ctx.fillText(dLine, 160, dY);

  // Metadata pills
  const metaY = 740;
  const pills = [
    `📊 ${deck.totalSlides} Διαφάνειες`,
    `⏱️ ${deck.estimatedDuration}`,
    `📖 ${deck.bookRef}`,
    `🔬 Περιλαμβάνει Διαδραστικά Εργαστήρια`
  ];

  let pX = 160;
  for (const pill of pills) {
    ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.beginPath();
    ctx.roundRect(pX, metaY, 340, 50, 12);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#e0f2fe';
    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
    ctx.fillText(pill, pX + 20, metaY + 33);
    pX += 370;
  }

  // Cover Footer
  ctx.fillStyle = '#94a3b8';
  ctx.font = '22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('Σχεδιασμένο για προβολή σε διαδραστικό πίνακα / projector και διαμοιρασμό σε μαθητές.', 120, 960);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('Έκδοση PDF • Α\' Τάξη ΕΠΑΛ', 1800, 960);
  ctx.textAlign = 'left';

  return canvas;
}

/**
 * Downloads a complete, beautiful PDF of the slide deck directly to user device.
 */
export async function downloadSlideDeckPdf(deck: ChapterSlideDeck, onProgress?: (percent: number) => void): Promise<void> {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const totalSteps = deck.slides.length + 1; // 1 cover + slides

  // 1. Cover Page
  if (onProgress) onProgress(10);
  const coverCanvas = renderCoverSlideToCanvas(deck);
  const coverDataUrl = coverCanvas.toDataURL('image/jpeg', 0.92);
  pdf.addImage(coverDataUrl, 'JPEG', 0, 0, pdfWidth, pdfHeight);

  // 2. Content Slides
  for (let i = 0; i < deck.slides.length; i++) {
    pdf.addPage([pdfWidth, pdfHeight], 'landscape');
    const slideCanvas = renderSlideToCanvas(deck.slides[i], deck, i, deck.slides.length);
    const slideDataUrl = slideCanvas.toDataURL('image/jpeg', 0.92);
    pdf.addImage(slideDataUrl, 'JPEG', 0, 0, pdfWidth, pdfHeight);

    if (onProgress) {
      const p = Math.round(((i + 2) / totalSteps) * 100);
      onProgress(p);
    }
  }

  // Filename safe format
  const sanitizedTitle = `Arxes_Ilektronikis_Kefalaio_${deck.chapterId}_Diafaneies_Taksis.pdf`;
  pdf.save(sanitizedTitle);
}

/**
 * Print presentation directly via browser dialog with clean slide page breaks
 */
export function printSlideDeck(deck: ChapterSlideDeck): void {
  // Open print container
  window.print();
}
