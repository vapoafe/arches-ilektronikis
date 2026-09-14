import React, { useState, useMemo } from 'react';
import { datasheetsData } from '../data/datasheetsData';
import { FileText, Search, Cpu, CheckCircle, Lightbulb, Tag } from 'lucide-react';

export const DatasheetsViewer: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Όλα');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedComponentId, setSelectedComponentId] = useState<string>(datasheetsData[0].id);

  const categories = ['Όλα', 'Δίοδοι', 'Ειδικές Δίοδοι', 'Θυρίστορ', 'Τρανζίστορ', 'Ψηφιακά Ολοκληρωμένα'];

  const filteredComponents = useMemo(() => {
    return datasheetsData.filter((c) => {
      const matchesCat = selectedCategory === 'Όλα' || c.category === selectedCategory;
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const activeComp = datasheetsData.find((c) => c.id === selectedComponentId) || datasheetsData[0];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-xl transition-colors">
        <div className="flex items-center gap-2 text-cyan-800 dark:text-cyan-400 font-bold text-xs tracking-wider uppercase">
          <FileText className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          Εργαστηριακός Οδηγός Τεχνικών Φυλλαδίων (Datasheets)
        </div>
        <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mt-1">
          Ανάγνωση & Ερμηνεία Φυλλαδίων Κατασκευαστών
        </h3>
        <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 max-w-3xl leading-relaxed">
          Σύμφωνα με τους εκπαιδευτικούς στόχους του μαθήματος, οι μαθητές του ΕΠΑΛ μαθαίνουν να εντοπίζουν και να ερμηνεύουν τα κρίσιμα τεχνικά μεγέθη (τάσεις αντοχής, ρεύματα, κέρδος hFE, ισχύ) στα πραγματικά εξαρτήματα.
        </p>

        {/* Search & Filter Bar */}
        <div className="mt-5 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Αναζήτηση εξαρτήματος (π.χ. 1N4007, BC547, SCR)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-600 dark:focus:border-cyan-400 shadow-xs"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Left component list, Right component detailed datasheet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Component Selector List */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider px-1">
            Επιλέξτε Εξάρτημα ({filteredComponents.length})
          </div>
          <div className="space-y-2">
            {filteredComponents.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedComponentId(item.id)}
                className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-start justify-between gap-3 cursor-pointer ${
                  selectedComponentId === item.id
                    ? 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-500 text-slate-900 dark:text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div>
                  <span className="font-bold text-sm block text-slate-900 dark:text-white">{item.name}</span>
                  <span className="text-[11px] text-cyan-800 dark:text-cyan-400 font-mono mt-0.5 block font-semibold">
                    {item.category} • Κεφάλαιο {item.chapterId}
                  </span>
                </div>
                <Cpu className={`w-4 h-4 shrink-0 mt-1 ${selectedComponentId === item.id ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400 dark:text-slate-600'}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Datasheet Display Card */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm dark:shadow-xl transition-colors">
          {/* Header of the Active Datasheet */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-cyan-100 dark:bg-cyan-950 text-cyan-900 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/30 text-[11px] font-mono font-bold uppercase">
                  {activeComp.category}
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
                  Κεφάλαιο {activeComp.chapterId}
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">{activeComp.name}</h2>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">{activeComp.description}</p>
            </div>

            <div className="text-right text-xs text-slate-700 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 self-start sm:self-center">
              <span className="block text-slate-500 text-[10px] uppercase font-bold">Κέλυφος (Package)</span>
              <span className="font-mono text-slate-900 dark:text-white font-bold">{activeComp.packageType}</span>
            </div>
          </div>

          {/* Pinout / Terminals Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Tag className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              Ακροδέκτες & Συνδεσμολογία (Pinout)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {activeComp.pinout.map((p, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
                  <div className="font-bold text-cyan-800 dark:text-cyan-400 font-mono mb-1">{p.name}</div>
                  <div className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">{p.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Specifications Table */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Βασικά Τεχνικά Χαρακτηριστικά (Absolute Maximum Ratings & Specs)
            </h4>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-300 uppercase font-mono font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Παράμετρος</th>
                    <th className="p-3 text-center">Σύμβολο</th>
                    <th className="p-3 text-cyan-800 dark:text-cyan-300">Τιμή Datasheet</th>
                    <th className="p-3 text-slate-700 dark:text-slate-400">Σημασία για τον Τεχνικό</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {activeComp.specs.map((s, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{s.parameter}</td>
                      <td className="p-3 text-center font-mono font-bold text-amber-800 dark:text-amber-400">{s.symbol}</td>
                      <td className="p-3 font-mono font-extrabold text-cyan-900 dark:text-cyan-300">{s.value}</td>
                      <td className="p-3 text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">{s.meaning}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Practical Technician Tip */}
          <div className="p-4 bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-500/30 rounded-2xl text-xs text-slate-800 dark:text-cyan-200 flex items-start gap-3 shadow-xs">
            <Lightbulb className="w-5 h-5 text-cyan-700 dark:text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white block mb-1 font-bold">
                Συμβουλή Εργαστηρίου & Εξετάσεων ΕΠΑΛ:
              </strong>
              {activeComp.practicalTip}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
