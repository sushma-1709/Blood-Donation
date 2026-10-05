import React, { useState } from 'react';
import { Hospital } from '../types';
import { REAL_HOSPITALS } from '../data/mockData';
import { 
  Building2, 
  MapPin, 
  Phone, 
  ExternalLink, 
  Navigation, 
  Search, 
  Globe, 
  BookOpen 
} from 'lucide-react';

interface HospitalNetworkDirectoryProps {
  onSelectHospitalForBooking?: (hospital: Hospital) => void;
}

export const HospitalNetworkDirectory: React.FC<HospitalNetworkDirectoryProps> = ({
  onSelectHospitalForBooking,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState<'all' | 'usa' | 'india' | 'international'>('all');

  const filtered = REAL_HOSPITALS.filter((h) => {
    const matchesSearch =
      h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.traumaLevel.toLowerCase().includes(searchTerm.toLowerCase());

    if (regionFilter === 'usa') {
      return matchesSearch && h.country === 'United States';
    } else if (regionFilter === 'india') {
      return matchesSearch && h.country === 'India';
    } else if (regionFilter === 'international') {
      return matchesSearch && h.country !== 'United States' && h.country !== 'India';
    }
    return matchesSearch;
  });

  const officialAgencies = [
    {
      name: 'American Red Cross Blood Services',
      description: 'Supplies ~40% of the United States blood and platelet inventory.',
      url: 'https://www.redcrossblood.org',
      role: 'National Voluntary Blood Bank System',
    },
    {
      name: 'AABB (Assoc. for Advancement of Blood & Biotherapies)',
      description: 'International standards accreditation for transfusion medicine and cellular therapy.',
      url: 'https://www.aabb.org',
      role: 'Transfusion Accreditation & Standards',
    },
    {
      name: 'World Health Organization (WHO) Blood Safety',
      description: 'Global guidelines on universal access to safe blood and voluntary unpaid donations.',
      url: 'https://www.who.int/news-room/fact-sheets/detail/blood-safety-and-availability',
      role: 'Global Health Policy',
    },
    {
      name: 'FDA Center for Biologics Evaluation and Research (CBER)',
      description: 'Federal regulations on blood donor eligibility, viral testing, and pathogen reduction.',
      url: 'https://www.fda.gov/vaccines-blood-biologics/blood-blood-products',
      role: 'Regulatory Authority',
    },
  ];

  return (
    <div className="space-y-8 text-left">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Building2 className="w-7 h-7 text-cyan-600" />
          Certified Trauma Center &amp; Blood Bank Directory
        </h1>
        <p className="text-slate-600 text-sm mt-1">
          Explore world-class academic medical centers, Level 1 Trauma Centers, and verified regional blood collection hubs with real-time location links and direct contact details.
        </p>
      </div>

      {/* Search and Region Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-white border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search hospitals by name, city, or trauma designation..."
            className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs w-full sm:w-auto">
          <button
            onClick={() => setRegionFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              regionFilter === 'all' ? 'bg-cyan-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Hubs ({REAL_HOSPITALS.length})
          </button>
          <button
            onClick={() => setRegionFilter('usa')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              regionFilter === 'usa' ? 'bg-cyan-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            United States
          </button>
          <button
            onClick={() => setRegionFilter('india')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              regionFilter === 'india' ? 'bg-cyan-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            India
          </button>
          <button
            onClick={() => setRegionFilter('international')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              regionFilter === 'international' ? 'bg-cyan-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            UK / Canada / Australia
          </button>
        </div>
      </div>

      {/* Hospital Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((hospital) => (
          <div
            key={hospital.id}
            className="rounded-3xl bg-white border border-slate-200 p-6 flex flex-col justify-between hover:border-cyan-400 transition-all shadow-xs space-y-4 group"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200">
                  {hospital.traumaLevel}
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  {hospital.availableSlotsToday} Slots Open
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-cyan-700 transition-colors">
                  {hospital.name}
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {hospital.address}, {hospital.city}, {hospital.state}, {hospital.country}
                </p>
              </div>

              {/* Department & Hours */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="text-slate-800 font-semibold truncate">
                  {hospital.bloodBankDepartment}
                </div>
                <div className="text-[11px] text-slate-500">
                  Hours: {hospital.hoursOfOperation}
                </div>
              </div>

              {/* Urgent Needs */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Critical Trauma Needs:
                </span>
                <div className="flex flex-wrap gap-1">
                  {hospital.urgentNeeds.map((type) => (
                    <span
                      key={type}
                      className="px-2 py-0.5 rounded-lg bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-bold"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Contacts & External Links */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-700">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <a
                    href={`tel:${hospital.phone.replace(/[^0-9+]/g, '')}`}
                    className="hover:underline font-medium"
                  >
                    {hospital.phone}
                  </a>
                </div>
                <span className="text-[10px] text-rose-700 font-mono font-bold">
                  ER: {hospital.emergencyHotline}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href={hospital.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold text-center flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5 text-cyan-600" />
                  Official Site
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>

                <a
                  href={hospital.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-xs transition-all"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Maps Route
                  <ExternalLink className="w-3 h-3 text-cyan-200" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Official Guidelines & Real-World Transfusion Links */}
      <div className="rounded-3xl bg-white border border-slate-200 p-6 md:p-7 space-y-5 shadow-xs">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-600" />
          <h2 className="text-base font-bold text-slate-900">
            Official Global Transfusion Guidelines &amp; Health Authority Links
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          All criteria, eligibility standards, and compatibility protocols in Blood Donation are strictly aligned with international hematology benchmarks.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {officialAgencies.map((agency) => (
            <a
              key={agency.name}
              href={agency.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all space-y-2 group block"
            >
              <div className="flex items-start justify-between">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                  {agency.role}
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-800 transition-colors" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                {agency.name}
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {agency.description}
              </p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
