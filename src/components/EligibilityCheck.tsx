import React, { useState } from 'react';
import { UserProfile, EligibilityResult } from '../types';
import { 
  ClipboardCheck, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Clock, 
  Send, 
  Bot, 
  RotateCcw, 
  Stethoscope
} from 'lucide-react';

interface EligibilityCheckProps {
  currentUser: UserProfile;
  onNavigateToScheduling: () => void;
}

export const EligibilityCheck: React.FC<EligibilityCheckProps> = ({
  currentUser,
  onNavigateToScheduling,
}) => {
  // Questionnaire states
  const [age, setAge] = useState<number>(28);
  const [weightKg, setWeightKg] = useState<number>(68);
  const [feelingHealthy, setFeelingHealthy] = useState<'yes' | 'no'>('yes');
  const [antibiotics, setAntibiotics] = useState<'yes' | 'no'>('no');
  const [tattoos3Months, setTattoos3Months] = useState<'yes' | 'no'>('no');
  const [travelMalaria, setTravelMalaria] = useState<'yes' | 'no'>('no');
  const [pregnant, setPregnant] = useState<'yes' | 'no'>('no');
  const [dentalWork72h, setDentalWork72h] = useState<'yes' | 'no'>('no');
  const [daysSinceLastDonation, setDaysSinceLastDonation] = useState<number>(62);

  // Result state
  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // AI Copilot Clinical Q&A state
  const [customQuestion, setCustomQuestion] = useState('');
  const [copilotAnswer, setCopilotAnswer] = useState<string | null>(null);
  const [isAskingCopilot, setIsAskingCopilot] = useState(false);

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEvaluating(true);

    const isWeightOk = weightKg >= 50;
    const isAgeOk = age >= 16;
    const isIntervalOk = daysSinceLastDonation >= 56;
    const isHealthyOk = feelingHealthy === 'yes';
    const isAntibioticOk = antibiotics === 'no';
    const isTattooOk = tattoos3Months === 'no';
    const isTravelOk = travelMalaria === 'no';
    const isDentalOk = dentalWork72h === 'no';
    const isPregnancyOk = pregnant === 'no';

    const passedAll =
      isWeightOk &&
      isAgeOk &&
      isIntervalOk &&
      isHealthyOk &&
      isAntibioticOk &&
      isTattooOk &&
      isTravelOk &&
      isDentalOk &&
      isPregnancyOk;

    try {
      const response = await fetch('/api/gemini/eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionnaire: {
            age,
            weightKg,
            feelingHealthy,
            antibiotics,
            tattoos3Months,
            travelMalaria,
            pregnant,
            dentalWork72h,
            daysSinceLastDonation,
            donorBloodGroup: currentUser.bloodGroup,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const clearanceCode = passedAll
          ? `PASS-${Math.floor(100000 + Math.random() * 900000)}`
          : undefined;

        setResult({
          isEligible: passedAll,
          status: passedAll ? 'ELIGIBLE' : 'DEFERRED_TEMPORARY',
          clearanceCode,
          headline: passedAll
            ? 'ELIGIBLE: Pre-Screening Clearance Approved!'
            : 'TEMPORARILY DEFERRED: Action or Waiting Period Required',
          detailedReason: passedAll
            ? 'All physiological indicators (weight, interval, vitals criteria, travel history) comply with FDA and AABB Transfusion Medicine guidelines.'
            : generateDeferralReason(
                isWeightOk,
                isIntervalOk,
                daysSinceLastDonation,
                isHealthyOk,
                isAntibioticOk,
                isTattooOk,
                isTravelOk,
                isDentalOk
              ),
          nextEligibleDate: !isIntervalOk
            ? new Date(Date.now() + (56 - daysSinceLastDonation) * 86400000).toISOString().split('T')[0]
            : undefined,
          daysRemaining: !isIntervalOk ? 56 - daysSinceLastDonation : undefined,
          categoryChecks: [
            {
              name: 'Minimum Weight Requirement (≥ 50 kg / 110 lbs)',
              passed: isWeightOk,
              detail: `Recorded: ${weightKg} kg (${Math.round(weightKg * 2.20462)} lbs)`,
            },
            {
              name: 'Donation Interval (≥ 56 days whole blood)',
              passed: isIntervalOk,
              detail: `${daysSinceLastDonation} days elapsed since last session`,
            },
            {
              name: 'Current Health & Acute Symptoms',
              passed: isHealthyOk && isAntibioticOk,
              detail: isHealthyOk && isAntibioticOk ? 'Fever-free, no active antibiotics' : 'Symptoms or active prescription noted',
            },
            {
              name: 'Recent Tattoos / Piercings (Last 3 Months)',
              passed: isTattooOk,
              detail: isTattooOk ? 'Complies with regulated facility criteria' : 'Requires 3-month observation window',
            },
            {
              name: 'Malaria-Endemic Region Exposure (Last 12 Months)',
              passed: isTravelOk,
              detail: isTravelOk ? 'No high-risk geographical exposure' : 'Geographical travel deferral protocol active',
            },
          ],
          clinicalAdvisory:
            data.analysis ||
            'Drink 16-20 oz of water and eat a healthy meal prior to venipuncture. Fast-track badge is valid for 48 hours.',
        });
      }
    } catch {
      setResult({
        isEligible: passedAll,
        status: passedAll ? 'ELIGIBLE' : 'DEFERRED_TEMPORARY',
        clearanceCode: passedAll ? `PASS-${Math.floor(100000 + Math.random() * 900000)}` : undefined,
        headline: passedAll
          ? 'ELIGIBLE: Pre-Screening Clearance Approved!'
          : 'TEMPORARILY DEFERRED: Waiting Period Required',
        detailedReason: generateDeferralReason(
          isWeightOk,
          isIntervalOk,
          daysSinceLastDonation,
          isHealthyOk,
          isAntibioticOk,
          isTattooOk,
          isTravelOk,
          isDentalOk
        ),
        categoryChecks: [
          { name: 'Weight Requirement', passed: isWeightOk, detail: `${weightKg} kg recorded` },
          { name: 'Donation Interval', passed: isIntervalOk, detail: `${daysSinceLastDonation} days elapsed` },
          { name: 'Health Status', passed: isHealthyOk, detail: isHealthyOk ? 'Healthy' : 'Active illness' },
        ],
        clinicalAdvisory: 'Stay well hydrated and ensure adequate rest before your scheduled donation.',
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const generateDeferralReason = (
    weightOk: boolean,
    intervalOk: boolean,
    days: number,
    healthyOk: boolean,
    antibioticOk: boolean,
    tattooOk: boolean,
    travelOk: boolean,
    dentalOk: boolean
  ): string => {
    const reasons: string[] = [];
    if (!weightOk) reasons.push('Donor body weight is below the 50 kg (110 lbs) safety threshold for 470 mL whole blood collection.');
    if (!intervalOk) reasons.push(`Mandatory 56-day whole blood interval not met. ${56 - days} days remaining until full red cell recovery.`);
    if (!healthyOk) reasons.push('Donors must be symptom-free from viral infections, colds, and fever for at least 48 hours.');
    if (!antibioticOk) reasons.push('Must finish entire course of antibiotics and wait 48 hours to ensure resolution of underlying infection.');
    if (!tattooOk) reasons.push('A 3-month deferral applies for recent tattoos or body piercings unless performed in a state-regulated facility.');
    if (!travelOk) reasons.push('Travel to areas with active malaria transmission requires a temporary 12-month deferral under CDC/FDA guidelines.');
    if (!dentalOk) reasons.push('Oral surgery or deep cleaning requires a 72-hour window to eliminate transient bacteremia risk.');
    return reasons.join(' ');
  };

  const handleAskCopilot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;

    setIsAskingCopilot(true);
    setCopilotAnswer(null);

    try {
      const response = await fetch('/api/gemini/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Prospective donor asks eligibility question: "${customQuestion}". Provide an accurate clinical answer based on FDA/AABB guidelines regarding medication, travel, vaccines, or medical conditions.`,
          role: 'patient',
          scenario: 'Donor Pre-Screening Eligibility Consultation',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCopilotAnswer(data.text);
      } else {
        setCopilotAnswer(
          'Clinical Guideline: Most common medications (such as blood pressure medicines, birth control, and cholesterol drugs) do not disqualify you from blood donation as long as your condition is well-controlled. Blood thinners (Warfarin, Eliquis, Plavix) and certain acne/hair-loss medications (Accutane, Propecia) require specific deferral periods. Please consult the on-duty screening nurse.'
        );
      }
    } catch {
      setCopilotAnswer(
        'Clinical Guideline: Over-the-counter pain relievers like ibuprofen or acetaminophen generally do not defer whole blood donation (though aspirin requires a 48-hour wait before platelet donation). Always disclose all current prescriptions during the on-site nurse intake.'
      );
    } finally {
      setIsAskingCopilot(false);
    }
  };

  return (
    <div className="space-y-8 text-left">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <ClipboardCheck className="w-7 h-7 text-emerald-600" />
          AI Pre-Donation Eligibility Self-Check
        </h1>
        <p className="text-slate-600 text-sm mt-1">
          Instant clinical self-evaluation according to AABB and FDA blood safety standards. Generate a Fast-Pass before arriving at the clinic.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Questionnaire */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleEvaluate} className="rounded-3xl bg-white border border-slate-200 p-6 md:p-7 space-y-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-emerald-600" />
                Donor Health &amp; History Questionnaire
              </span>
              <span className="text-[11px] text-slate-500">Takes ~60 seconds</span>
            </div>

            {/* Vital Baseline */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Age (Years)
                </label>
                <input
                  type="number"
                  min={16}
                  max={95}
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Min. 16/17 (with consent)</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  min={35}
                  max={250}
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  ≈ {Math.round(weightKg * 2.20462)} lbs (Min: 50kg)
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Days Since Last Donation
                </label>
                <input
                  type="number"
                  min={0}
                  max={730}
                  value={daysSinceLastDonation}
                  onChange={(e) => setDaysSinceLastDonation(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Min. 56 days whole blood</span>
              </div>
            </div>

            {/* Health Questions */}
            <div className="space-y-3 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <div className="font-bold text-slate-800">
                    Are you feeling well, healthy, and fever-free today?
                  </div>
                  <div className="text-[11px] text-slate-500">
                    No active cold, flu, cough, or acute illness in the last 48 hours.
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setFeelingHealthy('yes')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      feelingHealthy === 'yes'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeelingHealthy('no')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      feelingHealthy === 'no'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <div className="font-bold text-slate-800">
                    Are you currently taking antibiotics or anti-coagulants?
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Antibiotics require 48h completion before blood collection.
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setAntibiotics('yes')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      antibiotics === 'yes'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setAntibiotics('no')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      antibiotics === 'no'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <div className="font-bold text-slate-800">
                    Tattoo, body piercing, or acupuncture in the past 3 months?
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Regulated sterile facilities permitted; non-regulated requires 3-month wait.
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setTattoos3Months('yes')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      tattoos3Months === 'yes'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setTattoos3Months('no')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      tattoos3Months === 'no'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <div className="font-bold text-slate-800">
                    Travel to malaria-risk areas outside the country within 12 months?
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Standard international epidemiological screening precaution.
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setTravelMalaria('yes')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      travelMalaria === 'yes'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setTravelMalaria('no')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      travelMalaria === 'no'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <div className="font-bold text-slate-800">
                    Currently pregnant or given birth in the last 6 weeks?
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Post-partum maternal physiological recovery and iron replenishment window.
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setPregnant('yes')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      pregnant === 'yes'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setPregnant('no')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      pregnant === 'no'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isEvaluating}
              className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isEvaluating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Running Clinical Algorithm...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-100" />
                  Evaluate Eligibility &amp; Generate Fast-Pass
                </>
              )}
            </button>
          </form>

          {/* Ask AI Pre-Screening Copilot */}
          <div className="rounded-3xl bg-white border border-slate-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Ask Clinical Screening AI Copilot
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Have questions about a specific medication (e.g. Accutane, aspirin), a vaccine, or a recent medical test? Ask our clinical copilot for instant guidance.
            </p>

            <form onSubmit={handleAskCopilot} className="flex gap-2">
              <input
                type="text"
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder="e.g., Can I donate if I took amoxicillin 3 days ago?"
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
              />
              <button
                type="submit"
                disabled={isAskingCopilot || !customQuestion.trim()}
                className="px-4 py-2.5 bg-purple-700 hover:bg-purple-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {isAskingCopilot ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                Ask Copilot
              </button>
            </form>

            {copilotAnswer && (
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-900 space-y-2 animate-in fade-in">
                <div className="flex items-center gap-1.5 font-bold text-purple-800">
                  <Sparkles className="w-3.5 h-3.5" />
                  Clinical Copilot Recommendation:
                </div>
                <div className="leading-relaxed whitespace-pre-line text-slate-700">
                  {copilotAnswer}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Instant Result & Clearance Pass */}
        <div className="lg:col-span-5 space-y-6">
          {result ? (
            <div
              className={`rounded-3xl border p-6 md:p-7 space-y-6 shadow-xs animate-in fade-in duration-300 ${
                result.isEligible
                  ? 'bg-emerald-50/50 border-emerald-300'
                  : 'bg-amber-50/50 border-amber-300'
              }`}
            >
              {/* Badge & Headline */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      result.isEligible
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {result.isEligible ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Status: Pre-Screening Passed
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        Status: Temporary Deferral
                      </>
                    )}
                  </span>

                  {result.clearanceCode && (
                    <span className="text-[10px] font-mono text-emerald-800 font-bold bg-white px-2 py-0.5 rounded border border-emerald-300">
                      TOKEN: {result.clearanceCode}
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-bold text-slate-900">{result.headline}</h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {result.detailedReason}
                </p>
              </div>

              {/* Countdown if deferred */}
              {!result.isEligible && result.daysRemaining && result.daysRemaining > 0 && (
                <div className="p-4 rounded-2xl bg-white border border-amber-200 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex flex-col items-center justify-center font-bold text-sm shrink-0 border border-amber-200">
                    <Clock className="w-5 h-5 mb-0.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      Countdown to Next Eligible Date
                    </div>
                    <div className="text-xs text-amber-800 mt-0.5">
                      <strong>{result.daysRemaining} days remaining</strong> (Eligible on {result.nextEligibleDate})
                    </div>
                  </div>
                </div>
              )}

              {/* Digital Pre-Clearance Fast-Pass Mock Card */}
              {result.isEligible && (
                <div className="p-5 rounded-2xl bg-white border border-emerald-300 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-emerald-800 tracking-wider">
                      DIGITAL FAST-TRACK PASS
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      VALID: 48 HOURS
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Donor Name:</span>
                      <strong className="text-slate-900">{currentUser.name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Blood Group:</span>
                      <strong className="text-rose-700">{currentUser.bloodGroup || 'O-'}</strong>
                    </div>
                  </div>

                  {/* Barcode Visual */}
                  <div className="py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-900">
                    <div className="h-9 w-full flex items-center justify-center gap-0.5">
                      {[4, 2, 6, 2, 4, 8, 2, 4, 2, 6, 4, 2, 8, 4, 2, 6, 2, 4, 8, 2, 6, 4].map(
                        (w, i) => (
                          <div
                            key={i}
                            className="h-full bg-slate-900"
                            style={{ width: `${w * 1.5}px` }}
                          />
                        )
                      )}
                    </div>
                    <span className="text-[9px] font-mono tracking-widest mt-1 font-bold text-slate-700">
                      *{result.clearanceCode}*
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-500 text-center">
                    Show this barcode at the reception desk to bypass paper intake forms.
                  </p>
                </div>
              )}

              {/* Category Breakdown */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Clinical Criteria Breakdown:
                </span>
                <div className="space-y-1.5">
                  {result.categoryChecks.map((cat, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-800">{cat.name}</div>
                        <div className="text-[10px] text-slate-500">{cat.detail}</div>
                      </div>
                      <div>
                        {cat.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              {result.isEligible ? (
                <button
                  onClick={onNavigateToScheduling}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  Proceed to Schedule Appointment Slot →
                </button>
              ) : (
                <button
                  onClick={() => setResult(null)}
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-300 transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Retake Assessment
                </button>
              )}
            </div>
          ) : (
            /* Blank state prompt */
            <div className="rounded-3xl bg-white border border-slate-200 p-8 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 mx-auto flex items-center justify-center">
                <ClipboardCheck className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Ready for Screening</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Complete the health history checklist on the left and submit to verify your donation clearance in real time.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
