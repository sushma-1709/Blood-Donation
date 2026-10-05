import React, { useState } from 'react';
import { UserProfile, BloodType } from '../types';
import { COMPATIBILITY_RULES } from '../data/mockData';
import { 
  CreditCard, 
  QrCode, 
  Heart, 
  Award, 
  RotateCw, 
  Share2, 
  Download, 
  Check, 
  Sparkles, 
  ArrowRight, 
  ShieldAlert, 
  Phone, 
  Droplet,
  CheckCircle2,
  Info
} from 'lucide-react';

interface DigitalDonorCardProps {
  currentUser: UserProfile;
  onNavigateToScheduling: () => void;
  onNavigateToRecords: () => void;
}

export const DigitalDonorCard: React.FC<DigitalDonorCardProps> = ({
  currentUser,
  onNavigateToScheduling,
  onNavigateToRecords,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [inspectBloodType, setInspectBloodType] = useState<BloodType>(currentUser.bloodGroup || 'O-');
  const [copiedToken, setCopiedToken] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  const activeCompat = COMPATIBILITY_RULES[inspectBloodType];

  const bloodGroupList: BloodType[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

  const handleCopyToken = () => {
    const token = currentUser.qrToken || `BLOOD-DONATION::${currentUser.id}::VERIFIED`;
    navigator.clipboard.writeText(token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2500);
  };

  const handleShare = () => {
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 3000);
  };

  const handlePrintCard = () => {
    window.print();
  };

  const totalDonations = currentUser.totalDonations || 8;
  const livesSaved = currentUser.livesSaved || totalDonations * 3;

  return (
    <div className="space-y-8">
      {/* Top Banner / Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/90 p-6 md:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold mb-3">
              <Award className="w-3.5 h-3.5 text-rose-600" />
              Verified Voluntary Blood Donor Credential
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Digital Donor Pass &amp; Compatibility Matrix
            </h1>
            <p className="text-slate-600 text-sm mt-1 max-w-2xl">
              Official biometric identification card for voluntary blood donors. Present at any participating Level 1 Trauma Center or hospital for express intake and triage.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-300 cursor-pointer shadow-xs"
            >
              <RotateCw className="w-4 h-4 text-rose-600" />
              {isFlipped ? 'Show Front Card' : 'Flip to QR Token'}
            </button>
            <button
              onClick={handlePrintCard}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-300 cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              Save / Print Pass
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-600 text-white text-xs font-bold transition-all shadow-md shadow-rose-700/20 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              Share Impact
            </button>
          </div>
        </div>

        {showShareToast && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Donor achievement link copied! You have helped save an estimated <strong>{livesSaved} lives</strong>.</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Digital Card 3D Perspective */}
        <div className="lg:col-span-5 space-y-6">
          <div className="perspective-1000">
            {!isFlipped ? (
              /* FRONT OF CARD */
              <div className="relative rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-rose-800 via-rose-900 to-slate-900 border border-rose-700 shadow-xl text-white overflow-hidden transition-all duration-300 transform hover:scale-[1.01]">
                {/* Holographic accent glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-rose-400/20 via-transparent to-transparent pointer-events-none" />

                <div className="flex items-start justify-between relative z-10 mb-6">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-inner">
                      <Heart className="w-5 h-5 text-white fill-white" />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold tracking-widest uppercase text-rose-200">
                        Blood Donation ID
                      </div>
                      <div className="text-[10px] text-rose-300 font-mono">
                        NATIONAL DONOR REGISTRY
                      </div>
                    </div>
                  </div>

                  {/* Big Blood Badge */}
                  <div className="px-3.5 py-1.5 rounded-2xl bg-white text-rose-900 font-black text-xl tracking-tight shadow-md border border-white/60 flex items-center gap-1.5">
                    <Droplet className="w-4 h-4 fill-rose-600 text-rose-600" />
                    {currentUser.bloodGroup || 'O-'}
                  </div>
                </div>

                {/* Donor Details */}
                <div className="space-y-4 relative z-10">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-rose-200 tracking-wider">
                      Donor Legal Name
                    </span>
                    <div className="text-xl font-black text-white tracking-wide">
                      {currentUser.name}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-1">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-rose-200 tracking-wider">
                        Donor Identifier
                      </span>
                      <div className="text-sm font-mono font-bold text-rose-100">
                        {currentUser.donorId || currentUser.id}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-rose-200 tracking-wider">
                        Honorary Tier
                      </span>
                      <div className="text-xs font-bold text-amber-300 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        {currentUser.donorTier || 'Gold Champion'}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-1 border-t border-rose-800/80">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-rose-200 tracking-wider">
                        Emergency Contact
                      </span>
                      <div className="text-xs font-semibold text-white truncate">
                        {currentUser.emergencyContact?.name || 'Elena Vance'} ({currentUser.emergencyContact?.relationship || 'Spouse'})
                      </div>
                      <div className="text-[10px] font-mono text-rose-200 flex items-center gap-1 mt-0.5">
                        <Phone className="w-2.5 h-2.5 text-rose-300" />
                        {currentUser.emergencyContact?.phone || '+1 (415) 890-4499'}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-rose-200 tracking-wider">
                        Last Active Donation
                      </span>
                      <div className="text-xs font-semibold text-white">
                        {currentUser.lastDonationDate || '2026-08-14'}
                      </div>
                      <div className="text-[10px] text-emerald-300 font-bold flex items-center gap-1 mt-0.5">
                        <Check className="w-2.5 h-2.5" />
                        Eligible Today
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Micro-Bar */}
                <div className="mt-6 pt-4 border-t border-rose-800/80 flex items-center justify-between text-[10px] text-rose-300 font-mono">
                  <span>TRANSFUSION PROTOCOL v4.2</span>
                  <span className="text-white font-bold">CLICK CARD TO FLIP QR ↻</span>
                </div>
              </div>
            ) : (
              /* BACK OF CARD (QR & SECURE TOKEN) */
              <div className="relative rounded-3xl p-6 sm:p-7 bg-white border border-slate-300 shadow-xl text-slate-800 overflow-hidden transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-rose-600" />
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Hospital Check-In Token
                    </span>
                  </div>
                  <button
                    onClick={() => setIsFlipped(false)}
                    className="text-xs text-rose-700 hover:underline font-semibold cursor-pointer"
                  >
                    View Front ↻
                  </button>
                </div>

                <div className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 mb-4 shadow-xs">
                  {/* High Quality SVG QR Code Simulation */}
                  <svg
                    className="w-44 h-44"
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect x="5" y="5" width="26" height="26" rx="4" stroke="#0f172a" strokeWidth="4" />
                    <rect x="11" y="11" width="14" height="14" fill="#e11d48" />

                    <rect x="69" y="5" width="26" height="26" rx="4" stroke="#0f172a" strokeWidth="4" />
                    <rect x="75" y="11" width="14" height="14" fill="#e11d48" />

                    <rect x="5" y="69" width="26" height="26" rx="4" stroke="#0f172a" strokeWidth="4" />
                    <rect x="11" y="75" width="14" height="14" fill="#e11d48" />

                    <path
                      d="M38 8h6v6h-6z M50 8h6v6h-6z M38 20h18v6h-18z M44 32h12v6h-12z M8 38h6v12h-6z M20 38h12v6h-12z M38 44h6v6h-6z M50 44h18v6h-18z M74 38h18v6h-18z M74 50h6v6h-6z M86 50h6v6h-6z M8 56h18v6h-18z M32 56h12v12h-12z M50 56h6v6h-6z M62 56h18v6h-18z M38 74h6v18h-6z M50 74h12v6h-12z M68 74h6v6h-6z M80 74h12v18h-12z M50 86h18v6h-18z"
                      fill="#0f172a"
                    />
                    <circle cx="50" cy="50" r="7" fill="#e11d48" />
                  </svg>
                  <span className="text-[10px] font-mono text-slate-700 mt-2 font-bold tracking-tight">
                    {currentUser.donorId || 'DONOR-7842'} • BLOOD: {currentUser.bloodGroup || 'O-'}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="text-[11px] text-slate-500 text-center">
                    Authorized scanning by certified hospital staff, triage nurses, and blood bank lab technicians.
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono">
                    <span className="text-slate-600 text-[10px] truncate max-w-[240px]">
                      {currentUser.qrToken || 'BLOOD-DONATION::DONOR::7842::O-NEG::VERIFIED'}
                    </span>
                    <button
                      onClick={handleCopyToken}
                      className="text-rose-700 hover:text-rose-800 font-bold shrink-0 ml-2 cursor-pointer text-[11px]"
                    >
                      {copiedToken ? 'Copied!' : 'Copy Token'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Lives Saved & Impact Summary */}
          <div className="rounded-3xl bg-white border border-slate-200 p-6 space-y-4 shadow-xs text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-600 fill-rose-600" />
                Donation Impact Metric
              </span>
              <span className="text-xs font-bold text-rose-700">
                1 Donation = Up to 3 Lives Saved
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-3xl font-black text-slate-900">{totalDonations}</div>
                <div className="text-xs font-semibold text-slate-500 mt-0.5">
                  Total Donations Completed
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
                <div className="text-3xl font-black text-rose-700">{livesSaved}</div>
                <div className="text-xs font-semibold text-rose-900 mt-0.5">
                  Estimated Lives Impacted
                </div>
              </div>
            </div>

            {/* Next Tier Milestone Bar */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600">
                  Current: <strong className="text-amber-600">{currentUser.donorTier || 'Gold Champion'}</strong>
                </span>
                <span className="text-slate-600">
                  Next: <strong className="text-cyan-700">Platinum Legend</strong> (10 Donations)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="bg-gradient-to-r from-rose-500 to-amber-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (totalDonations / 10) * 100)}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-500 flex items-center justify-between">
                <span>{Math.max(0, 10 - totalDonations)} donations until Platinum tier badge</span>
                <button
                  onClick={onNavigateToScheduling}
                  className="text-rose-700 hover:underline font-bold cursor-pointer"
                >
                  Book Next Slot →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Blood Group Compatibility Matrix */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <div className="rounded-3xl bg-white border border-slate-200 p-6 md:p-7 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <Droplet className="w-5 h-5 text-rose-600 fill-rose-600" />
                  <h2 className="text-lg font-bold text-slate-900">
                    Blood Group Transfusion Compatibility
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Cross-match rules for Red Blood Cells (RBC) and Fresh Frozen Plasma (FFP).
                </p>
              </div>

              {/* Selector for testing different blood groups */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 pl-2 pr-1 uppercase">
                  Test:
                </span>
                <div className="flex flex-wrap gap-1">
                  {bloodGroupList.map((bg) => (
                    <button
                      key={bg}
                      onClick={() => setInspectBloodType(bg)}
                      className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        inspectBloodType === bg
                          ? 'bg-rose-700 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                      }`}
                    >
                      {bg}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Selected Blood Type Card */}
            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white border border-rose-300 text-rose-700 flex flex-col items-center justify-center font-black text-xl shrink-0 shadow-xs">
                <span>{inspectBloodType}</span>
                <span className="text-[9px] font-mono text-slate-500 font-normal">
                  {activeCompat.rarityPercent}% pop
                </span>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  Clinical Profile for {inspectBloodType}
                  {inspectBloodType === 'O-' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold border border-rose-300">
                      Universal Red Cell Donor
                    </span>
                  )}
                  {inspectBloodType === 'AB+' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 font-bold border border-cyan-300">
                      Universal Red Cell Recipient
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {activeCompat.specialNotes}
                </p>
              </div>
            </div>

            {/* RBC Compatibility */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                  Red Blood Cells (RBC) Compatibility
                </span>
                <span className="text-[11px] text-slate-400">
                  Antigen Matching: A, B, and Rh (D)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Can Donate To */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Can Donate Red Cells To ({activeCompat.canDonateRBC.length} types)
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {bloodGroupList.map((bg) => {
                      const isMatch = activeCompat.canDonateRBC.includes(bg);
                      return (
                        <span
                          key={bg}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            isMatch
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs'
                              : 'bg-slate-100 text-slate-400 border border-slate-200 line-through opacity-50'
                          }`}
                        >
                          {bg}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Can Receive From */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="text-xs font-bold text-blue-700 flex items-center gap-1.5">
                    <ArrowRight className="w-3.5 h-3.5" />
                    Can Receive Red Cells From ({activeCompat.canReceiveRBC.length} types)
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {bloodGroupList.map((bg) => {
                      const isMatch = activeCompat.canReceiveRBC.includes(bg);
                      return (
                        <span
                          key={bg}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            isMatch
                              ? 'bg-blue-100 text-blue-800 border border-blue-300 shadow-xs'
                              : 'bg-slate-100 text-slate-400 border border-slate-200 line-through opacity-50'
                          }`}
                        >
                          {bg}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Plasma Compatibility */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Fresh Frozen Plasma (FFP) Compatibility
                </span>
                <span className="text-[11px] text-slate-400">
                  Reverse crossmatch rules apply
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="text-xs font-bold text-amber-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Can Donate Plasma To
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {bloodGroupList.map((bg) => {
                      const isMatch = activeCompat.canDonatePlasma.includes(bg);
                      return (
                        <span
                          key={bg}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            isMatch
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-slate-100 text-slate-400 border border-slate-200 line-through opacity-50'
                          }`}
                        >
                          {bg}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="text-xs font-bold text-purple-700 flex items-center gap-1.5">
                    <ArrowRight className="w-3.5 h-3.5" />
                    Can Receive Plasma From
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {bloodGroupList.map((bg) => {
                      const isMatch = activeCompat.canReceivePlasma.includes(bg);
                      return (
                        <span
                          key={bg}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            isMatch
                              ? 'bg-purple-100 text-purple-800 border border-purple-300'
                              : 'bg-slate-100 text-slate-400 border border-slate-200 line-through opacity-50'
                          }`}
                        >
                          {bg}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Footer */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Info className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Need to view your previous blood pressure and hemoglobin numbers?</span>
              </div>
              <button
                onClick={onNavigateToRecords}
                className="text-xs font-bold text-rose-700 hover:underline transition-colors cursor-pointer"
              >
                Open Health Records Dashboard →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
