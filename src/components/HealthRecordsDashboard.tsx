import React, { useState } from 'react';
import { HealthMetricRecord, UserProfile } from '../types';
import { 
  Activity, 
  Heart, 
  TrendingUp, 
  Droplet, 
  Plus, 
  CheckCircle2, 
  Download,
  Stethoscope
} from 'lucide-react';

interface HealthRecordsDashboardProps {
  currentUser: UserProfile;
  healthRecords: HealthMetricRecord[];
  onAddHealthRecord: (record: HealthMetricRecord) => void;
}

export const HealthRecordsDashboard: React.FC<HealthRecordsDashboardProps> = ({
  currentUser,
  healthRecords,
  onAddHealthRecord,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'hemoglobin' | 'bloodPressure' | 'pulse' | 'platelets'>('hemoglobin');
  const [showAddModal, setShowAddModal] = useState(false);

  // New vitals form states
  const [newHgb, setNewHgb] = useState<number>(14.5);
  const [newSystolic, setNewSystolic] = useState<number>(120);
  const [newDiastolic, setNewDiastolic] = useState<number>(78);
  const [newPulse, setNewPulse] = useState<number>(68);
  const [newPlatelets, setNewPlatelets] = useState<number>(260);
  const [newHospital, setNewHospital] = useState('The Johns Hopkins Hospital');
  const [newNotes, setNewNotes] = useState('Routine pre-donation vitals check passed without complications.');

  const latestRecord = healthRecords[0] || {
    hemoglobin: 14.6,
    bloodPressureSystolic: 118,
    bloodPressureDiastolic: 76,
    pulseRate: 68,
    plateletCount: 260,
    volumeDonatedMl: 470,
    date: '2026-08-14',
    doctorNotes: 'Vitals in optimal clinical range.',
    ironStatus: 'Optimal',
    vitalsPassed: true,
  };

  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: HealthMetricRecord = {
      id: `hr-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      hospitalName: newHospital,
      hemoglobin: Number(newHgb),
      bloodPressureSystolic: Number(newSystolic),
      bloodPressureDiastolic: Number(newDiastolic),
      pulseRate: Number(newPulse),
      plateletCount: Number(newPlatelets),
      volumeDonatedMl: 470,
      doctorNotes: newNotes,
      ironStatus: Number(newHgb) >= 13.0 ? 'Optimal' : 'Borderline',
      vitalsPassed: true,
    };

    onAddHealthRecord(newEntry);
    setShowAddModal(false);
  };

  const handlePrint = () => {
    window.print();
  };

  // Sort chronological for chart
  const chartRecords = [...healthRecords].reverse();

  // SVG Chart Dimensions
  const chartWidth = 560;
  const chartHeight = 180;
  const padding = 35;

  const getChartPoints = () => {
    if (chartRecords.length === 0) return '';

    return chartRecords.map((r, i) => {
      const x = padding + (i / Math.max(1, chartRecords.length - 1)) * (chartWidth - padding * 2);
      let val = 0;
      let minVal = 0;
      let maxVal = 100;

      if (selectedMetric === 'hemoglobin') {
        val = r.hemoglobin;
        minVal = 11.0;
        maxVal = 17.0;
      } else if (selectedMetric === 'bloodPressure') {
        val = r.bloodPressureSystolic;
        minVal = 90;
        maxVal = 160;
      } else if (selectedMetric === 'pulse') {
        val = r.pulseRate;
        minVal = 50;
        maxVal = 110;
      } else {
        val = r.plateletCount;
        minVal = 150;
        maxVal = 400;
      }

      const normalized = (val - minVal) / (maxVal - minVal);
      const y = chartHeight - padding - normalized * (chartHeight - padding * 2);
      return `${x},${y}`;
    }).join(' ');
  };

  return (
    <div className="space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Activity className="w-7 h-7 text-amber-600" />
            Health Records &amp; Biomarker Dashboard
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Longitudinal monitoring of hemoglobin, blood pressure, pulse rate, and donation volume across clinical screenings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-300 cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            Export Health Report
          </button>

          {(currentUser.role === 'doctor' || currentUser.role === 'staff') && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Log New Screening Vitals
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Hemoglobin */}
        <div
          onClick={() => setSelectedMetric('hemoglobin')}
          className={`p-5 rounded-3xl border transition-all cursor-pointer ${
            selectedMetric === 'hemoglobin'
              ? 'bg-rose-50/70 border-rose-400 shadow-xs ring-1 ring-rose-300'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Hemoglobin (Hgb)
            </span>
            <Droplet className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{latestRecord.hemoglobin}</span>
            <span className="text-xs text-slate-500 font-mono">g/dL</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-700 flex items-center gap-1 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Normal Range (≥ 13.0 g/dL)
          </div>
        </div>

        {/* Blood Pressure */}
        <div
          onClick={() => setSelectedMetric('bloodPressure')}
          className={`p-5 rounded-3xl border transition-all cursor-pointer ${
            selectedMetric === 'bloodPressure'
              ? 'bg-blue-50/70 border-blue-400 shadow-xs ring-1 ring-blue-300'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Blood Pressure
            </span>
            <Heart className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              {latestRecord.bloodPressureSystolic}/{latestRecord.bloodPressureDiastolic}
            </span>
            <span className="text-xs text-slate-500 font-mono">mmHg</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-700 flex items-center gap-1 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Normotensive (Optimal)
          </div>
        </div>

        {/* Pulse Rate */}
        <div
          onClick={() => setSelectedMetric('pulse')}
          className={`p-5 rounded-3xl border transition-all cursor-pointer ${
            selectedMetric === 'pulse'
              ? 'bg-amber-50/70 border-amber-400 shadow-xs ring-1 ring-amber-300'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Resting Pulse
            </span>
            <Activity className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{latestRecord.pulseRate}</span>
            <span className="text-xs text-slate-500 font-mono">BPM</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-700 flex items-center gap-1 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Target Window (50 - 100)
          </div>
        </div>

        {/* Platelet Count */}
        <div
          onClick={() => setSelectedMetric('platelets')}
          className={`p-5 rounded-3xl border transition-all cursor-pointer ${
            selectedMetric === 'platelets'
              ? 'bg-purple-50/70 border-purple-400 shadow-xs ring-1 ring-purple-300'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Platelet Count
            </span>
            <Droplet className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{latestRecord.plateletCount}</span>
            <span className="text-xs text-slate-500 font-mono">×10³/μL</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-700 flex items-center gap-1 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Optimal for Apheresis
          </div>
        </div>
      </div>

      {/* Visual SVG Trend Chart & Clinical Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Visual Trend Chart */}
        <div className="lg:col-span-8 rounded-3xl bg-white border border-slate-200 p-6 md:p-7 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-600" />
                Biomarker Trend Curve: {selectedMetric.toUpperCase()}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Observed progression across voluntary donation screening appointments.
              </p>
            </div>

            {/* Metric Tab Selector */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => setSelectedMetric('hemoglobin')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedMetric === 'hemoglobin' ? 'bg-rose-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Hgb
              </button>
              <button
                onClick={() => setSelectedMetric('bloodPressure')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedMetric === 'bloodPressure' ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                BP
              </button>
              <button
                onClick={() => setSelectedMetric('pulse')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedMetric === 'pulse' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pulse
              </button>
              <button
                onClick={() => setSelectedMetric('platelets')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedMetric === 'platelets' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Platelets
              </button>
            </div>
          </div>

          {/* SVG Interactive Trend Visualizer */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="relative w-full overflow-x-auto">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-56 text-slate-400"
              >
                <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#cbd5e1" strokeWidth="1" />
                <line x1={padding} y1={chartHeight / 2} x2={chartWidth - padding} y2={chartHeight / 2} stroke="#e2e8f0" strokeDasharray="4 4" strokeWidth="1" />
                <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="#e2e8f0" strokeDasharray="4 4" strokeWidth="1" />

                {selectedMetric === 'hemoglobin' && (
                  <line
                    x1={padding}
                    y1={chartHeight - padding - ((13.0 - 11.0) / 6.0) * (chartHeight - padding * 2)}
                    x2={chartWidth - padding}
                    y2={chartHeight - padding - ((13.0 - 11.0) / 6.0) * (chartHeight - padding * 2)}
                    stroke="#10b981"
                    strokeWidth="1.5"
                    strokeDasharray="6 3"
                  />
                )}

                <polyline
                  fill="none"
                  stroke={
                    selectedMetric === 'hemoglobin'
                      ? '#e11d48'
                      : selectedMetric === 'bloodPressure'
                      ? '#2563eb'
                      : selectedMetric === 'pulse'
                      ? '#d97706'
                      : '#9333ea'
                  }
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={getChartPoints()}
                />

                {chartRecords.map((r, i) => {
                  const x = padding + (i / Math.max(1, chartRecords.length - 1)) * (chartWidth - padding * 2);
                  let val = 0;
                  let minVal = 0;
                  let maxVal = 100;

                  if (selectedMetric === 'hemoglobin') {
                    val = r.hemoglobin;
                    minVal = 11.0;
                    maxVal = 17.0;
                  } else if (selectedMetric === 'bloodPressure') {
                    val = r.bloodPressureSystolic;
                    minVal = 90;
                    maxVal = 160;
                  } else if (selectedMetric === 'pulse') {
                    val = r.pulseRate;
                    minVal = 50;
                    maxVal = 110;
                  } else {
                    val = r.plateletCount;
                    minVal = 150;
                    maxVal = 400;
                  }

                  const normalized = (val - minVal) / (maxVal - minVal);
                  const y = chartHeight - padding - normalized * (chartHeight - padding * 2);

                  return (
                    <g key={r.id}>
                      <circle
                        cx={x}
                        cy={y}
                        r="6"
                        fill="#ffffff"
                        stroke={
                          selectedMetric === 'hemoglobin'
                            ? '#e11d48'
                            : selectedMetric === 'bloodPressure'
                            ? '#2563eb'
                            : selectedMetric === 'pulse'
                            ? '#d97706'
                            : '#9333ea'
                        }
                        strokeWidth="3"
                      />
                      <text
                        x={x}
                        y={y - 12}
                        textAnchor="middle"
                        fill="#0f172a"
                        fontSize="10"
                        fontWeight="bold"
                      >
                        {val}
                      </text>
                      <text
                        x={x}
                        y={chartHeight - 12}
                        textAnchor="middle"
                        fill="#64748b"
                        fontSize="9"
                        fontFamily="monospace"
                      >
                        {r.date.slice(5)}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 px-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Target Clinical Donor Clearance Zone
              </span>
              <span>Updated automatically per session</span>
            </div>
          </div>

          {/* Historical Logs List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Screening History &amp; Physician Notes
            </h3>
            <div className="space-y-2">
              {healthRecords.map((record) => (
                <div
                  key={record.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{record.hospitalName}</span>
                      <span className="text-slate-500 font-mono">• {record.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-rose-800 font-bold">
                        Hgb: {record.hemoglobin} g/dL
                      </span>
                      <span className="text-slate-300">|</span>
                      <span className="font-mono text-blue-800 font-bold">
                        BP: {record.bloodPressureSystolic}/{record.bloodPressureDiastolic}
                      </span>
                      <span className="text-slate-300">|</span>
                      <span className="font-mono text-amber-800 font-bold">
                        Pulse: {record.pulseRate}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 italic">
                    "{record.doctorNotes}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Clinical Guidance */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-3xl bg-white border border-slate-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-rose-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Clinical Health Guidance
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-1">
                <div className="font-bold text-rose-900">Hemoglobin &amp; Iron Replenishment</div>
                <p className="text-slate-600 leading-relaxed">
                  Your body recovers lost plasma within 24–48 hours, while full red blood cell and iron ferritin restoration requires approximately 4–6 weeks.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-1">
                <div className="font-bold text-blue-900">Blood Pressure Standards</div>
                <p className="text-slate-600 leading-relaxed">
                  FDA regulations require donor systolic pressure between 90–180 mmHg and diastolic between 50–100 mmHg.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-1">
                <div className="font-bold text-amber-900">Heart Rate Safety Window</div>
                <p className="text-slate-600 leading-relaxed">
                  A pulse between 50 and 100 bpm is required. Rates down to 45 bpm are accepted for athletic donors without irregular rhythm.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white border border-slate-200 p-6 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-xs uppercase tracking-wider">
              <Droplet className="w-4 h-4 fill-rose-600 text-rose-600" />
              Lifetime Donation Volume
            </div>
            <div className="text-3xl font-black text-slate-900">
              {currentUser.totalDonations ? (currentUser.totalDonations * 470) / 1000 : 3.76} Liters
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              You have provided vital cellular transfusion components across {currentUser.totalDonations || 8} separate voluntary donor sessions.
            </p>
          </div>
        </div>
      </div>

      {/* Log New Vitals Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xl text-slate-900">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Record Pre-Donation Screening Vitals</h2>
            <p className="text-xs text-slate-500 mb-5">
              Enter donor physiological observations taken at the triage station prior to venipuncture.
            </p>

            <form onSubmit={handleSaveRecord} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hemoglobin (g/dL)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newHgb}
                    onChange={(e) => setNewHgb(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pulse (BPM)
                  </label>
                  <input
                    type="number"
                    value={newPulse}
                    onChange={(e) => setNewPulse(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Systolic BP (mmHg)
                  </label>
                  <input
                    type="number"
                    value={newSystolic}
                    onChange={(e) => setNewSystolic(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Diastolic BP (mmHg)
                  </label>
                  <input
                    type="number"
                    value={newDiastolic}
                    onChange={(e) => setNewDiastolic(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Screening Hospital Facility
                </label>
                <input
                  type="text"
                  value={newHospital}
                  onChange={(e) => setNewHospital(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Physician / Triage Nurse Notes
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-600/20 cursor-pointer"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
