import React, { useState, useMemo } from 'react';
import { curriculumData } from './data/curriculumData';
import { quizData } from './data/quizData';
import { datasheetsData } from './data/datasheetsData';
import { glossaryData } from './data/glossaryData';
import { ChapterDetail } from './components/ChapterDetail';
import { QuizComponent } from './components/QuizComponent';
import { DatasheetsViewer } from './components/DatasheetsViewer';
import { GlossaryViewer } from './components/GlossaryViewer';
import { Chapter1Simulator } from './components/simulators/Chapter1Simulator';
import { Chapter2Simulator } from './components/simulators/Chapter2Simulator';
import { Chapter4Simulator } from './components/simulators/Chapter4Simulator';
import { Chapter5Simulator } from './components/simulators/Chapter5Simulator';
import { Chapter8Simulator } from './components/simulators/Chapter8Simulator';
import { useTheme } from './context/ThemeContext';

import {
  Cpu,
  BookOpen,
  HelpCircle,
  FileText,
  BookMarked,
  Sliders,
  ExternalLink,
  Layers,
  GraduationCap,
  ArrowRight,
  Search,
  Sun,
  Moon
} from 'lucide-react';

type ViewMode = 'chapters' | 'chapter-detail' | 'simulators' | 'datasheets' | 'glossary' | 'quiz';

