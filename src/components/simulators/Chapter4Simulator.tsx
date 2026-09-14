import React, { useState, useMemo } from 'react';
import { Sliders, Zap, Power, RotateCcw, Lightbulb, Info } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const Chapter4Simulator: React.FC = () => {
  const { isDark } = useTheme();
  const [device, setDevice] = useState<'scr' | 'triac'>('scr');
  const [powerSource, setPowerSource] = useState<'ac' | 'dc'>('dc');
  const [gateTriggered, setGateTriggered] = useState<boolean>(false);
  const [dcAnodeCurrentCut, setDcAnodeCurrentCut] = useState<boolean>(false);
  const [phaseAngleDeg, setPhaseAngleDeg] = useState<number>(60); // 0 to 180 degrees for AC control

  // DC SCR State logic: Once triggered, it latches ON until current is cut (anode switch opened)
  const isDcLatchingOn = useMemo(() => {
    if (powerSource !== 'dc') return false;
    if (dcAnodeCurrentCut) return false;
    return gateTriggered;
  }, [powerSource, gateTriggered, dcAnodeCurrentCut]);

  // AC Phase Dimming calculations
  const acStats = useMemo(() => {
    // Power delivered to load is proportional to integral of sin^2(t) from alpha to pi
    const rad = (phaseAngleDeg * Math.PI) / 180;
    const conductionFraction = (Math.PI - rad + 0.5 * Math.sin(2 * rad)) / Math.PI;
    const powerPercent = Math.max(0, Math.min(100, Math.round(conductionFraction * 100)));
    const rmsVoltage = Math.round(230 * Math.sqrt(conductionFraction));

    return {
      powerPercent,
      rmsVoltage,
      conductionFraction
    };
  }, [phaseAngleDeg]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-sm dark:shadow-xl space-y-6 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-800 dark:text-cyan-400 font-bold text-xs tracking-wider uppercase">
            <Zap className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            Διαδραστικό Εργαστήριο Κεφαλαίου 4
          </div>
          <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mt-1">
            Θυρίστορ (SCR, Triac, Diac) & Έλεγχος Ισχύος
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Κατανοήστε το έναυσμα πύλης, το ρεύμα συγκράτησης (IH), τη μανδάλωση και το κόψιμο φάσης (Dimmer).
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-950 p-1 border border-slate-300 dark:border-slate-800 self-start sm:self-center">
          <button
            onClick={() => {
              setPowerSource('dc');
              setGateTriggered(false);
              setDcAnodeCurrentCut(false);
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              powerSource === 'dc'
                ? 'bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 shadow-xs'
                : 'text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            Συνεχές DC (Μανδάλωση & IH)
          </button>
          <button
            onClick={() => {
              setPowerSource('ac');
              setDevice('triac');
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              powerSource === 'ac'
                ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            Εναλλασσόμενο AC (Dimmer Φάσης)
          </button>
        </div>
      </div>

      {powerSource === 'dc' ? (
        /* DC Mode: Demonstration of SCR Latching and Holding Current */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1: Device Info */}
            <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-2 shadow-xs">
              <span className="text-xs font-bold text-cyan-800 dark:text-cyan-400 uppercase tracking-wider block">
                1. Εξάρτημα: SCR (BT151)
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                Δομή τεσσάρων στρωμάτων (P-N-P-N). Ακροδέκτες: Άνοδος (A), Κάθοδος (K), Πύλη (Gate).
              </p>
              <div className="text-[11px] text-slate-700 dark:text-slate-400 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 font-mono font-medium">
                Τάση DC: +12 V | Φορτίο: Λάμπα 12V 10W
              </div>
            </div>

            {/* Step 2: Gate Trigger */}
            <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-2 flex flex-col justify-between shadow-xs">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider block">
                  2. Έναυσμα Πύλης (Trigger)
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-medium">
                  Πατήστε το μπουτόν για να στείλετε έναν σύντομο θετικό παλμό ρεύματος στην πύλη G.
                </p>
              </div>

              <button
                onClick={() => {
                  setDcAnodeCurrentCut(false);
                  setGateTriggered(true);
                }}
                disabled={isDcLatchingOn}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isDcLatchingOn
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-300 dark:border-slate-700'
                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-500 dark:to-blue-500 text-white dark:text-slate-950 shadow-md shadow-cyan-500/20'
                }`}
              >
                <Power className="w-4 h-4" />
                {isDcLatchingOn ? 'Το SCR Μανδάλωσε (ON)' : 'Παλμός Έναυσης Πύλης (Pulse Gate)'}
              </button>
            </div>

            {/* Step 3: Turn-off via Anode Current Cut */}
            <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-2 flex flex-col justify-between shadow-xs">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider block">
                  3. Απενεργοποίηση (Turn-off)
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-medium">
                  Η πύλη δεν μπορεί να το σβήσει! Για να σβήσει, διακόψτε το ρεύμα ανόδου κάτω από το ρεύμα συγκράτησης (IH).
                </p>
              </div>

              <button
                onClick={() => {
                  setDcAnodeCurrentCut(true);
                  setGateTriggered(false);
                }}
                disabled={!isDcLatchingOn}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  isDcLatchingOn
                    ? 'bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/60 border-rose-300 dark:border-rose-500/60 text-rose-950 dark:text-rose-300'
                    : 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                Διακοπή Ρεύματος (Reset / I &lt; IH)
              </button>
            </div>
          </div>

          {/* Visual Schematic Box */}
          <div className="bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${isDcLatchingOn ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Κατάσταση SCR: {isDcLatchingOn ? 'ΑΓΩΓΗ (Μανδαλωμένο ON)' : 'ΑΠΟΚΟΠΗ (OFF)'}
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {isDcLatchingOn ? (
                  <span className="text-emerald-800 dark:text-emerald-300">
                    Το SCR άγει πλήρως! Παρατηρήστε ότι ακόμη κι αν ο παλμός της πύλης τελείωσε, το SCR <strong>παραμένει αναμμένο</strong>. Αυτή είναι η κρίσιμη ιδιότητα μανδάλωσης (latching) του SCR σε συνεχή τάση.
                  </span>
                ) : (
                  <span className="text-slate-600 dark:text-slate-400">
                    Το SCR είναι κλειστό (σαν ανοιχτός διακόπτης). Δεν ρέει ρεύμα στη λάμπα μέχρι να δοθεί ο παλμός έναυσης στην πύλη.
                  </span>
                )}
              </p>
            </div>

            {/* Lamp Output */}
            <div className="flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-4 rounded-2xl shadow-xs">
              <div
                className="w-16 h-16 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center transition-all duration-300"
                style={{
                  backgroundColor: isDcLatchingOn ? 'rgba(250, 204, 21, 0.9)' : isDark ? '#1e293b' : '#e2e8f0',
                  boxShadow: isDcLatchingOn ? '0 0 30px rgba(250, 204, 21, 0.9)' : 'none'
                }}
              >
                <Lightbulb className={`w-8 h-8 ${isDcLatchingOn ? 'text-slate-950' : 'text-slate-400 dark:text-slate-600'}`} />
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Φορτίο Λάμπας</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  {isDcLatchingOn ? 'Αναμμένη (100%)' : 'Σβηστή (0%)'}
                </span>
                <span className="text-[11px] font-mono font-bold text-cyan-800 dark:text-cyan-400 block">
                  {isDcLatchingOn ? 'Ρεύμα Ανόδου IA = 830 mA' : 'Ρεύμα Ανόδου IA = 0 mA'}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* AC Mode: Triac Dimmer with Phase Angle Control */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Controls: Dimmer Slider */}
            <div className="md:col-span-5 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-4 shadow-xs">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Γωνία Έναυσης α (Firing Angle)
                </label>
                <span className="text-sm font-mono font-bold text-indigo-800 dark:text-indigo-400">
                  {phaseAngleDeg}°
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="160"
                step="5"
                value={phaseAngleDeg}
                onChange={(e) => setPhaseAngleDeg(Number(e.target.value))}
                className="w-full accent-indigo-600 dark:accent-indigo-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
              />

              <div className="flex justify-between text-[10px] text-slate-600 dark:text-slate-400 font-mono font-semibold">
                <span>0° (Μέγιστο Φως)</span>
                <span>90° (Μισή Ισχύς)</span>
                <span>160° (Ελάχιστο)</span>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5 text-xs shadow-xs">
                <div className="flex justify-between text-slate-700 dark:text-slate-300 font-medium">
                  <span>Αποτελεσματική Τάση (Vrms):</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{acStats.rmsVoltage} V</span>
                </div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300 font-medium">
                  <span>Μέση Παρεχόμενη Ισχύς:</span>
                  <span className="font-mono font-bold text-indigo-800 dark:text-indigo-400">{acStats.powerPercent}%</span>
                </div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300 font-medium">
                  <span>Ρόλος του Diac:</span>
                  <span className="text-slate-500 dark:text-slate-400">Δίνει παλμό έναυσης στα ~30V</span>
                </div>
              </div>
            </div>

            {/* Right: Chopped AC Waveform SVG */}
            <div className="md:col-span-7 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col justify-between shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-300">
                  Κυματομορφή Τάσης στο Φορτίο (Έλεγχος Φάσης Triac)
                </span>
                <span className="text-[11px] font-mono font-bold text-emerald-800 dark:text-emerald-400">
                  AC 230V 50Hz
                </span>
              </div>

              {/* SVG AC Waveform */}
              <div className="h-40 w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-2 relative overflow-hidden flex items-center justify-center shadow-inner">
                <svg viewBox="0 -60 360 120" className="w-full h-full">
                  {/* Zero axis */}
                  <line x1="0" y1="0" x2="360" y2="0" stroke={isDark ? '#334155' : '#cbd5e1'} strokeWidth="1" />

                  {/* Reference full sine wave (faint dashed) */}
                  <path
                    d="M 0 0 Q 45 -70 90 0 T 180 0 T 270 0 T 360 0"
                    fill="none"
                    stroke={isDark ? '#475569' : '#94a3b8'}
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />

                  {/* Chopped Sine Wave (active power) */}
                  {/* Positive half-wave */}
                  {phaseAngleDeg < 180 && (
                    <path
                      d={`M ${phaseAngleDeg} 0 L ${phaseAngleDeg} ${-50 * Math.sin((phaseAngleDeg * Math.PI) / 180)} Q ${(180 + phaseAngleDeg) / 2} ${-50} 180 0`}
                      fill={isDark ? 'rgba(99, 102, 241, 0.25)' : 'rgba(99, 102, 241, 0.15)'}
                      stroke="#4f46e5"
                      strokeWidth="2.5"
                    />
                  )}

                  {/* Negative half-wave (Triac conducts bidirectionally!) */}
                  {phaseAngleDeg < 180 && (
                    <path
                      d={`M ${180 + phaseAngleDeg} 0 L ${180 + phaseAngleDeg} ${50 * Math.sin((phaseAngleDeg * Math.PI) / 180)} Q ${(360 + 180 + phaseAngleDeg) / 2} 50 360 0`}
                      fill={isDark ? 'rgba(99, 102, 241, 0.25)' : 'rgba(99, 102, 241, 0.15)'}
                      stroke="#4f46e5"
                      strokeWidth="2.5"
                    />
                  )}

                  {/* Alpha marker */}
                  <line
                    x1={phaseAngleDeg}
                    y1="-40"
                    x2={phaseAngleDeg}
                    y2="40"
                    stroke="#e11d48"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                  <text x={phaseAngleDeg + 4} y="-30" fill="#e11d48" fontSize="9" fontWeight="bold">
                    α={phaseAngleDeg}°
                  </text>
                </svg>
              </div>

              {/* Lamp Output Preview */}
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center transition-all duration-150"
                    style={{
                      backgroundColor: `rgba(250, 204, 21, ${0.1 + (acStats.powerPercent / 100) * 0.9})`,
                      boxShadow: `0 0 15px rgba(250, 204, 21, ${(acStats.powerPercent / 100) * 0.8})`
                    }}
                  >
                    <Lightbulb className="w-4 h-4 text-slate-900" />
                  </div>
                  <span className="text-xs text-slate-800 dark:text-slate-300 font-medium">
                    Φωτεινότητα Λαμπτήρα: <strong>{acStats.powerPercent}%</strong>
                  </span>
                </div>
                <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                  Το Triac άγει και στις δύο ημιπεριόδους (αμφίδρομο)
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 rounded-2xl text-xs text-slate-800 dark:text-indigo-200 flex items-start gap-2.5 shadow-xs">
            <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-indigo-950 dark:text-indigo-300 font-bold">Εφαρμογή στα Dimmers:</strong> Σε κάθε ημιπερίοδο του δικτύου 50Hz, το Triac παραμένει σβηστό μέχρι τη γωνία α. Τότε το Diac δίνει παλμό, το Triac ανάβει, και σβήνει μόνο του στο τέλος της ημιπεριόδου όταν το ρεύμα μηδενίζεται!
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
