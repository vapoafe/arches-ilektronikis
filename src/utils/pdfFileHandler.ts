/**
 * Utility for robustly resolving, opening, and downloading PDF files
 * across various environments (including sandboxed iframes, desktop, and mobile browsers).
 */

export function resolveFileUrl(relativeUrl: string): string {
  if (!relativeUrl) return '';
  if (
    relativeUrl.startsWith('http://') ||
    relativeUrl.startsWith('https://') ||
    relativeUrl.startsWith('data:') ||
    relativeUrl.startsWith('blob:')
  ) {
    return relativeUrl;
  }

  if (typeof window === 'undefined') {
    return relativeUrl;
  }

  try {
    // Strip leading slash to resolve against origin cleanly
    const cleanPath = relativeUrl.startsWith('/') ? relativeUrl.slice(1) : relativeUrl;
    return new URL(cleanPath, window.location.origin).href;
  } catch (err) {
    console.error('Error resolving URL:', err);
    return relativeUrl;
  }
}

/**
 * Downloads a PDF file reliably.
 * Uses fetch + blob URL to bypass sandboxed iframe restrictions on direct cross-origin anchors,
 * with progressive fallbacks.
 */
export async function downloadPdfFile(
  relativeUrl: string,
  fileName: string
): Promise<{ success: boolean; url: string; error?: string }> {
  const fullUrl = resolveFileUrl(relativeUrl);

  try {
    // Strategy 1: Fetch as Blob and create local object URL
    const response = await fetch(fullUrl, { credentials: 'same-origin' });
    if (!response.ok) {
      throw new Error(`Σφάλμα φόρτωσης αρχείου: HTTP ${response.status}`);
    }

    const blob = await response.blob();
    const pdfBlob = new Blob([blob], { type: 'application/pdf' });
    const blobUrl = window.URL.createObjectURL(pdfBlob);

    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
    link.style.display = 'none';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);

    link.click();

    setTimeout(() => {
      try {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      } catch {
        // cleanup ignore
      }
    }, 15000);

    return { success: true, url: blobUrl };
  } catch (err) {
    console.warn('Blob download fallback triggered:', err);

    // Strategy 2: Direct Anchor fallback with absolute URL
    try {
      const link = document.createElement('a');
      link.href = fullUrl;
      link.download = fileName;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => document.body.removeChild(link), 1000);
      return { success: true, url: fullUrl };
    } catch (fallbackErr) {
      // Strategy 3: Window location or open
      try {
        window.open(fullUrl, '_blank', 'noopener,noreferrer');
        return { success: true, url: fullUrl };
      } catch (finalErr) {
        return {
          success: false,
          url: fullUrl,
          error: 'Η λήψη μπλοκαρίστηκε από το πρόγραμμα περιήγησης. Παρακαλώ ανοίξτε το αρχείο απευθείας.'
        };
      }
    }
  }
}

/**
 * Opens a PDF in a new window or tab cleanly
 */
export async function openPdfInNewWindow(relativeUrl: string): Promise<boolean> {
  const fullUrl = resolveFileUrl(relativeUrl);

  try {
    // Attempt standard window.open
    const newWindow = window.open(fullUrl, '_blank', 'noopener,noreferrer');
    if (newWindow && !newWindow.closed) {
      newWindow.focus();
      return true;
    }
  } catch (err) {
    console.warn('Standard window.open failed:', err);
  }

  // Fallback: Fetch blob to bypass popup restrictions on relative URLs in iframes
  try {
    const response = await fetch(fullUrl);
    if (response.ok) {
      const blob = await response.blob();
      const pdfBlob = new Blob([blob], { type: 'application/pdf' });
      const blobUrl = window.URL.createObjectURL(pdfBlob);
      const win = window.open(blobUrl, '_blank', 'noopener,noreferrer');
      if (win) {
        win.focus();
        return true;
      }
    }
  } catch (blobErr) {
    console.warn('Blob window open failed:', blobErr);
  }

  // Last resort: Navigate current window
  try {
    window.location.href = fullUrl;
    return true;
  } catch {
    return false;
  }
}
