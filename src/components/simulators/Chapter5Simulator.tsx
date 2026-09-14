import React, { useState, useMemo } from 'react';
import { Activity, Radio, Cpu, Info } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const Chapter5Simulator: React.FC = () => {
  const { isDark } = useTheme();
  const [transistorType, setTransistorType] = useState<'npn' | 'pnp'>('npn');
  const [beta, setBeta] = useState<number>(200); // hFE
  const [baseCurrent_uA, setBaseCurrent_uA] = useState<number>(25); // microAmperes (0 to 100 uA)
  const [vcc, setVcc] = useState<number>(12); // Volts DC
  const [rc_kOhms, setRc_kOhms] = useState<number>(2.2); // 2.2 kOhms collector resistor
  const [signalActive, setSignalActive] = useState<boolean>(true); // Audio AC amplification toggle

  // Circuit calculations
  const sim = useMemo(() => {
    // Cut-off, Active or Saturation?
    const ib_mA = baseCurrent_uA / 1000;
    const ic_ideal_mA = ib_mA * beta;
    const ic_sat_mA = (vcc - 0.2) / rc_kOhms; // saturation limit

    let region: 'Αποκοπή (Cut-off)' | 'Ενεργός (Active)' | 'Κόρος (Saturation)';
    let ic_actual_mA = 0;
    let vce = 0;
    let regionColor = 'text-slate-600 dark:text-slate-400';

    if (baseCurrent_uA <= 0.5) {
      region = 'Αποκοπή (Cut-off)';
      ic_actual_mA = 0;
      vce = vcc;
      regionColor = 'text-amber-700 dark:text-amber-400';
    } else if (ic_ideal_mA >= ic_sat_mA) {
      region = 'Κόρος (Saturation)';
      ic_actual_mA = ic_sat_mA;
      vce = 0.2; // Vce(sat)
      regionColor = 'text-rose-700 dark:text-rose-400';
    } else {
      region = 'Ενεργός (Active)';
      ic_actual_mA = ic_ideal_mA;
      vce = vcc - ic_actual_mA * rc_kOhms;
      regionColor = 'text-emerald-700 dark:text-emerald-400';
    }

    const ie_mA = ib_mA + ic_actual_mA;
    const power_mW = vce * ic_actual_mA;

    // Load line saturation point
    const maxIc_mA = vcc / rc_kOhms;

    return {
      ib_mA,
      ic_actual_mA,
      ie_mA,
      vce,
      maxIc_mA,
      region,
      regionColor,
      power_mW,
      voltageGain: region === 'Ενεργός (Active)' ? Math.round((rc_kOhms * 1000) / 25) : 0
    };
  }, [baseCurrent_uA, beta, vcc, rc_kOhms]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-sm dark:shadow-xl space-y-6 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-800 dark:text-cyan-400 font-bold text-xs tracking-wider uppercase">
            <Cpu className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            Διαδραστικό Εργαστήριο Κεφαλαίου 5
          </div>
          <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mt-1">
            Τρανζίστορ BJT, Ευθεία Φόρτου & Ενισχυτής Κοινού Εκπομπού
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Ρυθμίστε το ρεύμα βάσης (Ib), δείτε τη μετακίνηση του σημείου ηρεμίας Q στην ευθεία φόρτου και την αναστροφή φάσης 180°!
          </p>
        </div>

        {/* NPN / PNP Selector */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-950 p-1 border border-slate-300 dark:border-slate-800 self-start sm:self-center">
          <button
            onClick={() => setTransistorType('npn')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              transistorType === 'npn'
                ? 'bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 shadow-xs'
                : 'text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            NPN (BC547 / 2N2222)
          </button>
          <button
            onClick={() => setTransistorType('pnp')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              transistorType === 'pnp'
                ? 'bg-amber-600 dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs'
                : 'text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            PNP (BC557 / 2N3906)
          </button>
        </div>
      </div>

      {/* Control Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Base Current Ib slider */}
        <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-2.5 shadow-xs">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
              1. Ρεύμα Βάσης (Ib)
            </label>
            <span className="text-xs font-mono font-bold text-cyan-800 dark:text-cyan-400">
              {baseCurrent_uA} μA
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="60"
            step="1"
            value={baseCurrent_uA}
            onChange={(e) => setBaseCurrent_uA(Number(e.target.value))}
            className="w-full accent-cyan-600 dark:accent-cyan-400 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-600 dark:text-slate-400 font-mono font-semibold">
            <span>0 μA (Αποκοπή)</span>
            <span>25 μA (Ενεργός Q)</span>
            <span>60 μA (Κόρος)</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
            Το μικρό ρεύμα που ελέγχει τη ροή του μεγάλου ρεύματος συλλέκτη.
          </p>
        </div>

        {/* Current Gain Beta (hFE) */}
        <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-2.5 shadow-xs">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
              2. Κέρδος Ρεύματος β (hFE)
            </label>
            <span className="text-xs font-mono font-bold text-emerald-800 dark:text-emerald-400">
              β = {beta}
            </span>
          </div>
          <input
            type="range"
            min="50"
            max="400"
            step="10"
            value={beta}
            onChange={(e) => setBeta(Number(e.target.value))}
            className="w-full accent-emerald-600 dark:accent-emerald-400 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-600 dark:text-slate-400 font-mono font-semibold">
            <span>50 (Ισχύος)</span>
            <span>200 (BC547)</span>
            <span>400 (Υψηλό)</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
            Σχέση ενίσχυσης: Ic = β · Ib στην ενεργό περιοχή.
          </p>
        </div>

        {/* Supply Voltage Vcc */}
        <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-2.5 shadow-xs">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
              3. Τροφοδοσία Vcc
            </label>
            <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
              {vcc} V
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="24"
            step="1"
            value={vcc}
            onChange={(e) => setVcc(Number(e.target.value))}
            className="w-full accent-indigo-600 dark:accent-indigo-400 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-600 dark:text-slate-400 font-mono font-semibold">
            <span>5V</span>
            <span>12V (Τυπικό)</span>
            <span>24V</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
            Η μέγιστη τάση αποκοπής στην ευθεία φόρτου (Vce_max = Vcc).
          </p>
        </div>

        {/* Collector Resistor Rc */}
        <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-2.5 shadow-xs">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
              4. Αντίσταση Rc
            </label>
            <span className="text-xs font-mono font-bold text-amber-800 dark:text-amber-400">
              {rc_kOhms} kΩ
            </span>
          </div>
          <input
            type="range"
            min="1.0"
            max="10.0"
            step="0.2"
            value={rc_kOhms}
            onChange={(e) => setRc_kOhms(Number(e.target.value))}
            className="w-full accent-amber-600 dark:accent-amber-400 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-600 dark:text-slate-400 font-mono font-semibold">
            <span>1 kΩ</span>
            <span>2.2 kΩ</span>
            <span>10 kΩ</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
            Καθορίζει την κλίση της ευθείας φόρτου και το ρεύμα κόρου.
          </p>
        </div>
      </div>

      {/* Main Visual Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Load Line Chart (SVG) */}
        <div className="lg:col-span-6 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              Ευθεία Φόρτου DC & Σημείο Ηρεμίας Q
            </h4>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-xs ${sim.regionColor}`}>
              {sim.region}
            </span>
          </div>

          <div className="h-56 w-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-2 relative overflow-hidden flex items-center justify-center shadow-inner">
            <svg viewBox="-30 -20 280 200" className="w-full h-full">
              {/* Axes */}
              <line x1="0" y1="160" x2="230" y2="160" stroke={isDark ? '#475569' : '#cbd5e1'} strokeWidth="1.5" />
              <line x1="0" y1="0" x2="0" y2="160" stroke={isDark ? '#475569' : '#cbd5e1'} strokeWidth="1.5" />

              {/* Labels */}
              <text x="225" y="155" fill={isDark ? '#94a3b8' : '#475569'} fontSize="8" fontWeight="bold" textAnchor="end">Vce (V)</text>
              <text x="5" y="10" fill={isDark ? '#94a3b8' : '#475569'} fontSize="8" fontWeight="bold">Ic (mA)</text>

              {/* Ticks on axes */}
              <text x="0" y="172" fill={isDark ? '#64748b' : '#475569'} fontSize="7" textAnchor="middle">0</text>
              <text x="200" y="172" fill={isDark ? '#64748b' : '#475569'} fontSize="7" fontWeight="bold" textAnchor="middle">{vcc}V (Vcc)</text>
              <text x="-5" y="25" fill={isDark ? '#64748b' : '#475569'} fontSize="7" fontWeight="bold" textAnchor="end">{sim.maxIc_mA.toFixed(1)}</text>

              {/* Shaded Saturation and Cut-off areas */}
              <rect x="0" y="0" width="15" height="160" fill={isDark ? 'rgba(244, 63, 94, 0.12)' : 'rgba(244, 63, 94, 0.08)'} />
              <text x="3" y="100" fill="#e11d48" fontSize="7" fontWeight="bold" transform="rotate(-90 3,100)">Περιοχή Κόρου</text>

              <rect x="180" y="145" width="50" height="15" fill={isDark ? 'rgba(245, 158, 11, 0.12)' : 'rgba(245, 158, 11, 0.08)'} />
              <text x="190" y="157" fill="#d97706" fontSize="7" fontWeight="bold">Αποκοπή</text>

              {/* DC Load Line (Vce_max = 200px, Ic_sat = 25px from top) */}
              <line x1="0" y1="25" x2="200" y2="160" stroke="#0284c7" strokeWidth="2.5" />

              {/* Coordinate calculations for Q-point */}
              {(() => {
                const qX = Math.min(200, Math.max(0, (sim.vce / vcc) * 200));
                const qY = Math.max(25, Math.min(160, 160 - (sim.ic_actual_mA / sim.maxIc_mA) * 135));

                return (
                  <g>
                    {/* Projection dashed lines */}
                    <line x1={qX} y1="160" x2={qX} y2={qY} stroke="#e11d48" strokeDasharray="3 3" strokeWidth="1" />
                    <line x1="0" y1={qY} x2={qX} y2={qY} stroke="#e11d48" strokeDasharray="3 3" strokeWidth="1" />

                    {/* Q-point circle */}
                    <circle cx={qX} cy={qY} r="6" fill="#e11d48" stroke="#fff" strokeWidth="2" />
                    <text x={qX + 8} y={qY - 5} fill="#e11d48" fontSize="9" fontWeight="bold">
                      Q ({sim.vce.toFixed(1)}V, {sim.ic_actual_mA.toFixed(2)}mA)
                    </text>
                  </g>
                );
              })()}
            </svg>
          </div>

          <div className="flex justify-between items-center text-xs text-slate-700 dark:text-slate-400 mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 font-mono font-medium">
            <span>VCEQ: <strong className="text-slate-900 dark:text-white">{sim.vce.toFixed(2)} V</strong></span>
            <span>ICQ: <strong className="text-slate-900 dark:text-white">{sim.ic_actual_mA.toFixed(2)} mA</strong></span>
            <span>P_diss: <strong className="text-slate-900 dark:text-white">{sim.power_mW.toFixed(1)} mW</strong></span>
          </div>
        </div>

        {/* Right: Common Emitter AC Waveform (180° Phase Inversion!) */}
        <div className="lg:col-span-6 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              Ενίσχυση Σήματος & Αναστροφή Φάσης 180°
            </h4>
            <button
              onClick={() => setSignalActive(!signalActive)}
              className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:text-white cursor-pointer shadow-xs"
            >
              {signalActive ? 'Πάγωμα Σήματος' : 'Έναρξη AC'}
            </button>
          </div>

          {/* SVG AC Waveform display */}
          <div className="h-44 w-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-2 relative overflow-hidden flex flex-col justify-around shadow-inner">
            {/* Input Wave at Base (Small sine wave) */}
            <div className="space-y-0.5">
              <div className="flex justify-between text-[10px] text-cyan-900 dark:text-cyan-300 font-bold">
                <span>ΣΗΜΑ ΕΙΣΟΔΟΥ (Βάση - Vin: 20 mVpp)</span>
                <span>Φάση: 0°</span>
              </div>
              <svg viewBox="0 -15 320 30" className="w-full h-8">
                <line x1="0" y1="0" x2="320" y2="0" stroke={isDark ? '#334155' : '#cbd5e1'} strokeWidth="1" />
                <path
                  d="M 0 0 Q 40 -12 80 0 T 160 0 T 240 0 T 320 0"
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="2"
                />
              </svg>
            </div>

            {/* Output Wave at Collector (Amplified & Inverted 180°!) */}
            <div className="space-y-0.5 pt-1 border-t border-slate-200 dark:border-slate-800">
              <div className="flex justify-between text-[10px] text-emerald-900 dark:text-emerald-400 font-bold">
                <span>ΣΗΜΑ ΕΞΟΔΟΥ (Συλλέκτης - Vout: 1.2 Vpp)</span>
                <span className="text-rose-600 dark:text-rose-400 font-bold">Αναστροφή Φάσης: 180° ⮌</span>
              </div>
              <svg viewBox="0 -25 320 50" className="w-full h-12">
                <line x1="0" y1="0" x2="320" y2="0" stroke={isDark ? '#334155' : '#cbd5e1'} strokeWidth="1" />
                {/* 180 degree inverted wave: starts downwards! */}
                <path
                  d="M 0 0 Q 40 22 80 0 T 160 0 T 240 0 T 320 0"
                  fill="none"
                  stroke="#059669"
                  strokeWidth="2.5"
                />
              </svg>
            </div>
          </div>

          <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs space-y-1 mt-2 shadow-xs">
            <div className="flex justify-between text-slate-700 dark:text-slate-300 font-medium">
              <span>Συνδεσμολογία:</span>
              <span className="font-bold text-slate-900 dark:text-white">Κοινού Εκπομπού (CE)</span>
            </div>
            <div className="flex justify-between text-slate-700 dark:text-slate-300 font-medium">
              <span>Σχέση Ρευμάτων:</span>
              <span className="font-mono font-bold text-cyan-800 dark:text-cyan-400">
                Ie ({sim.ie_mA.toFixed(2)}mA) = Ib ({sim.ib_mA.toFixed(3)}mA) + Ic ({sim.ic_actual_mA.toFixed(2)}mA)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Educational Summary */}
      <div className="p-4 bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-500/30 rounded-2xl text-xs text-slate-800 dark:text-cyan-200 flex items-start gap-2.5 shadow-xs">
        <Info className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-cyan-950 dark:text-white block mb-0.5 font-bold">
            Βασικός Κανόνας Εξετάσεων ΕΠΑΛ (Συνδεσμολογία Κοινού Εκπομπού):
          </strong>
          Στον ενισχυτή κοινού εκπομπού (CE), όταν η τάση εισόδου στη βάση ανεβαίνει, το τρανζίστορ άγει περισσότερο και η τάση στον συλλέκτη πέφτει. Αυτό σημαίνει ότι υπάρχει πάντοτε <strong>αναστροφή φάσης κατά 180°</strong>! Για να έχουμε πιστή ενίσχυση χωρίς παραμόρφωση (αποκοπή ή κόρο), το σημείο Q ρυθμίζεται στη μέση της ευθείας φόρτου (VceQ ≈ Vcc/2).
        </div>
      </div>
    </div>
  );
};
