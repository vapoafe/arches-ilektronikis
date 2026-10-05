import React, { useState, useMemo } from 'react';
import { ChapterSlideDeck, SharedPdfMaterial } from '../types';
import { slidesData } from '../data/slidesData';
import { ClassroomSlidesViewer } from './ClassroomSlidesViewer';
import { ShareModal } from './ShareModal';
import { downloadSlideDeckPdf, printSlideDeck } from '../utils/pdfGenerator';
import { getStoredTeacherMaterials, saveTeacherMaterial, deleteTeacherMaterial } from '../utils/materialsStorage';
import {
  FileText,
  Share2,
  Download,
  Printer,
  Presentation,
  Upload,
  PlusCircle,
  Search,
  CheckCircle2,
  Trash2,
  ExternalLink,
  BookOpen,
  Sparkles,
  QrCode,
  Sliders,
  Filter,
  Layers,
  GraduationCap
} from 'lucide-react';

interface ClassroomMaterialsHubProps {
  initialChapterId?: number;
  onNavigateToSimulator?: (chapterId: number) => void;
}

export const ClassroomMaterialsHub: React.FC<ClassroomMaterialsHubProps> = ({
  initialChapterId,
  onNavigateToSimulator
}) => {
  const [selectedChapterFilter, setSelectedChapterFilter] = useState<number | 'all' | 'custom'>(
    initialChapterId || 'all'
  );
  const [activeDeck, setActiveDeck] = useState<ChapterSlideDeck | null>(null);
  const [shareTargetDeck, setShareTargetDeck] = useState<ChapterSlideDeck | null>(null);
  const [shareTargetMaterial, setShareTargetMaterial] = useState<SharedPdfMaterial | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Teacher custom uploads
  const [customMaterials, setCustomMaterials] = useState<SharedPdfMaterial[]>(() =>
    getStoredTeacherMaterials()
  );
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [uploadTitle, setUploadTitle] = useState<string>('');
  const [uploadChapter, setUploadChapter] = useState<number>(1);
  const [uploadDescription, setUploadDescription] = useState<string>('');
  const [uploadLinkUrl, setUploadLinkUrl] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [downloadingDeckId, setDownloadingDeckId] = useState<number | null>(null);

  // Filter slide decks
  const filteredDecks = useMemo(() => {
    return slidesData.filter((deck) => {
      const matchesChapter =
        selectedChapterFilter === 'all' ||
        selectedChapterFilter === 'custom' ||
        deck.chapterId === selectedChapterFilter;

      if (!matchesChapter) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        deck.title.toLowerCase().includes(q) ||
        deck.chapterTitle.toLowerCase().includes(q) ||
        deck.description.toLowerCase().includes(q) ||
        deck.slides.some(
          (s) =>
            s.title.toLowerCase().includes(q) ||
            s.bulletPoints.some((b) => b.toLowerCase().includes(q)) ||
            (s.keyTakeaway && s.keyTakeaway.toLowerCase().includes(q))
        )
      );
    });
  }, [selectedChapterFilter, searchQuery]);

  // Filter custom teacher materials
  const filteredCustomMaterials = useMemo(() => {
    return customMaterials.filter((m) => {
      const matchesChapter =
        selectedChapterFilter === 'all' ||
        selectedChapterFilter === 'custom' ||
        m.chapterId === selectedChapterFilter;

      if (!matchesChapter) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return m.title.toLowerCase().includes(q) || m.description.toLowerCase().includes(q);
    });
  }, [customMaterials, selectedChapterFilter, searchQuery]);

  // Handle deck direct download
  const handleDownloadDeck = async (deck: ChapterSlideDeck) => {
    try {
      setDownloadingDeckId(deck.chapterId);
      await downloadSlideDeckPdf(deck);
    } catch (e) {
      console.error('Failed to download deck', e);
    } finally {
      setDownloadingDeckId(null);
    }
  };

  // Open share modal
  const handleOpenShare = (deck: ChapterSlideDeck) => {
    setShareTargetDeck(deck);
    setShareTargetMaterial(null);
    setIsShareModalOpen(true);
  };

  const handleOpenMaterialShare = (mat: SharedPdfMaterial) => {
    setShareTargetMaterial(mat);
    setShareTargetDeck(null);
    setIsShareModalOpen(true);
  };

  // Upload custom teacher file/link
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSaveMaterial = () => {
    if (!uploadTitle.trim()) return;

    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        const fileDataUrl = reader.result as string;
        const newMat: SharedPdfMaterial = {
          id: 'mat_' + Date.now(),
          title: uploadTitle.trim(),
          chapterId: uploadChapter as any,
          description: uploadDescription.trim(),
          fileDataUrl,
          fileName: selectedFile.name,
          fileSize: (selectedFile.size / (1024 * 1024)).toFixed(2) + ' MB',
          uploadDate: new Date().toLocaleDateString('el-GR'),
          uploadedByTeacher: true
        };
        saveTeacherMaterial(newMat);
        setCustomMaterials(getStoredTeacherMaterials());
        resetUploadForm();
      };
      reader.readAsDataURL(selectedFile);
    } else if (uploadLinkUrl.trim()) {
      const newMat: SharedPdfMaterial = {
        id: 'mat_' + Date.now(),
        title: uploadTitle.trim(),
        chapterId: uploadChapter as any,
        description: uploadDescription.trim(),
        externalUrl: uploadLinkUrl.trim(),
        uploadDate: new Date().toLocaleDateString('el-GR'),
        uploadedByTeacher: true
      };
      saveTeacherMaterial(newMat);
      setCustomMaterials(getStoredTeacherMaterials());
      resetUploadForm();
    }
  };

  const resetUploadForm = () => {
    setUploadTitle('');
    setUploadDescription('');
    setUploadLinkUrl('');
    setSelectedFile(null);
    setIsUploadModalOpen(false);
  };

  const handleDeleteMaterial = (id: string) => {
    if (window.confirm('Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτό το εκπαιδευτικό υλικό;')) {
      deleteTeacherMaterial(id);
      setCustomMaterials(getStoredTeacherMaterials());
    }
  };

  // If a deck is actively being presented, show the SlidesViewer!
  if (activeDeck) {
    return (
      <ClassroomSlidesViewer
        deck={activeDeck}
        allDecks={slidesData}
        onBack={() => setActiveDeck(null)}
        onOpenShareModal={(d) => handleOpenShare(d)}
        onSelectOtherDeck={(chId) => {
          const found = slidesData.find((d) => d.chapterId === chId);
          if (found) setActiveDeck(found);
        }}
      />
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Banner for PDF & Slide Distribution */}
      <div className="relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-10 shadow-md dark:shadow-xl overflow-hidden transition-colors">
        <div className="max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-500/10 border border-cyan-300 dark:border-cyan-500/30 text-cyan-900 dark:text-cyan-400 text-xs font-bold">
            <Presentation className="w-4 h-4" />
            <span>Κέντρο Διαμοιρασμού Υλικού & Διαφανειών Τάξης</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Διαφάνειες & Υλικό σε PDF
          </h1>

          <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
            Εδώ βρίσκεται συγκεντρωμένο όλο το υλικό διαφανειών που διδάσκεται μέσα στην τάξη για τα <strong>Κεφάλαια 1, 2, 4, 5 και 8</strong>. Μπορείτε να προβάλετε τις διαφάνειες σε προβολέα (διαδραστικό πίνακα), να τις κατεβάσετε απευθείας σε <strong>μορφή PDF</strong>, να εκτυπώσετε σημειώσεις, καθώς και να προβάλετε άμεσα <strong>κωδικό QR</strong> ώστε οι μαθητές να σκανάρουν και να αποθηκεύουν το υλικό στα κινητά ή tablets τους.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Ανάρτηση Νέου Υλικού / PDF Καθηγητή</span>
            </button>

            <button
              onClick={() => handleOpenShare(slidesData[0])}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all border border-slate-300 dark:border-slate-700 cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Άνοιγμα QR Code Τάξης</span>
            </button>
          </div>
        </div>
      </div>

      {/* Chapter Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Chapter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'Όλα τα Κεφάλαια' },
            { id: 1, label: 'Κεφ. 1: Στερεό Σώμα' },
            { id: 2, label: 'Κεφ. 2: Δίοδοι' },
            { id: 4, label: 'Κεφ. 4: Θυρίστορ' },
            { id: 5, label: 'Κεφ. 5: BJT' },
            { id: 8, label: 'Κεφ. 8: Ψηφιακά' },
            { id: 'custom', label: `Υλικό Καθηγητή (${customMaterials.length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedChapterFilter(tab.id as any)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedChapterFilter === tab.id
                  ? 'bg-cyan-600 text-white dark:bg-cyan-500 dark:text-slate-950 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Αναζήτηση διαφανειών..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-600 dark:focus:border-cyan-400 shadow-xs"
          />
        </div>
      </div>

      {/* SECTION 1: OFFICIAL CURRICULUM SLIDE DECKS */}
      {selectedChapterFilter !== 'custom' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              <span>Έτοιμες Διαφάνειες Μαθήματος (Αναλυτικό Πρόγραμμα ΕΠΑΛ)</span>
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {filteredDecks.length} Σειρές Διαφανειών
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDecks.map((deck) => (
              <div
                key={deck.chapterId}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col justify-between hover:border-cyan-500/50 hover:shadow-lg transition-all group shadow-sm"
              >
                <div className="space-y-4">
                  {/* Top tags */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-cyan-100 dark:bg-cyan-500/10 text-cyan-900 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/30">
                      ΚΕΦΑΛΑΙΟ {deck.chapterId}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {deck.totalSlides} Διαφάνειες
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
                      {deck.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-3 leading-relaxed">
                      {deck.description}
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-1 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-center justify-between">
                      <span>Διδακτική διάρκεια:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{deck.estimatedDuration}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Σχολικό Βιβλίο:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{deck.bookRef}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <button
                    onClick={() => setActiveDeck(deck)}
                    className="w-full py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Presentation className="w-4 h-4" />
                    <span>Προβολή Διαφανειών (Slideshow)</span>
                  </button>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleDownloadDeck(deck)}
                      disabled={downloadingDeckId === deck.chapterId}
                      className="py-2 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer border border-slate-300 dark:border-slate-700 disabled:opacity-50"
                      title="Κατέβασμα αρχείου PDF"
                    >
                      <Download className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                      <span>{downloadingDeckId === deck.chapterId ? '...' : 'PDF'}</span>
                    </button>

                    <button
                      onClick={() => handleOpenShare(deck)}
                      className="py-2 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer border border-slate-300 dark:border-slate-700"
                      title="Διαμοιρασμός με QR Code & Link"
                    >
                      <QrCode className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                      <span>QR</span>
                    </button>

                    <button
                      onClick={() => printSlideDeck(deck)}
                      className="py-2 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer border border-slate-300 dark:border-slate-700"
                      title="Εκτύπωση"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      <span>Εκτύπωση</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: CUSTOM TEACHER MATERIALS & PDFS */}
      {(selectedChapterFilter === 'all' || selectedChapterFilter === 'custom') && (
        <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Προσωπικό Υλικό & Πρόσθετα Αρχεία PDF του Καθηγητή</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Αρχεία PDF και σύνδεσμοι διαφανειών που αναρτά ο διδάσκων για την τάξη.
              </p>
            </div>

            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Προσθήκη PDF</span>
            </button>
          </div>

          {filteredCustomMaterials.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-8 text-center space-y-3">
              <FileText className="w-10 h-10 text-slate-400 mx-auto" />
              <div className="max-w-md mx-auto">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Δεν έχει αναρτηθεί ακόμα πρόσθετο υλικό
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Μπορείτε να ανεβάσετε τις δικές σας διαφάνειες σε PDF από τον υπολογιστή σας ή να προσθέσετε συνδέσμους από Google Drive / OneDrive για να τις μοιράζεστε με τους μαθητές.
                </p>
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="mt-4 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer border border-slate-300 dark:border-slate-700"
                >
                  Ανάρτηση του πρώτου σας PDF
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCustomMaterials.map((mat) => (
                <div
                  key={mat.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col justify-between hover:border-emerald-500/50 shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-100 dark:bg-emerald-500/10 text-emerald-900 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30">
                        {mat.chapterId === 0 ? 'ΓΕΝΙΚΟ ΥΛΙΚΟ' : `ΚΕΦΑΛΑΙΟ ${mat.chapterId}`}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">{mat.uploadDate}</span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2">
                        {mat.title}
                      </h3>
                      {mat.description && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 line-clamp-2">
                          {mat.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 text-[11px] text-slate-500 flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{mat.fileName || (mat.externalUrl ? 'Σύνδεσμος Cloud' : 'Αρχείο PDF')}</span>
                      {mat.fileSize && <span>({mat.fileSize})</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    {mat.fileDataUrl ? (
                      <a
                        href={mat.fileDataUrl}
                        download={mat.fileName || `${mat.title}.pdf`}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Λήψη PDF</span>
                      </a>
                    ) : (
                      <a
                        href={mat.externalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Άνοιγμα</span>
                      </a>
                    )}

                    <button
                      onClick={() => handleOpenMaterialShare(mat)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 cursor-pointer"
                      title="Διαμοιρασμός σε μαθητές (QR Code)"
                    >
                      <QrCode className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    </button>

                    <button
                      onClick={() => handleDeleteMaterial(mat.id)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-red-100 dark:bg-slate-800 dark:hover:bg-red-950/40 text-slate-400 hover:text-red-600 dark:hover:text-red-400 border border-slate-300 dark:border-slate-700 cursor-pointer transition-colors"
                      title="Διαγραφή αρχείου"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: SHARE & QR CODE MODAL */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        deck={shareTargetDeck}
        material={shareTargetMaterial}
      />

      {/* MODAL 2: UPLOAD CUSTOM MATERIAL MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl transition-colors">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <Upload className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              <span>Ανάρτηση Υλικού / Διαφανειών PDF</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Προσθέστε τις δικές σας διαφάνειες ή συμπληρωματικά έγγραφα για τους μαθητές σας.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Τίτλος Υλικού / Διαφανειών *
                </label>
                <input
                  type="text"
                  placeholder="π.χ. Διαφάνειες Εργαστηρίου: Μέτρηση Διόδου Zener"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Αντιστοίχιση σε Κεφάλαιο
                </label>
                <select
                  value={uploadChapter}
                  onChange={(e) => setUploadChapter(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value={1}>Κεφάλαιο 1: Στοιχεία Θεωρίας Στερεού Σώματος</option>
                  <option value={2}>Κεφάλαιο 2: Κρυσταλλοδίοδοι</option>
                  <option value={4}>Κεφάλαιο 4: Στοιχεία Ελέγχου Ισχύος (Θυρίστορ)</option>
                  <option value={5}>Κεφάλαιο 5: Διπολικά Τρανζίστορ (BJT)</option>
                  <option value={8}>Κεφάλαιο 8: Ψηφιακά Ηλεκτρονικά & Πύλες</option>
                  <option value={0}>Γενικό Υλικό / Επαναληπτικό</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Περιγραφή / Σημείωση για τους μαθητές
                </label>
                <textarea
                  rows={2}
                  placeholder="Σύντομη περιγραφή των θεμάτων που καλύπτει το έγγραφο..."
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* File upload OR URL link */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Επιλογή Αρχείου PDF από τον υπολογιστή
                  </label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="w-full text-xs text-slate-600 dark:text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-cyan-100 file:text-cyan-800 dark:file:bg-cyan-500/20 dark:file:text-cyan-400 hover:file:bg-cyan-200 cursor-pointer"
                  />
                  {selectedFile && (
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block mt-1">
                      ✓ Επιλέχθηκε: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  )}
                </div>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
                  <span className="flex-shrink mx-3 text-[10px] text-slate-400 uppercase font-mono">ή μέσω συνδέσμου</span>
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Σύνδεσμος Google Drive / OneDrive / Web
                  </label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/file/..."
                    value={uploadLinkUrl}
                    onChange={(e) => setUploadLinkUrl(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={resetUploadForm}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
              >
                Ακύρωση
              </button>
              <button
                onClick={handleSaveMaterial}
                disabled={!uploadTitle.trim() || (!selectedFile && !uploadLinkUrl.trim())}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-sm"
              >
                Αποθήκευση & Διαμοιρασμός
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
