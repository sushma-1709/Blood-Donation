import React from 'react';
import { UserProfile, UserRole } from '../types';
import { 
  Heart, 
  Activity, 
  CreditCard, 
  Calendar, 
  ClipboardCheck, 
  Bot, 
  Building2, 
  LogOut, 
  Stethoscope,
  ShieldCheck,
  Phone,
  Shield,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Flame,
  User,
  Bell,
  Clock
} from 'lucide-react';

interface NavbarProps {
  currentUser: UserProfile | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onSwitchRole: (role: UserRole) => void;
  onOpenReminders?: () => void;
  unreadRemindersCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onLogout,
  onSwitchRole,
  onOpenReminders,
  unreadRemindersCount = 0,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      {/* 1. Top Clinical Dispatch & Live Interval Alert Ribbon */}
      <div className="bg-gradient-to-r from-rose-700 via-red-700 to-rose-800 text-white text-xs px-4 py-2 border-b border-rose-800/80 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          {/* Left: Live Network Status & 56-Day Interval Quick Alert */}
          <div className="flex items-center gap-2.5 flex-wrap justify-center sm:justify-start">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-200 opacity-80"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <span className="font-extrabold uppercase tracking-wider text-[10px] bg-rose-900/80 px-2 py-0.5 rounded-full border border-rose-600/60 shadow-xs">
              Live Network: 22 Trauma Centers Active
            </span>

            {/* 56-Day Post-Donation Notification Banner in Top Ribbon */}
            {currentUser?.role === 'patient' && onOpenReminders && (
              <button
                onClick={onOpenReminders}
                className="inline-flex items-center gap-1.5 text-[11px] bg-white/15 hover:bg-white/25 px-2.5 py-0.5 rounded-full border border-white/30 text-rose-100 hover:text-white transition-all cursor-pointer font-medium"
                title="View 56-day post-donation interval details"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <span><strong>56-Day Recovery Complete:</strong> Eligible to donate again!</span>
                <span className="text-[10px] underline font-bold ml-1">Open Reminders →</span>
              </button>
            )}

            {currentUser?.role !== 'patient' && (
              <span className="hidden md:inline text-rose-100 text-[11px]">
                O-Negative &amp; B-Negative units below 48h emergency reserve.
              </span>
            )}
          </div>

