import React, { useState } from 'react';
import { GitHubPdfItem } from '../data/githubPdfsData';
import {
  X,
  Download,
  ExternalLink,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  FileText,
  Folder,
  FolderOpen
} from 'lucide-react';

interface PdfViewerModalProps {
  pdf: GitHubPdfItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  pdf,
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  if (!isOpen || !pdf) return null;

  const fullUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${pdf.relativeUrl}`
    : pdf.relativeUrl;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div
        className={`relative w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all ${
          isFullscreen ? 'h-full max-w-full' : 'h-[92vh] max-w-6xl'
        }`}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 shrink-0 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 border border-red-200 dark:border-red-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                {pdf.title}
              </h3>
              
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Direct download */}
            <a
              href={pdf.relativeUrl}
              download={pdf.fileName}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 text-xs font-bold transition-colors cursor-pointer shadow-xs"
              title="Άμεση λήψη αρχείου PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Λήψη PDF</span>
            </a>

            {/* Open in new browser window */}
            <a
              href={pdf.relativeUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer border border-slate-300 dark:border-slate-700"
              title="Άνοιγμα σε νέα καρτέλα"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            {/* Toggle Fullscreen */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer border border-slate-300 dark:border-slate-700 hidden sm:block"
              title={isFullscreen ? 'Έξοδος από πλήρη οθόνη' : 'Πλήρης οθόνη'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Κλείσιμο παραθύρου"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Embedded View */}
        <div className="flex-1 bg-slate-100 dark:bg-slate-950 relative overflow-hidden flex flex-col">
          <iframe
            src={`${pdf.relativeUrl}#view=FitH`}
            title={pdf.title}
            className="w-full flex-1 border-0"
          />

          {/* Bottom Bar: Instructions / Fallback link */}
          <div className="px-4 py-2 bg-slate-200 dark:bg-slate-900 border-t border-slate-300 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-1">
            <a
              href={pdf.relativeUrl}
              target="_blank"
              rel="noreferrer"
              className="text-cyan-700 dark:text-cyan-400 font-semibold hover:underline flex items-center gap-1"
            >
              <span>Πατήστε για άνοιγμα σε ξεχωριστό παράθυρο</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
