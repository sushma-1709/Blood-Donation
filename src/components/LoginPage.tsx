import React, { useState } from 'react';
import { UserRole, UserProfile, BloodType } from '../types';
import { DEFAULT_USERS, REAL_HOSPITALS } from '../data/mockData';
import { 
  Heart, 
  Lock, 
  User, 
  KeyRound, 
  Sparkles, 
  Stethoscope, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Phone, 
  ExternalLink, 
  ArrowRight, 
  Building2, 
  Droplet,
  Compass,
  FileCheck
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('patient');
  const [userId, setUserId] = useState('DONOR-7842');
  const [passcode, setPasscode] = useState('donor2026');
  const [rememberMe, setRememberMe] = useState(true);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New Donor Registration State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regBlood, setRegBlood] = useState<BloodType>('O-');
  const [regEmergencyName, setRegEmergencyName] = useState('');
  const [regEmergencyPhone, setRegEmergencyPhone] = useState('');

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setError(null);
    if (role === 'patient') {
      setUserId('DONOR-7842');
      setPasscode('donor2026');
    } else if (role === 'doctor') {
      setUserId('DOC-9041');
      setPasscode('transfusion2026');
    } else {
      setUserId('STAFF-3309');
      setPasscode('bloodbank2026');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanId = userId.trim().toUpperCase();

    if (selectedRole === 'patient') {
      if (cleanId === 'DONOR-7842' || cleanId.length >= 3) {
        onLoginSuccess({
          ...DEFAULT_USERS.patient,
          id: cleanId,
        });
        return;
      }
    } else if (selectedRole === 'doctor') {
      if (cleanId.length >= 3) {
        onLoginSuccess({
          ...DEFAULT_USERS.doctor,
          id: cleanId,
        });
        return;
      }
    } else if (selectedRole === 'staff') {
      if (cleanId.length >= 3) {
        onLoginSuccess({
          ...DEFAULT_USERS.staff,
          id: cleanId,
        });
        return;
      }
    }

    setError('Authentication failed. Please verify your ID and security passcode.');
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) {
      setError('Please provide your full name and a valid email address.');
      return;
    }

    const randomId = `DONOR-${Math.floor(1000 + Math.random() * 9000)}`;
    const newProfile: UserProfile = {
      id: randomId,
      name: regName.trim(),
      email: regEmail.trim(),
      role: 'patient',
      phone: regPhone.trim() || '+1 (555) 019-2831',
      bloodGroup: regBlood,
      donorId: randomId,
      donorTier: 'Bronze Guardian',
      lastDonationDate: undefined,
      totalDonations: 0,
      livesSaved: 0,
      emergencyContact: {
        name: regEmergencyName.trim() || 'Primary Contact',
        relationship: 'Family',
        phone: regEmergencyPhone.trim() || '+1 (555) 019-9999',
      },
      qrToken: `BLOOD-DONATION::DONOR::${randomId}::${regBlood}::VERIFIED`,
    };

    onLoginSuccess(newProfile);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/60 via-slate-50 to-slate-100 flex flex-col justify-between selection:bg-rose-500/20 selection:text-rose-900">
      {/* Top Clinical Announcement Bar */}
      <div className="bg-rose-700 text-white text-xs py-2 px-4 shadow-sm border-b border-rose-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-200 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <span className="font-bold">CRITICAL BLOOD SUPPLY BULLETIN:</span>
            <span className="text-rose-100 hidden md:inline">
              O-Negative &amp; B-Negative reserves across Level 1 Trauma Centers are critically low.
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-rose-100">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              Emergency Triage: <strong>1-800-RED-HEMA</strong>
            </span>
            <span>•</span>
            <span className="hidden sm:inline">Hopkins • Mayo Clinic • Mass General</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Welcoming Brand Hero */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-rose-100 border border-rose-200 text-rose-800 text-xs font-bold shadow-xs">
              <Heart className="w-4 h-4 text-rose-600 fill-rose-600" />
              Official National Blood Donation System
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Welcome to <span className="bg-gradient-to-r from-rose-700 to-red-600 bg-clip-text text-transparent">Blood Donation</span> Portal
              </h1>
              <p className="text-slate-600 text-base leading-relaxed">
                A connected, clinical transfusion network providing voluntary donors, emergency trauma physicians, and hospital blood banks with real-time scheduling, digital cards, and AI-assisted care.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
                <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
                  <Droplet className="w-4 h-4 fill-rose-600 text-rose-600" />
                  Digital Donor ID Card
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Encrypted biometric pass, blood group cross-match matrix, and lives saved tracker.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
                <div className="flex items-center gap-2 text-blue-700 font-bold text-xs">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  Trauma Center Scheduling
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Reserve slots at certified Level 1 Trauma Centers with instant calendar export.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  AI Eligibility Self-Check
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Screen against FDA/AABB guidelines to receive an express digital fast-track pass.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
                <div className="flex items-center gap-2 text-purple-700 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  AI Transfusion Copilot
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Rapid MTP calculator and regional inventory demand prediction for trauma surgery.
                </p>
              </div>
            </div>

            {/* Real World Hospital Ticker */}
            <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/80 shadow-xs text-xs space-y-2">
              <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400 flex items-center justify-between">
                <span>Active Clinical Network Nodes</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 22 Certified Trauma Centers Online
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-700 font-medium">
                <span className="px-2 py-1 rounded-lg bg-slate-100 border border-slate-200">The Johns Hopkins Hospital</span>
                <span className="px-2 py-1 rounded-lg bg-slate-100 border border-slate-200">Mayo Clinic Saint Marys</span>
                <span className="px-2 py-1 rounded-lg bg-slate-100 border border-slate-200">Massachusetts General</span>
                <span className="px-2 py-1 rounded-lg bg-slate-100 border border-slate-200">MD Anderson Cancer Center</span>
                <span className="px-2 py-1 rounded-lg bg-slate-100 border border-slate-200">Stanford Health Care</span>
                <span className="px-2 py-1 rounded-lg bg-slate-100 border border-slate-200">UCLA Ronald Reagan</span>
                <span className="px-2 py-1 rounded-lg bg-slate-100 border border-slate-200">Charité Berlin</span>
                <span className="px-2 py-1 rounded-lg bg-slate-100 border border-slate-200">Singapore General Hospital</span>
                <span className="px-2 py-1 rounded-lg bg-slate-100 border border-slate-200">King's College London</span>
                <span className="px-2 py-1 rounded-lg bg-slate-100 border border-slate-200">AIIMS New Delhi</span>
                <span className="px-2 py-1 rounded-lg bg-slate-100 border border-slate-200">Tata Memorial Mumbai</span>
              </div>
            </div>
          </div>

          {/* Right Column: Pleasant Authentic Login Card */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 text-slate-900 relative overflow-hidden">
              {/* Top Accent Strip */}
              <div className="h-2 bg-gradient-to-r from-rose-600 via-red-600 to-amber-500 absolute top-0 left-0 right-0" />

              <div className="text-center mb-6 pt-2">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 border border-rose-100 flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <Lock className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {isRegisterMode ? 'New Donor Registration' : 'Secure Healthcare Portal'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {isRegisterMode
                    ? 'Create your verified biometric pass to begin donating and saving lives'
                    : 'Please select your role and sign in with your authorized credentials'}
                </p>
              </div>

              {!isRegisterMode ? (
                <>
                  {/* Role Selector Tabs */}
                  <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-2xl mb-6 border border-slate-200/80">
                    <button
                      type="button"
                      onClick={() => handleRoleSelect('patient')}
                      className={`flex flex-col items-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedRole === 'patient'
                          ? 'bg-white text-rose-700 shadow-sm border border-slate-200/70'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <Heart className="w-4 h-4 mb-1 text-rose-600 fill-rose-600" />
                      Patient / Donor
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRoleSelect('doctor')}
                      className={`flex flex-col items-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedRole === 'doctor'
                          ? 'bg-white text-cyan-700 shadow-sm border border-slate-200/70'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <Stethoscope className="w-4 h-4 mb-1 text-cyan-600" />
                      Trauma Doctor
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRoleSelect('staff')}
                      className={`flex flex-col items-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedRole === 'staff'
                          ? 'bg-white text-purple-700 shadow-sm border border-slate-200/70'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 mb-1 text-purple-600" />
                      Hospital Staff
                    </button>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleLogin} className="space-y-4 text-left">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {selectedRole === 'patient'
                          ? 'Patient / Donor ID'
                          : selectedRole === 'doctor'
                          ? 'State Medical Board License / ID'
                          : 'Blood Bank Central Staff Badge ID'}
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={userId}
                          onChange={(e) => setUserId(e.target.value)}
                          placeholder={
                            selectedRole === 'patient'
                              ? 'e.g. DONOR-7842'
                              : selectedRole === 'doctor'
                              ? 'e.g. DOC-9041'
                              : 'e.g. STAFF-3309'
                          }
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-700">
                          Security Passcode
                        </label>
                        <span className="text-[11px] text-rose-700 hover:underline cursor-pointer">
                          Forgot Passcode?
                        </span>
                      </div>
                      <div className="relative">
                        <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="password"
                          value={passcode}
                          onChange={(e) => setPasscode(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="rounded text-rose-600 focus:ring-rose-500 h-4 w-4 border-slate-300"
                        />
                        <span>Remember session on this device</span>
                      </label>
                      <span className="text-[10px] text-slate-400">256-bit Encrypted</span>
                    </div>

                    {error && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-3 px-4 bg-gradient-to-r from-rose-700 to-red-600 hover:from-rose-600 hover:to-red-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-rose-700/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Sign In to Blood Donation Network</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>

                  {/* 1-Click Quick Demo Sign-In Chips */}
                  <div className="mt-6 pt-5 border-t border-slate-200 text-left">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        Quick Test Profiles (1-Click Fill)
                      </span>
                      <span className="text-[10px] text-slate-400">Instant Access</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          handleRoleSelect('patient');
                          setUserId('DONOR-7842');
                          setPasscode('donor2026');
                        }}
                        className="p-2 rounded-xl bg-rose-50/70 border border-rose-200 hover:border-rose-400 text-left transition-colors cursor-pointer group"
                      >
                        <div className="text-[11px] font-bold text-rose-900 group-hover:text-rose-700 truncate">
                          Alexander Vance
                        </div>
                        <div className="text-[10px] text-rose-600">Donor (O-Neg)</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          handleRoleSelect('doctor');
                          setUserId('DOC-9041');
                          setPasscode('transfusion2026');
                        }}
                        className="p-2 rounded-xl bg-cyan-50/70 border border-cyan-200 hover:border-cyan-400 text-left transition-colors cursor-pointer group"
                      >
                        <div className="text-[11px] font-bold text-cyan-900 group-hover:text-cyan-700 truncate">
                          Dr. Sarah Lin
                        </div>
                        <div className="text-[10px] text-cyan-600">Trauma MD</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          handleRoleSelect('staff');
                          setUserId('STAFF-3309');
                          setPasscode('bloodbank2026');
                        }}
                        className="p-2 rounded-xl bg-purple-50/70 border border-purple-200 hover:border-purple-400 text-left transition-colors cursor-pointer group"
                      >
                        <div className="text-[11px] font-bold text-purple-900 group-hover:text-purple-700 truncate">
                          Marcus Brody
                        </div>
                        <div className="text-[10px] text-purple-600">Blood Bank Ops</div>
                      </button>
                    </div>
                  </div>

                  {/* Register and Express Guest Mode */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => setIsRegisterMode(true)}
                      className="text-rose-700 hover:text-rose-800 font-semibold cursor-pointer underline"
                    >
                      New donor? Register donor card
                    </button>

                    <button
                      type="button"
                      onClick={() => onLoginSuccess(DEFAULT_USERS.patient)}
                      className="text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
                    >
                      Instant Guest Demo →
                    </button>
                  </div>
                </>
              ) : (
                /* Registration Mode */
                <form onSubmit={handleRegister} className="space-y-3.5 text-left">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Donor Full Legal Name
                    </label>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Jordan Miller"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="jordan@example.com"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="+1 (555) 012-3456"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Blood Group (Known)
                      </label>
                      <select
                        value={regBlood}
                        onChange={(e) => setRegBlood(e.target.value as BloodType)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      >
                        <option value="O-">O Negative (Universal Red Cells)</option>
                        <option value="O+">O Positive</option>
                        <option value="A-">A Negative</option>
                        <option value="A+">A Positive</option>
                        <option value="B-">B Negative</option>
                        <option value="B+">B Positive</option>
                        <option value="AB-">AB Negative</option>
                        <option value="AB+">AB Positive (Universal Plasma)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Emergency Contact
                      </label>
                      <input
                        type="text"
                        value={regEmergencyName}
                        onChange={(e) => setRegEmergencyName(e.target.value)}
                        placeholder="e.g. Morgan Miller"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-gradient-to-r from-rose-700 to-red-600 hover:from-rose-600 hover:to-red-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-rose-700/20 transition-all cursor-pointer"
                  >
                    Issue Digital Donor Card &amp; Sign In
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setIsRegisterMode(false)}
                      className="text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    >
                      ← Back to standard login
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges & Clinical Standards Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-800">Blood Donation</span>
            <span>•</span>
            <span>National Transfusion Medicine &amp; Voluntary Donor Registry</span>
          </div>

          <div className="flex items-center gap-5 text-[11px] text-slate-400">
            <span className="flex items-center gap-1 text-slate-600 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              HIPAA &amp; AABB Compliant
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-600 font-semibold">
              <Lock className="w-3.5 h-3.5 text-blue-600" />
              256-Bit SSL Encryption
            </span>
            <span>•</span>
            <span>Emergency 24/7 Hotline: 1-800-RED-HEMA</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