          {/* Right: Emergency Hotline & Quick Action */}
          <div className="flex items-center gap-2.5 text-xs">
            <a
              href="tel:18007334362"
              className="flex items-center gap-1.5 font-bold hover:text-rose-100 transition-colors bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20"
              title="Call 24/7 Clinical Emergency Hotline"
            >
              <Phone className="w-3 h-3 text-rose-200" />
              <span className="text-[11px]">24/7 Dispatch: <strong>1-800-RED-HEMA</strong></span>
            </a>
            <button 
              onClick={() => setActiveTab('scheduling')}
              className="font-extrabold text-[11px] bg-white text-rose-700 hover:bg-rose-50 px-3 py-1 rounded-full transition-all shadow-xs cursor-pointer flex items-center gap-1 shrink-0"
            >
              <span>Book Slot</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo & Medical Identity */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('donorCard')}
              className="flex items-center gap-3 group text-left cursor-pointer select-none"
            >
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-600 via-red-600 to-rose-700 flex items-center justify-center shadow-md shadow-rose-600/25 group-hover:scale-105 transition-all">
                  <Heart className="w-6 h-6 text-white fill-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-2xl tracking-tight text-slate-900 group-hover:text-rose-700 transition-colors">
                    Blood Donation
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 hidden sm:flex items-center gap-1">
                    <Shield className="w-2.5 h-2.5" />
                    Verified Network
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                  National Transfusion &amp; Voluntary Donor Registry
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200">
            <button
              onClick={() => setActiveTab('donorCard')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'donorCard'
                  ? 'bg-white text-rose-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <CreditCard className="w-4 h-4 text-rose-600" />
              Digital Pass
            </button>

            <button
              onClick={() => setActiveTab('scheduling')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'scheduling'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Calendar className="w-4 h-4 text-blue-600" />
              Schedule Slot
            </button>

            <button
              onClick={() => setActiveTab('eligibility')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'eligibility'
                  ? 'bg-white text-emerald-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <ClipboardCheck className="w-4 h-4 text-emerald-600" />
              Eligibility
            </button>

            <button
              onClick={() => setActiveTab('healthRecords')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'healthRecords'
                  ? 'bg-white text-amber-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Activity className="w-4 h-4 text-amber-600" />
              Health Vitals
            </button>

            <button
              onClick={() => setActiveTab('copilot')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'copilot'
                  ? 'bg-white text-purple-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Bot className="w-4 h-4 text-purple-600" />
              AI Copilot
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-800 font-extrabold">
                MD/Staff
              </span>
            </button>

            <button
              onClick={() => setActiveTab('hospitals')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'hospitals'
                  ? 'bg-white text-cyan-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Building2 className="w-4 h-4 text-cyan-600" />
              Hospitals
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-100 text-cyan-800 font-extrabold">
                22
              </span>
            </button>
          </nav>

          {/* Right Header Actions: Reminders Drawer Trigger, Role Badge & Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick 56-Day Recovery Status Pill Button (Direct Header CTA) */}
            {currentUser?.role === 'patient' && onOpenReminders && (
              <button
                onClick={onOpenReminders}
                className="hidden md:flex items-center gap-2 py-1.5 px-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100/90 border border-emerald-200 text-emerald-800 transition-all cursor-pointer shadow-xs group"
                title="56-day whole blood interval elapsed. Click to open Reminders drawer."
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <div className="text-left">
                  <div className="text-[10px] font-black uppercase tracking-wider text-emerald-700">
                    56d Interval
                  </div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    Eligible Now
                    <ChevronRight className="w-3 h-3 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </button>
            )}

            {/* Reminders & Notification Drawer Bell Button */}
            {onOpenReminders && (
              <button
                onClick={onOpenReminders}
                className="relative p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200/90 border border-slate-200 text-slate-700 hover:text-slate-900 transition-all cursor-pointer shadow-xs group"
                title="Open 56-Day Donation Reminders & Notifications"
                aria-label="Open reminders"
              >
                <Bell className="w-5 h-5 text-slate-700 group-hover:text-rose-600 transition-colors" />
                {unreadRemindersCount > 0 ? (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-rose-600 text-white rounded-full text-[10px] font-black px-1 flex items-center justify-center border-2 border-white shadow-xs animate-bounce">
                    {unreadRemindersCount}
                  </span>
                ) : (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full border border-white"></span>
                )}
              </button>
            )}

            {currentUser && (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-1.5 pr-2.5 shadow-xs">
                {/* Role Avatar Badge */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shadow-xs ${
                    currentUser.role === 'doctor'
                      ? 'bg-cyan-100 text-cyan-800 border border-cyan-300'
                      : currentUser.role === 'staff'
                      ? 'bg-purple-100 text-purple-800 border border-purple-300'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}
                >
                  {currentUser.role === 'doctor' ? (
                    <Stethoscope className="w-4 h-4 text-cyan-700" />
                  ) : currentUser.role === 'staff' ? (
                    <ShieldCheck className="w-4 h-4 text-purple-700" />
                  ) : (
                    <span className="flex items-center font-black">
                      {currentUser.bloodGroup || 'O-'}
                    </span>
                  )}
                </div>

                {/* Name & Role Text */}
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                    {currentUser.name}
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded capitalize ${
                        currentUser.role === 'doctor'
                          ? 'bg-cyan-100 text-cyan-800'
                          : currentUser.role === 'staff'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {currentUser.role}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    ID: {currentUser.id} {currentUser.role === 'patient' && `• ${currentUser.donorTier}`}
                  </div>
                </div>

                {/* Quick Role Switcher Segmented Control */}
                <div className="flex items-center gap-1 ml-1 pl-2 border-l border-slate-200">
                  <button
                    title="Switch to Donor View"
                    onClick={() => onSwitchRole('patient')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      currentUser.role === 'patient'
                        ? 'bg-rose-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                    }`}
                  >
                    Donor
                  </button>
                  <button
                    title="Switch to Doctor View"
                    onClick={() => onSwitchRole('doctor')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      currentUser.role === 'doctor'
                        ? 'bg-cyan-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                    }`}
                  >
                    MD
                  </button>
                  <button
                    title="Switch to Staff View"
                    onClick={() => onSwitchRole('staff')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      currentUser.role === 'staff'
                        ? 'bg-purple-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                    }`}
                  >
                    Staff
                  </button>

                  <button
                    onClick={onLogout}
                    title="Sign Out to Login Portal"
                    className="p-1.5 text-slate-400 hover:text-rose-700 rounded-lg hover:bg-slate-200 transition-colors ml-0.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex lg:hidden items-center justify-between py-2 border-t border-slate-200 overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('donorCard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer ${
              activeTab === 'donorCard' ? 'bg-rose-700 text-white shadow-xs' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Digital Pass
          </button>
          <button
            onClick={() => setActiveTab('scheduling')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer ${
              activeTab === 'scheduling' ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Scheduling
          </button>
          <button
            onClick={() => setActiveTab('eligibility')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer ${
              activeTab === 'eligibility' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Eligibility
          </button>
          <button
            onClick={() => setActiveTab('healthRecords')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer ${
              activeTab === 'healthRecords' ? 'bg-amber-700 text-white shadow-xs' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Vitals
          </button>
          <button
            onClick={() => setActiveTab('copilot')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer ${
              activeTab === 'copilot' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-600 bg-slate-100'
            }`}
          >
            AI Copilot
          </button>
          <button
            onClick={() => setActiveTab('hospitals')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer ${
              activeTab === 'hospitals' ? 'bg-cyan-700 text-white shadow-xs' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Hospitals (22)
          </button>
          {onOpenReminders && (
            <button
              onClick={onOpenReminders}
              className="px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 shrink-0"
            >
              <Bell className="w-3.5 h-3.5" />
              Reminders {unreadRemindersCount > 0 && `(${unreadRemindersCount})`}
            </button>
          )}
        </div>
      </div>

      {/* 3. Contextual Clinical Status Strip directly below Header */}
      {currentUser && (
        <div className="bg-slate-50/90 border-t border-slate-200/80 px-4 py-2 text-xs">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-600">
            <div className="flex items-center gap-2 flex-wrap">
              {currentUser.role === 'patient' && (
                <>
                  <span className="font-bold text-slate-900 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-rose-600" />
                    Donor Session:
                  </span>
                  <span className="text-slate-800 font-semibold">{currentUser.name}</span>
                  <span>•</span>
                  {onOpenReminders ? (
                    <button
                      onClick={onOpenReminders}
                      className="text-emerald-700 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      56-Day Post-Donation Recovery Passed (Eligible Today)
                    </button>
                  ) : (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      56-Day Interval Passed (Eligible Today)
                    </span>
                  )}
                  <span>•</span>
                  <span className="text-amber-700 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    {currentUser.donorTier || 'Gold Champion'} ({currentUser.livesSaved || 24} Lives Impacted)
                  </span>
                </>
              )}

              {currentUser.role === 'doctor' && (
                <>
                  <span className="font-bold text-slate-900 flex items-center gap-1">
                    <Stethoscope className="w-3.5 h-3.5 text-cyan-600" />
                    Attending Physician:
                  </span>
                  <span className="text-slate-800 font-semibold">{currentUser.name}</span>
                  <span>•</span>
                  <span className="text-cyan-800 font-medium">The Johns Hopkins Hospital (Trauma Bay 1)</span>
                  <span>•</span>
                  <span className="text-rose-700 font-bold flex items-center gap-1">
                    <Flame className="w-3 h-3 text-rose-600" />
                    MTP Protocol Online
                  </span>
                </>
              )}

              {currentUser.role === 'staff' && (
                <>
                  <span className="font-bold text-slate-900 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                    Blood Bank Operations:
                  </span>
                  <span className="text-slate-800 font-semibold">{currentUser.name}</span>
                  <span>•</span>
                  <span className="text-purple-800 font-medium">Regional Transfusion Logistics Core</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-bold">22 Hospital Cryo-Nodes Synced</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                Interval Protocol: 56 Days Whole Blood
              </span>
              <span>•</span>
              <button
                onClick={() => setActiveTab('hospitals')}
                className="text-rose-700 hover:underline font-bold cursor-pointer"
              >
                View 22 Trauma Centers →
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
