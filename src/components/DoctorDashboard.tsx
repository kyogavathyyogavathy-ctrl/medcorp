import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Layers, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Building2, 
  Filter, 
  ArrowRight, 
  Sparkles,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  SlidersHorizontal,
  Bookmark,
  X
} from 'lucide-react';
import { StorageService, subscribeToStorage } from '../services/storage';
import { searchMedicines } from '../services/searchEngine';
import { Medicine, MedicineRequest, Quotation, Doctor } from '../types';

interface DoctorDashboardProps {
  doctorId: string;
  onNavigate: (tab: string, meta?: any) => void;
  onRequestQuote: (medicine: Medicine) => void;
  onCompareSelect: (medicine: Medicine) => void;
  selectedForCompare: Medicine[];
  onOpenMedicineDetail: (medicine: Medicine) => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({
  doctorId,
  onNavigate,
  onRequestQuote,
  onCompareSelect,
  selectedForCompare,
  onOpenMedicineDetail,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [savedMeds, setSavedMeds] = useState<string[]>(['med-001', 'med-006']);
  const [doctor, setDoctor] = useState<Doctor | undefined>(() => StorageService.getDoctorById(doctorId));
  const [medicines, setMedicines] = useState<Medicine[]>(() => StorageService.getMedicines());
  const [requests, setRequests] = useState<MedicineRequest[]>(() => StorageService.getRequests());
  const [quotations, setQuotations] = useState<Quotation[]>(() => StorageService.getQuotations());

  useEffect(() => {
    const handleUpdate = () => {
      setDoctor(StorageService.getDoctorById(doctorId));
      setMedicines(StorageService.getMedicines());
      setRequests(StorageService.getRequests());
      setQuotations(StorageService.getQuotations());
    };
    return subscribeToStorage(handleUpdate);
  }, [doctorId]);

  const docRequests = requests.filter(r => r.doctor_id === doctorId);
  const activeRequestsCount = docRequests.filter(r => r.status !== 'completed' && r.status !== 'cancelled').length;
  
  // Pending quotations received across doctor's requests
  const doctorRequestIds = new Set(docRequests.map(r => r.id));
  const receivedQuotes = quotations.filter(q => doctorRequestIds.has(q.request_id));
  const pendingQuotesCount = receivedQuotes.filter(q => q.quotation_status === 'submitted').length;

  const categories = [
    'All',
    'Analgesics & Antipyretics',
    'Antibiotics & Anti-Infective',
    'Cardiovascular',
    'Critical Care & ICU',
    'Endocrinology & Diabetes',
    'Gastroenterology',
    'Respiratory Care',
    'Oncology & Immunotherapy',
    'Pediatrics',
    'Anesthesia & Surgery',
  ];

  // High-hit rate search using searchEngine (ALWAYS WINS)
  const searchResults = useMemo(() => {
    return searchMedicines(medicines, searchQuery, {
      category: selectedCategory,
    });
  }, [medicines, searchQuery, selectedCategory]);

  const filteredMeds = searchResults.allMatches;

  // Live suggestions for dropdown while typing
  const liveSuggestions = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return [];
    return searchMedicines(medicines, searchQuery.trim()).allMatches.slice(0, 6);
  }, [medicines, searchQuery]);

  const toggleSaveMed = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedMeds(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearchFocused(false);
    onNavigate('search', { query: searchQuery });
  };

  const POPULAR_SEARCH_PRESETS = [
    { label: 'Dolo 650 (Paracetamol)', query: 'Dolo 650' },
    { label: 'Augmentin 625 (Amox-Clav)', query: 'Augmentin 625' },
    { label: 'Azithromycin 500mg', query: 'Azithromycin 500mg' },
    { label: 'Pantoprazole 40mg IV', query: 'Pantoprazole 40mg' },
    { label: 'Ceftriaxone 1g Injection', query: 'Ceftriaxone 1g' },
    { label: 'Meropenem 1g IV', query: 'Meropenem 1g' },
    { label: 'Metformin 500mg', query: 'Metformin 500mg' },
    { label: 'Telmisartan 40mg', query: 'Telmisartan 40mg' },
    { label: 'Enoxaparin 40mg (Clexane)', query: 'Enoxaparin 40mg' },
    { label: 'Noradrenaline 4mg IV', query: 'Noradrenaline 4mg' },
    { label: 'Insulin Glargine (Lantus)', query: 'Insulin Glargine' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Verification Status Banner if pending */}
      {doctor?.verification_status === 'pending' && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-sm flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                Medical Council Verification In Progress
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                Your medical registration ({doctor.registration_number}) and hospital credentials are being audited by the MedLink compliance desk. You can browse medicines and draft requirements.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-amber-800 bg-amber-200/70 px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0">
            Pending Audit
          </span>
        </div>
      )}

