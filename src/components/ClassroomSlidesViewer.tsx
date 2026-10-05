import React, { useState, useEffect, useCallback } from 'react';
import { ChapterSlideDeck, SlideItem } from '../types';
import { downloadSlideDeckPdf, printSlideDeck } from '../utils/pdfGenerator';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Printer,
  Share2,
  Maximize2,
  Minimize2,
  BookOpen,
  Sparkles,
  HelpCircle,
  FileText,
  Cpu,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Layers,
  Info
} from 'lucide-react';

interface ClassroomSlidesViewerProps {
  deck: ChapterSlideDeck;
  onBack: () => void;
  onOpenShareModal: (deck: ChapterSlideDeck) => void;
  onSelectOtherDeck?: (chapterId: number) => void;
  allDecks: ChapterSlideDeck[];
}

export const ClassroomSlidesViewer: React.FC<ClassroomSlidesViewerProps> = ({
  deck,
  onBack,
  onOpenShareModal,
  onSelectOtherDeck,
  allDecks
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [showTeacherNotes, setShowTeacherNotes] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);

  const currentSlide: SlideItem = deck.slides[currentSlideIndex] || deck.slides[0];

  const handleNext = useCallback(() => {
    if (currentSlideIndex < deck.slides.length - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
    }
  }, [currentSlideIndex, deck.slides.length]);

  const handlePrev = useCallback(() => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
    }
  }, [currentSlideIndex]);

  // Keyboard navigation for classroom projector presentation (Left, Right, Spacebar, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, isFullscreen]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setIsDownloading(true);
      setDownloadProgress(10);
      await downloadSlideDeckPdf(deck, (p) => setDownloadProgress(p));
    } catch (err) {
      console.error('Failed to download PDF', err);
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const renderSlideDiagram = (slide: SlideItem) => {
    switch (slide.diagramType) {
      case 'energy-bands':
        return (
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-4 text-white shadow-inner flex flex-col items-center justify-center">
            <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider mb-2">
              Διάγραμμα Ενεργειακών Σταθμών (ΕΠΑΛ)
            </span>
            <svg viewBox="0 0 380 200" className="w-full max-w-[340px] h-40">
              {/* Conduction band */}
              <rect x="30" y="20" width="320" height="40" rx="8" fill="#0284c7" opacity="0.85" />
              <text x="190" y="45" fill="#ffffff" textAnchor="middle" fontSize="13" fontWeight="bold">
                Ζώνη Αγωγιμότητας (Ελεύθερα e⁻)
              </text>

              {/* Energy gap */}
              <line x1="190" y1="65" x2="190" y2="125" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 4" />
              <polygon points="190,65 186,72 194,72" fill="#38bdf8" />
              <polygon points="190,125 186,118 194,118" fill="#38bdf8" />
              <rect x="135" y="85" width="110" height="24" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
              <text x="190" y="102" fill="#38bdf8" textAnchor="middle" fontSize="11" fontWeight="bold">
                Χάσμα Eg (1.12 eV Si)
              </text>

              {/* Valence band */}
              <rect x="30" y="130" width="320" height="40" rx="8" fill="#1e293b" stroke="#0284c7" strokeWidth="1.5" />
              <text x="190" y="155" fill="#93c5fd" textAnchor="middle" fontSize="13" fontWeight="bold">
                Ζώνη Σθένους (Οπές / Δεσμοί)
              </text>
            </svg>
            <p className="text-[11px] text-slate-300 text-center mt-2 font-medium">
              Απαιτείται ενέργεια ≥ Eg για να γίνει αγώγιμο το υλικό.
            </p>
          </div>
        );

      case 'pn-junction':
        return (
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-4 text-white shadow-inner flex flex-col items-center justify-center">
            <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider mb-2">
              Επαφή P-N & Περιοχή Απογύμνωσης
            </span>
            <svg viewBox="0 0 380 180" className="w-full max-w-[340px] h-36">
              {/* P block */}
              <rect x="30" y="30" width="120" height="90" rx="6" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" />
              <text x="90" y="65" fill="#ffffff" textAnchor="middle" fontSize="16" fontWeight="bold">Τύπος P</text>
              <text x="90" y="88" fill="#93c5fd" textAnchor="middle" fontSize="11">Οπές (h⁺)</text>

              {/* Depletion region */}
              <rect x="150" y="30" width="80" height="90" fill="#0f172a" stroke="#eab308" strokeWidth="2" strokeDasharray="3 3" />
              <text x="190" y="70" fill="#fde047" textAnchor="middle" fontSize="11" fontWeight="bold">Ζώνη</text>
              <text x="190" y="88" fill="#fde047" textAnchor="middle" fontSize="10">Απογύμνωσης</text>
              <text x="190" y="105" fill="#fde047" textAnchor="middle" fontSize="10">Vγ ≈ 0.7V</text>

              {/* N block */}
              <rect x="230" y="30" width="120" height="90" rx="6" fill="#065f46" stroke="#10b981" strokeWidth="2" />
              <text x="290" y="65" fill="#ffffff" textAnchor="middle" fontSize="16" fontWeight="bold">Τύπος N</text>
              <text x="290" y="88" fill="#a7f3d0" textAnchor="middle" fontSize="11">Ηλεκτρόνια (e⁻)</text>

              {/* Terminals */}
              <line x1="10" y1="75" x2="30" y2="75" stroke="#ffffff" strokeWidth="4" />
              <text x="12" y="65" fill="#38bdf8" fontSize="12" fontWeight="bold">A (+)</text>

              <line x1="350" y1="75" x2="370" y2="75" stroke="#ffffff" strokeWidth="4" />
              <text x="355" y="65" fill="#38bdf8" fontSize="12" fontWeight="bold">K (-)</text>
            </svg>
            <p className="text-[11px] text-slate-300 text-center mt-2 font-medium">
              Άνοδος (P) & Κάθοδος (N) • Δυναμικό Φραγμού 0.7V στο Si
            </p>
          </div>
        );

      case 'scr-circuit':
        return (
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-4 text-white shadow-inner flex flex-col items-center justify-center">
            <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider mb-2">
              Θυρίστορ SCR (P-N-P-N) & Έλεγχος Φάσης
            </span>
            <svg viewBox="0 0 380 180" className="w-full max-w-[340px] h-36">
              {/* SCR Symbol */}
              <polygon points="190,40 160,85 220,85" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
              <line x1="160" y1="85" x2="220" y2="85" stroke="#38bdf8" strokeWidth="3" />
              <line x1="190" y1="15" x2="190" y2="40" stroke="#ffffff" strokeWidth="3" />
              <text x="205" y="25" fill="#38bdf8" fontSize="13" fontWeight="bold">Άνοδος (A)</text>

              <line x1="190" y1="85" x2="190" y2="120" stroke="#ffffff" strokeWidth="3" />
              <text x="205" y="115" fill="#38bdf8" fontSize="13" fontWeight="bold">Κάθοδος (K)</text>

              {/* Gate */}
              <line x1="190" y1="85" x2="230" y2="105" stroke="#f59e0b" strokeWidth="3" />
              <line x1="230" y1="105" x2="260" y2="105" stroke="#f59e0b" strokeWidth="3" />
              <text x="265" y="110" fill="#f59e0b" fontSize="13" fontWeight="bold">Πύλη Gate (G)</text>

              {/* Waveform snippet */}
              <path d="M 40,150 Q 70,120 100,150 Q 130,180 160,150" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="3 3" />
              <path d="M 70,120 Q 85,130 100,150" fill="none" stroke="#38bdf8" strokeWidth="3" />
              <text x="50" y="170" fill="#94a3b8" fontSize="10">Γωνία έναυσης α: 0° - 180°</text>
            </svg>
            <p className="text-[11px] text-slate-300 text-center mt-2 font-medium">
              Έλεγχος φορτίου μέσω χρονισμού έναυσης στην πύλη G.
            </p>
          </div>
        );

      case 'bjt-characteristics':
        return (
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-4 text-white shadow-inner flex flex-col items-center justify-center">
            <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider mb-2">
              Ευθεία Φόρτου & Σημείο Q (BJT NPN)
            </span>
            <svg viewBox="0 0 380 180" className="w-full max-w-[340px] h-36">
              {/* Axes */}
              <line x1="50" y1="20" x2="50" y2="150" stroke="#94a3b8" strokeWidth="2" />
              <line x1="50" y1="150" x2="350" y2="150" stroke="#94a3b8" strokeWidth="2" />
              <text x="340" y="170" fill="#cbd5e1" fontSize="11" fontWeight="bold">V_CE (V)</text>
              <text x="20" y="25" fill="#cbd5e1" fontSize="11" fontWeight="bold">I_C (mA)</text>

              {/* DC Load line */}
              <line x1="50" y1="35" x2="330" y2="150" stroke="#ef4444" strokeWidth="3" />
              <text x="55" y="30" fill="#ef4444" fontSize="10" fontWeight="bold">I_C(sat) = V_CC/R_C</text>
              <text x="290" y="142" fill="#ef4444" fontSize="10" fontWeight="bold">V_CC</text>

              {/* Q Point */}
              <circle cx="190" cy="92" r="6" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
              <text x="202" y="90" fill="#38bdf8" fontSize="12" fontWeight="bold">Σημείο Q (Ηρεμίας)</text>
              <line x1="190" y1="92" x2="190" y2="150" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="50" y1="92" x2="190" y2="92" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" />
            </svg>
            <p className="text-[11px] text-slate-300 text-center mt-2 font-medium">
              Στο μέσον της ευθείας φόρτου επιτυγχάνεται μέγιστη γραμμική ενίσχυση.
            </p>
          </div>
        );

      case 'logic-gates':
        return (
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-4 text-white shadow-inner flex flex-col items-center justify-center">
            <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider mb-2">
              Βασικές Λογικές Πύλες & Πίνακες Αληθείας
            </span>
            <div className="grid grid-cols-3 gap-2 w-full max-w-[340px] pt-1 text-center">
              <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700">
                <span className="text-xs font-bold text-cyan-400 block font-mono">AND (7408)</span>
                <span className="text-[10px] text-slate-300 block font-mono mt-1">Y = A · B</span>
                <span className="text-[9px] text-emerald-400 block mt-1 font-semibold">1 μόνο αν A=1 & B=1</span>
              </div>
              <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700">
                <span className="text-xs font-bold text-cyan-400 block font-mono">OR (7432)</span>
                <span className="text-[10px] text-slate-300 block font-mono mt-1">Y = A + B</span>
                <span className="text-[9px] text-emerald-400 block mt-1 font-semibold">1 αν έστω ένα είναι 1</span>
              </div>
              <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700">
                <span className="text-xs font-bold text-cyan-400 block font-mono">NAND (7400)</span>
                <span className="text-[10px] text-slate-300 block font-mono mt-1">Y = (A·B)'</span>
                <span className="text-[9px] text-amber-400 block mt-1 font-semibold">Καθολική Πύλη</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-300 text-center mt-2 font-medium">
              Στάθμη Low: 0V • Στάθμη High: +5V (TTL Logic)
            </p>
          </div>
        );

      default:
        return (
          <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center">
            <Cpu className="w-8 h-8 text-cyan-600 dark:text-cyan-400 mx-auto mb-2 opacity-80" />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
              {slide.diagramDescription || 'Τεχνικό Διάγραμμα & Κύκλωμα'}
            </span>
          </div>
        );
    }
  };

  return (
    <div className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-6 overflow-y-auto' : ''}`}>
      {/* Top Bar / Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer border border-slate-300 dark:border-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Επιστροφή στο Μενού</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-100 dark:bg-cyan-500/20 text-cyan-900 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-500/30">
                ΚΕΦΑΛΑΙΟ {deck.chapterId}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white line-clamp-1">
                {deck.title}
              </h2>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline-block">
              {deck.bookRef} • {deck.estimatedDuration}
            </span>
          </div>
        </div>

        {/* Action Buttons: Share, Download PDF, Print, Fullscreen */}
        <div className="flex items-center gap-2">
          {/* Deck switcher dropdown */}
          {allDecks.length > 1 && onSelectOtherDeck && (
            <select
              value={deck.chapterId}
              onChange={(e) => onSelectOtherDeck(Number(e.target.value))}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
              title="Επιλογή άλλου Κεφαλαίου"
            >
              {allDecks.map((d) => (
                <option key={d.chapterId} value={d.chapterId}>
                  Κεφάλαιο {d.chapterId} ({d.slides.length} διαφ.)
                </option>
              ))}
            </select>
          )}

          {/* Share Modal Trigger */}
          <button
            onClick={() => onOpenShareModal(deck)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 text-xs font-bold transition-colors cursor-pointer shadow-sm"
            title="Διαμοιρασμός στους μαθητές με QR Code & Link"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Διαμοιρασμός (QR)</span>
          </button>

          {/* Direct PDF Download */}
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-cyan-400 text-xs font-bold transition-colors cursor-pointer border border-slate-700 disabled:opacity-50 shadow-sm"
            title="Λήψη αρχείου PDF"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">
              {isDownloading ? `Λήψη (${downloadProgress}%)` : 'Λήψη PDF'}
            </span>
          </button>

          {/* Print */}
          <button
            onClick={() => printSlideDeck(deck)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer border border-slate-300 dark:border-slate-700"
            title="Εκτύπωση / Αποθήκευση μέσω Browser"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Toggle Teacher Notes */}
          <button
            onClick={() => setShowTeacherNotes(!showTeacherNotes)}
            className={`px-2.5 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
              showTeacherNotes
                ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-400 border-amber-300 dark:border-amber-500/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
            }`}
            title="Εμφάνιση / Απόκρυψη Σημειώσεων Διδάσκοντα"
          >
            <BookOpen className="w-4 h-4 inline-block sm:mr-1" />
            <span className="hidden md:inline">Σημειώσεις</span>
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer border border-slate-300 dark:border-slate-700"
            title={isFullscreen ? 'Έξοδος από πλήρη οθόνη' : 'Προβολή πλήρους οθόνης (Προβολέας)'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Slide Card: High Contrast Presentation Canvas */}
      <div className="relative rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-6 md:p-10 shadow-lg dark:shadow-2xl overflow-hidden transition-all">
        {/* Top Header inside slide */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-200 dark:border-slate-800 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-cyan-700 dark:text-cyan-400 uppercase tracking-wider">
                {deck.chapterTitle}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
              {currentSlide.title}
            </h1>
            {currentSlide.subtitle && (
              <p className="text-sm font-semibold text-cyan-800 dark:text-cyan-300 mt-1">
                {currentSlide.subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-100 dark:bg-cyan-500/20 text-cyan-900 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-500/30 whitespace-nowrap">
              Διαφάνεια {currentSlideIndex + 1} / {deck.slides.length}
            </span>
          </div>
        </div>

        {/* Slide Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-6 items-start">
          {/* Left Column: Bullet Points & Explanation (8 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="space-y-3">
              {currentSlide.bulletPoints.map((point, idx) => (
                <div key={idx} className="flex items-start gap-3 group">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-600 dark:bg-cyan-400 mt-2 shrink-0 group-hover:scale-125 transition-transform" />
                  <p className="text-sm md:text-base text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
                    {point}
                  </p>
                </div>
              ))}
            </div>

            {/* Key Takeaway Card */}
            <div className="mt-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/30">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4" />
                <span>Βασικό Συμπέρασμα</span>
              </div>
              <p className="text-xs md:text-sm font-medium text-emerald-950 dark:text-emerald-200 leading-relaxed">
                {currentSlide.keyTakeaway}
              </p>
            </div>
          </div>

          {/* Right Column: Visual Diagram & Formulas (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Interactive / SVG Diagram */}
            {renderSlideDiagram(currentSlide)}

            {/* Formulae Box if present */}
            {currentSlide.formulaOrFormulae && currentSlide.formulaOrFormulae.length > 0 && (
              <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
                <span className="text-xs font-mono font-bold text-cyan-800 dark:text-cyan-400 block mb-2 uppercase tracking-wider flex items-center gap-1.5">
                  📐 Βασικές Σχέσεις & Τύποι
                </span>
                <div className="space-y-2 font-mono text-xs text-slate-900 dark:text-slate-200">
                  {currentSlide.formulaOrFormulae.map((formula, i) => (
                    <div
                      key={i}
                      className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                      <span className="font-semibold">{formula}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Collapsible Teacher Notes */}
        {showTeacherNotes && currentSlide.teacherNotes && (
          <div className="mt-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-500/30">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
              <BookOpen className="w-4 h-4" />
              <span>Σημειώσεις Διδάσκοντα για την Τάξη</span>
            </div>
            <p className="text-xs md:text-sm text-amber-950 dark:text-amber-200 leading-relaxed font-normal">
              {currentSlide.teacherNotes}
            </p>
          </div>
        )}

        {/* Slide Bottom Navigation Controls */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={handlePrev}
            disabled={currentSlideIndex === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border border-slate-300 dark:border-slate-700 shadow-xs"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Προηγούμενη</span>
          </button>

          {/* Progress dots */}
          <div className="hidden sm:flex items-center gap-1.5">
            {deck.slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`h-2.5 rounded-full transition-all cursor-pointer ${
                  currentSlideIndex === idx
                    ? 'w-7 bg-cyan-600 dark:bg-cyan-400'
                    : 'w-2.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600'
                }`}
                title={`Μετάβαση στη διαφάνεια ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={currentSlideIndex === deck.slides.length - 1}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm"
          >
            <span>Επόμενη</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Thumbnails strip for fast navigation */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            Επισκόπηση Διαφανειών ({deck.slides.length})
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Πλήκτρα: ← / → / Spacebar
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {deck.slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlideIndex(idx)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                currentSlideIndex === idx
                  ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/40 shadow-xs ring-2 ring-cyan-500/30'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] font-mono font-bold text-cyan-700 dark:text-cyan-400">
                  #{idx + 1}
                </span>
                {currentSlideIndex === idx && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                )}
              </div>
              <span className="text-[11px] font-bold text-slate-900 dark:text-slate-200 line-clamp-2 leading-tight">
                {s.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
