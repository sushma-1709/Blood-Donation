import React, { useState } from 'react';
import { Hospital, Appointment, DonationType, BloodType, UserProfile } from '../types';
import { REAL_HOSPITALS } from '../data/mockData';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Phone, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Droplet, 
  Search, 
  Sparkles, 
  Download, 
  X, 
  Navigation
} from 'lucide-react';

interface DonationSchedulerProps {
  currentUser: UserProfile;
  appointments: Appointment[];
  onAddAppointment: (appointment: Appointment) => void;
  onCancelAppointment: (id: string) => void;
}

export const DonationScheduler: React.FC<DonationSchedulerProps> = ({
  currentUser,
  appointments,
  onAddAppointment,
  onCancelAppointment,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTraumaOnly, setFilterTraumaOnly] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<Hospital>(REAL_HOSPITALS[0]);
  const [selectedDonationType, setSelectedDonationType] = useState<DonationType>('whole_blood');
  
  // Date selection (defaults to tomorrow)
  const tomorrow = new Date(Date.now() + 86400000);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(tomorrowStr);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('09:30 AM');
  
  // Confirmation Modal
  const [confirmedBooking, setConfirmedBooking] = useState<Appointment | null>(null);
  const [bookingSuccessModal, setBookingSuccessModal] = useState(false);

  // Filtered hospitals
  const filteredHospitals = REAL_HOSPITALS.filter((h) => {
    const matchesSearch =
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.bloodBankDepartment.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterTraumaOnly) {
      return matchesSearch && h.traumaLevel.includes('Level 1');
    }
    return matchesSearch;
  });

  const timeSlots = [
    { time: '08:00 AM', status: 'Available', spots: 4 },
    { time: '09:30 AM', status: 'Available', spots: 6 },
    { time: '11:00 AM', status: 'Filling Fast', spots: 2 },
    { time: '01:30 PM', status: 'Available', spots: 5 },
    { time: '03:00 PM', status: 'Available', spots: 4 },
    { time: '04:30 PM', status: 'Filling Fast', spots: 1 },
    { time: '06:00 PM', status: 'Available', spots: 3 },
  ];

  const donationTypes = [
    {
      id: 'whole_blood',
      title: 'Whole Blood Donation',
      duration: '45 - 60 mins',
      volume: '~470 mL',
      interval: 'Every 56 days',
      description: 'Most common and versatile donation. Separated into red cells, plasma, and platelets to treat up to 3 patients.',
      badge: 'Highest Need',
    },
    {
      id: 'power_red',
      title: 'Power Red / Double Red',
      duration: '75 - 90 mins',
      volume: '2 Red Cell Units',
      interval: 'Every 112 days',
      description: 'Apheresis machine collects concentrated red blood cells while safely returning platelets and plasma to you.',
      badge: 'Trauma Essential',
    },
    {
      id: 'platelets',
      title: 'Platelet Apheresis',
      duration: '120 mins',
      volume: 'Single/Double Unit',
      interval: 'Every 7 days (up to 24/yr)',
      description: 'Vital for cancer patients, leukemia therapy, and major organ transplants. Shelf-life is only 5-7 days!',
      badge: 'Critical for Oncology',
    },
    {
      id: 'plasma',
      title: 'Plasma Donation',
      duration: '75 - 90 mins',
      volume: '~600 - 800 mL',
      interval: 'Every 28 days',
      description: 'Essential for burn victims, clotting disorders, and trauma shock recovery. Freeze-stored for up to 1 year.',
      badge: 'Clotting Support',
    },
  ];

  const handleBookSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const referenceCode = `BLD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBooking: Appointment = {
      id: `apt-${Date.now()}`,
      referenceCode,
      donorId: currentUser.id,
      donorName: currentUser.name,
      bloodGroup: currentUser.bloodGroup || 'O-',
      hospitalId: selectedHospital.id,
      hospitalName: selectedHospital.name,
      hospitalAddress: `${selectedHospital.address}, ${selectedHospital.city}, ${selectedHospital.state}`,
      hospitalMapsUrl: selectedHospital.mapsUrl,
      donationType: selectedDonationType,
      appointmentDate: selectedDate,
      timeSlot: selectedTimeSlot,
      status: 'confirmed',
      bookedAt: new Date().toISOString(),
      preScreeningCleared: true,
      notes: `Pre-check confirmed. Blood bank contact: ${selectedHospital.phone}`,
    };

    onAddAppointment(newBooking);
    setConfirmedBooking(newBooking);
    setBookingSuccessModal(true);
  };

  const generateICSFile = (apt: Appointment) => {
    const calendarContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Blood Donation//Appointment Reminder//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
SUMMARY:Blood Donation Appointment - ${apt.hospitalName}
DESCRIPTION:Blood donation session (${apt.donationType.replace('_', ' ').toUpperCase()}). Booking Code: ${apt.referenceCode}. Please hydrate with 16oz water and bring photo ID.
LOCATION:${apt.hospitalAddress}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([calendarContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `BloodDonation_${apt.referenceCode}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <CalendarIcon className="w-7 h-7 text-rose-600" />
            Trauma Center &amp; Blood Donation Scheduling
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Reserve dedicated slots at premier Level 1 Trauma Centers and regional university hospitals with real-time capacity tracking.
          </p>
        </div>

        {/* Existing Appointments Indicator */}
        {appointments.length > 0 && (
          <div className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-2xl text-xs shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-700 font-semibold">
              You have {appointments.length} active scheduled donation{appointments.length > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* User's Scheduled Appointments Card (if any) */}
      {appointments.length > 0 && (
        <div className="rounded-3xl bg-rose-50/50 border border-rose-200 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Your Confirmed Upcoming Appointments
            </h3>
            <span className="text-xs text-rose-800 font-mono font-bold">
              Fast-Track Triage Check-In
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {appointments.map((apt) => (
              <div
                key={apt.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 relative group hover:border-rose-300 transition-all shadow-xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded border border-rose-200">
                      REF: {apt.referenceCode}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1.5">{apt.hospitalName}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      {apt.hospitalAddress}
                    </p>
                  </div>
                  <button
                    onClick={() => onCancelAppointment(apt.id)}
                    className="text-xs text-slate-400 hover:text-rose-700 transition-colors p-1"
                    title="Cancel appointment"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Date &amp; Time</span>
                    <strong className="text-slate-800">
                      {apt.appointmentDate} @ {apt.timeSlot}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Donation Type</span>
                    <strong className="text-rose-800 capitalize">
                      {apt.donationType.replace('_', ' ')}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <a
                    href={apt.hospitalMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-cyan-700 hover:underline flex items-center gap-1"
                  >
                    <Navigation className="w-3 h-3" />
                    Open Google Maps Directions
                  </a>
                  <button
                    onClick={() => generateICSFile(apt)}
                    className="text-[11px] font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-lg cursor-pointer transition-colors"
                  >
                    <Download className="w-3 h-3 text-emerald-600" />
                    Calendar (.ics)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Scheduling Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Hospital & Center Selection */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl bg-white border border-slate-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-600" />
                1. Select Certified Hospital
              </h2>
              <span className="text-xs text-slate-500">
                {filteredHospitals.length} Centers Available
              </span>
            </div>

            {/* Search and Filters */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by hospital name, city, or specialty..."
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <label className="flex items-center gap-2 text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={filterTraumaOnly}
                    onChange={(e) => setFilterTraumaOnly(e.target.checked)}
                    className="rounded bg-white border-slate-300 text-rose-600 focus:ring-rose-500 h-4 w-4"
                  />
                  <span>Level 1 Trauma Centers only</span>
                </label>
                <span className="text-[11px] text-slate-400">Verified hubs</span>
              </div>
            </div>

            {/* Hospital List */}
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {filteredHospitals.map((hospital) => {
                const isSelected = selectedHospital.id === hospital.id;
                const hasDonorBloodNeed = hospital.urgentNeeds.includes(currentUser.bloodGroup || 'O-');

                return (
                  <div
                    key={hospital.id}
                    onClick={() => setSelectedHospital(hospital)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-rose-50/70 border-rose-400 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            {hospital.traumaLevel}
                          </span>
                          {hasDonorBloodNeed && (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5 text-rose-600" />
                              Urgent Need for {currentUser.bloodGroup || 'O-'}!
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 mt-1.5 leading-snug">
                          {hospital.name}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          {hospital.address}, {hospital.city}, {hospital.state}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono font-bold text-emerald-700 block">
                          {hospital.availableSlotsToday} slots today
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {hospital.distanceMiles} mi away
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px]">
                      <div className="text-slate-500 truncate max-w-[200px]">
                        {hospital.bloodBankDepartment}
                      </div>

                      <div className="flex items-center gap-3">
                        <a
                          href={hospital.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-slate-600 hover:text-slate-900 flex items-center gap-0.5 font-bold transition-colors"
                          title="Open official hospital portal"
                        >
                          Website <ExternalLink className="w-3 h-3" />
                        </a>
                        <a
                          href={hospital.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-cyan-700 hover:underline flex items-center gap-0.5 font-bold transition-colors"
                          title="Open in Google Maps"
                        >
                          Directions <Navigation className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Donation Type, Date, Time & Confirmation */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleBookSlot} className="space-y-6">
            {/* Step 2: Donation Type Selector */}
            <div className="rounded-3xl bg-white border border-slate-200 p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Droplet className="w-4 h-4 text-rose-600 fill-rose-600" />
                  2. Select Donation Type
                </h2>
                <span className="text-xs text-slate-500">
                  Donor Blood Group: <strong className="text-rose-700">{currentUser.bloodGroup || 'O-'}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {donationTypes.map((type) => {
                  const isSelected = selectedDonationType === type.id;
                  return (
                    <div
                      key={type.id}
                      onClick={() => setSelectedDonationType(type.id as DonationType)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer text-left relative ${
                        isSelected
                          ? 'bg-rose-50/70 border-rose-400 shadow-xs ring-1 ring-rose-300'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                          {type.badge}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {type.duration}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">{type.title}</h4>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                        {type.description}
                      </p>
                      <div className="mt-2 text-[10px] text-slate-400 font-mono">
                        Safe interval: {type.interval} • Vol: {type.volume}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Date & Real-Time Time Slots */}
            <div className="rounded-3xl bg-white border border-slate-200 p-6 space-y-4 shadow-xs">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-rose-600" />
                3. Choose Date &amp; Preferred Time Slot
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Appointment Date
                  </label>
                  <input
                    type="date"
                    min={tomorrowStr}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
                    required
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Operating Hours: {selectedHospital.hoursOfOperation}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Selected Hospital Center
                  </label>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <strong className="text-slate-900 block truncate">{selectedHospital.name}</strong>
                    <span className="text-[10px] text-slate-500 block truncate">
                      {selectedHospital.bloodBankDepartment}
                    </span>
                  </div>
                </div>
              </div>

              {/* Time Slots */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-700 block">
                  Real-Time Slot Availability for {selectedDate}:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {timeSlots.map((slot) => {
                    const isSelected = selectedTimeSlot === slot.time;
                    return (
                      <button
                        type="button"
                        key={slot.time}
                        onClick={() => setSelectedTimeSlot(slot.time)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-rose-700 border-rose-700 text-white font-bold shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <div className="text-xs font-bold">{slot.time}</div>
                        <div
                          className={`text-[9px] mt-0.5 ${
                            isSelected
                              ? 'text-rose-100'
                              : slot.spots <= 2
                              ? 'text-amber-700 font-bold'
                              : 'text-emerald-700 font-semibold'
                          }`}
                        >
                          {slot.spots} spots left
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Step 4: Pre-Donation Fast Checklist & Final Confirmation */}
            <div className="rounded-3xl bg-white border border-slate-200 p-6 space-y-4 shadow-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Pre-Appointment Patient Preparation Checklist
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2">
                  <span className="text-rose-600 font-bold">💧</span>
                  <span>Hydrate with 16-20 oz of water or juice 2 hours prior.</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2">
                  <span className="text-amber-600 font-bold">🥩</span>
                  <span>Eat a wholesome, iron-rich meal (avoid high-fat foods).</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2">
                  <span className="text-cyan-600 font-bold">🪪</span>
                  <span>Bring your Digital Donor Pass &amp; photo ID for fast check-in.</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-rose-700 to-red-600 hover:from-rose-600 hover:to-red-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-rose-700/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                Confirm Appointment &amp; Generate Fast-Pass
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Booking Success Confirmation Modal */}
      {bookingSuccessModal && confirmedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xl text-slate-900 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-emerald-500 to-rose-600 absolute top-0 left-0 right-0" />

            <div className="text-center pt-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 mb-3 shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Donation Slot Confirmed!</h2>
              <p className="text-xs text-slate-500 mt-1">
                Your reservation has been transmitted to the hospital blood bank intake desk.
              </p>
            </div>

            <div className="my-5 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 text-xs">
                <span className="text-slate-500">Booking Reference Code:</span>
                <span className="font-mono font-bold text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded border border-rose-200">
                  {confirmedBooking.referenceCode}
                </span>
              </div>

              <div className="text-xs space-y-1.5 text-slate-700">
                <div>
                  <strong>Hospital:</strong> {confirmedBooking.hospitalName}
                </div>
                <div className="text-slate-500 text-[11px]">
                  <strong>Address:</strong> {confirmedBooking.hospitalAddress}
                </div>
                <div>
                  <strong>Scheduled For:</strong> {confirmedBooking.appointmentDate} at {confirmedBooking.timeSlot}
                </div>
                <div>
                  <strong>Donation Component:</strong> <span className="capitalize text-rose-800 font-bold">{confirmedBooking.donationType.replace('_', ' ')}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => generateICSFile(confirmedBooking)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-300 cursor-pointer flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                Add to Apple / Google Calendar (.ics)
              </button>

              <button
                type="button"
                onClick={() => setBookingSuccessModal(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-700 hover:bg-rose-600 text-white text-xs font-bold transition-all shadow-md shadow-rose-700/20 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
