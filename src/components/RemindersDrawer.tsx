import React, { useState, useEffect } from 'react';
import { UserProfile, Appointment } from '../types';
import { 
  Bell, 
  X, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  Heart, 
  ShieldCheck, 
  Sparkles, 
  ChevronRight, 
  Volume2, 
  VolumeX,
  RotateCcw,
  Send,
  Droplet,
  ExternalLink,
  Shield,
  Activity
} from 'lucide-react';

interface RemindersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  appointments: Appointment[];
  onNavigateToScheduling: () => void;
  onNavigateToEligibility: () => void;
  onUnreadCountChange?: (count: number) => void;
}

export interface NotificationItem {
  id: string;
  type: 'interval_eligible' | 'interval_countdown' | 'appointment' | 'shortage' | 'iron_health';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'high' | 'medium' | 'info';
  actionLabel?: string;
  actionType?: 'schedule' | 'eligibility' | 'none';
}

export const RemindersDrawer: React.FC<RemindersDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  appointments,
  onNavigateToScheduling,
  onNavigateToEligibility,
  onUnreadCountChange,
}) => {
  // Browser Notification Permission State
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const [notificationSentToast, setNotificationSentToast] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'urgent'>('all');

  // Interval simulation state (allows testing both 56+ days passed and in-progress countdown)
  const [simulatedDaysElapsed, setSimulatedDaysElapsed] = useState<number>(58); // > 56 days by default for immediate eligibility alert!

  const totalRequiredInterval = 56; // Standard AABB / FDA Whole Blood interval in days
  const isIntervalPassed = simulatedDaysElapsed >= totalRequiredInterval;
  const daysRemaining = Math.max(0, totalRequiredInterval - simulatedDaysElapsed);

  // Play pleasant synthetic clinical notification chime
  const playNotificationChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {
      // Audio playback restricted or unsupported
    }
  };

  // List of active notification reminders
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'rem-interval',
      type: 'interval_eligible',
      title: '56-Day Post-Donation Interval Passed!',
      message: 'Your body has fully regenerated red blood cell and iron reserves. You are officially eligible to donate again and save up to 3 more lives.',
      timestamp: 'Today at 07:00 AM',
      read: false,
      priority: 'high',
      actionLabel: 'Schedule Donation Slot →',
      actionType: 'schedule',
    },
    {
      id: 'rem-appt',
      type: 'appointment',
      title: 'Upcoming Appointment: The Johns Hopkins Hospital',
      message: 'Your donation appointment is scheduled for Oct 12 at 09:30 AM. Please hydrate with 16-20 oz of fluids 2 hours prior.',
      timestamp: '1 hour ago',
      read: false,
      priority: 'medium',
      actionLabel: 'View Booking Details →',
      actionType: 'schedule',
    },
    {
      id: 'rem-shortage',
      type: 'shortage',
      title: 'Urgent O-Negative Call-to-Action',
      message: 'Regional Level 1 Trauma bays report low reserve margins. As an O-Negative universal donor, your units are urgently requested.',
      timestamp: '3 hours ago',
      read: false,
      priority: 'high',
      actionLabel: 'Check Immediate Need →',
      actionType: 'schedule',
    },
    {
      id: 'rem-health',
      type: 'iron_health',
      title: 'Post-Donation Iron & Ferritin Health Tip',
      message: 'Maintain robust hemoglobin levels by including iron-rich greens, citrus, and beans in your meals.',
      timestamp: 'Yesterday',
      read: true,
      priority: 'info',
    },
  ]);

  // Sync unread count to parent whenever notifications change
  useEffect(() => {
    const unread = notifications.filter((n) => !n.read).length;
    if (onUnreadCountChange) {
      onUnreadCountChange(unread);
    }
  }, [notifications, onUnreadCountChange]);

  // Check browser notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Request browser notification permission
  const handleRequestPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setNotificationSentToast('Browser notifications are not supported in this environment.');
      setTimeout(() => setNotificationSentToast(null), 4000);
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        playNotificationChime();
        sendBrowserNotification(
          'Blood Donation Alerts Enabled!',
          'You will now receive automatic alerts when your 56-day post-donation interval has passed.'
        );
      } else {
        setNotificationSentToast('Notification permission was not granted. In-app alerts remain active.');
        setTimeout(() => setNotificationSentToast(null), 4000);
      }
    } catch (err) {
      console.warn('Error requesting notification permission (iframe restriction):', err);
      setNotificationSentToast('Browser notifications simulated in-app (iframe permission restricted).');
      setTimeout(() => setNotificationSentToast(null), 4000);
    }
  };

  // Helper to trigger browser notification
  const sendBrowserNotification = (title: string, body: string) => {
    playNotificationChime();

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const notif = new Notification(title, {
          body,
          icon: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="%23e11d48"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',
          badge: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="%23e11d48"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',
        });

        notif.onclick = () => {
          window.focus();
          onNavigateToScheduling();
          onClose();
        };

        setNotificationSentToast(`Browser notification dispatched: "${title}"`);
        setTimeout(() => setNotificationSentToast(null), 4000);
        return;
      } catch (err) {
        console.warn('Native Notification constructor blocked by environment:', err);
      }
    }

    // In-app alert fallback
    setNotificationSentToast(`Alert triggered: "${title}"`);
    setTimeout(() => setNotificationSentToast(null), 4000);
  };

  // Trigger immediate 56-day interval alert
  const handleTriggerIntervalAlert = () => {
    sendBrowserNotification(
      'Blood Donation: 56-Day Interval Passed!',
      `Hello ${currentUser.name}! Your 56-day post-donation recovery interval is complete. You are eligible to donate again today.`
    );

    // Also ensure the interval notification is present in the feed and marked unread
    setNotifications((prev) => {
      const existing = prev.find((n) => n.id === 'rem-interval');
      if (existing) {
        return prev.map((n) =>
          n.id === 'rem-interval'
            ? { ...n, read: false, timestamp: 'Just now' }
            : n
        );
      }
      return [
        {
          id: 'rem-interval',
          type: 'interval_eligible',
          title: '56-Day Post-Donation Interval Passed!',
          message: 'Your body has fully regenerated red blood cell and iron reserves. You are officially eligible to donate again.',
          timestamp: 'Just now',
          read: false,
          priority: 'high',
          actionLabel: 'Schedule Donation Slot →',
          actionType: 'schedule',
        },
        ...prev,
      ];
    });
  };

  // Mark all as read
  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Dismiss notification
  const handleDismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((item) => {
    if (activeFilter === 'unread') return !item.read;
    if (activeFilter === 'urgent') return item.priority === 'high';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col text-slate-800 animate-in slide-in-from-right duration-300">
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 border border-rose-200 text-rose-700 flex items-center justify-center shadow-xs">
                <Bell className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-slate-900 text-base">Reminders &amp; Alerts</h3>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-600 text-white shadow-xs">
                      {unreadCount} New
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  56-day interval tracking &amp; transfusion advisories
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  soundEnabled
                    ? 'text-slate-600 bg-slate-100 border-slate-200 hover:bg-slate-200'
                    : 'text-slate-400 bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
                title={soundEnabled ? 'Chime sound enabled' : 'Chime sound muted'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-rose-600" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-rose-700 hover:text-rose-800 font-bold px-2 py-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  Mark read
                </button>
              )}

              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
                title="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Toast Notification Alert */}
          {notificationSentToast && (
            <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{notificationSentToast}</span>
            </div>
          )}

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 text-left">
            {/* 1. Browser Notification Permission Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-50 via-white to-slate-50 border border-rose-200/90 shadow-xs space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 block">
                      Browser Push Notifications
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Standard AABB / FDA 56-day alerting
                    </span>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                    notificationPermission === 'granted'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : notificationPermission === 'denied'
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                >
                  {notificationPermission === 'granted' ? 'Enabled' : notificationPermission}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Receive instant browser notifications the exact moment your 56-day whole blood recovery interval passes, so you never miss an opportunity to donate.
              </p>

              <div className="flex items-center gap-2 pt-1">
                {notificationPermission !== 'granted' ? (
                  <button
                    onClick={handleRequestPermission}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-rose-700 hover:bg-rose-600 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    Enable Browser Notifications
                  </button>
                ) : (
                  <button
                    onClick={handleTriggerIntervalAlert}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send Test 56-Day Alert
                  </button>
                )}
              </div>
            </div>

            {/* 2. 56-Day Post-Donation Interval Live Tracker Card */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-rose-600" />
                  Whole Blood Recovery Interval
                </span>
                <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                  STANDARD: 56 DAYS
                </span>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">
                    Days Elapsed: <strong>{simulatedDaysElapsed} of {totalRequiredInterval} days</strong>
                  </span>
                  <span className={`font-black ${isIntervalPassed ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {isIntervalPassed ? 'Interval Completed!' : `${daysRemaining} days left`}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200 p-0.5">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      isIntervalPassed ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-500 to-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, (simulatedDaysElapsed / totalRequiredInterval) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Status Message */}
              {isIntervalPassed ? (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-black text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>56 Days Passed: Eligible to Donate Today!</span>
                    </div>
                    <span className="text-[10px] bg-emerald-200/60 text-emerald-900 font-bold px-2 py-0.5 rounded">
                      Day {simulatedDaysElapsed}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800/90 leading-relaxed">
                    It has been {simulatedDaysElapsed} days since your last whole blood donation. Your red blood cells and ferritin levels are completely restored.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        onNavigateToScheduling();
                        onClose();
                      }}
                      className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                    >
                      <span>Reserve Donation Slot</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleTriggerIntervalAlert}
                      className="py-2 px-2.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-xs transition-colors cursor-pointer"
                      title="Send browser alert again"
                    >
                      Alert Me
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-black text-amber-800">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Interval In Progress ({daysRemaining} days remaining)</span>
                  </div>
                  <p className="text-[11px] text-amber-800/90 leading-relaxed">
                    Your body is synthesizing new hemoglobin and red blood cells. You will receive an automated browser notification on Day 56.
                  </p>
                </div>
              )}

              {/* Simulation Testing Slider & Presets */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1 font-semibold">
                    <RotateCcw className="w-3 h-3 text-slate-400" />
                    Simulate Interval Days:
                  </span>
                  <span className="font-mono font-bold text-slate-700">
                    {simulatedDaysElapsed} Days
                  </span>
                </div>

                <input
                  type="range"
                  min="1"
                  max="90"
                  value={simulatedDaysElapsed}
                  onChange={(e) => setSimulatedDaysElapsed(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
                />

                <div className="flex items-center justify-between gap-1">
                  <button
                    onClick={() => {
                      setSimulatedDaysElapsed(58);
                      handleTriggerIntervalAlert();
                    }}
                    className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-all ${
                      simulatedDaysElapsed === 58
                        ? 'bg-rose-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    58 Days (Passed)
                  </button>
                  <button
                    onClick={() => {
                      setSimulatedDaysElapsed(56);
                      handleTriggerIntervalAlert();
                    }}
                    className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-all ${
                      simulatedDaysElapsed === 56
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    56 Days (Just Now)
                  </button>
                  <button
                    onClick={() => setSimulatedDaysElapsed(42)}
                    className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-all ${
                      simulatedDaysElapsed === 42
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    42 Days (14d left)
                  </button>
                  <button
                    onClick={() => setSimulatedDaysElapsed(14)}
                    className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-all ${
                      simulatedDaysElapsed === 14
                        ? 'bg-slate-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    14 Days
                  </button>
                </div>
              </div>
            </div>

            {/* Biological Regeneration Milestones */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <span className="font-bold text-slate-900 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                <Activity className="w-3.5 h-3.5 text-rose-600" />
                Biological Recovery Milestones
              </span>
              <div className="space-y-1.5 text-[11px] text-slate-600">
                <div className="flex items-center justify-between">
                  <span>• Day 1-2: Blood plasma volume 100% replaced</span>
                  <span className="font-bold text-emerald-700">Done</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>• Day 4-21: Erythropoietin surge in bone marrow</span>
                  <span className="font-bold text-emerald-700">Done</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>• Day 56: Red cells &amp; ferritin completely restored</span>
                  <span className={`font-bold ${isIntervalPassed ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {isIntervalPassed ? 'Cleared' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Notifications Feed with Filter Tabs */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-slate-900 uppercase tracking-wider">
                  Recent Alerts &amp; Advisories
                </span>
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                  <button
                    onClick={() => setActiveFilter('all')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                      activeFilter === 'all'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    All ({notifications.length})
                  </button>
                  <button
                    onClick={() => setActiveFilter('unread')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                      activeFilter === 'unread'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Unread ({unreadCount})
                  </button>
                  <button
                    onClick={() => setActiveFilter('urgent')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                      activeFilter === 'urgent'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Urgent
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                {filteredNotifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs">
                    No alerts matching this filter.
                  </div>
                ) : (
                  filteredNotifications.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-2xl border transition-all text-xs space-y-2 relative group ${
                        !item.read
                          ? 'bg-white border-rose-200 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 opacity-90'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {item.type === 'interval_eligible' && (
                            <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>
                          )}
                          {item.type === 'appointment' && (
                            <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                              <Calendar className="w-3.5 h-3.5" />
                            </div>
                          )}
                          {item.type === 'shortage' && (
                            <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                              <AlertTriangle className="w-3.5 h-3.5" />
                            </div>
                          )}
                          {item.type === 'iron_health' && (
                            <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                              <Heart className="w-3.5 h-3.5" />
                            </div>
                          )}
                          <h4 className="font-extrabold text-slate-900 leading-snug">{item.title}</h4>
                        </div>

                        <div className="flex items-center gap-1">
                          {!item.read && (
                            <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
                          )}
                          <button
                            onClick={() => handleDismissNotification(item.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                            title="Dismiss notification"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-slate-600 leading-relaxed pl-8">
                        {item.message}
                      </p>

                      <div className="flex items-center justify-between pl-8 pt-1 text-[10px] text-slate-400 font-mono">
                        <span>{item.timestamp}</span>

                        {item.actionLabel && (
                          <button
                            onClick={() => {
                              if (item.actionType === 'schedule') {
                                onNavigateToScheduling();
                              } else if (item.actionType === 'eligibility') {
                                onNavigateToEligibility();
                              }
                              onClose();
                            }}
                            className="font-bold text-rose-700 hover:underline flex items-center gap-0.5 cursor-pointer"
                          >
                            {item.actionLabel}
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Automated 56-day sync active
            </span>
            <button
              onClick={() => {
                onNavigateToScheduling();
                onClose();
              }}
              className="text-rose-700 font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>Book Donation Slot</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
