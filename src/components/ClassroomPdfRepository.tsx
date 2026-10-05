import React, { useState, useMemo } from 'react';
import {
  GitHubPdfItem,
  PdfFolderCategory,
  pdfFolders,
  initialGitHubPdfs
} from '../data/githubPdfsData';
import { PdfViewerModal } from './PdfViewerModal';
import {
  Folder,
  FolderOpen,
  FileText,
  Download,
  ExternalLink,
  Eye,
  Search,
  Copy,
  Check,
  QrCode,
  Github,
  HelpCircle,
  PlusCircle,
  Trash2,
  Tag,
  Info,
  ChevronRight,
  BookOpen,
  Sliders,
  CheckCircle2,
  Calendar,
  Layers,
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  LogOut,
  ShieldAlert,
  Loader2,
  X
} from 'lucide-react';

import {
  downloadPdfFile,
  openPdfInNewWindow,
  resolveFileUrl
} from '../utils/pdfFileHandler';

const STORAGE_CUSTOM_GITHUB_PDFS = 'epal_github_custom_pdfs_v1';
const STORAGE_TEACHER_PIN = 'epal_teacher_admin_pin_v1';
const DEFAULT_TEACHER_PIN = 'epal2026';

export const ClassroomPdfRepository: React.FC<{ initialChapterId?: number }> = ({
  initialChapterId
}) => {
  const [selectedFolderId, setSelectedFolderId] = useState<string>(() => {
    if (initialChapterId) {
      const match = pdfFolders.find((f) => f.chapterId === initialChapterId);
      if (match) return match.id;
    }
    return 'all';
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activePdfForModal, setActivePdfForModal] = useState<GitHubPdfItem | null>(null);
  const [activePdfForShare, setActivePdfForShare] = useState<GitHubPdfItem | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showGithubGuide, setShowGithubGuide] = useState<boolean>(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [globalNotice, setGlobalNotice] = useState<string | null>(null);

  // Teacher Authentication state (defaults to false for public visitors)
  const [isTeacherLoggedIn, setIsTeacherLoggedIn] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('epal_teacher_logged_in') === 'true';
    } catch {
      return false;
    }
  });

  // Login Modal state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');

  // Change PIN Modal state
  const [isChangePinModalOpen, setIsChangePinModalOpen] = useState<boolean>(false);
  const [currentPinInput, setCurrentPinInput] = useState<string>('');
  const [newPinInput, setNewPinInput] = useState<string>('');
  const [changePinError, setChangePinError] = useState<string>('');
  const [changePinSuccess, setChangePinSuccess] = useState<string>('');

  // Custom added PDFs (stored in localStorage)
  const [customPdfs, setCustomPdfs] = useState<GitHubPdfItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_CUSTOM_GITHUB_PDFS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Modal to register a new PDF
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newPdfTitle, setNewPdfTitle] = useState<string>('');
  const [newPdfFileName, setNewPdfFileName] = useState<string>('');
  const [newPdfFolderId, setNewPdfFolderId] = useState<string>('kefalaio-1');
  const [newPdfDescription, setNewPdfDescription] = useState<string>('');
  const [newPdfTopics, setNewPdfTopics] = useState<string>('');
  const [newPdfFileSize, setNewPdfFileSize] = useState<string>('1.5 MB');

  const getStoredPin = (): string => {
    try {
      return localStorage.getItem(STORAGE_TEACHER_PIN) || DEFAULT_TEACHER_PIN;
    } catch {
      return DEFAULT_TEACHER_PIN;
    }
  };

  const handleTeacherLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const validPin = getStoredPin();
    if (enteredPin.trim() === validPin) {
      setIsTeacherLoggedIn(true);
      try {
        sessionStorage.setItem('epal_teacher_logged_in', 'true');
      } catch {}
      setEnteredPin('');
      setPinError('');
      setIsLoginModalOpen(false);
    } else {
      setPinError('Λάθος PIN. Παρακαλώ δοκιμάστε ξανά.');
    }
  };

  const handleTeacherLogout = () => {
    setIsTeacherLoggedIn(false);
    try {
      sessionStorage.removeItem('epal_teacher_logged_in');
    } catch {}
    setShowGithubGuide(false);
  };

  const handleChangePin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const validPin = getStoredPin();
    if (currentPinInput.trim() !== validPin) {
      setChangePinError('Το τρέχον PIN που εισάγατε δεν είναι σωστό.');
      return;
    }
    if (newPinInput.trim().length < 4) {
      setChangePinError('Το νέο PIN πρέπει να περιέχει τουλάχιστον 4 χαρακτήρες.');
      return;
    }
    try {
      localStorage.setItem(STORAGE_TEACHER_PIN, newPinInput.trim());
    } catch {}
    setChangePinSuccess('Το PIN διδάσκοντα ενημερώθηκε επιτυχώς!');
    setChangePinError('');
    setTimeout(() => {
      setIsChangePinModalOpen(false);
      setCurrentPinInput('');
      setNewPinInput('');
      setChangePinSuccess('');
    }, 1500);
  };

  // Combine initial built-in registry + custom registered PDFs
  const allPdfs = useMemo(() => {
    return [...initialGitHubPdfs, ...customPdfs];
  }, [customPdfs]);

  // Current selected folder category
  const currentFolder = useMemo(() => {
    return pdfFolders.find((f) => f.id === selectedFolderId) || null;
  }, [selectedFolderId]);

  // Filtered PDFs
  const filteredPdfs = useMemo(() => {
    return allPdfs.filter((item) => {
      // Folder filter
      if (selectedFolderId !== 'all') {
        const targetFolder = pdfFolders.find((f) => f.id === selectedFolderId);
        if (targetFolder && item.folder !== targetFolder.folderPath) {
          return false;
        }
      }

      // Search filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.fileName.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.folder.toLowerCase().includes(q) ||
        item.topics.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [allPdfs, selectedFolderId, searchQuery]);

  const handleCopyLink = (item: GitHubPdfItem) => {
    const fullUrl = resolveFileUrl(item.relativeUrl);
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadPdf = async (item: GitHubPdfItem) => {
    setDownloadingId(item.id);
    const result = await downloadPdfFile(item.relativeUrl, item.fileName);
    setDownloadingId(null);
    if (result.success) {
      setGlobalNotice(`Η λήψη του "${item.fileName}" ξεκίνησε!`);
      setTimeout(() => setGlobalNotice(null), 4000);
    } else {
      setGlobalNotice(result.error || 'Σφάλμα κατά τη λήψη του αρχείου.');
      setTimeout(() => setGlobalNotice(null), 6000);
    }
  };

  const handleOpenPdfExternal = async (item: GitHubPdfItem) => {
    await openPdfInNewWindow(item.relativeUrl);
  };

  const handleOpenShare = (item: GitHubPdfItem) => {
    setActivePdfForShare(item);
    setIsShareModalOpen(true);
  };

  const handleAddCustomPdf = () => {
    if (!newPdfTitle.trim() || !newPdfFileName.trim()) return;

    let sanitizedFileName = newPdfFileName.trim();
    if (!sanitizedFileName.endsWith('.pdf')) {
      sanitizedFileName += '.pdf';
    }

    const folderCat = pdfFolders.find((f) => f.id === newPdfFolderId) || pdfFolders[0];
    const relativeUrl = `/slides/${newPdfFolderId}/${sanitizedFileName}`;

    const newPdf: GitHubPdfItem = {
      id: 'custom_pdf_' + Date.now(),
      fileName: sanitizedFileName,
      title: newPdfTitle.trim(),
      chapterId: (folderCat.chapterId ?? 1) as any,
      folder: folderCat.folderPath,
      relativeUrl,
      description: newPdfDescription.trim() || 'Διαφάνειες PDF αναρτημένες από τον διδάσκοντα στο GitHub.',
      topics: newPdfTopics.split(',').map((t) => t.trim()).filter(Boolean),
      fileSize: newPdfFileSize.trim() || '2.0 MB',
      pages: 15,
      lastUpdated: new Date().toLocaleDateString('el-GR', { month: 'long', year: 'numeric' })
    };

    const updated = [newPdf, ...customPdfs];
    setCustomPdfs(updated);
    localStorage.setItem(STORAGE_CUSTOM_GITHUB_PDFS, JSON.stringify(updated));

    // Reset form
    setNewPdfTitle('');
    setNewPdfFileName('');
    setNewPdfDescription('');
    setNewPdfTopics('');
    setIsAddModalOpen(false);
  };

  const handleDeleteCustomPdf = (id: string) => {
    if (window.confirm('Είστε βέβαιοι ότι θέλετε να αφαιρέσετε αυτή την καταχώρηση PDF;')) {
      const updated = customPdfs.filter((p) => p.id !== id);
      setCustomPdfs(updated);
      localStorage.setItem(STORAGE_CUSTOM_GITHUB_PDFS, JSON.stringify(updated));
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Teacher Authenticated Admin Bar (Visible ONLY when Teacher is logged in) */}
      {isTeacherLoggedIn ? (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-400 dark:border-emerald-500/40 rounded-2xl p-3.5 sm:px-5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
          <div className="flex items-center gap-2.5 text-emerald-950 dark:text-emerald-300 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Λειτουργία Διδάσκοντα Ενεργή • Πρόσβαση σε εργαλεία διαχείρισης PDF</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors cursor-pointer shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Δήλωση Νέου PDF</span>
            </button>

            <button
              onClick={() => setShowGithubGuide(!showGithubGuide)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border border-slate-300 dark:border-slate-700 cursor-pointer"
            >
              <Github className="w-3.5 h-3.5 text-cyan-600" />
              <span>Οδηγός GitHub</span>
            </button>

            <button
              onClick={() => setIsChangePinModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border border-slate-300 dark:border-slate-700 cursor-pointer"
              title="Αλλαγή Μυστικού PIN"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-500" />
              <span>Αλλαγή PIN</span>
            </button>

            <button
              onClick={handleTeacherLogout}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600 dark:text-red-400 font-bold border border-slate-300 dark:border-slate-700 cursor-pointer transition-colors"
              title="Κλείδωμα διαχείρισης & Αποσύνδεση"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Κλείδωμα / Έξοδος</span>
            </button>
          </div>
        </div>
      ) : null}

      {/* Hero Header */}
      <div className="relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-10 shadow-md dark:shadow-xl overflow-hidden transition-colors">
        <div className="max-w-4xl space-y-4">
          
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Διαφάνειες σε PDF
          </h1>

          <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
            Σε αυτή την ενότητα βρίσκονται τα αρχεία PDF των διαφανειών που αναρτά ο κ. <strong>Αποστολίδης-Αφεντούλης Βασίλειος</strong>. Ο/η μαθητής/τρια μπορεί να περιηγηθεί στους αντίστοιχους φακέλους ανά κεφάλαιο, να <strong>προβάλει</strong> το PDF, ή να το <strong>κατεβάσει</strong>.
          </p>
          
        </div>
      </div>

      {/* Main Layout: Folder Navigation Sidebar + PDF Files Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Folder Navigation (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Folder className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                Φάκελοι Αρχείων (Folders)
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {pdfFolders.length} Φάκελοι
              </span>
            </div>

            {/* Folder button: All */}
            <button
              onClick={() => setSelectedFolderId('all')}
              className={`w-full p-3 rounded-2xl text-left transition-all cursor-pointer flex items-center justify-between ${
                selectedFolderId === 'all'
                  ? 'bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-300 dark:border-cyan-500/40 text-cyan-950 dark:text-cyan-300 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FolderOpen className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                <span className="text-xs font-bold">Όλοι οι Φάκελοι</span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 font-semibold">
                {allPdfs.length}
              </span>
            </button>

            {/* Folder categories */}
            <div className="space-y-2 pt-1">
              {pdfFolders.map((folder) => {
                const count = allPdfs.filter((p) => p.folder === folder.folderPath).length;
                const isSelected = selectedFolderId === folder.id;

                return (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedFolderId(folder.id)}
                    className={`w-full p-3 rounded-2xl text-left transition-all cursor-pointer flex flex-col gap-1 border ${
                      isSelected
                        ? 'bg-cyan-50 dark:bg-cyan-950/50 border-cyan-400 dark:border-cyan-500/50 text-cyan-950 dark:text-cyan-300 shadow-xs ring-1 ring-cyan-500/30'
                        : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        {isSelected ? (
                          <FolderOpen className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                        ) : (
                          <Folder className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                        )}
                        <span className="text-xs font-bold line-clamp-1">
                          {folder.name}
                        </span>
                      </div>

                    </div>

                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: PDF Files List (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Header of the Selected Folder + Search Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>

                <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {currentFolder ? currentFolder.name : 'Όλα τα Αρχεία PDF'}
                </h2>
                {currentFolder && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {currentFolder.description}
                  </p>
                )}
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64 shrink-0">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Αναζήτηση αρχείου PDF..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Files Grid */}
          {filteredPdfs.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-10 text-center space-y-3">
              <FileText className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Δεν βρέθηκαν αρχεία PDF σε αυτόν τον φάκελο
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {isTeacherLoggedIn
                  ? `Μπορείτε να ανεβάσετε το PDF σας στο GitHub στον φάκελο ${currentFolder?.folderPath || 'public/slides/'} και να το δηλώσετε εδώ.`
                  : 'Τα αρχεία διαφανειών αυτού του φακέλου θα αναρτηθούν σύντομα από τον διδάσκοντα.'}
              </p>
              {isTeacherLoggedIn && (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-3 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold cursor-pointer"
                >
                  Δήλωση Αρχείου PDF
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPdfs.map((pdf) => (
                <div
                  key={pdf.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-sm hover:border-cyan-500/50 hover:shadow-md transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 border border-red-200 dark:border-red-500/20">
                        <FileText className="w-6 h-6" />
                      </div>

                      <div className="min-w-0 space-y-1">
                       
                        <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                          {pdf.title}
                        </h3>

                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                          {pdf.description}
                        </p>                        
                      </div>
                    </div>

                    {/* Metadata badge */}

                  </div>

                  {/* Actions Bar */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* View PDF Modal */}
                      <button
                        onClick={() => setActivePdfForModal(pdf)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 text-xs font-bold transition-colors cursor-pointer shadow-xs"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Προβολή PDF</span>
                      </button>

                      {/* Download */}
                      <button
                        onClick={() => handleDownloadPdf(pdf)}
                        disabled={downloadingId === pdf.id}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer border border-slate-300 dark:border-slate-700 disabled:opacity-60"
                        title="Κατέβασμα αρχείου PDF"
                      >
                        {downloadingId === pdf.id ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-600 dark:text-cyan-400" />
                            <span>Λήψη...</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                            <span>Λήψη</span>
                          </>
                        )}
                      </button>

                      {/* Open in new browser tab */}
                      <button
                        onClick={() => handleOpenPdfExternal(pdf)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
                        title="Άνοιγμα σε νέο παράθυρο"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">




                      {/* Delete if custom AND Teacher is Logged in */}
                      {isTeacherLoggedIn && pdf.id.startsWith('custom_') && (
                        <button
                          onClick={() => handleDeleteCustomPdf(pdf.id)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-red-100 dark:bg-slate-800 dark:hover:bg-red-950/50 text-slate-400 hover:text-red-600 border border-slate-300 dark:border-slate-700 cursor-pointer transition-colors"
                          title="Διαγραφή καταχώρησης"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Embedded PDF Viewer Modal */}
      <PdfViewerModal
        pdf={activePdfForModal}
        isOpen={Boolean(activePdfForModal)}
        onClose={() => setActivePdfForModal(null)}
      />

      {/* Share / QR Modal */}
      {activePdfForShare && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => {
            setIsShareModalOpen(false);
            setActivePdfForShare(null);
          }}
          material={{
            id: activePdfForShare.id,
            title: activePdfForShare.title,
            chapterId: activePdfForShare.chapterId,
            description: activePdfForShare.description,
            fileName: activePdfForShare.fileName,
            fileSize: activePdfForShare.fileSize,
            uploadDate: activePdfForShare.lastUpdated,
            uploadedByTeacher: true
          }}
        />
      )}

      {/* MODAL 1: TEACHER PIN LOGIN MODAL */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl transition-colors space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-cyan-100 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Σύνδεση Διδάσκοντα
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Εισάγετε το μυστικό PIN για να αποκτήσετε δικαιώματα διαχείρισης PDF.
                </p>
              </div>
            </div>

            <form onSubmit={handleTeacherLogin} className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Μυστικό PIN Διδάσκοντα
                </label>
                <input
                  type="password"
                  placeholder="Εισαγωγή PIN..."
                  autoFocus
                  value={enteredPin}
                  onChange={(e) => {
                    setEnteredPin(e.target.value);
                    setPinError('');
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white font-mono tracking-widest focus:outline-none focus:border-cyan-500"
                />
                {pinError && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1.5 flex items-center gap-1 font-medium">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>{pinError}</span>
                  </p>
                )}
                <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-1.5">
                  Προεπιλεγμένο αρχικό PIN: <code className="font-mono text-cyan-600 dark:text-cyan-400">epal2026</code> (μπορείτε να το αλλάξετε μετά τη σύνδεση).
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsLoginModalOpen(false);
                    setEnteredPin('');
                    setPinError('');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
                >
                  Ακύρωση
                </button>
                <button
                  type="submit"
                  disabled={!enteredPin.trim()}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  Σύνδεση
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CHANGE TEACHER PIN MODAL */}
      {isChangePinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl transition-colors space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Αλλαγή Μυστικού PIN Διδάσκοντα
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Ορίστε το δικό σας προσωπικό PIN για να προστατεύσετε τη διαχείριση.
                </p>
              </div>
            </div>

            <form onSubmit={handleChangePin} className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Τρέχον PIN *
                </label>
                <input
                  type="password"
                  placeholder="Εισαγωγή τρέχοντος PIN..."
                  value={currentPinInput}
                  onChange={(e) => setCurrentPinInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Νέο Προσωπικό PIN (τουλάχιστον 4 χαρακτήρες) *
                </label>
                <input
                  type="password"
                  placeholder="Εισαγωγή νέου PIN..."
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              {changePinError && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-1 flex items-center gap-1 font-medium">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>{changePinError}</span>
                </p>
              )}

              {changePinSuccess && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{changePinSuccess}</span>
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsChangePinModalOpen(false);
                    setCurrentPinInput('');
                    setNewPinInput('');
                    setChangePinError('');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
                >
                  Ακύρωση
                </button>
                <button
                  type="submit"
                  disabled={!currentPinInput || !newPinInput}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  Αποθήκευση Νέου PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: REGISTER / ADD NEW PDF (Teacher Only) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl transition-colors space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-100 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Δήλωση Αρχείου PDF από το GitHub
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Καταχωρήστε το αρχείο PDF που τοποθετήσατε στο φάκελο του GitHub.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Επιλογή Φακέλου Στο GitHub *
                </label>
                <select
                  value={newPdfFolderId}
                  onChange={(e) => setNewPdfFolderId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono"
                >
                  {pdfFolders.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.folderPath} ({f.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Όνομα Αρχείου PDF στο GitHub (π.χ. diafaneies-zener.pdf) *
                </label>
                <input
                  type="text"
                  placeholder="diafaneies-kefalaio-2.pdf"
                  value={newPdfFileName}
                  onChange={(e) => setNewPdfFileName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Τίτλος Παρουσίασης *
                </label>
                <input
                  type="text"
                  placeholder="π.χ. Κεφάλαιο 2: Ανόρθωση & Δίοδος Zener"
                  value={newPdfTitle}
                  onChange={(e) => setNewPdfTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Περιγραφή περιεχομένου
                </label>
                <textarea
                  rows={2}
                  placeholder="Σύντομη περιγραφή των θεμάτων της διάλεξης..."
                  value={newPdfDescription}
                  onChange={(e) => setNewPdfDescription(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Ετικέτες / Θέματα (χωρισμένα με κόμμα)
                </label>
                <input
                  type="text"
                  placeholder="π.χ. Zener, Ανόρθωση, Graetz, Ripple"
                  value={newPdfTopics}
                  onChange={(e) => setNewPdfTopics(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Εκτιμώμενο Μέγεθος Αρχείου
                </label>
                <input
                  type="text"
                  placeholder="π.χ. 1.8 MB"
                  value={newPdfFileSize}
                  onChange={(e) => setNewPdfFileSize(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
              >
                Ακύρωση
              </button>
              <button
                onClick={handleAddCustomPdf}
                disabled={!newPdfTitle.trim() || !newPdfFileName.trim()}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
              >
                Προσθήκη στον Κατάλογο
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
