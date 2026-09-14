import React, { useState, useMemo } from 'react';
import { glossaryData } from '../data/glossaryData';
import { BookMarked, Search, Lightbulb } from 'lucide-react';

interface GlossaryViewerProps {
  onSelectChapter?: (chId: number) => void;
}

export const GlossaryViewer: React.FC<GlossaryViewerProps> = ({ onSelectChapter }) => {
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredTerms = useMemo(() => {
    return glossaryData.filter((item) => {
      const matchChapter = selectedChapter === null || item.chapterId === selectedChapter;
      const matchSearch =
        item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.example && item.example.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchChapter && matchSearch;
    });
  }, [selectedChapter, searchQuery]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-xl transition-colors">
        <div className="flex items-center gap-2 text-cyan-800 dark:text-cyan-400 font-bold text-xs tracking-wider uppercase">
          <BookMarked className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          Ηλεκτρονικό Λεξικό & Ορολογία Αρχών Ηλεκτρονικής
        </div>
        <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mt-1">
          Γλωσσάριο Βασικών Εννοιών & Ορισμών ΕΠΑΛ
        </h3>
        <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 max-w-3xl leading-relaxed">
          Αναζητήστε και εμπεδώστε τους επίσημους επιστημονικούς ορισμούς και τις πρακτικές έννοιες της ύλης για τις εξετάσεις και το εργαστήριο.
        </p>

        {/* Search & Filter Bar */}
        <div className="mt-5 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Αναζήτηση όρου (π.χ. οπή, Zener, κόρος, θυρίστορ)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-600 dark:focus:border-cyan-400 shadow-xs"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setSelectedChapter(null)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedChapter === null
                  ? 'bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200'
              }`}
            >
              Όλα ({glossaryData.length})
            </button>
            {[1, 2, 4, 5, 8].map((ch) => (
              <button
                key={ch}
                onClick={() => setSelectedChapter(ch)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedChapter === ch
                    ? 'bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200'
                }`}
              >
                Κεφ. {ch}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Glossary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTerms.map((item, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 hover:border-cyan-500/60 transition-all flex flex-col justify-between shadow-sm dark:shadow-md"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-slate-900 dark:text-white tracking-wide">
                  {item.term}
                </span>
                <span
                  onClick={() => onSelectChapter && onSelectChapter(item.chapterId)}
                  className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] text-cyan-800 dark:text-cyan-400 font-mono font-bold hover:border-cyan-600 cursor-pointer transition-colors"
                  title="Μετάβαση στη θεωρία του κεφαλαίου"
                >
                  Κεφάλαιο {item.chapterId}
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {item.definition}
              </p>
            </div>

            {item.example && (
              <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-start gap-2 text-[11px] text-slate-800 dark:text-cyan-300">
                <Lightbulb className="w-4 h-4 text-cyan-700 dark:text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-900 dark:text-white">Παράδειγμα:</strong> {item.example}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredTerms.length === 0 && (
        <div className="text-center py-12 text-slate-500 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl">
          Δεν βρέθηκε όρος που να ταιριάζει με την αναζήτηση "{searchQuery}".
        </div>
      )}
    </div>
  );
};
