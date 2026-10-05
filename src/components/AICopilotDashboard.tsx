import React, { useState } from 'react';
import { BloodInventoryItem, DispatchLog, UserProfile, BloodType } from '../types';
import { REAL_HOSPITALS } from '../data/mockData';
import { 
  Bot, 
  AlertTriangle, 
  Send, 
  Sparkles, 
  Truck, 
  ShieldAlert, 
  TrendingUp, 
  CheckCircle2, 
  Thermometer, 
  Flame, 
  Droplet
} from 'lucide-react';

interface AICopilotDashboardProps {
  currentUser: UserProfile;
  inventory: BloodInventoryItem[];
  dispatchLogs: DispatchLog[];
  onUpdateInventory: (newInv: BloodInventoryItem[]) => void;
  onAddDispatchLog: (log: DispatchLog) => void;
}

export const AICopilotDashboard: React.FC<AICopilotDashboardProps> = ({
  currentUser,
  inventory,
  dispatchLogs,
  onUpdateInventory,
  onAddDispatchLog,
}) => {
  // Scenario Predictor State
  const [selectedScenario, setSelectedScenario] = useState<string>('highway_collision');
  const [predictionResult, setPredictionResult] = useState<{
    demandEstimateText: string;
    criticalAlerts: string[];
    mtpUnitsNeeded: { rbc: number; ffp: number; platelets: number; cryo: number };
    shortageRiskTypes: BloodType[];
  } | null>(null);

  // MTP Rapid Calculator
  const [estimatedBloodLossLiters, setEstimatedBloodLossLiters] = useState<number>(2.5);
  const [patientWeightKg, setPatientWeightKg] = useState<number>(75);
  const [activeMTPCooler, setActiveMTPCooler] = useState<{
    prbc: number;
    ffp: number;
    platelets: number;
    activated: boolean;
  }>({ prbc: 6, ffp: 6, platelets: 1, activated: false });

  // AI Copilot Chat state
  const [chatMessages, setChatMessages] = useState<
    Array<{ sender: 'user' | 'copilot'; text: string; time: string; model?: string }>
  >([
    {
      sender: 'copilot',
      text: `Hello ${currentUser.name}. I am your Clinical Transfusion & Logistics Copilot. I am actively monitoring regional trauma reserves across Johns Hopkins, Mass General, Mayo Clinic, and affiliated centers. How can I assist with triage, emergency release protocols, or inventory balancing today?`,
      time: 'Just now',
      model: 'gemini-3.8-flash',
    },
  ]);
  const [userQuery, setUserQuery] = useState('');
  const [isCopilotThinking, setIsCopilotThinking] = useState(false);

  // New Dispatch Request Modal state
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [dispatchFrom, setDispatchFrom] = useState('Massachusetts General Hospital');
  const [dispatchTo, setDispatchTo] = useState('The Johns Hopkins Hospital');
  const [dispatchBloodType, setDispatchBloodType] = useState<BloodType>('O-');
  const [dispatchUnits, setDispatchUnits] = useState<number>(6);
  const [dispatchPriority, setDispatchPriority] = useState<'STAT_EMERGENCY' | 'URGENT_SURGICAL' | 'ROUTINE_TRANSFER'>('STAT_EMERGENCY');

  // Evaluate Demand Prediction
  const handleRunPrediction = (scenarioKey: string) => {
    setSelectedScenario(scenarioKey);
    if (scenarioKey === 'highway_collision') {
      setPredictionResult({
        demandEstimateText:
          'Multi-vehicle highway collision incident (estimated 6-8 trauma victims with Class III/IV hemorrhagic shock). Projected deficit: 18-24 units of Packed RBCs and 12 units of Fresh Frozen Plasma within 90 minutes.',
        criticalAlerts: [
          'Immediate risk of O-Negative depletion at regional Level 1 trauma hub.',
          'Activate Massive Transfusion Protocol (MTP) Cooler Pack 1 & 2 for ER Bays 3 and 4.',
          'Request emergency courier transfer of 8 O- units from partner hospitals.',
        ],
        mtpUnitsNeeded: { rbc: 18, ffp: 18, platelets: 3, cryo: 20 },
        shortageRiskTypes: ['O-', 'O+', 'B-'],
      });
    } else if (scenarioKey === 'holiday_surge') {
      setPredictionResult({
        demandEstimateText:
          'Long weekend surgical rebound and holiday road travel surge. Voluntary donor walk-ins decrease by ~35% while emergency trauma admissions increase by ~22%.',
        criticalAlerts: [
          '48-hour platelet inventory will fall below safe threshold of 15 units.',
          'Schedule targeted apheresis recall for top registered regular donors.',
          'Pre-position 10 O- units in high-velocity emergency departments.',
        ],
        mtpUnitsNeeded: { rbc: 35, ffp: 25, platelets: 12, cryo: 10 },
        shortageRiskTypes: ['O-', 'A-', 'B-', 'AB-'],
      });
    } else {
      setPredictionResult({
        demandEstimateText:
          'Baseline routine clinical operations and elective orthopedic/cardiovascular surgeries. Normal consumption rate.',
        criticalAlerts: [
          'Platelet unit lot #PLT-981 expires in 36 hours. Prioritize for hematology ward.',
          'All red cell components within safe regional operational reserve margins.',
        ],
        mtpUnitsNeeded: { rbc: 8, ffp: 6, platelets: 2, cryo: 0 },
        shortageRiskTypes: ['O-'],
      });
    }
  };

  // Run initial prediction on load if empty
  if (!predictionResult) {
    handleRunPrediction('highway_collision');
  }

  // Handle Send Query to Gemini Copilot
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim() || isCopilotThinking) return;

    const queryText = userQuery.trim();
    setUserQuery('');
    const userMsg = {
      sender: 'user' as const,
      text: queryText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsCopilotThinking(true);

    try {
      const response = await fetch('/api/gemini/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: queryText,
          scenario: selectedScenario,
          role: currentUser.role,
          bloodStockContext: inventory.map((i) => ({
            type: i.bloodType,
            prbc: i.packedRbcUnits,
            status: i.status,
            expiringIn48h: i.expiringIn48h,
          })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setChatMessages((prev) => [
          ...prev,
          {
            sender: 'copilot',
            text: data.text || 'Protocol recommendation complete.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            model: data.source || 'gemini-3.8-flash',
          },
        ]);
      } else {
        throw new Error('Server returned non-200');
      }
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'copilot',
          text: `[Emergency Protocol Guideline]:
1. For hemorrhagic shock triage, order uncrossed O-Negative PRBC immediately while type & screen blood sample is dispatched to blood bank lab.
2. In massive bleeding, maintain 1:1:1 balanced ratio (PRBC : FFP : Platelets) to avoid dilutional coagulopathy and hypothermia.
3. If Rh-negative red cells fall below threshold, Rh-positive PRBC may be transfused to adult male trauma patients or females post-childbearing age (>50) to preserve O-Negative for pediatric and fertile female resuscitation.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          model: 'clinical-fallback-engine',
        },
      ]);
    } finally {
      setIsCopilotThinking(false);
    }
  };

  const handleActivateMTP = () => {
    setActiveMTPCooler({
      prbc: 6,
      ffp: 6,
      platelets: 1,
      activated: true,
    });

    const updated = inventory.map((item) => {
      if (item.bloodType === 'O-') {
        return {
          ...item,
          packedRbcUnits: Math.max(0, item.packedRbcUnits - 6),
          status: item.packedRbcUnits - 6 < item.minSafeThreshold ? 'critical' : item.status,
        };
      }
      return item;
    });
    onUpdateInventory(updated);
  };

  const handleCreateDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: DispatchLog = {
      id: `disp-${Date.now()}`,
      dispatchId: `TRF-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      fromHospital: dispatchFrom,
      toHospital: dispatchTo,
      bloodType: dispatchBloodType,
      component: 'Packed Red Blood Cells (PRBC)',
      units: Number(dispatchUnits),
      priority: dispatchPriority,
      status: 'In Transit',
      etaMinutes: 25,
      tempCelsius: 3.8,
      courier: 'AeroMed CryoTransit Express #52',
      timestamp: 'Just now',
    };

    onAddDispatchLog(newLog);
    setShowDispatchModal(false);
  };

  return (
    <div className="space-y-8 text-left">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 border border-purple-200 text-purple-800 text-xs font-bold mb-2">
            <Bot className="w-4 h-4 text-purple-600" />
            AI Clinical Decision Support &amp; Regional Logistics
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Transfusion Copilot &amp; Inventory Balancer
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Real-time supply forecasting, emergency MTP activation protocols, and inter-hospital cryo-dispatch coordination.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDispatchModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold shadow-md shadow-purple-700/20 transition-all cursor-pointer"
          >
            <Truck className="w-4 h-4" />
            Initiate Emergency Inter-Hospital Transfer
          </button>
        </div>
      </div>

      {/* Row 1: Real-Time Blood Stock Monitor Across All 8 Types */}
      <div className="rounded-3xl bg-white border border-slate-200 p-6 md:p-7 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Droplet className="w-5 h-5 text-rose-600 fill-rose-600" />
              Regional Emergency Blood Inventory Reserve
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Current units on hand vs clinical reserve safety thresholds across trauma departments.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-rose-800 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
              Critical Shortage (&lt;Threshold)
            </span>
            <span className="flex items-center gap-1.5 text-emerald-800 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              Optimal Buffer
            </span>
          </div>
        </div>

        {/* 8 Blood Types Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {inventory.map((item) => {
            const isCritical = item.status === 'critical';
            const isLow = item.status === 'low';

            return (
              <div
                key={item.bloodType}
                className={`p-3.5 rounded-2xl border text-center transition-all ${
                  isCritical
                    ? 'bg-rose-50/70 border-rose-300 shadow-xs'
                    : isLow
                    ? 'bg-amber-50/70 border-amber-300'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-slate-900">{item.bloodType}</span>
                  {isCritical ? (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-200 text-rose-900 border border-rose-300">
                      CRIT
                    </span>
                  ) : isLow ? (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 border border-amber-300">
                      LOW
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-200 text-emerald-900">
                      OK
                    </span>
                  )}
                </div>

                <div className="text-2xl font-black text-slate-900 my-1">{item.packedRbcUnits}</div>
                <div className="text-[10px] text-slate-500 font-mono">
                  Min: {item.minSafeThreshold} units
                </div>

                {/* Sub components */}
                <div className="mt-2 pt-2 border-t border-slate-200 text-[9px] text-slate-600 space-y-0.5 text-left">
                  <div>Whole: {item.wholeBloodUnits}</div>
                  <div>Platelets: {item.plateletUnits}</div>
                  <div>Plasma: {item.plasmaUnits}</div>
                  {item.expiringIn48h > 0 && (
                    <div className="text-amber-700 font-bold">
                      {item.expiringIn48h} exp &lt;48h
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Row 2: AI/ML Demand Prediction & Massive Transfusion Protocol (MTP) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: AI/ML Demand Forecast Simulation */}
        <div className="lg:col-span-6 rounded-3xl bg-white border border-slate-200 p-6 md:p-7 space-y-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                AI/ML Blood Demand Predictor
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Simulate trauma surges, mass casualty incidents, and weather disruptions.
              </p>
            </div>
            <span className="text-[10px] font-mono text-purple-800 bg-purple-100 px-2.5 py-1 rounded-lg border border-purple-200 font-bold">
              TRAUMA SIMULATOR
            </span>
          </div>

          {/* Scenario Selector Pills */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleRunPrediction('highway_collision')}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-left ${
                selectedScenario === 'highway_collision'
                  ? 'bg-rose-50 border-rose-300 text-rose-900 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-600" />
                <span>Highway Trauma</span>
              </div>
              <div className="text-[10px] text-slate-500 font-normal mt-0.5">MCI Alert (6-8 pts)</div>
            </button>

            <button
              onClick={() => handleRunPrediction('holiday_surge')}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-left ${
                selectedScenario === 'holiday_surge'
                  ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Holiday Rebound</span>
              </div>
              <div className="text-[10px] text-slate-500 font-normal mt-0.5">Donor Shortfall</div>
            </button>

            <button
              onClick={() => handleRunPrediction('baseline')}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-left ${
                selectedScenario === 'baseline'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Baseline Ops</span>
              </div>
              <div className="text-[10px] text-slate-500 font-normal mt-0.5">Routine Surgeries</div>
            </button>
          </div>

          {/* Prediction Output Card */}
          {predictionResult && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                Predictive Analysis &amp; Impact Projection:
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {predictionResult.demandEstimateText}
              </p>

              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-200 text-center">
                <div className="p-2 rounded-xl bg-white border border-slate-200">
                  <div className="text-sm font-black text-rose-700">
                    +{predictionResult.mtpUnitsNeeded.rbc}
                  </div>
                  <div className="text-[10px] text-slate-500">PRBC Units</div>
                </div>
                <div className="p-2 rounded-xl bg-white border border-slate-200">
                  <div className="text-sm font-black text-blue-700">
                    +{predictionResult.mtpUnitsNeeded.ffp}
                  </div>
                  <div className="text-[10px] text-slate-500">FFP Plasma</div>
                </div>
                <div className="p-2 rounded-xl bg-white border border-slate-200">
                  <div className="text-sm font-black text-purple-700">
                    +{predictionResult.mtpUnitsNeeded.platelets}
                  </div>
                  <div className="text-[10px] text-slate-500">Platelet Pheresis</div>
                </div>
                <div className="p-2 rounded-xl bg-white border border-slate-200">
                  <div className="text-sm font-black text-amber-700">
                    +{predictionResult.mtpUnitsNeeded.cryo}
                  </div>
                  <div className="text-[10px] text-slate-500">Cryoprecipitate</div>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-bold text-slate-700 block uppercase tracking-wider">
                  Automated Action Directives:
                </span>
                {predictionResult.criticalAlerts.map((alert, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-xs text-slate-700 bg-white p-2 rounded-lg border border-slate-200"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                    <span>{alert}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Massive Transfusion Protocol (MTP) Rapid Calculator */}
        <div className="lg:col-span-6 rounded-3xl bg-white border border-slate-200 p-6 md:p-7 space-y-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                Massive Transfusion Protocol (MTP) Triage
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Standardized 1:1:1 Hemostatic Resuscitation (PRBC : FFP : Platelets).
              </p>
            </div>
            <span className="text-[10px] font-mono text-rose-800 bg-rose-100 px-2.5 py-1 rounded-lg border border-rose-200 font-bold">
              TRAUMA BAY PROTOCOL
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Estimated Blood Loss (Liters)
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="8.0"
                value={estimatedBloodLossLiters}
                onChange={(e) => setEstimatedBloodLossLiters(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Patient Body Weight (kg)
              </label>
              <input
                type="number"
                min="30"
                max="160"
                value={patientWeightKg}
                onChange={(e) => setPatientWeightKg(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
              />
            </div>
          </div>

          {/* Active Cooler Composition */}
          <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900">
              <span>Standard MTP Cooler Package #1:</span>
              <span className="text-rose-800 font-mono">1:1:1 RATIO</span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <div className="text-2xl font-black text-rose-600">6</div>
                <div className="text-xs font-bold text-slate-900 mt-0.5">PRBC Units</div>
                <div className="text-[10px] text-slate-500">Uncrossed O-Neg / Type-Spec</div>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <div className="text-2xl font-black text-blue-600">6</div>
                <div className="text-xs font-bold text-slate-900 mt-0.5">FFP Units</div>
                <div className="text-[10px] text-slate-500">Thawed Fresh Frozen Plasma</div>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <div className="text-2xl font-black text-purple-600">1</div>
                <div className="text-xs font-bold text-slate-900 mt-0.5">Apheresis Pack</div>
                <div className="text-[10px] text-slate-500">Equivalent to 6 whole units</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-600 font-medium">
                Total Blood Volume Deficit: ~{Math.round((estimatedBloodLossLiters / (patientWeightKg * 0.07)) * 100)}%
              </span>
              <button
                type="button"
                onClick={handleActivateMTP}
                className="px-4 py-2 bg-rose-700 hover:bg-rose-600 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-700/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Flame className="w-3.5 h-3.5" />
                {activeMTPCooler.activated ? 'Dispatched to Trauma Bay' : 'Activate MTP Dispatch'}
              </button>
            </div>

            {activeMTPCooler.activated && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>MTP Cooler #1 authorized and logged in blood bank inventory ledger.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Live Inter-Hospital Logistics Transits */}
      <div className="rounded-3xl bg-white border border-slate-200 p-6 md:p-7 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-cyan-600" />
              Inter-Hospital Emergency Blood Logistics &amp; Courier Transit
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live GPS and temperature telemetry tracking for life-saving cross-hospital stock transfers.
            </p>
          </div>

          <button
            onClick={() => setShowDispatchModal(true)}
            className="text-xs text-cyan-700 hover:underline font-bold cursor-pointer"
          >
            + Dispatch New Transfer Request
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {dispatchLogs.map((log) => (
            <div
              key={log.id}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-cyan-800 bg-cyan-100 px-2 py-0.5 rounded border border-cyan-200">
                    {log.dispatchId}
                  </span>
                  <div className="text-xs font-bold text-slate-900 mt-1.5 flex items-center gap-1.5">
                    <span className="text-rose-700 font-black">{log.bloodType}</span>
                    <span>({log.units} units)</span>
                  </div>
                  <div className="text-[10px] text-slate-500">{log.component}</div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      log.status === 'In Transit'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {log.status}
                  </span>
                  {log.etaMinutes > 0 ? (
                    <div className="text-[10px] font-mono text-slate-600 mt-1">
                      ETA: {log.etaMinutes} mins
                    </div>
                  ) : (
                    <div className="text-[10px] text-emerald-700 font-bold mt-1">
                      Delivered
                    </div>
                  )}
                </div>
              </div>

              <div className="text-[11px] space-y-1 bg-white p-2.5 rounded-xl border border-slate-200">
                <div className="text-slate-600 truncate">
                  <strong>From:</strong> {log.fromHospital}
                </div>
                <div className="text-slate-900 truncate">
                  <strong>To:</strong> {log.toHospital}
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 font-mono">
                <span className="flex items-center gap-1">
                  <Thermometer className="w-3 h-3 text-cyan-600" />
                  {log.tempCelsius}°C (Regulated)
                </span>
                <span>{log.courier.slice(0, 20)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 4: Interactive Gemini AI Copilot Transfusion Assistant */}
      <div className="rounded-3xl bg-white border border-slate-200 p-6 md:p-7 space-y-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Blood Donation Clinical Copilot
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold">
                  Gemini 3.8 Flash
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Direct evidence-based clinical guidance for trauma surgeons, anesthesiologists, and blood bank directors.
              </p>
            </div>
          </div>
        </div>

        {/* Chat History Box */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-h-96 overflow-y-auto space-y-3">
          {chatMessages.map((msg, i) => (
            <div
              key={i}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-2xl p-4 rounded-2xl text-xs leading-relaxed space-y-1 ${
                  msg.sender === 'user'
                    ? 'bg-purple-700 text-white rounded-br-none shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-xs'
                }`}
              >
                {msg.sender === 'copilot' && (
                  <div className="text-[10px] font-bold text-purple-700 flex items-center gap-1 mb-1">
                    <Sparkles className="w-3 h-3 text-purple-600" />
                    Clinical Copilot Protocol:
                  </div>
                )}
                <div className="whitespace-pre-line">{msg.text}</div>
                <div
                  className={`text-[9px] font-mono text-right mt-1 ${
                    msg.sender === 'user' ? 'text-purple-200' : 'text-slate-400'
                  }`}
                >
                  {msg.time}
                </div>
              </div>
            </div>
          ))}

          {isCopilotThinking && (
            <div className="flex items-center gap-2 text-xs text-purple-800 p-3 bg-purple-50 rounded-xl border border-purple-200 animate-pulse">
              <Bot className="w-4 h-4 animate-spin" />
              <span>Analyzing regional trauma protocols and synthesizing guidance...</span>
            </div>
          )}
        </div>

        {/* Preset Prompt Suggestions */}
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="text-[11px] font-bold text-slate-500 self-center">
            Suggested Clinical Inquiries:
          </span>
          <button
            type="button"
            onClick={() => setUserQuery('How should we handle cold agglutinins detected during emergency crossmatch in cardiac surgery?')}
            className="px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 hover:border-purple-300 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer text-[11px]"
          >
            Cold agglutinin protocol
          </button>
          <button
            type="button"
            onClick={() => setUserQuery('What is the protocol for emergency uncrossed O-Positive red blood cells when O-Negative is exhausted in adult trauma?')}
            className="px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 hover:border-purple-300 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer text-[11px]"
          >
            Rh-Negative conservation policy
          </button>
          <button
            type="button"
            onClick={() => setUserQuery('Draft an urgent emergency mobile blood appeal notice for O-Negative donors in the Baltimore/Hopkins area.')}
            className="px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 hover:border-purple-300 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer text-[11px]"
          >
            Draft emergency donor appeal
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSendChat} className="flex gap-2">
          <input
            type="text"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            placeholder="Type clinical question, transfusion guideline, or logistics query..."
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
          />
          <button
            type="submit"
            disabled={isCopilotThinking || !userQuery.trim()}
            className="px-5 py-2.5 bg-purple-700 hover:bg-purple-600 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-700/20 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            Consult Copilot
          </button>
        </form>
      </div>

      {/* New Dispatch Modal */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xl text-slate-900">
            <h2 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Truck className="w-5 h-5 text-purple-600" />
              Emergency Inter-Hospital Transfer
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Dispatch units via cold-chain courier to mitigate critical stock shortfalls.
            </p>

            <form onSubmit={handleCreateDispatch} className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Origin Center
                  </label>
                  <select
                    value={dispatchFrom}
                    onChange={(e) => setDispatchFrom(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                  >
                    {REAL_HOSPITALS.map((h) => (
                      <option key={h.id} value={h.name}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Destination Center
                  </label>
                  <select
                    value={dispatchTo}
                    onChange={(e) => setDispatchTo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                  >
                    {REAL_HOSPITALS.map((h) => (
                      <option key={h.id} value={h.name}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Blood Type</label>
                  <select
                    value={dispatchBloodType}
                    onChange={(e) => setDispatchBloodType(e.target.value as BloodType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                  >
                    {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Units (Units)</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={dispatchUnits}
                    onChange={(e) => setDispatchUnits(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={dispatchPriority}
                    onChange={(e) => setDispatchPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                  >
                    <option value="STAT_EMERGENCY">STAT Emergency (15-30m)</option>
                    <option value="URGENT_SURGICAL">Urgent Surgical (&lt;2h)</option>
                    <option value="ROUTINE_TRANSFER">Routine Balancing (&lt;6h)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold shadow-md shadow-purple-700/20 cursor-pointer"
                >
                  Authorize Courier Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
