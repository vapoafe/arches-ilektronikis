import React, { useState, useMemo } from 'react';
import { QuizQuestion, ChapterId } from '../types';
import { quizData } from '../data/quizData';
import {
  CheckCircle,
  XCircle,
  RotateCcw,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Award,
  Filter
} from 'lucide-react';

interface QuizProps {
  initialChapterId?: number;
  onNavigateToChapter?: (chapterId: number) => void;
}

export const QuizComponent: React.FC<QuizProps> = ({ initialChapterId, onNavigateToChapter }) => {
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(initialChapterId || null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Filter questions based on selected chapter
  const filteredQuestions: QuizQuestion[] = useMemo(() => {
    if (!selectedChapterId) {
      return quizData;
    }
    return quizData.filter((q) => q.chapterId === selectedChapterId);
  }, [selectedChapterId]);

  const currentQ = filteredQuestions[currentIndex] || filteredQuestions[0];

  const handleSelectOption = (optionIndex: number) => {
    if (selectedAnswers[currentQ.id] !== undefined) return; // already answered
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionIndex
    }));
    setShowExplanation(true);
  };

  const handleNext = () => {
    setShowExplanation(false);
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setShowExplanation(selectedAnswers[filteredQuestions[currentIndex - 1].id] !== undefined);
    }
  };

  const handleRestart = () => {
    setSelectedAnswers({});
    setCurrentIndex(0);
    setShowExplanation(false);
    setIsFinished(false);
  };

  // Calculate score
  const scoreStats = useMemo(() => {
    let correct = 0;
    filteredQuestions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correct++;
      }
    });
    const total = filteredQuestions.length;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { correct, total, percentage };
  }, [filteredQuestions, selectedAnswers]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Chapter Selection Filter Tabs */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
          <Filter className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span>Επιλογή Ενότητας:</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => {
              setSelectedChapterId(null);
              handleRestart();
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              selectedChapterId === null
                ? 'bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200'
            }`}
          >
            Όλα ({quizData.length})
          </button>
          {[1, 2, 4, 5, 8].map((chId) => {
            const count = quizData.filter((q) => q.chapterId === chId).length;
            return (
              <button
                key={chId}
                onClick={() => {
                  setSelectedChapterId(chId);
                  handleRestart();
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  selectedChapterId === chId
                    ? 'bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200'
                }`}
              >
                Κεφ. {chId} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Quiz Box */}
      {!isFinished && currentQ ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm dark:shadow-xl space-y-6">
          {/* Progress bar and counter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <span className="font-bold text-cyan-700 dark:text-cyan-400 uppercase tracking-wider">
                Κεφάλαιο {currentQ.chapterId} • Ερώτηση {currentIndex + 1} από {filteredQuestions.length}
              </span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                Βαθμολογία: {scoreStats.correct} / {Object.keys(selectedAnswers).length}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-500 dark:to-blue-500 transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / filteredQuestions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`text-[11px] px-2 py-0.5 rounded-lg font-mono uppercase font-bold ${
                currentQ.difficulty === 'Προχωρημένο'
                  ? 'bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-500/40 text-rose-800 dark:text-rose-300'
                  : currentQ.difficulty === 'Μεσαίο'
                  ? 'bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-500/40 text-amber-800 dark:text-amber-300'
                  : 'bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300'
              }`}>
                {currentQ.difficulty}
              </span>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white leading-snug">
              {currentQ.question}
            </h3>
          </div>

          {/* Multiple Choice Options */}
          <div className="space-y-3">
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedAnswers[currentQ.id] === idx;
              const hasAnswered = selectedAnswers[currentQ.id] !== undefined;
              const isCorrect = idx === currentQ.correctIndex;

              let btnStyle = 'bg-slate-50 dark:bg-slate-950/80 border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/60';

              if (hasAnswered) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-100 dark:bg-emerald-950/50 border-emerald-500 text-emerald-950 dark:text-emerald-200 font-bold';
                } else if (isSelected) {
                  btnStyle = 'bg-rose-100 dark:bg-rose-950/50 border-rose-500 text-rose-950 dark:text-rose-200 font-bold';
                } else {
                  btnStyle = 'bg-slate-100/60 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800/60 text-slate-500 dark:text-slate-500 opacity-60';
                }
              }

              return (
                <button
                  key={idx}
                  disabled={hasAnswered}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full p-4 rounded-xl border text-left text-sm transition-all flex items-center justify-between gap-3 cursor-pointer ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-xs font-mono font-bold text-slate-700 dark:text-slate-300 shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="leading-relaxed">{option}</span>
                  </div>

                  {hasAnswered && (
                    <div>
                      {isCorrect && <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                      {isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Box */}
          {showExplanation && (
            <div
              className={`p-4 rounded-xl border text-xs leading-relaxed space-y-2 animate-fadeIn ${
                selectedAnswers[currentQ.id] === currentQ.correctIndex
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-500/40 text-emerald-950 dark:text-emerald-200'
                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-500/40 text-amber-950 dark:text-amber-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
                  {selectedAnswers[currentQ.id] === currentQ.correctIndex ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Σωστή Απάντηση!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                      <span>Επεξήγηση Ορθής Απάντησης:</span>
                    </>
                  )}
                </span>
                <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400">
                  {currentQ.bookRef}
                </span>
              </div>
              <p className="text-slate-800 dark:text-slate-300 text-xs leading-relaxed">{currentQ.explanation}</p>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Προηγούμενη</span>
            </button>

            {onNavigateToChapter && (
              <button
                onClick={() => onNavigateToChapter(currentQ.chapterId)}
                className="hidden sm:flex items-center gap-1.5 text-xs text-cyan-700 dark:text-cyan-400 hover:underline font-bold"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Μελέτη Θεωρίας Κεφ. {currentQ.chapterId}</span>
              </button>
            )}

            <button
              onClick={handleNext}
              disabled={selectedAnswers[currentQ.id] === undefined}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-cyan-600 hover:bg-cyan-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all shadow-sm"
            >
              <span>{currentIndex === filteredQuestions.length - 1 ? 'Ολοκλήρωση' : 'Επόμενη'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : isFinished ? (
        /* Results Card */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-6 shadow-sm dark:shadow-xl animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 flex items-center justify-center mx-auto">
            <Award className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              Ολοκληρώσατε το Κουίζ!
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {scoreStats.percentage >= 80
                ? 'Εξαιρετική επίδοση! Έχετε κατανοήσει πλήρως τις έννοιες του μαθήματος.'
                : scoreStats.percentage >= 50
                ? 'Καλή προσπάθεια! Μπορείτε να μελετήσετε ξανά τις ενότητες για ακόμη καλύτερο αποτέλεσμα.'
                : 'Χρειάζεται περισσότερη επανάληψη στη θεωρία και στα παραδείγματα του βιβλίου.'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-xl font-bold font-mono text-cyan-700 dark:text-cyan-400 block">{scoreStats.correct}</span>
              <span className="text-[11px] text-slate-600 dark:text-slate-400">Σωστές</span>
            </div>
            <div>
              <span className="text-xl font-bold font-mono text-slate-800 dark:text-slate-300 block">
                {scoreStats.total - scoreStats.correct}
              </span>
              <span className="text-[11px] text-slate-600 dark:text-slate-400">Λάθη</span>
            </div>
            <div>
              <span className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400 block">
                {scoreStats.percentage}%
              </span>
              <span className="text-[11px] text-slate-600 dark:text-slate-400">Ποσοστό</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleRestart}
              className="flex items-center gap-2 px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold rounded-xl text-xs transition-all shadow-sm cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Επανάληψη Τεστ</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};