      {/* Top Welcome & Hospital Profile Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Welcome, {doctor?.name || 'Doctor'}
            </h1>
            {doctor?.verification_status === 'verified' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                Verified Physician
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {doctor?.specialization} · <span className="font-semibold text-slate-700">{doctor?.hospital}</span> ({doctor?.location})
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate('search')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition"
          >
            <Search className="w-4 h-4" />
            <span>Find Medicines</span>
          </button>
          <button
            onClick={() => onNavigate('compare')}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-200 transition"
          >
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Compare ({selectedForCompare.length})</span>
          </button>
        </div>
      </div>

      {/* DASHBOARD CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Active Requests */}
        <div 
          onClick={() => onNavigate('requests')}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-300 shadow-sm hover:shadow transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Requests</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 tracking-tight group-hover:text-blue-600 transition-colors">
            {activeRequestsCount}
          </div>
          <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
            <span>In procurement cycle</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Pending Quotations */}
        <div 
          onClick={() => onNavigate('requests')}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-teal-300 shadow-sm hover:shadow transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Quotations Received</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-teal-700 mt-2 tracking-tight">
            {pendingQuotesCount}
          </div>
          <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
            <span>Awaiting doctor approval</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Available Medicines */}
        <div 
          onClick={() => onNavigate('search')}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Available Medicines</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 tracking-tight">
            {medicines.filter(m => m.status === 'published').length}
          </div>
          <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
            <span>Verified catalog items</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Saved Suppliers */}
        <div 
          onClick={() => onNavigate('compare')}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Verified Suppliers</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 tracking-tight">
            {StorageService.getPharmaCompanies().filter(p => p.verification_status === 'verified').length}
          </div>
          <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
            <span>Authorized pharma partners</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

      </div>

      {/* LARGE SEARCH BAR & NLP ASSISTANT */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight">
              Hospital Pharmaceutical Sourcing Desk
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Search by medicine name, chemical composition, strength, or enter a natural requisition.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 bg-blue-800/60 border border-blue-700/60 text-blue-200 text-xs px-2.5 py-1 rounded-lg">
            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            <span>AI Entity Extraction Enabled</span>
          </div>
        </div>

        <div className="relative">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchFocused(true);
              }}
              placeholder="Search medicine, composition or brand... e.g. 'Dolo 650', 'Augmentin 625', 'Pantoprazole', 'Meropenem'..."
              className="w-full bg-white text-slate-900 pl-12 pr-32 py-3 rounded-xl text-sm font-medium shadow-inner focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-36 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-2 top-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition"
            >
              Find Medicines
            </button>
          </form>

          {/* Autocomplete suggestions dropdown */}
          {isSearchFocused && liveSuggestions.length > 0 && (
            <div 
              onMouseDown={(e) => e.preventDefault()} 
              className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden divide-y divide-slate-100 text-slate-900 animate-in fade-in"
            >
              <div className="p-2.5 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold flex items-center gap-1.5 text-slate-700">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  Instant Matches for "{searchQuery}" ({liveSuggestions.length})
                </span>
                <span className="text-[11px] text-slate-400">Click any formulation to inspect</span>
              </div>
              {liveSuggestions.map((med) => (
                <div 
                  key={med.id}
                  onClick={() => {
                    setIsSearchFocused(false);
                    onOpenMedicineDetail(med);
                  }}
                  className="p-3 hover:bg-teal-50/60 cursor-pointer flex items-center justify-between gap-4 transition"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 hover:text-blue-600">{med.medicine_name}</span>
                      <span className="text-xs text-slate-500 font-medium">({med.composition} - {med.strength})</span>
                      {med.is_verified_supplier && (
                        <span className="text-[10px] bg-teal-100 text-teal-800 font-semibold px-1.5 py-0.2 rounded">
                          Verified
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-3">
                      <span>{med.company_name}</span>
                      <span>·</span>
                      <span>Pack: {med.pack_size}</span>
                      <span>·</span>
                      <span className="text-emerald-700 font-semibold">
                        {med.availability === 'in_stock' ? 'In Stock' : 'Limited Stock'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs text-slate-400">Listed Price</div>
                    <div className="font-black text-slate-900 text-sm">₹{med.listed_price}</div>
                  </div>
                </div>
              ))}
              <div className="p-2.5 bg-slate-50 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchFocused(false);
                    onNavigate('search', { query: searchQuery });
                  }}
                  className="text-xs text-blue-600 font-bold hover:underline"
                >
                  View all results for "{searchQuery}" in Medicine Discovery →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick query presets */}
        <div className="flex items-center gap-2 flex-wrap text-xs text-slate-300 pt-1">
          <span className="text-slate-400 shrink-0 font-medium">Popular Searches:</span>
          {POPULAR_SEARCH_PRESETS.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                setSearchQuery(item.query);
                setIsSearchFocused(false);
                onNavigate('search', { query: item.query });
              }}
              className="bg-slate-800/80 hover:bg-slate-700 hover:border-slate-500 text-slate-200 px-2.5 py-1 rounded-md text-[11px] border border-slate-700 transition"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* QUICK CATEGORY FILTER ROW */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white font-semibold shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* RECOMMENDED MEDICINES SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Recommended Medicines</h3>
            <p className="text-xs text-slate-500">
              High-demand hospital essentials from verified pharmaceutical manufacturers with verified stocks.
            </p>
          </div>
          <button
            onClick={() => onNavigate('search')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>View all ({medicines.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {filteredMeds.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500 space-y-2">
            <Search className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="font-semibold text-sm text-slate-700">No medicines matched your filter criteria.</p>
            <p className="text-xs">Try clearing your search query or selecting "All" categories.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMeds.slice(0, 6).map((med) => {
              const isSelected = selectedForCompare.some(m => m.id === med.id);
              const isSaved = savedMeds.includes(med.id);

              return (
                <div
                  key={med.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4 group"
                >
                  {/* Card Header */}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {med.category}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => toggleSaveMed(med.id, e)}
                          className={`p-1 rounded-md transition ${
                            isSaved ? 'text-amber-500 bg-amber-50' : 'text-slate-400 hover:text-slate-600'
                          }`}
                          title="Save medicine"
                        >
                          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500' : ''}`} />
                        </button>
                      </div>
                    </div>

                    <h4 
                      onClick={() => onOpenMedicineDetail(med)}
                      className="text-base font-bold text-slate-900 mt-2 hover:text-blue-600 cursor-pointer transition-colors"
                    >
                      {med.medicine_name}
                    </h4>

                    {/* Composition & Strength */}
                    <div className="text-xs text-slate-600 mt-1 space-y-0.5">
                      <p><span className="text-slate-400">Composition:</span> <strong className="text-slate-700">{med.composition}</strong></p>
                      <p><span className="text-slate-400">Strength:</span> {med.strength} · <span className="text-slate-400">Form:</span> {med.dosage_form}</p>
                    </div>

                    {/* Supplier info */}
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-slate-700 truncate">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium truncate">{med.company_name}</span>
                      </div>
                      {med.is_verified_supplier && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-teal-700 font-semibold bg-teal-50 px-1.5 py-0.5 rounded shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-teal-600" />
                          Verified
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Commercial details: Pack size, price, availability */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Pack Size:</span>
                      <span className="font-semibold text-slate-800">{med.pack_size}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Listed Price:</span>
                      <span className="font-extrabold text-sm text-slate-900">
                        ₹{med.listed_price} <span className="text-[10px] font-normal text-slate-500">/ pack</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <span className="text-slate-500">Availability:</span>
                      <span className={`font-semibold inline-flex items-center gap-1 ${
                        med.availability === 'in_stock' ? 'text-emerald-700' :
                        med.availability === 'limited_stock' ? 'text-amber-700' : 'text-rose-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          med.availability === 'in_stock' ? 'bg-emerald-500' :
                          med.availability === 'limited_stock' ? 'bg-amber-500' : 'bg-rose-500'
                        }`}></span>
                        {med.availability === 'in_stock' ? `In Stock (${med.stock_quantity.toLocaleString()})` :
                         med.availability === 'limited_stock' ? 'Limited Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons: Compare, View Details, Request Quotation */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <button
                      onClick={() => onCompareSelect(med)}
                      className={`text-xs font-semibold py-2 px-1 rounded-lg border transition ${
                        isSelected 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                      title={isSelected ? 'Remove from compare' : 'Add to supplier compare'}
                    >
                      {isSelected ? '✓ Added' : 'Compare'}
                    </button>

                    <button
                      onClick={() => onOpenMedicineDetail(med)}
                      className="text-xs font-semibold py-2 px-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                    >
                      Details
                    </button>

                    <button
                      onClick={() => onRequestQuote(med)}
                      className="text-xs font-semibold py-2 px-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition truncate shadow-sm"
                    >
                      Request
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ACTIVE DOCTOR REQUISITIONS PREVIEW */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Your Active Procurement Requisitions</h3>
            <p className="text-xs text-slate-500">Track quotes received, hospital review status, and supplier dispatches.</p>
          </div>
          <button
            onClick={() => onNavigate('requests')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>View all tracking ({docRequests.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {docRequests.slice(0, 3).map((req) => (
            <div key={req.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900">{req.id}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    req.status === 'quotation_received' ? 'bg-teal-100 text-teal-800' :
                    req.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                    req.status === 'under_review' ? 'bg-blue-100 text-blue-800' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {req.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="font-semibold text-slate-800 mt-1">
                  {req.medicine_name} · <span className="text-slate-500 font-normal">Qty: {req.required_quantity} units</span>
                </p>
                <p className="text-[11px] text-slate-400">Required Date: {req.required_date} · Sent to {req.selected_company_ids.length} suppliers</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('requests', { selectedRequestId: req.id })}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded-lg text-xs transition"
                >
                  Track Status
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