export default function App() {
  const { theme, toggleTheme, isDark } = useTheme();
  const [currentView, setCurrentView] = useState<ViewMode>('chapters');
  const [selectedChapterId, setSelectedChapterId] = useState<number>(1);
  const [selectedSimTab, setSelectedSimTab] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const allChapterIds = useMemo(() => curriculumData.map((c) => c.id), []);

  const activeChapter = useMemo(
    () => curriculumData.find((c) => c.id === selectedChapterId) || curriculumData[0],
    [selectedChapterId]
  );

  const handleOpenChapter = (id: number) => {
    setSelectedChapterId(id);
    setCurrentView('chapter-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenQuiz = (chapterId?: number) => {
    if (chapterId) {
      setSelectedChapterId(chapterId);
    }
    setCurrentView('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenSimulator = (chapterId: number) => {
    setSelectedSimTab(chapterId);
    setCurrentView('simulators');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredChapters = useMemo(() => {
    if (!searchQuery.trim()) return curriculumData;
    const q = searchQuery.toLowerCase();
    return curriculumData.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.sections.some(
          (s) =>
            s.title.toLowerCase().includes(q) ||
            s.summary.toLowerCase().includes(q) ||
            s.content.some((para) => para.toLowerCase().includes(q))
        )
    );
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Header & Navigation */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo and Brand */}
            <div
              onClick={() => {
                setCurrentView('chapters');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 dark:from-cyan-500 dark:to-blue-600 flex items-center justify-center shadow-md shadow-cyan-600/20 group-hover:scale-105 transition-transform">
                <Cpu className="w-5 h-5 text-white dark:text-slate-950 font-bold" />
              </div>
              <div>
                <span className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                  Αρχές Ηλεκτρονικής
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-500/30">
                    Α' ΕΠΑΛ
                  </span>
                </span>
                <span className="text-[11px] text-slate-600 dark:text-slate-400 block -mt-0.5 font-medium">
                  Διαδραστικό Εργαλείο Εκμάθησης & Προσομοιώσεων
                </span>
              </div>
            </div>

            {/* Navigation Tabs (Desktop) */}
            <nav className="hidden lg:flex items-center gap-1">
              <button
                onClick={() => setCurrentView('chapters')}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  currentView === 'chapters' || currentView === 'chapter-detail'
                    ? 'bg-cyan-100 text-cyan-900 dark:bg-slate-800 dark:text-cyan-400 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Διδακτική Ύλη</span>
              </button>

              <button
                onClick={() => setCurrentView('simulators')}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  currentView === 'simulators'
                    ? 'bg-cyan-100 text-cyan-900 dark:bg-slate-800 dark:text-cyan-400 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>Προσομοιωτές</span>
              </button>

              <button
                onClick={() => setCurrentView('datasheets')}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  currentView === 'datasheets'
                    ? 'bg-cyan-100 text-cyan-900 dark:bg-slate-800 dark:text-cyan-400 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Datasheets</span>
              </button>

              <button
                onClick={() => setCurrentView('glossary')}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  currentView === 'glossary'
                    ? 'bg-cyan-100 text-cyan-900 dark:bg-slate-800 dark:text-cyan-400 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
                }`}
              >
                <BookMarked className="w-4 h-4" />
                <span>Γλωσσάριο</span>
              </button>

              <button
                onClick={() => handleOpenQuiz()}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  currentView === 'quiz'
                    ? 'bg-cyan-100 text-cyan-900 dark:bg-slate-800 dark:text-cyan-400 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>Κουίζ & Τεστ</span>
              </button>
            </nav>

            {/* Header Right Actions: E-book & Theme Toggle */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                aria-label="Εναλλαγή θέματος"
                title={isDark ? 'Μετάβαση σε Φωτεινό Θέμα' : 'Μετάβαση σε Σκοτεινό Θέμα'}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer text-xs font-semibold shadow-xs"
              >
                {isDark ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span className="hidden sm:inline">Φωτεινό</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-indigo-600" />
                    <span className="hidden sm:inline">Σκοτεινό</span>
                  </>
                )}
              </button>

              <a
                href="https://ebooks.edu.gr/ebooks/v/pdf/8547/4692/24-0339-02_Stoicheia-Ilektronikis_A-EPAL_Vivlio-Mathiti-Emploutismeno/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors"
                title="Άνοιγμα επίσημου ψηφιακού βιβλίου ΕΠΑΛ (ΙΕΠ/ebooks.edu.gr)"
              >
                <BookOpen className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span className="hidden sm:inline">Βιβλίο ΙΕΠ</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>

          {/* Mobile Navigation bar */}
          <div className="lg:hidden flex items-center justify-around py-2.5 border-t border-slate-200 dark:border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setCurrentView('chapters')}
              className={`p-1.5 cursor-pointer transition-colors ${
                currentView === 'chapters' || currentView === 'chapter-detail'
                  ? 'text-cyan-700 dark:text-cyan-400 font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Ύλη
            </button>
            <button
              onClick={() => setCurrentView('simulators')}
              className={`p-1.5 cursor-pointer transition-colors ${
                currentView === 'simulators' ? 'text-cyan-700 dark:text-cyan-400 font-bold' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Προσομοιωτές
            </button>
            <button
              onClick={() => setCurrentView('datasheets')}
              className={`p-1.5 cursor-pointer transition-colors ${
                currentView === 'datasheets' ? 'text-cyan-700 dark:text-cyan-400 font-bold' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Datasheets
            </button>
            <button
              onClick={() => setCurrentView('glossary')}
              className={`p-1.5 cursor-pointer transition-colors ${
                currentView === 'glossary' ? 'text-cyan-700 dark:text-cyan-400 font-bold' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Γλωσσάριο
            </button>
            <button
              onClick={() => handleOpenQuiz()}
              className={`p-1.5 cursor-pointer transition-colors ${
                currentView === 'quiz' ? 'text-cyan-700 dark:text-cyan-400 font-bold' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Κουίζ
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* VIEW 1: CHAPTERS LIST (HOME) */}
        {currentView === 'chapters' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Hero Section */}
            <div className="relative rounded-3xl bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-cyan-950/40 border border-slate-200 dark:border-slate-800 p-6 md:p-10 shadow-md dark:shadow-2xl overflow-hidden transition-colors">
              <div className="max-w-3xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-500/10 border border-cyan-300 dark:border-cyan-500/30 text-cyan-900 dark:text-cyan-400 text-xs font-bold">
                  <GraduationCap className="w-4 h-4" />
                  <span>Επίσημο Αναλυτικό Πρόγραμμα Σπουδών • Τομέας Ηλεκτρολογίας & Ηλεκτρονικής</span>
                </div>

                <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                  Διαδραστικές Αρχές Ηλεκτρονικής
                </h1>

                <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                  Εκπαιδευτική εφαρμογή για τους μαθητές της <strong>Α' Τάξης ΕΠΑΛ</strong>. Καλύπτει πλήρως τη διδακτέα ύλη (Κεφάλαια 1, 2, 4, 5, 8) με θεωρία, διαδραστικούς προσομοιωτές κυκλωμάτων, ανάγνωση πραγματικών τεχνικών φυλλαδίων (datasheets), γλωσσάριο και ερωτήσεις αυτοαξιολόγησης.
                </p>

                {/* Metrics Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
                    <span className="text-xl font-extrabold font-mono text-cyan-700 dark:text-cyan-400 block">5</span>
                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">Κεφάλαια Ύλης</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
                    <span className="text-xl font-extrabold font-mono text-emerald-700 dark:text-emerald-400 block">5</span>
                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">Εικονικά Εργαστήρια</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
                    <span className="text-xl font-extrabold font-mono text-amber-700 dark:text-amber-400 block">{quizData.length}</span>
                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">Ερωτήσεις Κουίζ</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
                    <span className="text-xl font-extrabold font-mono text-purple-700 dark:text-purple-400 block">{datasheetsData.length}</span>
                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">Τεχνικά Φυλλάδια</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Filter / Search */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  Διδακτικές Ενότητες του Μαθήματος
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
                  Επιλέξτε κεφάλαιο για να μελετήσετε τη θεωρία και να ανοίξετε τα διαδραστικά εργαστήρια.
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Αναζήτηση στην ύλη..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-600 dark:focus:border-cyan-400 shadow-xs"
                />
              </div>
            </div>

            {/* Chapter Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredChapters.map((chapter) => (
                <div
                  key={chapter.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-cyan-500/60 dark:hover:border-cyan-500/40 hover:shadow-lg transition-all group shadow-sm"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-cyan-100 dark:bg-cyan-500/10 text-cyan-900 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/30">
                        ΚΕΦΑΛΑΙΟ {chapter.id}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        {chapter.sections.length} Ενότητες
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors">
                        {chapter.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-3 leading-relaxed">
                        {chapter.description}
                      </p>
                    </div>

                    {/* Objectives snippets */}
                    <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                        Βασικές Δεξιότητες:
                      </span>
                      {chapter.objectives?.skills?.slice(0, 2).map((skill, i) => (
                        <div key={i} className="text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                          <span className="text-cyan-600 dark:text-cyan-400 font-bold">•</span>
                          <span className="line-clamp-1">{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <button
                      onClick={() => handleOpenChapter(chapter.id)}
                      className="flex-1 py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                    >
                      <span>Μελέτη Θεωρίας</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleOpenSimulator(chapter.id)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer border border-slate-300 dark:border-slate-700"
                      title="Άνοιγμα Προσομοιωτή"
                    >
                      <Sliders className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    </button>

                    <button
                      onClick={() => handleOpenQuiz(chapter.id)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer border border-slate-300 dark:border-slate-700"
                      title="Κουίζ Κεφαλαίου"
                    >
                      <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 2: CHAPTER DETAIL VIEW */}
        {currentView === 'chapter-detail' && (
          <div className="animate-fadeIn">
            <ChapterDetail
              chapter={activeChapter}
              allChapterIds={allChapterIds}
              onBack={() => setCurrentView('chapters')}
              onOpenQuiz={(chId) => handleOpenQuiz(chId)}
              onNextChapter={(nextId) => setSelectedChapterId(nextId)}
              onPrevChapter={(prevId) => setSelectedChapterId(prevId)}
            />
          </div>
        )}

        {/* VIEW 3: SIMULATORS WORKBENCH */}
        {currentView === 'simulators' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm dark:shadow-xl">
              <div>
                <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-400 font-bold text-xs tracking-wider uppercase">
                  <Sliders className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  Εικονικό Εργαστήριο Ηλεκτρονικών
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  Διαδραστικοί Προσομοιωτές Κυκλωμάτων
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
                  Επιλέξτε εργαστήριο για να εκτελέσετε εικονικά πειράματα και να παρατηρήσετε κυματομορφές σε πραγματικό χρόνο.
                </p>
              </div>

              {/* Simulator Selector Tabs */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 1, title: 'Κεφ. 1: Ζώνες & N/P' },
                  { id: 2, title: 'Κεφ. 2: Δίοδοι & Zener' },
                  { id: 4, title: 'Κεφ. 4: SCR & Dimmer' },
                  { id: 5, title: 'Κεφ. 5: BJT & Ενισχυτής' },
                  { id: 8, title: 'Κεφ. 8: Πύλες & Δυαδικό' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedSimTab(tab.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedSimTab === tab.id
                        ? 'bg-cyan-600 text-white dark:bg-cyan-500 dark:text-slate-950 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    {tab.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Render active simulator */}
            <div>
              {selectedSimTab === 1 && <Chapter1Simulator />}
              {selectedSimTab === 2 && <Chapter2Simulator />}
              {selectedSimTab === 4 && <Chapter4Simulator />}
              {selectedSimTab === 5 && <Chapter5Simulator />}
              {selectedSimTab === 8 && <Chapter8Simulator />}
            </div>
          </div>
        )}

        {/* VIEW 4: DATASHEETS VIEWER */}
        {currentView === 'datasheets' && (
          <div className="animate-fadeIn">
            <DatasheetsViewer />
          </div>
        )}

        {/* VIEW 5: GLOSSARY VIEWER */}
        {currentView === 'glossary' && (
          <div className="animate-fadeIn">
            <GlossaryViewer
              onSelectChapter={(chId) => {
                setSelectedChapterId(chId);
                setCurrentView('chapter-detail');
              }}
            />
          </div>
        )}

        {/* VIEW 6: QUIZ & ASSESSMENT */}
        {currentView === 'quiz' && (
          <div className="animate-fadeIn">
            <QuizComponent
              initialChapterId={selectedChapterId}
              onNavigateToChapter={(chId) => {
                setSelectedChapterId(chId);
                setCurrentView('chapter-detail');
              }}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-8 text-xs text-slate-600 dark:text-slate-400 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div>
            <span className="font-bold text-slate-800 dark:text-slate-300 block">
              Αρχές Ηλεκτρονικής (Θεωρία)  •  Α' Τάξη ΕΠΑΛ  •  Αποστολίδης-Αφεντούλης Βασίλειος
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Βασισμένο στο εγκεκριμένο αναλυτικό πρόγραμμα σπουδών του ΙΕΠ και στο εμπλουτισμένο ψηφιακό βιβλίο μαθητή.
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium">
            <button
              onClick={() => setCurrentView('chapters')}
              className="text-slate-700 dark:text-slate-400 hover:text-cyan-700 dark:hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Διδακτική Ύλη
            </button>
            <button
              onClick={() => setCurrentView('simulators')}
              className="text-slate-700 dark:text-slate-400 hover:text-cyan-700 dark:hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Προσομοιωτές
            </button>
            <button
              onClick={() => setCurrentView('datasheets')}
              className="text-slate-700 dark:text-slate-400 hover:text-cyan-700 dark:hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Datasheets
            </button>
            <button
              onClick={() => setCurrentView('glossary')}
              className="text-slate-700 dark:text-slate-400 hover:text-cyan-700 dark:hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Γλωσσάριο
            </button>
            <button
              onClick={() => handleOpenQuiz()}
              className="text-slate-700 dark:text-slate-400 hover:text-cyan-700 dark:hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Κουίζ
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
