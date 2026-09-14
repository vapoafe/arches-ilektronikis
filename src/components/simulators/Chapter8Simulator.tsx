import React, { useState, useMemo } from 'react';
import { Binary, ToggleLeft, ToggleRight, Lightbulb, Check, Zap } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const Chapter8Simulator: React.FC = () => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'converter' | 'gates' | 'combinational'>('gates');

  // Converter state
  const [decNumber, setDecNumber] = useState<number>(13);
  const [binaryBits, setBinaryBits] = useState<number[]>([0, 0, 0, 0, 1, 1, 0, 1]); // 8-bit representation of 13

  // Update binary bits when decimal number changes
  const handleDecChange = (val: number) => {
    const clamped = Math.max(0, Math.min(255, val || 0));
    setDecNumber(clamped);
    const bits: number[] = [];
    for (let i = 7; i >= 0; i--) {
      bits.push((clamped >> i) & 1);
    }
    setBinaryBits(bits);
  };

  // Toggle single bit
  const handleToggleBit = (index: number) => {
    const newBits = [...binaryBits];
    newBits[index] = newBits[index] === 1 ? 0 : 1;
    setBinaryBits(newBits);
    // recalculate decimal
    let newDec = 0;
    for (let i = 0; i < 8; i++) {
      newDec += newBits[i] * Math.pow(2, 7 - i);
    }
    setDecNumber(newDec);
  };

  // Step-by-step division breakdown
  const divisionSteps = useMemo(() => {
    const steps: { quotient: number; remainder: number; prev: number }[] = [];
    let curr = decNumber;
    if (curr === 0) {
      steps.push({ prev: 0, quotient: 0, remainder: 0 });
      return steps;
    }
    while (curr > 0) {
      const rem = curr % 2;
      const quot = Math.floor(curr / 2);
      steps.push({ prev: curr, quotient: quot, remainder: rem });
      curr = quot;
    }
    return steps;
  }, [decNumber]);

  // Gates Lab state
  const [selectedGate, setSelectedGate] = useState<'AND' | 'OR' | 'NOT' | 'NAND' | 'NOR' | 'XOR' | 'XNOR'>('AND');
  const [inputA, setInputA] = useState<boolean>(true);
  const [inputB, setInputB] = useState<boolean>(false);

  // Gate evaluation
  const gateOutput = useMemo(() => {
    switch (selectedGate) {
      case 'NOT':
        return !inputA;
      case 'AND':
        return inputA && inputB;
      case 'OR':
        return inputA || inputB;
      case 'NAND':
        return !(inputA && inputB);
      case 'NOR':
        return !(inputA || inputB);
      case 'XOR':
        return inputA !== inputB;
      case 'XNOR':
        return inputA === inputB;
    }
  }, [selectedGate, inputA, inputB]);

  // Gate details for truth table and explanation
  const gateInfo = useMemo(() => {
    switch (selectedGate) {
      case 'NOT':
        return {
          title: 'Πύλη NOT (Αναστροφέας)',
          expression: 'Y = Ā (NOT A)',
          icModel: '74HC04 (Hex Inverter)',
          switchEquivalent: 'Διακόπτης παράλληλα με τη λάμπα (όταν κλείνει, βραχυκυκλώνει τη λάμπα και σβήνει)',
          tableRows: [
            { a: 0, b: '-', y: 1 },
            { a: 1, b: '-', y: 0 }
          ]
        };
      case 'AND':
        return {
          title: 'Πύλη AND (ΚΑΙ)',
          expression: 'Y = A · B',
          icModel: '74HC08 (Quad 2-Input AND)',
          switchEquivalent: 'ΔΥΟ ΔΙΑΚΟΠΤΕΣ ΣΕ ΣΕΙΡΑ: Η λάμπα ανάβει ΜΟΝΟ ΑΝ κλείσουν και οι δύο!',
          tableRows: [
            { a: 0, b: 0, y: 0 },
            { a: 0, b: 1, y: 0 },
            { a: 1, b: 0, y: 0 },
            { a: 1, b: 1, y: 1 }
          ]
        };
      case 'OR':
        return {
          title: 'Πύλη OR (Ή)',
          expression: 'Y = A + B',
          icModel: '74HC32 (Quad 2-Input OR)',
          switchEquivalent: 'ΔΥΟ ΔΙΑΚΟΠΤΕΣ ΠΑΡΑΛΛΗΛΑ: Η λάμπα ανάβει αν κλείσει ο ένας ΕΙΤΕ ο άλλος ΕΙΤΕ και οι δύο!',
          tableRows: [
            { a: 0, b: 0, y: 0 },
            { a: 0, b: 1, y: 1 },
            { a: 1, b: 0, y: 1 },
            { a: 1, b: 1, y: 1 }
          ]
        };
      case 'NAND':
        return {
          title: 'Πύλη NAND (ΟΧΙ-ΚΑΙ) - Καθολική Πύλη',
          expression: 'Y = (A · B)̄',
          icModel: '74HC00 (Quad 2-Input NAND)',
          switchEquivalent: 'Αντίστροφη της AND: Η έξοδος είναι 0 ΜΟΝΟ όταν και οι δύο είσοδοι είναι 1.',
          tableRows: [
            { a: 0, b: 0, y: 1 },
            { a: 0, b: 1, y: 1 },
            { a: 1, b: 0, y: 1 },
            { a: 1, b: 1, y: 0 }
          ]
        };
      case 'NOR':
        return {
          title: 'Πύλη NOR (ΟΧΙ-Ή) - Καθολική Πύλη',
          expression: 'Y = (A + B)̄',
          icModel: '74HC02 (Quad 2-Input NOR)',
          switchEquivalent: 'Αντίστροφη της OR: Η έξοδος είναι 1 ΜΟΝΟ όταν και οι δύο είσοδοι είναι 0.',
          tableRows: [
            { a: 0, b: 0, y: 1 },
            { a: 0, b: 1, y: 0 },
            { a: 1, b: 0, y: 0 },
            { a: 1, b: 1, y: 0 }
          ]
        };
      case 'XOR':
        return {
          title: 'Πύλη XOR (Αποκλειστικό Ή)',
          expression: 'Y = A ⊕ B',
          icModel: '74HC86 (Quad 2-Input XOR)',
          switchEquivalent: 'Έξοδος 1 όταν οι είσοδοι είναι ΔΙΑΦΟΡΕΤΙΚΕΣ μεταξύ τους (A ≠ B).',
          tableRows: [
            { a: 0, b: 0, y: 0 },
            { a: 0, b: 1, y: 1 },
            { a: 1, b: 0, y: 1 },
            { a: 1, b: 1, y: 0 }
          ]
        };
      case 'XNOR':
        return {
          title: 'Πύλη XNOR (Αποκλειστικό ΟΧΙ-Ή)',
          expression: 'Y = (A ⊕ B)̄',
          icModel: '74HC266 (Quad 2-Input XNOR)',
          switchEquivalent: 'Έξοδος 1 όταν οι είσοδοι είναι ΙΔΙΕΣ (ανιχνευτής ισοτιμίας A = B).',
          tableRows: [
            { a: 0, b: 0, y: 1 },
            { a: 0, b: 1, y: 0 },
            { a: 1, b: 0, y: 0 },
            { a: 1, b: 1, y: 1 }
          ]
        };
    }
  }, [selectedGate]);

  // Combinational Circuit Alarm simulation
  const [sensorDoor, setSensorDoor] = useState<boolean>(true); // 1 = door open
  const [sensorArmed, setSensorArmed] = useState<boolean>(true); // 1 = system armed
  const [sensorNight, setSensorNight] = useState<boolean>(false); // 1 = is dark
  const alarmSiren = (sensorDoor && sensorArmed) || (sensorDoor && sensorNight);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-sm dark:shadow-xl space-y-6 transition-colors">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-800 dark:text-cyan-400 font-bold text-xs tracking-wider uppercase">
            <Binary className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            Διαδραστικό Εργαστήριο Κεφαλαίου 8
          </div>
          <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mt-1">
            Ψηφιακή Λογική, Μετατροπές Δυαδικού & Πύλες
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Πειραματιστείτε με διακόπτες 0/1, πίνακες αλήθειας, ισοδύναμα κυκλώματα και μετατροπές βάσεων.
          </p>
        </div>

        <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 dark:bg-slate-950 p-1 border border-slate-300 dark:border-slate-800 self-start sm:self-center">
          <button
            onClick={() => setActiveTab('gates')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'gates'
                ? 'bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 shadow-xs'
                : 'text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            Λογικές Πύλες & Διακόπτες
          </button>
          <button
            onClick={() => setActiveTab('converter')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'converter'
                ? 'bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 shadow-xs'
                : 'text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            Μετατροπέας 10 ↔ 2
          </button>
          <button
            onClick={() => setActiveTab('combinational')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'combinational'
                ? 'bg-purple-600 dark:bg-purple-500 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            Συνδυαστικό Συναγερμού
          </button>
        </div>
      </div>

      {activeTab === 'gates' ? (
        /* TAB 1: LOGIC GATES LAB */
        <div className="space-y-6">
          {/* Gate Selector Buttons */}
          <div className="flex flex-wrap gap-2">
            {(['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR'] as const).map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGate(g)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  selectedGate === g
                    ? 'bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 border-cyan-600 dark:border-cyan-500 shadow-md shadow-cyan-500/20'
                    : 'bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Interactive Circuit with Switches & Output Lamp */}
            <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">{gateInfo.title}</h4>
                  <span className="text-xs font-mono text-cyan-800 dark:text-cyan-400 font-bold">
                    {gateInfo.expression}
                  </span>
                </div>
                <span className="text-xs px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-300 font-mono font-bold shadow-xs">
                  {gateInfo.icModel}
                </span>
              </div>

              {/* Interactive Switches & Gate Diagram */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-inner">
                {/* Inputs Box */}
                <div className="space-y-4 w-full sm:w-auto">
                  {/* Switch A */}
                  <div className="flex items-center justify-between sm:justify-start gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-300">Διακόπτης A:</span>
                    <button
                      onClick={() => setInputA(!inputA)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        inputA ? 'bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                      }`}
                    >
                      {inputA ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      {inputA ? '1 (HIGH)' : '0 (LOW)'}
                    </button>
                  </div>

                  {/* Switch B (if not NOT gate) */}
                  {selectedGate !== 'NOT' && (
                    <div className="flex items-center justify-between sm:justify-start gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-300">Διακόπτης B:</span>
                      <button
                        onClick={() => setInputB(!inputB)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                          inputB ? 'bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                        }`}
                      >
                        {inputB ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                        {inputB ? '1 (HIGH)' : '0 (LOW)'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Gate Symbol SVG */}
                <div className="w-28 h-20 flex items-center justify-center relative">
                  <svg viewBox="0 0 100 70" className="w-full h-full">
                    {/* Input lines */}
                    <line x1="0" y1="20" x2="30" y2="20" stroke={inputA ? '#0284c7' : isDark ? '#64748b' : '#94a3b8'} strokeWidth="3" />
                    {selectedGate !== 'NOT' && (
                      <line x1="0" y1="50" x2="30" y2="50" stroke={inputB ? '#0284c7' : isDark ? '#64748b' : '#94a3b8'} strokeWidth="3" />
                    )}

                    {/* Gate Body based on type */}
                    {selectedGate === 'AND' || selectedGate === 'NAND' ? (
                      <path d="M 30 10 L 55 10 A 25 25 0 0 1 55 60 L 30 60 Z" fill={isDark ? '#1e293b' : '#f1f5f9'} stroke="#0284c7" strokeWidth="2.5" />
                    ) : selectedGate === 'OR' || selectedGate === 'NOR' ? (
                      <path d="M 30 10 Q 45 35 30 60 Q 60 60 70 35 Q 60 10 30 10 Z" fill={isDark ? '#1e293b' : '#f1f5f9'} stroke="#0284c7" strokeWidth="2.5" />
                    ) : selectedGate === 'XOR' || selectedGate === 'XNOR' ? (
                      <>
                        <path d="M 23 10 Q 38 35 23 60" fill="none" stroke="#0284c7" strokeWidth="2.5" />
                        <path d="M 30 10 Q 45 35 30 60 Q 60 60 70 35 Q 60 10 30 10 Z" fill={isDark ? '#1e293b' : '#f1f5f9'} stroke="#0284c7" strokeWidth="2.5" />
                      </>
                    ) : (
                      /* NOT Gate */
                      <polygon points="30,10 70,35 30,60" fill={isDark ? '#1e293b' : '#f1f5f9'} stroke="#0284c7" strokeWidth="2.5" />
                    )}

                    {/* Inversion circle for NOT, NAND, NOR, XNOR */}
                    {(selectedGate === 'NOT' || selectedGate === 'NAND' || selectedGate === 'NOR' || selectedGate === 'XNOR') && (
                      <circle cx="75" cy="35" r="4" fill={isDark ? '#0f172a' : '#ffffff'} stroke="#0284c7" strokeWidth="2" />
                    )}

                    {/* Output line */}
                    <line
                      x1={selectedGate === 'NOT' || selectedGate === 'NAND' || selectedGate === 'NOR' || selectedGate === 'XNOR' ? "79" : "70"}
                      y1="35"
                      x2="100"
                      y2="35"
                      stroke={gateOutput ? '#16a34a' : isDark ? '#64748b' : '#94a3b8'}
                      strokeWidth="3"
                    />
                  </svg>
                </div>

                {/* Output Lamp */}
                <div className="flex flex-col items-center justify-center p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 min-w-[120px] shadow-xs">
                  <div
                    className="w-14 h-14 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center transition-all duration-200 mb-2"
                    style={{
                      backgroundColor: gateOutput ? 'rgba(34, 197, 94, 0.9)' : isDark ? '#1e293b' : '#e2e8f0',
                      boxShadow: gateOutput ? '0 0 25px rgba(34, 197, 94, 0.9)' : 'none'
                    }}
                  >
                    <Lightbulb className={`w-7 h-7 ${gateOutput ? 'text-white' : 'text-slate-400 dark:text-slate-600'}`} />
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Έξοδος Y:</span>
                  <span className={`text-sm font-mono font-extrabold ${gateOutput ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-500'}`}>
                    {gateOutput ? '1 (HIGH / +5V)' : '0 (LOW / 0V)'}
                  </span>
                </div>
              </div>

              {/* Switch Equivalent Explanation */}
              <div className="bg-white dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 shadow-xs">
                <strong className="text-slate-900 dark:text-white block mb-1 font-bold">
                  🔌 Ισοδύναμο Κύκλωμα με Ηλεκτρικούς Διακόπτες:
                </strong>
                {gateInfo.switchEquivalent}
              </div>
            </div>

            {/* Right: Truth Table & Educational Highlight */}
            <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xs">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                  Πίνακας Αλήθειας (Truth Table)
                </h4>
                <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 uppercase font-mono border-b border-slate-200 dark:border-slate-800 font-bold">
                      <tr>
                        <th className="p-2.5 text-center">Είσοδος A</th>
                        {selectedGate !== 'NOT' && <th className="p-2.5 text-center">Είσοδος B</th>}
                        <th className="p-2.5 text-center bg-cyan-100 dark:bg-cyan-950/40 text-cyan-900 dark:text-cyan-300">Έξοδος Y</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono">
                      {gateInfo.tableRows.map((row, idx) => {
                        const isCurrentActive =
                          selectedGate === 'NOT'
                            ? (inputA ? 1 : 0) === row.a
                            : (inputA ? 1 : 0) === row.a && (inputB ? 1 : 0) === row.b;

                        return (
                          <tr
                            key={idx}
                            className={`transition-colors ${
                              isCurrentActive
                                ? 'bg-cyan-100 dark:bg-cyan-500/20 text-slate-900 dark:text-white font-bold'
                                : 'text-slate-700 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                            }`}
                          >
                            <td className="p-2.5 text-center">{row.a}</td>
                            {selectedGate !== 'NOT' && <td className="p-2.5 text-center">{row.b}</td>}
                            <td className="p-2.5 text-center font-bold">
                              <span
                                className={`inline-block px-2 py-0.5 rounded-md text-xs ${
                                  row.y === 1
                                    ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                }`}
                              >
                                {row.y}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-3.5 bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-500/30 rounded-xl text-xs text-slate-800 dark:text-cyan-200 shadow-xs">
                <strong className="text-cyan-950 dark:text-cyan-300 block mb-1 font-bold">
                  Τεχνικό Χαρακτηριστικό TTL / CMOS:
                </strong>
                Στα ψηφιακά ολοκληρωμένα (π.χ. σειρά 74HC), η τάση εισόδου &gt; 3.15V αναγνωρίζεται ως <strong>1</strong>, ενώ τάση &lt; 1.35V ως <strong>0</strong>. Οι αχρησιμοποίητες είσοδοι δεν πρέπει να μένουν ποτέ ασύνδετες!
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'converter' ? (
        /* TAB 2: DECIMAL TO BINARY CONVERTER WITH STEP-BY-STEP ARITHMETIC */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Input Decimal */}
            <div className="md:col-span-5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4 shadow-xs">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider block">
                Εισαγωγή Δεκαδικού Αριθμού (0 - 255)
              </label>

              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={decNumber}
                  onChange={(e) => handleDecChange(Number(e.target.value))}
                  className="w-28 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xl font-mono font-extrabold text-cyan-800 dark:text-cyan-400 text-center focus:border-cyan-500 focus:outline-none shadow-xs"
                />
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={decNumber}
                  onChange={(e) => handleDecChange(Number(e.target.value))}
                  className="flex-1 accent-cyan-600 dark:accent-cyan-400 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
                />
              </div>

              {/* 8-bit Interactive Register */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-300 block">
                  Δυαδικός Καταχωρητής 8-bit (Πατήστε στα bits για αλλαγή):
                </span>
                <div className="grid grid-cols-8 gap-1.5">
                  {binaryBits.map((bit, idx) => {
                    const weight = Math.pow(2, 7 - idx);
                    return (
                      <button
                        key={idx}
                        onClick={() => handleToggleBit(idx)}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                          bit === 1
                            ? 'bg-emerald-100 dark:bg-emerald-500/20 border-emerald-400 dark:border-emerald-500 text-emerald-900 dark:text-emerald-300 font-bold shadow-xs'
                            : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="block text-base font-mono font-extrabold">{bit}</span>
                        <span className="block text-[9px] text-slate-600 dark:text-slate-400 font-mono mt-0.5">
                          2^{7 - idx} ({weight})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Conversion Formula Result */}
              <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs space-y-1 shadow-xs">
                <div className="text-slate-600 dark:text-slate-400 font-medium">Δεκαδικό σε Δυαδικό:</div>
                <div className="font-mono text-cyan-800 dark:text-cyan-300 font-extrabold text-sm">
                  ({decNumber})₁₀ = ({binaryBits.join('')})₂
                </div>
              </div>
            </div>

            {/* Step-by-Step Arithmetic Calculation Explanation */}
            <div className="md:col-span-7 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4 shadow-xs">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Βήμα-Βήμα Μέθοδος Διαδοχικών Διαιρέσεων διά 2
              </h4>

              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                Διαιρούμε συνεχώς με το 2 και σημειώνουμε το <strong>υπόλοιπο (0 ή 1)</strong>. Διαβάζοντας τα υπόλοιπα από το τέλος προς την αρχή (από κάτω προς τα πάνω), σχηματίζουμε τον δυαδικό αριθμό!
              </p>

              <div className="max-h-52 overflow-y-auto space-y-1.5 pr-2 font-mono text-xs">
                {divisionSteps.map((s, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs"
                  >
                    <span className="text-slate-800 dark:text-slate-300">
                      {s.prev} ÷ 2 = <strong className="text-slate-950 dark:text-white">{s.quotient}</strong>
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">με υπόλοιπο</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-500 text-emerald-900 dark:text-emerald-300 font-bold">
                      {s.remainder}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30 rounded-xl text-xs text-emerald-950 dark:text-emerald-200 shadow-xs">
                <strong className="font-bold">Αντίστροφη Επαλήθευση (Δυαδικό ➔ Δεκαδικό):</strong>
                <div className="font-mono mt-1 text-slate-700 dark:text-slate-300">
                  {binaryBits
                    .map((b, i) => (b === 1 ? `1·2^${7 - i} (${Math.pow(2, 7 - i)})` : null))
                    .filter(Boolean)
                    .join(' + ') || '0'}{' '}
                  = <strong className="text-slate-900 dark:text-white">{decNumber}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* TAB 3: COMBINATIONAL CIRCUIT EXAMPLE */
        <div className="bg-purple-50/60 dark:bg-slate-950/80 border border-purple-300 dark:border-purple-500/30 rounded-2xl p-5 space-y-5 shadow-xs">
          <div className="border-b border-purple-200 dark:border-slate-800 pb-3">
            <span className="text-xs font-bold uppercase text-purple-900 dark:text-purple-400 tracking-wider">
              Εφαρμογή Κεφαλαίου 8.3
            </span>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              Σχεδίαση Συνδυαστικού Κυκλώματος Συναγερμού
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-400 mt-1 font-medium">
              Υλοποίηση λογικής συνάρτησης με πύλες AND και OR: Η σειρήνα χτυπάει αν (Πόρτα Ανοιχτή AND Συναγερμός Οπλισμένος) OR (Πόρτα Ανοιχτή AND Νύχτα).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Input 1 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex items-center justify-between shadow-xs">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-300">Αισθητήρας Πόρτας:</span>
              <button
                onClick={() => setSensorDoor(!sensorDoor)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer transition-all ${
                  sensorDoor ? 'bg-rose-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                }`}
              >
                {sensorDoor ? 'ΑΝΟΙΧΤΗ (1)' : 'ΚΛΕΙΣΤΗ (0)'}
              </button>
            </div>

            {/* Input 2 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex items-center justify-between shadow-xs">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-300">Οπλισμός Συναγερμού:</span>
              <button
                onClick={() => setSensorArmed(!sensorArmed)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer transition-all ${
                  sensorArmed ? 'bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                }`}
              >
                {sensorArmed ? 'ΟΠΛΙΣΜΕΝΟΣ (1)' : 'ΑΦΟΠΛΙΣΜΕΝΟΣ (0)'}
              </button>
            </div>

            {/* Input 3 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex items-center justify-between shadow-xs">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-300">Αισθητήρας Φωτός (LDR):</span>
              <button
                onClick={() => setSensorNight(!sensorNight)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer transition-all ${
                  sensorNight ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                }`}
              >
                {sensorNight ? 'ΝΥΧΤΑ (1)' : 'ΗΜΕΡΑ (0)'}
              </button>
            </div>
          </div>

          {/* Result Output Alarm */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between shadow-xs ${
            alarmSiren
              ? 'bg-rose-100 dark:bg-rose-950/60 border-rose-400 dark:border-rose-500 text-rose-950 dark:text-rose-200'
              : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400'
          }`}>
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  alarmSiren ? 'bg-rose-600 text-white animate-bounce' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}
              >
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider block">
                  Έξοδος Σειρήνας Συναγερμού
                </span>
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  {alarmSiren ? '🚨 ΕΝΕΡΓΟΠΟΙΗΣΗ ΣΕΙΡΗΝΑΣ (Στάθμη 1)' : '🛡️ ΣΥΣΤΗΜΑ ΣΕ ΗΡΕΜΙΑ (Στάθμη 0)'}
                </span>
              </div>
            </div>

            <div className="text-right text-xs font-mono">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Λογική Έκφραση:</span>
              <div className="font-bold text-slate-900 dark:text-white text-sm">
                S = (Π · Ο) + (Π · Ν)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
