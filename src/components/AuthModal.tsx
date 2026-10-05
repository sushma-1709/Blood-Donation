import React, { useState } from 'react';
import { UserRole, UserProfile, BloodType } from '../types';
import { DEFAULT_USERS } from '../data/mockData';
import { 
  ShieldCheck, 
  Stethoscope, 
  Heart, 
  Lock, 
  User, 
  X, 
  KeyRound, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('patient');
  const [userId, setUserId] = useState('DONOR-7842');
  const [passcode, setPasscode] = useState('donor2026');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New Donor Registration State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regBlood, setRegBlood] = useState<BloodType>('O-');
  const [regEmergencyName, setRegEmergencyName] = useState('');
  const [regEmergencyPhone, setRegEmergencyPhone] = useState('');

  if (!isOpen) return null;

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

    // Verify role credentials
    if (selectedRole === 'patient') {
      if (userId.trim().toUpperCase() === 'DONOR-7842' || userId.trim().length > 3) {
        const user = {
          ...DEFAULT_USERS.patient,
          id: userId.trim().toUpperCase(),
        };
        onLoginSuccess(user);
        onClose();
        return;
      }
    } else if (selectedRole === 'doctor') {
      if (userId.trim().length >= 3) {
        const docUser = {
          ...DEFAULT_USERS.doctor,
          id: userId.trim().toUpperCase(),
        };
        onLoginSuccess(docUser);
        onClose();
        return;
      }
    } else if (selectedRole === 'staff') {
      if (userId.trim().length >= 3) {
        const staffUser = {
          ...DEFAULT_USERS.staff,
          id: userId.trim().toUpperCase(),
        };
        onLoginSuccess(staffUser);
        onClose();
        return;
      }
    }

    setError('Invalid authentication credentials. Please check your ID and passcode.');
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) {
      setError('Please provide your full name and valid contact email.');
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
      qrToken: `HEMALINK::DONOR::${randomId}::${regBlood}::NEW::2026`,
    };

    onLoginSuccess(newProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header decoration */}
        <div className="h-2 bg-gradient-to-r from-rose-600 via-purple-600 to-cyan-500" />

        <div className="p-6">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-3 shadow-inner">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              {isRegisterMode ? 'Create Digital Donor Account' : 'Secure Transfusion Portal'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {isRegisterMode
                ? 'Register your profile to track donations, compatibility, and health vitals'
                : 'Authenticated access for Donors, Attending Physicians, and Blood Bank Staff'}
            </p>
          </div>

          {!isRegisterMode ? (
            <>
              {/* Role Selector Tabs */}
              <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950/80 border border-slate-800 rounded-xl mb-6">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('patient')}
                  className={`flex flex-col items-center py-2.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedRole === 'patient'
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Heart className="w-4 h-4 mb-1" />
                  Patient / Donor
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect('doctor')}
                  className={`flex flex-col items-center py-2.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedRole === 'doctor'
                      ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Stethoscope className="w-4 h-4 mb-1" />
                  Trauma Doctor
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect('staff')}
                  className={`flex flex-col items-center py-2.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedRole === 'staff'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 mb-1" />
                  Hospital Staff
                </button>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {selectedRole === 'patient'
                      ? 'Patient / Donor ID'
                      : selectedRole === 'doctor'
                      ? 'Medical Board License / ID'
                      : 'Blood Bank Staff Badge ID'}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      placeholder={
                        selectedRole === 'patient' ? 'e.g. DONOR-7842' : 'e.g. DOC-9041'
                      }
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Security Passcode
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
                >
                  Authenticate &amp; Enter Portal
                </button>
              </form>

              {/* Quick Demo Fill Buttons */}
              <div className="mt-5 pt-5 border-t border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    Quick Demo Credentials
                  </span>
                  <span className="text-[10px] text-slate-400">1-Click Auto-Fill</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleRoleSelect('patient');
                      setUserId('DONOR-7842');
                      setPasscode('donor2026');
                    }}
                    className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-rose-500/50 text-left transition-colors cursor-pointer group"
                  >
                    <div className="text-[10px] font-bold text-rose-400 group-hover:text-rose-300">
                      Alexander Vance
                    </div>
                    <div className="text-[9px] text-slate-400">Donor (O-Neg)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleRoleSelect('doctor');
                      setUserId('DOC-9041');
                      setPasscode('transfusion2026');
                    }}
                    className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-left transition-colors cursor-pointer group"
                  >
                    <div className="text-[10px] font-bold text-cyan-400 group-hover:text-cyan-300">
                      Dr. Sarah Lin
                    </div>
                    <div className="text-[9px] text-slate-400">Trauma MD (Hopkins)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleRoleSelect('staff');
                      setUserId('STAFF-3309');
                      setPasscode('bloodbank2026');
                    }}
                    className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-purple-500/50 text-left transition-colors cursor-pointer group"
                  >
                    <div className="text-[10px] font-bold text-purple-400 group-hover:text-purple-300">
                      Marcus Brody
                    </div>
                    <div className="text-[9px] text-slate-400">Blood Bank Ops</div>
                  </button>
                </div>
              </div>

              {/* Registration toggle */}
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(true)}
                  className="text-xs text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                >
                  New donor? <span className="font-semibold underline">Register digital donor card</span>
                </button>
              </div>
            </>
          ) : (
            /* Registration Form */
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Jordan Miller"
                  className="w-full px-3.5 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="jordan@example.com"
                    className="w-full px-3.5 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+1 (555) 012-3456"
                    className="w-full px-3.5 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Blood Group
                  </label>
                  <select
                    value={regBlood}
                    onChange={(e) => setRegBlood(e.target.value as BloodType)}
                    className="w-full px-3.5 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    value={regEmergencyName}
                    onChange={(e) => setRegEmergencyName(e.target.value)}
                    placeholder="e.g. Morgan Miller"
                    className="w-full px-3.5 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
              >
                Create Digital Donor Pass &amp; Sign In
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(false)}
                  className="text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  ← Back to standard login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
