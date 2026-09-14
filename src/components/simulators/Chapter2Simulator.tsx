import React, { useState, useMemo } from 'react';
import { Lightbulb, ShieldCheck, Gauge, Zap, AlertTriangle, ArrowRight, Info } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const Chapter2Simulator: React.FC = () => {
  const { isDark } = useTheme();
  const [diodeType, setDiodeType] = useState<'si' | 'ge' | 'led' | 'zener' | 'schottky'>('si');
  const [appliedVoltage, setAppliedVoltage] = useState<number>(1.2); // Volts
  const [seriesResistor, setSeriesResistor] = useState<number>(220); // Ohms
  const [mode, setMode] = useState<'curve' | 'zenerRegulator'>('curve');
  const [zenerVin, setZenerVin] = useState<number>(12); // Input voltage for Zener circuit

  // Diode parameters
  const diodeParams = useMemo(() => {
    switch (diodeType) {
      case 'ge':
        return { name: 'Γερμανίου (Ge)', vGamma: 0.3, vBreakdown: -30, color: 'emerald', ledGlow: false };
      case 'led':
        return { name: 'LED Κόκκινο', vGamma: 1.9, vBreakdown: -5, color: 'rose', ledGlow: true };
      case 'zener':
        return { name: 'Zener (Vz = 5.1V)', vGamma: 0.7, vBreakdown: -5.1, color: 'purple', ledGlow: false };
      case 'schottky':
        return { name: 'Schottky (1N5819)', vGamma: 0.25, vBreakdown: -40, color: 'amber', ledGlow: false };
      case 'si':
      default:
        return { name: 'Πυριτίου (Si - 1N4007)', vGamma: 0.7, vBreakdown: -100, color: 'cyan', ledGlow: false };
    }
  }, [diodeType]);

  // Circuit calculations for normal mode
  const circuitState = useMemo(() => {
    const { vGamma, vBreakdown } = diodeParams;
    let diodeVoltage = 0;
    let current_mA = 0;
    let stateDescription = '';
    let depletionWidth = 50; // percentage
    let isForward = appliedVoltage >= 0;
    let isDamaged = false;

    if (appliedVoltage > 0) {
      // Forward bias
      if (appliedVoltage < vGamma) {
        diodeVoltage = appliedVoltage;
        current_mA = 0.01;
        stateDescription = `Ορθή πόλωση κάτω από το Vγ (${vGamma}V). Πολύ μικρό ρεύμα, το φράγμα αντιστέκεται.`;
        depletionWidth = Math.max(15, 50 - (appliedVoltage / vGamma) * 35);
      } else {
        // Conductive forward
        diodeVoltage = vGamma + (appliedVoltage - vGamma) * 0.05; // slight internal dynamic resistance
        current_mA = ((appliedVoltage - diodeVoltage) / seriesResistor) * 1000;
        stateDescription = `Ορθή πόλωση σε αγωγή! Το φράγμα υπερνικήθηκε. Vd ≈ ${diodeVoltage.toFixed(2)}V.`;
        depletionWidth = 8; // Very narrow
      }
    } else {
      // Reverse bias
      const absV = Math.abs(appliedVoltage);
      if (diodeType === 'zener' && absV >= Math.abs(vBreakdown)) {
        // Zener breakdown (stable controlled)
        diodeVoltage = vBreakdown;
        current_mA = -((absV - Math.abs(vBreakdown)) / seriesResistor) * 1000;
        stateDescription = `Ανάστροφη διάσπαση Zener! Η τάση κλειδώνει σταθερά στα ${Math.abs(vBreakdown)}V.`;
        depletionWidth = 90;
      } else if (absV > Math.abs(vBreakdown)) {
        // Breakdown destruction on normal diode
        isDamaged = true;
        current_mA = -((absV - Math.abs(vBreakdown)) / seriesResistor) * 1000;
        stateDescription = `ΚΑΤΑΣΤΡΟΦΙΚΗ ΔΙΑΣΠΑΣΗ ΧΙΟΝΟΣΤΙΒΑΔΑΣ! Υπέρβαση VBR (${vBreakdown}V).`;
        depletionWidth = 100;
      } else {
        // Normal reverse cutoff
        diodeVoltage = appliedVoltage;
        current_mA = -0.000005; // tiny saturation current Is
        stateDescription = `Ανάστροφη πόλωση (Αποκοπή). Η περιοχή απογύμνωσης διευρύνθηκε. Ρεύμα σχεδόν μηδέν (I ≈ 0).`;
        depletionWidth = Math.min(95, 50 + (absV / 10) * 45);
      }
    }

    // Indicator light / LED output brightness
    const lampBrightness = Math.min(1, Math.max(0, current_mA / 25)); // full brightness at 25mA

    return {
      diodeVoltage,
      current_mA,
      stateDescription,
      depletionWidth,
      isForward,
      isDamaged,
      lampBrightness
    };
  }, [appliedVoltage, seriesResistor, diodeParams, diodeType]);

  // Zener voltage regulator circuit calculations
  const zenerRegulatorState = useMemo(() => {
    const vz = 5.1;
    const rSeries = 220; // Ohms
    let vOut = 0;
    let iz_mA = 0;
    let isRegulating = false;

    if (zenerVin <= vz) {
      vOut = zenerVin;
      iz_mA = 0;
      isRegulating = false;
    } else {
      vOut = vz;
      iz_mA = ((zenerVin - vz) / rSeries) * 1000;
      isRegulating = true;
    }

    return {
      vOut,
      iz_mA,
      isRegulating
    };
  }, [zenerVin]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-sm dark:shadow-xl space-y-6 transition-colors">
      {/* Header & Sub-mode switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-800 dark:text-cyan-400 font-bold text-xs tracking-wider uppercase">
            <Zap className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            Διαδραστικό Εργαστήριο Κεφαλαίου 2
          </div>
          <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mt-1">
            Δίοδος Επαφής P-N, Καμπύλη I-V & Δίοδος Zener
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Εξετάστε την ορθή και ανάστροφη πόλωση, το κατώφλι αγωγής (Vγ), την περιοχή απογύμνωσης και τη σταθεροποίηση τάσης.
          </p>
        </div>

        {/* Experiment selector toggle */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-950 p-1 border border-slate-300 dark:border-slate-800 self-start sm:self-center">
          <button
            onClick={() => setMode('curve')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'curve'
                ? 'bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 shadow-xs'
                : 'text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            Επαφή P-N & Καμπύλη I-V
          </button>
          <button
            onClick={() => setMode('zenerRegulator')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'zenerRegulator'
                ? 'bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 shadow-xs'
                : 'text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            Σταθεροποίηση Zener
          </button>
        </div>
      </div>

      {mode === 'curve' ? (
        <>
          {/* Controls Panel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Diode Model Selector */}
            <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-2.5 shadow-xs">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider block">
                1. Τύπος Διόδου
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setDiodeType('si')}
                  className={`p-2 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                    diodeType === 'si'
                      ? 'bg-cyan-100 dark:bg-cyan-500/20 border-cyan-500 text-cyan-900 dark:text-cyan-300 shadow-xs'
                      : 'bg-white dark:bg-slate-800/60 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  Πυριτίου (1N4007)
                  <span className="block text-[10px] text-slate-500 font-mono">Vγ = 0.7V</span>
                </button>
                <button
                  onClick={() => setDiodeType('ge')}
                  className={`p-2 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                    diodeType === 'ge'
                      ? 'bg-emerald-100 dark:bg-emerald-500/20 border-emerald-500 text-emerald-900 dark:text-emerald-300 shadow-xs'
                      : 'bg-white dark:bg-slate-800/60 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  Γερμανίου (Ge)
                  <span className="block text-[10px] text-slate-500 font-mono">Vγ = 0.3V</span>
                </button>
                <button
                  onClick={() => setDiodeType('led')}
                  className={`p-2 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                    diodeType === 'led'
                      ? 'bg-rose-100 dark:bg-rose-500/20 border-rose-500 text-rose-900 dark:text-rose-300 shadow-xs'
                      : 'bg-white dark:bg-slate-800/60 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  LED (Κόκκινο)
                  <span className="block text-[10px] text-slate-500 font-mono">Vγ = 1.9V</span>
                </button>
                <button
                  onClick={() => setDiodeType('zener')}
                  className={`p-2 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                    diodeType === 'zener'
                      ? 'bg-purple-100 dark:bg-purple-500/20 border-purple-500 text-purple-900 dark:text-purple-300 shadow-xs'
                      : 'bg-white dark:bg-slate-800/60 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  Zener (5.1V)
                  <span className="block text-[10px] text-slate-500 font-mono">Vz = -5.1V</span>
                </button>
              </div>
            </div>

            {/* Applied Voltage Slider */}
            <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
                  2. Εφαρμοζόμενη Τάση (Vπηγής)
                </label>
                <span className={`text-xs font-mono font-bold ${appliedVoltage >= 0 ? 'text-cyan-800 dark:text-cyan-400' : 'text-amber-800 dark:text-amber-400'}`}>
                  {appliedVoltage > 0 ? `+${appliedVoltage.toFixed(1)}` : appliedVoltage.toFixed(1)} V
                </span>
              </div>
              <input
                type="range"
                min="-10"
                max="5"
                step="0.1"
                value={appliedVoltage}
                onChange={(e) => setAppliedVoltage(Number(e.target.value))}
                className="w-full accent-cyan-600 dark:accent-cyan-400 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-600 dark:text-slate-400 font-mono font-semibold">
                <span>-10V (Ανάστροφη)</span>
                <span>0V</span>
                <span>+5V (Ορθή)</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                Δοκιμάστε να ξεπεράσετε το κατώφλι Vγ ({diodeParams.vGamma}V) για να δείτε το ρεύμα να απογειώνεται!
              </p>
            </div>

            {/* Resistor Slider & Status */}
            <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
                  3. Αντίσταση Προστασίας (R)
                </label>
                <span className="text-xs font-mono font-bold text-cyan-800 dark:text-cyan-400">
                  {seriesResistor} Ω
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="1000"
                step="10"
                value={seriesResistor}
                onChange={(e) => setSeriesResistor(Number(e.target.value))}
                className="w-full accent-cyan-600 dark:accent-cyan-400 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-600 dark:text-slate-400 font-mono font-semibold">
                <span>50 Ω</span>
                <span>220 Ω (Τυπικό)</span>
                <span>1000 Ω</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                Περιορίζει το ρεύμα I = (Vπηγής - Vd) / R ώστε να μην υπερθερμανθεί η δίοδος.
              </p>
            </div>
          </div>

          {/* Interactive Visualizations */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Depletion Region Graphic */}
            <div className="lg:col-span-6 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  Φυσική της Επαφής P-N & Περιοχή Απογύμνωσης
                </h4>
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-300 font-bold">
                  {circuitState.isForward ? 'Ορθή Πόλωση' : 'Ανάστροφη Πόλωση'}
                </span>
              </div>

              {/* Physical P-N block */}
              <div className="h-44 w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden flex relative my-2 shadow-inner">
                {/* P-Region */}
                <div className="flex-1 bg-gradient-to-r from-rose-100 to-rose-50 dark:from-rose-950/80 dark:to-rose-900/60 border-r border-rose-300 dark:border-rose-500/30 flex flex-col justify-between p-2">
                  <div className="text-xs font-bold text-rose-900 dark:text-rose-300 flex items-center justify-between">
                    <span>ΠΕΡΙΟΧΗ P (Άνοδος A)</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-rose-200 dark:bg-rose-500/20 rounded font-bold">Οπές h⁺</span>
                  </div>
                  <div className="flex flex-wrap gap-1 content-center">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <span key={i} className="w-3 h-3 rounded-full border border-rose-500 bg-rose-200 dark:bg-rose-500/40 text-[8px] font-bold flex items-center justify-center text-rose-950 dark:text-rose-200">
                        +
                      </span>
                    ))}
                  </div>
                  <span className="text-[10px] text-rose-800 dark:text-rose-400/80 font-medium">Ακίνητα αρνητικά ιόντα αποδεκτών ⊝</span>
                </div>

                {/* Depletion Region (Dynamic Width) */}
                <div
                  style={{ width: `${circuitState.depletionWidth}%` }}
                  className="bg-amber-100/90 dark:bg-amber-950/70 border-x-2 border-amber-500 flex flex-col items-center justify-center text-center p-1 relative transition-all duration-300 shadow-inner"
                >
                  <span className="text-[10px] font-bold text-amber-950 dark:text-amber-300 uppercase tracking-tight">
                    Περιοχή Απογύμνωσης
                  </span>
                  <span className="text-[9px] text-amber-900 dark:text-amber-200 font-mono font-bold">
                    {circuitState.depletionWidth > 40 ? 'ΠΛΑΤΥΝΕ (Αποκοπή)' : 'ΣΤΕΝΕΨΕ (Αγωγή)'}
                  </span>
                  <div className="text-[8px] text-amber-900 dark:text-amber-300 font-mono mt-1 font-bold">
                    Vγ = {diodeParams.vGamma}V
                  </div>
                </div>

                {/* N-Region */}
                <div className="flex-1 bg-gradient-to-l from-cyan-100 to-cyan-50 dark:from-cyan-950/80 dark:to-cyan-900/60 border-l border-cyan-300 dark:border-cyan-500/30 flex flex-col justify-between p-2">
                  <div className="text-xs font-bold text-cyan-900 dark:text-cyan-300 flex items-center justify-between">
                    <span className="text-[10px] px-1.5 py-0.5 bg-cyan-200 dark:bg-cyan-500/20 rounded font-bold">Ηλεκτρόνια e⁻</span>
                    <span>ΠΕΡΙΟΧΗ N (Κάθοδος K)</span>
                  </div>
                  <div className="flex flex-wrap gap-1 content-center">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <span key={i} className="w-3 h-3 rounded-full border border-cyan-500 bg-cyan-200 dark:bg-cyan-500/40 text-[8px] font-bold flex items-center justify-center text-cyan-950 dark:text-cyan-200">
                        -
                      </span>
                    ))}
                  </div>
                  <span className="text-[10px] text-cyan-800 dark:text-cyan-400/80 text-right font-medium">Ακίνητα θετικά ιόντα δοτών ⊕</span>
                </div>
              </div>

              {/* Status banner */}
              <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                circuitState.isDamaged
                  ? 'bg-rose-100 dark:bg-rose-950/80 border border-rose-400 dark:border-rose-500 text-rose-950 dark:text-rose-200'
                  : circuitState.current_mA > 1
                  ? 'bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-400 dark:border-emerald-500/40 text-emerald-950 dark:text-emerald-300'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}>
                {circuitState.isDamaged ? (
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                ) : (
                  <Info className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                )}
                <span className="leading-relaxed">{circuitState.stateDescription}</span>
              </div>
            </div>

            {/* Right: I-V Characteristic Curve (SVG) */}
            <div className="lg:col-span-6 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  Χαρακτηριστική Καμπύλη Ρεύματος-Τάσης (I-V)
                </h4>
                <span className="text-xs font-mono font-bold text-cyan-800 dark:text-cyan-400">
                  I = {circuitState.current_mA.toFixed(2)} mA | Vd = {circuitState.diodeVoltage.toFixed(2)} V
                </span>
              </div>

              {/* SVG I-V graph */}
              <div className="h-44 w-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-2 relative overflow-hidden flex items-center justify-center shadow-inner">
                <svg viewBox="-120 -80 240 160" className="w-full h-full">
                  {/* Grid Lines */}
                  <line x1="-120" y1="0" x2="120" y2="0" stroke={isDark ? '#334155' : '#cbd5e1'} strokeWidth="1" />
                  <line x1="0" y1="-80" x2="0" y2="80" stroke={isDark ? '#334155' : '#cbd5e1'} strokeWidth="1" />

                  {/* Labels */}
                  <text x="110" y="-5" fill={isDark ? '#94a3b8' : '#475569'} fontSize="8" fontWeight="bold" textAnchor="end">+V (Ορθή)</text>
                  <text x="-115" y="-5" fill={isDark ? '#94a3b8' : '#475569'} fontSize="8" fontWeight="bold">-V (Ανάστροφη)</text>
                  <text x="5" y="-70" fill={isDark ? '#94a3b8' : '#475569'} fontSize="8" fontWeight="bold">+I (mA)</text>
                  <text x="5" y="75" fill={isDark ? '#94a3b8' : '#475569'} fontSize="8" fontWeight="bold">-I</text>

                  {/* Threshold Vgamma marker */}
                  <line x1={diodeParams.vGamma * 25} y1="-5" x2={diodeParams.vGamma * 25} y2="5" stroke="#0284c7" strokeWidth="1.5" />
                  <text x={diodeParams.vGamma * 25} y="15" fill={isDark ? '#38bdf8' : '#0284c7'} fontSize="7" fontWeight="bold" textAnchor="middle">
                    Vγ={diodeParams.vGamma}V
                  </text>

                  {/* Characteristic Curve path */}
                  {/* Reverse part */}
                  <path
                    d={`M -110 2 L 0 0`}
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="1.5"
                  />
                  {/* Forward exponential curve */}
                  <path
                    d={`M 0 0 L ${diodeParams.vGamma * 25} 0 Q ${(diodeParams.vGamma + 0.15) * 25} 0, ${(diodeParams.vGamma + 0.3) * 25} -40 L ${(diodeParams.vGamma + 0.4) * 25} -75`}
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="2.5"
                  />

                  {/* Zener Breakdown knee if Zener diode */}
                  {diodeType === 'zener' && (
                    <>
                      <line x1="-80" y1="-5" x2="-80" y2="5" stroke="#9333ea" strokeWidth="1.5" />
                      <text x="-80" y="-8" fill="#9333ea" fontSize="7" fontWeight="bold" textAnchor="middle">Vz=5.1V</text>
                      <path d="M -80 0 L -80 70" fill="none" stroke="#9333ea" strokeWidth="2.5" />
                    </>
                  )}

                  {/* Current Operating Point Dot (Q) */}
                  {(() => {
                    let dotX = circuitState.diodeVoltage * 25;
                    let dotY = -Math.min(75, Math.max(-75, (circuitState.current_mA / 30) * 60));
                    dotX = Math.max(-110, Math.min(110, dotX));
                    return (
                      <g>
                        <circle cx={dotX} cy={dotY} r="5" fill="#f43f5e" stroke="#fff" strokeWidth="1.5" />
                        <text x={dotX + 8} y={dotY - 2} fill="#e11d48" fontSize="8" fontWeight="bold">
                          Q ({circuitState.diodeVoltage.toFixed(1)}V, {circuitState.current_mA.toFixed(1)}mA)
                        </text>
                      </g>
                    );
                  })()}
                </svg>
              </div>

              {/* Physical LED / Indicator light */}
              <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl mt-2 shadow-xs">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center transition-all duration-200"
                    style={{
                      backgroundColor:
                        circuitState.current_mA > 0.5
                          ? diodeType === 'led'
                            ? `rgba(239, 68, 68, ${0.3 + circuitState.lampBrightness * 0.7})`
                            : `rgba(34, 197, 94, ${0.3 + circuitState.lampBrightness * 0.7})`
                          : isDark ? '#1e293b' : '#e2e8f0',
                      boxShadow:
                        circuitState.current_mA > 0.5
                          ? `0 0 15px ${diodeType === 'led' ? 'rgba(239, 68, 68, 0.8)' : 'rgba(34, 197, 94, 0.8)'}`
                          : 'none'
                    }}
                  >
                    <Lightbulb className={`w-4 h-4 ${circuitState.current_mA > 0.5 ? 'text-white' : 'text-slate-400 dark:text-slate-600'}`} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      {diodeType === 'led' ? 'Φωτεινή Εκπομπή LED' : 'Λαμπτήρας Κυκλώματος'}
                    </span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                      {circuitState.current_mA > 1 ? `Αναμμένος (${(circuitState.lampBrightness * 100).toFixed(0)}% φωτεινότητα)` : 'Σβηστός (αποκοπή)'}
                    </span>
                  </div>
                </div>

                <div className="text-right text-xs font-mono">
                  <div className="text-slate-500 font-medium">Ισχύς Διόδου:</div>
                  <div className="font-bold text-cyan-800 dark:text-cyan-400">
                    {Math.abs(circuitState.diodeVoltage * circuitState.current_mA).toFixed(1)} mW
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Zener Regulator Demonstration Mode */
        <div className="bg-purple-50/60 dark:bg-slate-950/80 border border-purple-300 dark:border-purple-500/30 rounded-2xl p-5 space-y-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-200 dark:border-slate-800 pb-3">
            <div>
              <span className="text-xs font-bold uppercase text-purple-900 dark:text-purple-400 tracking-wider">
                Εφαρμογή Κεφαλαίου 2.3
              </span>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                Κύκλωμα Σταθεροποίησης Τάσης με Δίοδο Zener
              </h4>
            </div>
            <div className="text-xs text-purple-950 dark:text-purple-300 font-mono font-bold bg-purple-100 dark:bg-purple-950/60 px-3 py-1.5 rounded-xl border border-purple-300 dark:border-purple-500/40">
              Vz = 5.1 V (Σταθερή Τάση Αναφοράς)
            </div>
          </div>

          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
            Σύρετε την τάση εισόδου (Vin) από 0V έως 20V. Παρατηρήστε πώς, μόλις η Vin ξεπεράσει τα 5.1V, η δίοδος Zener αρχίζει να άγει ανάστροφα και <strong className="text-purple-900 dark:text-purple-300">διατηρεί την τάση εξόδου (Vload) απόλυτα σταθερή στα 5.1 V</strong>!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Vin Slider */}
            <div className="md:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-3 shadow-xs">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-300">
                  Κυμαινόμενη Τάση Εισόδου (Vin)
                </label>
                <span className="text-base font-mono font-bold text-purple-800 dark:text-purple-400">
                  {zenerVin.toFixed(1)} V
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                step="0.5"
                value={zenerVin}
                onChange={(e) => setZenerVin(Number(e.target.value))}
                className="w-full accent-purple-600 dark:accent-purple-400 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400 font-mono font-semibold">
                <span>0V (Σβηστό)</span>
                <span>5.1V (Κατώφλι Zener)</span>
                <span>20V (Υψηλή Vin)</span>
              </div>
            </div>

            {/* Visual Circuit Diagram Representation */}
            <div className="md:col-span-7 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center justify-between gap-2 shadow-xs">
              <div className="text-center p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 min-w-[70px]">
                <span className="text-[10px] text-slate-600 dark:text-slate-400 block font-bold">Vin</span>
                <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">{zenerVin.toFixed(1)}V</span>
              </div>

              <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

              <div className="text-center p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 min-w-[70px]">
                <span className="text-[10px] text-slate-600 dark:text-slate-400 block font-bold">Αντίσταση R</span>
                <span className="text-xs font-mono text-cyan-800 dark:text-cyan-400 font-bold">220 Ω</span>
              </div>

              <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

              <div className="text-center p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-500/50 min-w-[90px]">
                <span className="text-[10px] text-purple-900 dark:text-purple-300 block font-bold">Δίοδος Zener</span>
                <span className="text-xs font-mono font-bold text-purple-950 dark:text-purple-200">
                  Iz = {zenerRegulatorState.iz_mA.toFixed(1)} mA
                </span>
              </div>

              <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

              <div className={`text-center p-2 rounded-xl border min-w-[90px] ${
                zenerRegulatorState.isRegulating
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-400 dark:border-emerald-500 text-emerald-950 dark:text-emerald-300'
                  : 'bg-amber-100 dark:bg-amber-950/60 border-amber-400 dark:border-amber-500 text-amber-950 dark:text-amber-300'
              }`}>
                <span className="text-[10px] block font-bold opacity-80">Τάση Φορτίου Vout</span>
                <span className="text-sm font-mono font-bold">
                  {zenerRegulatorState.vOut.toFixed(2)} V
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-purple-100/70 dark:bg-purple-950/40 border border-purple-300 dark:border-purple-500/30 rounded-xl text-xs text-purple-950 dark:text-purple-200 flex items-start gap-2 shadow-xs">
            <Info className="w-4 h-4 text-purple-700 dark:text-purple-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Κανόνας Τεχνικού:</strong> Για να λειτουργεί η σταθεροποίηση, η Vin πρέπει να είναι πάντα τουλάχιστον 1-2 Volt μεγαλύτερη από την τάση Vz, και η αντίσταση R να αντέχει τη θερμική ισχύ P = (Vin - Vz)² / R.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
