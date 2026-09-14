import React, { useState, useMemo } from 'react';
import { Sun, Flame, Atom, Zap, Info, RefreshCw } from 'lucide-react';

export const Chapter1Simulator: React.FC = () => {
  const [material, setMaterial] = useState<'si' | 'ge' | 'conductor' | 'insulator'>('si');
  const [doping, setDoping] = useState<'intrinsic' | 'n-type' | 'p-type'>('intrinsic');
  const [temperature, setTemperature] = useState<number>(300); // Kelvin (room temp)
  const [lightLux, setLightLux] = useState<number>(100); // Lux

  // Calculate physical characteristics based on parameters
  const stats = useMemo(() => {
    let eg = 1.12; // eV for Si
    let materialName = 'Πυρίτιο (Si)';
    let color = 'text-cyan-700 dark:text-cyan-400';

    if (material === 'ge') {
      eg = 0.67;
      materialName = 'Γερμάνιο (Ge)';
      color = 'text-emerald-700 dark:text-emerald-400';
    } else if (material === 'conductor') {
      eg = 0.0;
      materialName = 'Αγωγός (Χαλκός Cu)';
      color = 'text-amber-700 dark:text-amber-400';
    } else if (material === 'insulator') {
      eg = 6.0;
      materialName = 'Μονωτής (Γυαλί/Πλαστικό)';
      color = 'text-rose-700 dark:text-rose-400';
    }

    // Thermal generation factor
    const tempCelsius = temperature - 273;
    const thermalGen = Math.max(0, Math.exp((temperature - 200) / 45));

    // Light generation factor
    const lightGen = (lightLux / 100) * 8;

    // Carrier calculations
    let electrons = 0;
    let holes = 0;
    let majorityCarrier = 'Κανένας (Ισορροπία)';
    let minorityCarrier = 'Κανένας';
    let resistanceOhms = 100000;

    if (material === 'conductor') {
      electrons = 100;
      holes = 0;
      majorityCarrier = 'Ελεύθερα Ηλεκτρόνια (άφθονα)';
      minorityCarrier = 'Δεν υπάρχουν οπές';
      // Conductor resistance INCREASES with temperature (PTC behavior)
      resistanceOhms = 1.5 * (1 + 0.004 * tempCelsius);
    } else if (material === 'insulator') {
      electrons = 0;
      holes = 0;
      majorityCarrier = 'Κανένας (δεσμευμένα όλα)';
      minorityCarrier = 'Κανένας';
      resistanceOhms = 1e9;
    } else {
      // Semiconductor
      const baseThermal = Math.floor(thermalGen * (material === 'ge' ? 1.8 : 1.0));
      const baseLight = Math.floor(lightGen * (material === 'ge' ? 1.5 : 1.0));
      const intrinsicCount = Math.max(1, baseThermal + baseLight);

      if (doping === 'intrinsic') {
        electrons = intrinsicCount;
        holes = intrinsicCount;
        majorityCarrier = 'Ίσος αριθμός (ni = pi)';
        minorityCarrier = 'Καμία υπεροχή';
        resistanceOhms = Math.max(200, Math.round(500000 / (intrinsicCount * 2 + 1)));
      } else if (doping === 'n-type') {
        const donorDoping = 60;
        electrons = donorDoping + intrinsicCount;
        holes = Math.max(1, Math.floor(intrinsicCount * 0.2));
        majorityCarrier = 'Ηλεκτρόνια (e⁻)';
        minorityCarrier = 'Οπές (h⁺)';
        resistanceOhms = Math.max(50, Math.round(20000 / (electrons * 1.5)));
      } else if (doping === 'p-type') {
        const acceptorDoping = 60;
        holes = acceptorDoping + intrinsicCount;
        electrons = Math.max(1, Math.floor(intrinsicCount * 0.2));
        majorityCarrier = 'Οπές (h⁺)';
        minorityCarrier = 'Ηλεκτρόνια (e⁻)';
        resistanceOhms = Math.max(60, Math.round(25000 / (holes * 1.2)));
      }
    }

    return {
      eg,
      materialName,
      color,
      electrons,
      holes,
      majorityCarrier,
      minorityCarrier,
      resistanceOhms: resistanceOhms > 1000000 ? `${(resistanceOhms / 1e6).toFixed(1)} MΩ` : resistanceOhms > 1000 ? `${(resistanceOhms / 1000).toFixed(1)} kΩ` : `${resistanceOhms.toFixed(1)} Ω`,
      tempCelsius,
      isSemiconductor: material === 'si' || material === 'ge'
    };
  }, [material, doping, temperature, lightLux]);

  const handleReset = () => {
    setMaterial('si');
    setDoping('intrinsic');
    setTemperature(300);
    setLightLux(100);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-sm dark:shadow-xl space-y-6 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-800 dark:text-cyan-400 font-bold text-xs tracking-wider uppercase">
            <Atom className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            Διαδραστικό Εργαστήριο Κεφαλαίου 1
          </div>
          <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mt-1">
            Ζώνες Ενέργειας & Εμπλουτισμός Ημιαγωγών (N & P)
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Εξερευνήστε τη ζώνη αγωγιμότητας, το ενεργειακό χάσμα (Eg) και πώς η θερμοκρασία και οι προσμίξεις δημιουργούν ελεύθερα ηλεκτρόνια και οπές.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors self-start sm:self-center cursor-pointer shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Επαναφορά</span>
        </button>
      </div>

      {/* Control Panel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Material Selection */}
        <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-2.5 shadow-xs">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider block">
            1. Επιλογή Υλικού
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => setMaterial('si')}
              className={`px-2.5 py-2 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                material === 'si'
                  ? 'bg-cyan-100 dark:bg-cyan-500/20 border-cyan-500 text-cyan-900 dark:text-cyan-300 shadow-xs'
                  : 'bg-white dark:bg-slate-800/60 border-slate-300 dark:border-slate-700/50 text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Πυρίτιο (Si)
            </button>
            <button
              onClick={() => setMaterial('ge')}
              className={`px-2.5 py-2 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                material === 'ge'
                  ? 'bg-emerald-100 dark:bg-emerald-500/20 border-emerald-500 text-emerald-900 dark:text-emerald-300 shadow-xs'
                  : 'bg-white dark:bg-slate-800/60 border-slate-300 dark:border-slate-700/50 text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Γερμάνιο (Ge)
            </button>
            <button
              onClick={() => setMaterial('conductor')}
              className={`px-2.5 py-2 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                material === 'conductor'
                  ? 'bg-amber-100 dark:bg-amber-500/20 border-amber-500 text-amber-900 dark:text-amber-300 shadow-xs'
                  : 'bg-white dark:bg-slate-800/60 border-slate-300 dark:border-slate-700/50 text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Αγωγός (Cu)
            </button>
            <button
              onClick={() => setMaterial('insulator')}
              className={`px-2.5 py-2 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                material === 'insulator'
                  ? 'bg-rose-100 dark:bg-rose-500/20 border-rose-500 text-rose-900 dark:text-rose-300 shadow-xs'
                  : 'bg-white dark:bg-slate-800/60 border-slate-300 dark:border-slate-700/50 text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Μονωτής
            </button>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 italic font-medium">
            Eg: {stats.eg === 0 ? '0 eV (επικάλυψη)' : `${stats.eg} eV`}
          </p>
        </div>

        {/* Doping Selection */}
        <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-2.5 shadow-xs">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider block">
            2. Εμπλουτισμός (Doping)
          </label>
          {stats.isSemiconductor ? (
            <div className="space-y-1.5">
              <button
                onClick={() => setDoping('intrinsic')}
                className={`w-full px-2.5 py-1.5 text-xs font-bold rounded-xl border text-left transition-all cursor-pointer ${
                  doping === 'intrinsic'
                    ? 'bg-indigo-100 dark:bg-indigo-500/20 border-indigo-500 text-indigo-900 dark:text-indigo-300 shadow-xs'
                    : 'bg-white dark:bg-slate-800/60 border-slate-300 dark:border-slate-700/50 text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Ενδογενής (Καθαρός Si/Ge)
              </button>
              <button
                onClick={() => setDoping('n-type')}
                className={`w-full px-2.5 py-1.5 text-xs font-bold rounded-xl border text-left transition-all cursor-pointer ${
                  doping === 'n-type'
                    ? 'bg-blue-100 dark:bg-blue-500/20 border-blue-500 text-blue-900 dark:text-blue-300 shadow-xs'
                    : 'bg-white dark:bg-slate-800/60 border-slate-300 dark:border-slate-700/50 text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Τύπου N (Δότες: Φώσφορος P)
              </button>
              <button
                onClick={() => setDoping('p-type')}
                className={`w-full px-2.5 py-1.5 text-xs font-bold rounded-xl border text-left transition-all cursor-pointer ${
                  doping === 'p-type'
                    ? 'bg-rose-100 dark:bg-rose-500/20 border-rose-500 text-rose-900 dark:text-rose-300 shadow-xs'
                    : 'bg-white dark:bg-slate-800/60 border-slate-300 dark:border-slate-700/50 text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Τύπου P (Αποδέκτες: Βόριο B)
              </button>
            </div>
          ) : (
            <div className="h-24 flex items-center justify-center text-xs text-slate-500 italic text-center p-2">
              Ο εμπλουτισμός εφαρμόζεται μόνο σε ημιαγωγούς (Si/Ge).
            </div>
          )}
        </div>

        {/* Temperature Slider */}
        <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-500" />
              3. Θερμοκρασία (T)
            </label>
            <span className="text-xs font-mono font-bold text-orange-700 dark:text-orange-400">
              {temperature} K ({stats.tempCelsius}°C)
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="450"
            step="10"
            value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
            className="w-full accent-orange-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-600 dark:text-slate-400 font-mono font-semibold">
            <span>0 K (-273°C)</span>
            <span>300 K (27°C)</span>
            <span>450 K (177°C)</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            {temperature === 0
              ? 'Στο 0 Kelvin: ο ημιαγωγός είναι απόλυτος μονωτής!'
              : 'Όσο αυξάνεται η Τ, σπάνε δεσμοί και παράγονται φορείς (NTC).'}
          </p>
        </div>

        {/* Light Level Slider */}
        <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-500" />
              4. Φωτεινότητα (LDR)
            </label>
            <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400">
              {lightLux} Lux
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1000"
            step="20"
            value={lightLux}
            onChange={(e) => setLightLux(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-600 dark:text-slate-400 font-mono font-semibold">
            <span>0 (Σκοτάδι)</span>
            <span>500 (Δωμάτιο)</span>
            <span>1000 (Ήλιος)</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            Φωτόνια δίνουν ενέργεια h·f &gt; Eg, εκτινάσσοντας ηλεκτρόνια στην αγωγιμότητα.
          </p>
        </div>
      </div>

      {/* Visual Simulation Display Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Energy Band Graphic */}
        <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              Ενεργειακό Διάγραμμα Ζωνών
            </h4>
            <span className="text-xs px-2.5 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-cyan-800 dark:text-cyan-300 font-mono font-bold">
              Eg = {stats.eg} eV
            </span>
          </div>

          <div className="w-full h-56 relative bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 p-2 overflow-hidden flex flex-col justify-between shadow-inner">
            {/* Conduction Band */}
            <div className="relative bg-emerald-100/80 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/40 rounded-lg p-2 h-16 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[11px] font-bold text-emerald-900 dark:text-emerald-400">
                <span>ΖΩΝΗ ΑΓΩΓΙΜΟΤΗΤΑΣ (Conduction Band)</span>
                <span>{stats.electrons} Ελεύθερα e⁻</span>
              </div>
              <div className="flex flex-wrap gap-1 items-center overflow-hidden max-h-8">
                {Array.from({ length: Math.min(24, stats.electrons) }).map((_, i) => (
                  <span
                    key={`e-${i}`}
                    className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-cyan-600 dark:bg-cyan-400 text-white dark:text-slate-950 font-bold text-[9px] shadow-xs animate-pulse"
                    title="Ελεύθερο Ηλεκτρόνιο (e⁻)"
                  >
                    e⁻
                  </span>
                ))}
                {stats.electrons > 24 && (
                  <span className="text-[10px] text-cyan-800 dark:text-cyan-300 font-mono font-bold">
                    +{stats.electrons - 24}
                  </span>
                )}
                {stats.electrons === 0 && (
                  <span className="text-xs text-slate-500 italic">
                    Κανένα ελεύθερο ηλεκτρόνιο (μονωτική συμπεριφορά)
                  </span>
                )}
              </div>
            </div>

            {/* Forbidden Gap (Energy Gap) */}
            <div className="relative flex items-center justify-center my-1 border-y border-dashed border-rose-300 dark:border-rose-500/30 bg-rose-50/80 dark:bg-rose-950/20 py-2 rounded-lg">
              <div className="text-center">
                <span className="text-xs font-bold text-rose-900 dark:text-rose-300 block">
                  Απαγορευμένη Ζώνη (Energy Gap)
                </span>
                <span className="text-[11px] font-mono text-rose-800 dark:text-rose-400 font-bold">
                  {stats.eg === 0
                    ? 'Eg = 0 eV (Επικάλυψη Ζωνών -> Τέλειος Αγωγός)'
                    : stats.eg > 5
                    ? 'Eg > 5 eV (Τεράστιο Χάσμα -> Μονωτής)'
                    : `Eg = ${stats.eg} eV (Μικρό Χάσμα -> Ημιαγωγός)`}
                </span>
              </div>
            </div>

            {/* Valence Band */}
            <div className="relative bg-indigo-100/80 dark:bg-indigo-950/40 border border-indigo-300 dark:border-indigo-500/40 rounded-lg p-2 h-16 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[11px] font-bold text-indigo-900 dark:text-indigo-300">
                <span>ΖΩΝΗ ΣΘΕΝΟΥΣ (Valence Band)</span>
                <span>{stats.holes} Οπές h⁺</span>
              </div>
              <div className="flex flex-wrap gap-1 items-center overflow-hidden max-h-8">
                {Array.from({ length: Math.min(24, stats.holes) }).map((_, i) => (
                  <span
                    key={`h-${i}`}
                    className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-rose-400 bg-rose-200 dark:bg-rose-500/30 text-rose-950 dark:text-rose-200 font-bold text-[9px] shadow-xs"
                    title="Οπή (h⁺) - Κενή θέση ηλεκτρονίου"
                  >
                    h⁺
                  </span>
                ))}
                {stats.holes > 24 && (
                  <span className="text-[10px] text-rose-800 dark:text-rose-300 font-mono font-bold">
                    +{stats.holes - 24}
                  </span>
                )}
                {stats.holes === 0 && stats.materialName.includes('Αγωγός') && (
                  <span className="text-xs text-amber-800 dark:text-amber-400 italic font-medium">
                    Μέταλλα: μόνο ηλεκτρόνια αγωγής, δεν υπάρχουν οπές.
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-700 dark:text-slate-400 flex items-center justify-between mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-600 dark:bg-cyan-400 inline-block" /> e⁻: Αρνητικό ηλεκτρόνιο
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full border border-rose-500 bg-rose-200 dark:bg-rose-500/30 inline-block" /> h⁺: Θετική οπή
            </span>
            <span className="text-slate-600 dark:text-slate-400 font-bold">2 φορείς ρεύματος!</span>
          </div>
        </div>

        {/* Right: Real-Time Results & Practical Impact */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-xs">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              Υπολογισμένα Μεγέθη
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-xs">
                <span className="text-[11px] text-slate-600 dark:text-slate-400 block font-medium">Εκτιμώμενη Αντίσταση</span>
                <span className="text-lg font-mono font-extrabold text-cyan-800 dark:text-cyan-400">
                  {stats.resistanceOhms}
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-xs">
                <span className="text-[11px] text-slate-600 dark:text-slate-400 block font-medium">Κατάσταση Αγωγής</span>
                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                  {stats.electrons > 15 || stats.holes > 15 ? 'Καλός Αγωγός' : stats.electrons > 2 ? 'Μέτριος Αγωγός' : 'Μονωτής'}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Φορείς Πλειονότητας:</span>
                <span className="font-bold text-slate-900 dark:text-white text-right max-w-[200px] truncate" title={stats.majorityCarrier}>
                  {stats.majorityCarrier}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Φορείς Μειονότητας:</span>
                <span className="font-bold text-slate-800 dark:text-slate-300 text-right max-w-[200px] truncate" title={stats.minorityCarrier}>
                  {stats.minorityCarrier}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Συμπεριφορά Θερμοκρασίας:</span>
                <span className="font-bold text-amber-800 dark:text-amber-400">
                  {material === 'conductor' ? 'PTC (R αυξάνεται)' : 'NTC (R μειώνεται)'}
                </span>
              </div>
            </div>
          </div>

          {/* Educational Callout */}
          <div className="bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-500/30 rounded-2xl p-4 text-xs text-slate-800 dark:text-cyan-200 leading-relaxed shadow-xs">
            <strong className="text-cyan-900 dark:text-cyan-300 block mb-1 font-bold">
              💡 Πρακτικό Συμπέρασμα για τις Εξετάσεις ΕΠΑΛ:
            </strong>
            {doping === 'n-type' && (
              <span>
                Στον τύπο <strong>N</strong>, τα πεντασθενή άτομα (δότες: P, As) προσφέρουν ελεύθερα ηλεκτρόνια. Τα ηλεκτρόνια είναι οι φορείς πλειονότητας και οι οπές οι φορείς μειονότητας.
              </span>
            )}
            {doping === 'p-type' && (
              <span>
                Στον τύπο <strong>P</strong>, τα τρισθενή άτομα (αποδέκτες: B, Ga) δημιουργούν κενές θέσεις (οπές). Οι οπές είναι οι φορείς πλειονότητας και τα ηλεκτρόνια οι φορείς μειονότητας.
              </span>
            )}
            {doping === 'intrinsic' && (
              <span>
                Στον καθαρό ενδογενή κρύσταλλο, το ρεύμα οφείλεται εξίσου σε ηλεκτρόνια και οπές. Αυξάνοντας τη θερμοκρασία ή το φως, η αντίσταση πέφτει κατακόρυφα (θερμίστορ NTC & φωτοαντίσταση LDR)!
              </span>
            )}
            {!stats.isSemiconductor && (
              <span>
                Στους αγωγούς οι ζώνες επικαλύπτονται και το ρεύμα οφείλεται αποκλειστικά σε ελεύθερα ηλεκτρόνια. Στους μονωτές το χάσμα είναι απαγορευτικά μεγάλο (&gt;5eV).
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
