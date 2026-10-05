import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole, Appointment, HealthMetricRecord, BloodInventoryItem, DispatchLog } from './types';
import { DEFAULT_USERS, INITIAL_INVENTORY, INITIAL_HEALTH_RECORDS, INITIAL_DISPATCH_LOGS } from './data/mockData';
import { Navbar } from './components/Navbar';
import { LoginPage } from './components/LoginPage';
import { DigitalDonorCard } from './components/DigitalDonorCard';
import { DonationScheduler } from './components/DonationScheduler';
import { EligibilityCheck } from './components/EligibilityCheck';
import { HealthRecordsDashboard } from './components/HealthRecordsDashboard';
import { AICopilotDashboard } from './components/AICopilotDashboard';
import { HospitalNetworkDirectory } from './components/HospitalNetworkDirectory';
import { RemindersDrawer } from './components/RemindersDrawer';
import { Heart, Phone, ExternalLink } from 'lucide-react';

export default function App() {
  // Current authenticated user (null initially so Login Portal is first!)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('blood_donation_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return null; // Login Portal comes first!
  });

  const [activeTab, setActiveTab] = useState<string>('donorCard');
  const [isRemindersOpen, setIsRemindersOpen] = useState<boolean>(false);
  const [unreadRemindersCount, setUnreadRemindersCount] = useState<number>(3);

  // Appointments state
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('blood_donation_appointments');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: 'apt-default-1',
        referenceCode: 'BLD-2026-7814',
        donorId: 'DONOR-7842',
        donorName: 'Alexander Vance',
        bloodGroup: 'O-',
        hospitalId: 'hosp-hopkins',
        hospitalName: 'The Johns Hopkins Hospital',
        hospitalAddress: '1800 Orleans Street, Baltimore, MD',
        hospitalMapsUrl: 'https://www.google.com/maps/search/?api=1&query=The+Johns+Hopkins+Hospital+Baltimore+MD',
        donationType: 'whole_blood',
        appointmentDate: '2026-10-12',
        timeSlot: '09:30 AM',
        status: 'confirmed',
        bookedAt: '2026-10-04T10:00:00.000Z',
        preScreeningCleared: true,
      },
    ];
  });

  // Health records state
  const [healthRecords, setHealthRecords] = useState<HealthMetricRecord[]>(() => {
    const saved = localStorage.getItem('blood_donation_health_records');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_HEALTH_RECORDS;
  });

  // Blood Inventory state
  const [inventory, setInventory] = useState<BloodInventoryItem[]>(() => {
    const saved = localStorage.getItem('blood_donation_inventory');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_INVENTORY;
  });

  // Inter-Hospital Dispatch Logs state
  const [dispatchLogs, setDispatchLogs] = useState<DispatchLog[]>(() => {
    const saved = localStorage.getItem('blood_donation_dispatch_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_DISPATCH_LOGS;
  });

  // LocalStorage syncing
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('blood_donation_session', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('blood_donation_session');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('blood_donation_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('blood_donation_health_records', JSON.stringify(healthRecords));
  }, [healthRecords]);

  useEffect(() => {
    localStorage.setItem('blood_donation_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('blood_donation_dispatch_logs', JSON.stringify(dispatchLogs));
  }, [dispatchLogs]);

  // Handle Login
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    if (user.role === 'doctor' || user.role === 'staff') {
      setActiveTab('copilot');
    } else {
      setActiveTab('donorCard');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('blood_donation_session');
  };

  // Handle Role Switch
  const handleSwitchRole = (role: UserRole) => {
    const targetUser = DEFAULT_USERS[role];
    if (targetUser) {
      setCurrentUser(targetUser);
      if (role === 'doctor' || role === 'staff') {
        setActiveTab('copilot');
      } else {
        setActiveTab('donorCard');
      }
    }
  };

  // Add appointment handler
  const handleAddAppointment = (newApt: Appointment) => {
    setAppointments((prev) => [newApt, ...prev]);
  };

  // Cancel appointment handler
  const handleCancelAppointment = (id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  };

  // Add health record handler
  const handleAddHealthRecord = (record: HealthMetricRecord) => {
    setHealthRecords((prev) => [record, ...prev]);
  };

  // Add dispatch log handler
  const handleAddDispatchLog = (log: DispatchLog) => {
    setDispatchLogs((prev) => [log, ...prev]);
  };

  // IF NOT LOGGED IN, RENDER THE AUTHENTIC LOGIN PORTAL FIRST!
  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-rose-500/20 selection:text-rose-900">
      {/* Primary Navigation */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setCurrentUser(null)}
        onLogout={handleLogout}
        onSwitchRole={handleSwitchRole}
        onOpenReminders={() => setIsRemindersOpen(true)}
        unreadRemindersCount={unreadRemindersCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'donorCard' && (
          <DigitalDonorCard
            currentUser={currentUser}
            onNavigateToScheduling={() => setActiveTab('scheduling')}
            onNavigateToRecords={() => setActiveTab('healthRecords')}
          />
        )}

        {activeTab === 'scheduling' && (
          <DonationScheduler
            currentUser={currentUser}
            appointments={appointments}
            onAddAppointment={handleAddAppointment}
            onCancelAppointment={handleCancelAppointment}
          />
        )}

        {activeTab === 'eligibility' && (
          <EligibilityCheck
            currentUser={currentUser}
            onNavigateToScheduling={() => setActiveTab('scheduling')}
          />
        )}

        {activeTab === 'healthRecords' && (
          <HealthRecordsDashboard
            currentUser={currentUser}
            healthRecords={healthRecords}
            onAddHealthRecord={handleAddHealthRecord}
          />
        )}

        {activeTab === 'copilot' && (
          <AICopilotDashboard
            currentUser={currentUser}
            inventory={inventory}
            dispatchLogs={dispatchLogs}
            onUpdateInventory={setInventory}
            onAddDispatchLog={handleAddDispatchLog}
          />
        )}

        {activeTab === 'hospitals' && (
          <HospitalNetworkDirectory
            onSelectHospitalForBooking={() => setActiveTab('scheduling')}
          />
        )}
      </main>

      {/* Reminders & Notification Slide-Over Drawer */}
      <RemindersDrawer
        isOpen={isRemindersOpen}
        onClose={() => setIsRemindersOpen(false)}
        currentUser={currentUser}
        appointments={appointments}
        onNavigateToScheduling={() => setActiveTab('scheduling')}
        onNavigateToEligibility={() => setActiveTab('eligibility')}
        onUnreadCountChange={setUnreadRemindersCount}
      />

      {/* Pleasant Hospital-Grade Footer */}
      <footer className="bg-white border-t border-slate-200 py-10 mt-12 text-slate-500 text-xs shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5 text-left">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-rose-600 to-red-600 flex items-center justify-center text-white font-bold shadow-xs">
                  <Heart className="w-4 h-4 fill-white" />
                </div>
                <span className="font-extrabold text-slate-900 text-base tracking-tight">
                  Blood Donation
                </span>
                <span className="text-[10px] bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded-full border border-rose-200 font-bold">
                  National Transfusion Network
                </span>
              </div>
              <p className="text-[11px] text-slate-500 max-w-md">
                Encrypted donor pass registry, AI-assisted trauma transfusion triage, and emergency inter-hospital blood logistics.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs">
              <div className="flex items-center gap-1.5 text-rose-800 font-bold">
                <Phone className="w-3.5 h-3.5 text-rose-600" />
                <span>Emergency Blood Dispatch: <strong>1-800-RED-HEMA</strong></span>
              </div>
              <div className="flex items-center gap-3 font-semibold text-slate-600">
                <button
                  onClick={() => setActiveTab('donorCard')}
                  className="hover:text-rose-700 transition-colors cursor-pointer"
                >
                  Digital Pass
                </button>
                <span>•</span>
                <button
                  onClick={() => setActiveTab('scheduling')}
                  className="hover:text-rose-700 transition-colors cursor-pointer"
                >
                  Schedule Donation
                </button>
                <span>•</span>
                <button
                  onClick={() => setActiveTab('eligibility')}
                  className="hover:text-rose-700 transition-colors cursor-pointer"
                >
                  Eligibility
                </button>
                <span>•</span>
                <button
                  onClick={() => setActiveTab('copilot')}
                  className="hover:text-rose-700 transition-colors cursor-pointer"
                >
                  AI Copilot
                </button>
                <span>•</span>
                <button
                  onClick={() => setActiveTab('hospitals')}
                  className="hover:text-rose-700 transition-colors cursor-pointer"
                >
                  Hospitals
                </button>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <div>
              © 2026 Blood Donation Network. Standards aligned with AABB, FDA CBER, and World Health Organization.
            </div>
            <div className="flex items-center gap-4 font-medium">
              <a
                href="https://www.redcrossblood.org"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-800 flex items-center gap-1"
              >
                Red Cross Blood <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://www.aabb.org"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-800 flex items-center gap-1"
              >
                AABB Standards <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://www.who.int/news-room/fact-sheets/detail/blood-safety-and-availability"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-800 flex items-center gap-1"
              >
                WHO Blood Safety <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
