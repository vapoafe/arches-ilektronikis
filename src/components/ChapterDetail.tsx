import React, { useState } from 'react';
import { Chapter } from '../types';
import { Chapter1Simulator } from './simulators/Chapter1Simulator';
import { Chapter2Simulator } from './simulators/Chapter2Simulator';
import { Chapter4Simulator } from './simulators/Chapter4Simulator';
import { Chapter5Simulator } from './simulators/Chapter5Simulator';
import { Chapter8Simulator } from './simulators/Chapter8Simulator';
import {
  BookOpen,
  CheckCircle2,
  HelpCircle,
  ArrowLeft,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Lightbulb,
  GraduationCap,
  Clock,
  Key
} from 'lucide-react';

interface ChapterDetailProps {
  chapter: Chapter;
  onBack: () => void;
  onOpenQuiz: (chapterId: number) => void;
  onNextChapter?: (nextId: number) => void;
  onPrevChapter?: (prevId: number) => void;
  allChapterIds: number[];
}

export const ChapterDetail: React.FC<ChapterDetailProps> = ({
  chapter,
  onBack,
  onOpenQuiz,
  onNextChapter,
  onPrevChapter,
  allChapterIds
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(chapter.sections[0]?.id || null);

  const currentIndex = allChapterIds.indexOf(chapter.id);
  const prevChapterId = currentIndex > 0 ? allChapterIds[currentIndex - 1] : null;
  const nextChapterId = currentIndex < allChapterIds.length - 1 ? allChapterIds[currentIndex + 1] : null;

  // Render the corresponding simulator
  const renderSimulator = () => {
    switch (chapter.id) {
      case 1:
        return <Chapter1Simulator />;
      case 2:
        return <Chapter2Simulator />;
      case 4:
        return <Chapter4Simulator />;
      case 5:
        return <Chapter5Simulator />;
      case 8:
        return <Chapter8Simulator />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 px-3.5 py-2 rounded-xl shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Επιστροφή στα Κεφάλαια</span>
        </button>

        <div className="flex items-center gap-2">
          {prevChapterId && onPrevChapter && (
            <button
              onClick={() => onPrevChapter(prevChapterId)}
              className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 transition-colors cursor-pointer shadow-xs"
            >
              ← Κεφ. {prevChapterId}
            </button>
          )}
          {nextChapterId && onNextChapter && (
            <button
              onClick={() => onNextChapter(nextChapterId)}
              className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 transition-colors cursor-pointer shadow-xs"
            >
              Κεφ. {nextChapterId} →
            </button>
          )}
        </div>
      </div>

      {/* Chapter Hero Card */}
      <div className="bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm dark:shadow-2xl relative overflow-hidden space-y-5 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-500/10 border border-cyan-300 dark:border-cyan-500/30 text-cyan-900 dark:text-cyan-400 text-xs font-bold font-mono uppercase tracking-wider">
                {chapter.code} • Αναλυτικό Πρόγραμμα
              </span>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1 border border-slate-200 dark:border-slate-700">
                <Clock className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                {chapter.hours} Διδακτικές Ώρες
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">
              {chapter.title}
            </h1>
            <p className="text-xs md:text-sm text-cyan-800 dark:text-cyan-300 font-semibold mt-1">
              {chapter.subtitle}
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 max-w-3xl leading-relaxed">
              {chapter.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => onOpenQuiz(chapter.id)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-500 dark:to-blue-500 hover:from-cyan-500 hover:to-blue-500 text-white dark:text-slate-950 font-bold rounded-xl text-xs md:text-sm transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Κουίζ Κεφαλαίου</span>
            </button>

            <a
              href="https://ebooks.edu.gr/ebooks/v/pdf/8547/4692/24-0339-02_Stoicheia-Ilektronikis_A-EPAL_Vivlio-Mathiti-Emploutismeno/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 hover:text-slate-950 dark:text-slate-200 dark:hover:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer border border-slate-300 dark:border-slate-700"
            >
              <BookOpen className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Βιβλίο: {chapter.textbookPages}</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        </div>

        {/* Curriculum Objectives Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800/80">
          <div className="bg-cyan-50/70 dark:bg-slate-950/60 border border-cyan-200 dark:border-slate-800 p-4 rounded-2xl space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-900 dark:text-cyan-400 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-cyan-700 dark:text-cyan-400" />
              Στόχοι Γνώσεων:
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-800 dark:text-slate-300 font-medium">
              {chapter.objectives?.knowledge?.map((obj, i) => (
                <li key={i} className="flex items-start gap-2 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400 shrink-0 mt-1.5" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-emerald-50/70 dark:bg-slate-950/60 border border-emerald-200 dark:border-slate-800 p-4 rounded-2xl space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              Δεξιότητες & Εργαστήριο:
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-800 dark:text-slate-300 font-medium">
              {chapter.objectives?.skills?.map((skill, i) => (
                <li key={i} className="flex items-start gap-2 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 shrink-0 mt-1.5" />
                  <span>{skill}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-purple-50/70 dark:bg-slate-950/60 border border-purple-200 dark:border-slate-800 p-4 rounded-2xl space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900 dark:text-purple-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-purple-700 dark:text-purple-400" />
              Ικανότητες & Εφαρμογές:
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-800 dark:text-slate-300 font-medium">
              {chapter.objectives?.abilities?.map((ab, i) => (
                <li key={i} className="flex items-start gap-2 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600 dark:bg-purple-400 shrink-0 mt-1.5" />
                  <span>{ab}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Embedded Chapter Simulator */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-600 dark:bg-cyan-400 animate-ping" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Διαδραστικός Προσομοιωτής & Πειράματα Κεφαλαίου {chapter.id}
          </h3>
        </div>
        {renderSimulator()}
      </div>

      {/* Sections Accordion / Detailed Theory */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            Αναλυτική Θεωρία & Διδακτικές Ενότητες ({chapter.sections.length})
          </h3>
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            Πατήστε σε μια ενότητα για ανάπτυξη
          </span>
        </div>

        <div className="space-y-3">
          {chapter.sections.map((section) => {
            const isExpanded = expandedSection === section.id;

            return (
              <div
                key={section.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-all shadow-sm"
              >
                {/* Accordion Header */}
                <button
                  onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                  className="w-full p-4 md:p-5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-cyan-700 dark:text-cyan-400">
                        {section.code}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                        {section.hours} ώρες
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">{section.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">{section.summary}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {/* Accordion Content */}
                {isExpanded && (
                  <div className="p-5 md:p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 space-y-6 animate-fadeIn">
                    {/* Summary box */}
                    <div className="p-4 bg-white dark:bg-slate-900/90 border-l-4 border-cyan-600 dark:border-cyan-500 rounded-r-xl text-xs text-slate-800 dark:text-slate-300 shadow-xs">
                      <strong className="text-cyan-800 dark:text-cyan-400 block mb-1 font-bold">Σύνοψη Ενότητας:</strong>
                      <p className="leading-relaxed">{section.summary}</p>
                    </div>

                    {/* Main Content Paragraphs */}
                    <div className="space-y-3.5 text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
                      {section.content.map((p, idx) => (
                        <p key={idx} className="whitespace-pre-line leading-relaxed">{p}</p>
                      ))}
                    </div>

                    {/* Key Terms / Definitions in this section */}
                    {section.keyTerms && section.keyTerms.length > 0 && (
                      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2.5 shadow-xs">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-cyan-800 dark:text-cyan-400 flex items-center gap-2">
                          <Key className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                          Βασικοί Όροι & Έννοιες:
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          {section.keyTerms.map((item, idx) => (
                            <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
                              <span className="font-bold text-slate-900 dark:text-white block mb-1">{item.term}</span>
                              <span className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px] block">{item.explanation}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Real-world Application Example */}
                    {section.realWorldExample && (
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30 rounded-xl text-xs text-slate-800 dark:text-emerald-200 space-y-2 shadow-xs">
                        <div className="flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-400">
                          <Lightbulb className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Πραγματική Εφαρμογή: {section.realWorldExample.title}</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                          {section.realWorldExample.description}
                        </p>
                        <div className="pt-2 border-t border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-mono text-[11px]">
                          <strong>Πού χρησιμοποιείται:</strong> {section.realWorldExample.application}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA to test knowledge */}
      <div className="bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-950/60 dark:to-blue-950/60 border border-cyan-300 dark:border-cyan-500/30 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div>
          <h4 className="text-lg font-bold text-slate-900 dark:text-white">
            Ολοκληρώσατε τη μελέτη του Κεφαλαίου {chapter.id};
          </h4>
          <p className="text-xs text-slate-700 dark:text-cyan-200 mt-1 font-medium">
            Δοκιμάστε τις γνώσεις σας με τις ερωτήσεις κουίζ του επίσημου βιβλίου και δείτε αναλυτική εξήγηση για κάθε απάντηση.
          </p>
        </div>

        <button
          onClick={() => onOpenQuiz(chapter.id)}
          className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold rounded-xl text-sm transition-all shadow-md shadow-cyan-500/20 shrink-0 cursor-pointer"
        >
          Έναρξη Κουίζ Κεφαλαίου {chapter.id}
        </button>
      </div>
    </div>
  );
};
