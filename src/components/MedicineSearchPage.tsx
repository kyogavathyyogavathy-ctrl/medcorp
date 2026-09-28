import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  Sparkles, 
  Building2, 
  CheckCircle2, 
  Layers, 
  ArrowRight, 
  RotateCcw, 
  FileText, 
  AlertCircle,
  X,
  Filter,
  Info,
  MapPin,
  Package
} from 'lucide-react';
import { StorageService, subscribeToStorage } from '../services/storage';
import { AIService } from '../services/aiService';
import { searchMedicines } from '../services/searchEngine';
import { Medicine, PharmaCompany, AIParsedMedicineQuery } from '../types';

interface MedicineSearchPageProps {
  initialQuery?: string;
  onNavigate: (tab: string, meta?: any) => void;
  onRequestQuote: (medicine: Medicine, prefillQty?: number) => void;
  onCompareSelect: (medicine: Medicine) => void;
  selectedForCompare: Medicine[];
  onOpenMedicineDetail: (medicine: Medicine) => void;
}

export const MedicineSearchPage: React.FC<MedicineSearchPageProps> = ({
  initialQuery = '',
  onNavigate,
  onRequestQuote,
  onCompareSelect,
  selectedForCompare,
  onOpenMedicineDetail,
}) => {
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  const [medicines, setMedicines] = useState<Medicine[]>(() => StorageService.getMedicines());
  const [pharmaCompanies, setPharmaCompanies] = useState<PharmaCompany[]>(() => StorageService.getPharmaCompanies());

  // Filter States
  const [selectedCompany, setSelectedCompany] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedForm, setSelectedForm] = useState<string>('All');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('All');
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [maxPrice, setMaxPrice] = useState<number>(100000);
  const [selectedLocation, setSelectedLocation] = useState<string>('All');

  // AI Entity Extraction state
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [parsedAiQuery, setParsedAiQuery] = useState<AIParsedMedicineQuery | null>(null);

  // View mode: 'all' vs 'grouped' (Duplicate & Similar detection)
  const [viewMode, setViewMode] = useState<'all' | 'grouped'>('all');

  useEffect(() => {
    const handleUpdate = () => {
      setMedicines(StorageService.getMedicines());
      setPharmaCompanies(StorageService.getPharmaCompanies());
    };
    return subscribeToStorage(handleUpdate);
  }, []);

  // Run AI natural query parser when requested
  const handleRunAiParser = async (queryText: string) => {
    if (!queryText.trim()) return;
    setIsAiLoading(true);
    try {
      const parsed = await AIService.parseMedicineQuery(queryText);
      setParsedAiQuery(parsed);
      
      // Auto apply extracted form or category if present
      if (parsed.dosage_form) {
        setSelectedForm(parsed.dosage_form);
      }
    } catch (err) {
      console.error('AI parse error:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveQuery(searchInput);
    if (searchInput.length > 15 || searchInput.toLowerCase().includes('need') || searchInput.toLowerCase().includes('unit')) {
      handleRunAiParser(searchInput);
    }
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setActiveQuery('');
    setSelectedCompany('All');
    setSelectedCategory('All');
    setSelectedForm('All');
    setSelectedAvailability('All');
    setVerifiedOnly(false);
    setMaxPrice(100000);
    setSelectedLocation('All');
    setParsedAiQuery(null);
  };

  // Distinct Filter Options
  const categories = useMemo(() => {
    const set = new Set(medicines.map(m => m.category));
    return ['All', ...Array.from(set)];
  }, [medicines]);

  const dosageForms = useMemo(() => {
    const set = new Set(medicines.map(m => m.dosage_form));
    return ['All', ...Array.from(set)];
  }, [medicines]);

  const locations = useMemo(() => {
    const set = new Set(medicines.map(m => m.supplier_location.split(',')[0].trim()));
    return ['All', ...Array.from(set)];
  }, [medicines]);

  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);

  // High-Confidence Winning Search Engine
  const searchResults = useMemo(() => {
    return searchMedicines(medicines, activeQuery, {
      companyId: selectedCompany,
      category: selectedCategory,
      dosageForm: selectedForm,
      availability: selectedAvailability,
      maxPrice: maxPrice,
      verifiedOnly: verifiedOnly,
      location: selectedLocation,
    });
  }, [medicines, activeQuery, selectedCompany, selectedCategory, selectedForm, selectedAvailability, verifiedOnly, maxPrice, selectedLocation]);

  const filteredMedicines = searchResults.allMatches;

  // Live autocomplete suggestions while typing
  const liveSuggestions = useMemo(() => {
    if (!searchInput.trim() || searchInput.trim().length < 2) return [];
    return searchMedicines(medicines, searchInput.trim()).allMatches.slice(0, 6);
  }, [medicines, searchInput]);

  const POPULAR_SEARCH_PRESETS = [
    { label: 'Dolo 650 (Paracetamol)', query: 'Dolo 650' },
    { label: 'Augmentin 625 (Amox-Clav)', query: 'Augmentin 625' },
    { label: 'Azithromycin 500mg', query: 'Azithromycin 500mg' },
    { label: 'Pantoprazole 40mg IV', query: 'Pantoprazole 40mg' },
    { label: 'Ceftriaxone 1g Injection', query: 'Ceftriaxone 1g' },
    { label: 'Meropenem 1g IV', query: 'Meropenem 1g' },
    { label: 'Metformin 500mg', query: 'Metformin 500mg' },
    { label: 'Telmisartan 40mg', query: 'Telmisartan 40mg' },
    { label: 'Atorvastatin 20mg', query: 'Atorvastatin 20mg' },
    { label: 'Enoxaparin 40mg (Clexane)', query: 'Enoxaparin 40mg' },
    { label: 'Noradrenaline 4mg IV', query: 'Noradrenaline 4mg' },
    { label: 'Insulin Glargine (Lantus)', query: 'Insulin Glargine' },
    { label: 'Ondansetron 4mg (Emeset)', query: 'Ondansetron 4mg' },
    { label: 'Hydrocortisone 100mg', query: 'Hydrocortisone 100mg' },
  ];

  // Similar Medicine Grouping
  const groupedMedicines = useMemo(() => {
    return AIService.groupSimilarMedicines(filteredMedicines);
  }, [filteredMedicines]);

  return (
    <div className="space-y-6">
      
      {/* Top Search & Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Pharmaceutical Medicine Discovery
            </h1>
            <span className="text-xs text-slate-500 font-medium">
              {filteredMedicines.length} formulations available
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search authorized medications across verified manufacturers, compare listed pricing and inventory, and generate quotation requests.
          </p>
        </div>

        {/* Search Bar Form with Live Autocomplete */}
        <div className="relative">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchInput}
              onFocus={() => setIsSearchFocused(true)}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setIsSearchFocused(true);
              }}
              placeholder="Search by brand name (e.g. Dolo 650, Augmentin), chemical composition, strength or symptom..."
              className="w-full bg-slate-50 text-slate-900 pl-12 pr-40 py-3 rounded-xl text-sm font-medium border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  setActiveQuery('');
                }}
                className="absolute right-44 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <div className="absolute right-2 top-2 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleRunAiParser(searchInput)}
                disabled={isAiLoading || !searchInput.trim()}
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs px-2.5 py-1.5 rounded-lg border border-blue-200 flex items-center gap-1 transition disabled:opacity-50"
                title="Parse query using AI entity extractor"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>{isAiLoading ? 'Extracting...' : 'AI Extract'}</span>
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-1.5 rounded-lg transition"
              >
                Search
              </button>
            </div>
          </form>

          {/* Autocomplete suggestions dropdown */}
          {isSearchFocused && liveSuggestions.length > 0 && (
            <div 
              onMouseDown={(e) => e.preventDefault()} 
              className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden divide-y divide-slate-100 text-slate-900 animate-in fade-in"
            >
              <div className="p-2.5 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold flex items-center gap-1.5 text-slate-700">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Instant Matches for "{searchInput}" ({liveSuggestions.length})
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
                  className="p-3 hover:bg-blue-50/60 cursor-pointer flex items-center justify-between gap-4 transition"
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
                    setActiveQuery(searchInput);
                  }}
                  className="text-xs text-blue-600 font-bold hover:underline"
                >
                  Filter all results for "{searchInput}" below →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Popular Clinical Search Presets */}
        <div className="flex items-center gap-2 flex-wrap text-xs text-slate-600 pt-0.5">
          <span className="text-slate-400 shrink-0 font-medium">Popular Searches:</span>
          {POPULAR_SEARCH_PRESETS.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                setSearchInput(item.query);
                setActiveQuery(item.query);
                setIsSearchFocused(false);
              }}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg text-[11px] font-medium transition border border-slate-200"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Did You Mean Suggestion Banner */}
        {searchResults.didYouMean && activeQuery && (
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-900 animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-amber-800">Did you mean:</span>
              <button
                type="button"
                onClick={() => {
                  setSearchInput(searchResults.didYouMean!);
                  setActiveQuery(searchResults.didYouMean!);
                }}
                className="font-bold underline text-amber-950 hover:text-amber-700 cursor-pointer"
              >
                {searchResults.didYouMean}
              </button>
            </div>
            <span className="text-[11px] text-amber-700">Click suggestion to run optimized search</span>
          </div>
        )}

        {/* AI Parsed Tag Banner if present */}
        {parsedAiQuery && (
          <div className="bg-teal-50 border border-teal-200 p-3 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs text-teal-900 animate-in fade-in">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold flex items-center gap-1 text-teal-800">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                AI Extracted Entities:
              </span>
              {parsedAiQuery.extracted_tags.map((tag, i) => (
                <span key={i} className="bg-white px-2 py-0.5 rounded-md border border-teal-300 font-medium text-teal-900 shadow-2xs">
                  {tag}
                </span>
              ))}
            </div>
            <button
              onClick={() => setParsedAiQuery(null)}
              className="text-teal-700 hover:text-teal-900 font-semibold text-[11px] underline"
            >
              Clear AI Tags
            </button>
          </div>
        )}

        {/* Legal / Pricing Disclaimer Banner */}
        <div className="bg-blue-50/60 border border-blue-100 p-3 rounded-xl flex items-start gap-2 text-xs text-blue-900">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p>
            <strong>Pricing Notice:</strong> Prices displayed are published <em>Listed Prices / Indicative Supplier Quotes</em> provided by manufacturers. The final transaction price, bulk discount tier, and tax terms are formalized via direct quotation submission from the supplier.
          </p>
        </div>
      </div>

      {/* Main Layout: Filters Sidebar + Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* FILTERS SIDEBAR */}
        <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <SlidersHorizontal className="w-4 h-4 text-blue-600" />
              <span>Filters</span>
            </div>
            <button
              onClick={handleResetFilters}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Category Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Therapeutic Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 text-xs rounded-lg p-2.5 border border-slate-200 focus:bg-white focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Pharma Company Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Pharma Supplier</label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 text-xs rounded-lg p-2.5 border border-slate-200 focus:bg-white focus:outline-none"
            >
              <option value="All">All Suppliers</option>
              {pharmaCompanies.map((p) => (
                <option key={p.id} value={p.id}>{p.company_name}</option>
              ))}
            </select>
          </div>

          {/* Dosage Form Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Dosage Form</label>
            <select
              value={selectedForm}
              onChange={(e) => setSelectedForm(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 text-xs rounded-lg p-2.5 border border-slate-200 focus:bg-white focus:outline-none"
            >
              {dosageForms.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          {/* Stock Availability */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Stock Availability</label>
            <div className="space-y-1 text-xs">
              {[
                { label: 'All Stock Levels', val: 'All' },
                { label: 'In Stock Only', val: 'in_stock' },
                { label: 'Limited Stock', val: 'limited_stock' },
              ].map((opt) => (
                <label key={opt.val} className="flex items-center gap-2 cursor-pointer py-1">
                  <input
                    type="radio"
                    name="availability_filter"
                    checked={selectedAvailability === opt.val}
                    onChange={() => setSelectedAvailability(opt.val)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-700 font-medium">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Supplier Location Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Hub Location</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 text-xs rounded-lg p-2.5 border border-slate-200 focus:bg-white focus:outline-none"
            >
              {locations.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {/* Verified Supplier Only Toggle */}
          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                Verified Suppliers Only
              </span>
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
              />
            </label>
            <p className="text-[11px] text-slate-400 mt-1">
              Limits search to manufacturers with validated Drug Licenses & WHO-GMP credentials.
            </p>
          </div>

          {/* Price Range Slider */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 uppercase tracking-wider">Max Listed Price</span>
              <span className="font-extrabold text-blue-700 font-mono">₹{maxPrice.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min={50}
              max={25000}
              step={50}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

        </div>

        {/* RESULTS AREA */}
        <div className="lg:col-span-9 space-y-4">
          
          {/* View Mode Bar: All Listings vs Grouped by Composition */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">View Mode:</span>
              <div className="inline-flex rounded-lg bg-slate-100 p-1">
                <button
                  onClick={() => setViewMode('all')}
                  className={`px-3 py-1.5 rounded-md font-semibold transition ${
                    viewMode === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Supplier Listings ({filteredMedicines.length})
                </button>
                <button
                  onClick={() => setViewMode('grouped')}
                  className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 ${
                    viewMode === 'grouped' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Detect duplicate/similar medicines and group them to compare prices across suppliers"
                >
                  <Sparkles className="w-3 h-3 text-teal-600" />
                  <span>Group by Active Formulation ({Object.keys(groupedMedicines).length})</span>
                </button>
              </div>
            </div>

            <div className="text-slate-500">
              Showing <strong className="text-slate-800">{filteredMedicines.length}</strong> verified listings
            </div>
          </div>

          {/* Smart Clinical Recommendations Banner when no direct query match */}
          {searchResults.totalResults === 0 && searchResults.recommendedMatches.length > 0 && activeQuery && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-blue-950 animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <strong className="block font-bold text-sm text-blue-900">Showing Recommended Therapeutic Alternatives</strong>
                  <span className="text-blue-800">We expanded your search for "{activeQuery}" to display verified hospital formulations and essential alternatives.</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="bg-white border border-blue-300 text-blue-700 px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-100 shrink-0 transition text-xs shadow-2xs"
              >
                View All Catalog
              </button>
            </div>
          )}

          {/* Empty State */}
          {filteredMedicines.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No matching pharmaceutical formulations found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No medicines matched your query and filter criteria. Try expanding the price ceiling, selecting "All Suppliers", or resetting your search.
              </p>
              <button
                onClick={handleResetFilters}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition"
              >
                Reset All Filters
              </button>
            </div>
          ) : viewMode === 'grouped' ? (
            /* GROUPED VIEW: Similar / Duplicate Formulations Grouped Together */
            <div className="space-y-5">
              {Object.entries(groupedMedicines).map(([groupKey, groupMeds]) => {
                const primary = groupMeds[0];
                return (
                  <div key={groupKey} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Formulation Header */}
                    <div className="bg-slate-50/80 px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900">
                            {primary.composition} ({primary.strength})
                          </h3>
                          <span className="text-[10px] font-bold text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded-full">
                            {groupMeds.length} Supplier {groupMeds.length === 1 ? 'Option' : 'Options'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Formulation: {primary.dosage_form} · Category: {primary.category}
                        </p>
                      </div>

                      {groupMeds.length > 1 && (
                        <button
                          onClick={() => {
                            // Add all meds in this group to comparison
                            groupMeds.forEach(m => {
                              if (!selectedForCompare.some(sc => sc.id === m.id)) {
                                onCompareSelect(m);
                              }
                            });
                            onNavigate('compare');
                          }}
                          className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs px-3 py-1.5 rounded-lg border border-blue-200 transition shrink-0"
                        >
                          <Layers className="w-3.5 h-3.5" />
                          <span>Compare All {groupMeds.length} Suppliers</span>
                        </button>
                      )}
                    </div>

                    {/* Suppliers in this group */}
                    <div className="divide-y divide-slate-100">
                      {groupMeds.map((med) => {
                        const isSelected = selectedForCompare.some(m => m.id === med.id);
                        return (
                          <div key={med.id} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 text-sm hover:text-blue-600 cursor-pointer" onClick={() => onOpenMedicineDetail(med)}>
                                  {med.medicine_name}
                                </span>
                                {med.is_verified_supplier && (
                                  <span className="inline-flex items-center gap-0.5 text-[10px] text-teal-700 font-semibold bg-teal-50 px-1.5 py-0.2 rounded">
                                    <CheckCircle2 className="w-3 h-3 text-teal-600" />
                                    Verified Supplier
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-4 text-xs text-slate-600 flex-wrap">
                                <span className="flex items-center gap-1">
                                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                  <strong className="text-slate-800">{med.company_name}</strong>
                                </span>
                                <span className="flex items-center gap-1 text-slate-500">
                                  <MapPin className="w-3 h-3 text-slate-400" />
                                  {med.supplier_location}
                                </span>
                                <span className="flex items-center gap-1 text-slate-500">
                                  <Package className="w-3 h-3 text-slate-400" />
                                  Pack: {med.pack_size}
                                </span>
                                <span className="text-slate-500">
                                  MOQ: {med.moq} units
                                </span>
                              </div>
                            </div>

                            {/* Commercial metrics & CTA */}
                            <div className="flex items-center justify-between md:justify-end gap-6 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                              <div className="text-left md:text-right">
                                <div className="text-xs text-slate-400">Listed Price</div>
                                <div className="text-lg font-black text-slate-900">
                                  ₹{med.listed_price} <span className="text-[10px] font-normal text-slate-500">/ pack</span>
                                </div>
                                <div className={`text-[10px] font-semibold ${
                                  med.availability === 'in_stock' ? 'text-emerald-700' :
                                  med.availability === 'limited_stock' ? 'text-amber-700' : 'text-rose-600'
                                }`}>
                                  {med.availability === 'in_stock' ? `In Stock (${med.stock_quantity.toLocaleString()})` :
                                   med.availability === 'limited_stock' ? 'Limited Stock' : 'Out of Stock'}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => onCompareSelect(med)}
                                  className={`text-xs font-semibold px-3 py-2 rounded-lg border transition ${
                                    isSelected 
                                      ? 'bg-blue-600 text-white border-blue-600' 
                                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                  }`}
                                >
                                  {isSelected ? '✓ Added' : 'Compare'}
                                </button>

                                <button
                                  onClick={() => onRequestQuote(med, parsedAiQuery?.quantity)}
                                  className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-3.5 py-2 rounded-lg shadow-sm transition"
                                >
                                  Request Quotation
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ALL LISTINGS VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMedicines.map((med) => {
                const isSelected = selectedForCompare.some(m => m.id === med.id);
                return (
                  <div
                    key={med.id}
                    className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                          {med.category}
                        </span>
                        {med.is_verified_supplier ? (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-teal-700 font-semibold bg-teal-50 px-1.5 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3 text-teal-600" />
                            Verified Supplier
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            Pending Audit
                          </span>
                        )}
                      </div>

                      <h3 
                        onClick={() => onOpenMedicineDetail(med)}
                        className="text-base font-bold text-slate-900 mt-2 hover:text-blue-600 cursor-pointer transition-colors"
                      >
                        {med.medicine_name}
                      </h3>

                      <div className="text-xs text-slate-600 mt-1 space-y-0.5">
                        <p><span className="text-slate-400">Composition:</span> <strong className="text-slate-800">{med.composition}</strong></p>
                        <p><span className="text-slate-400">Strength:</span> {med.strength} · <span className="text-slate-400">Dosage:</span> {med.dosage_form}</p>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                        <div className="flex items-center gap-1.5 truncate">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-semibold text-slate-800 truncate">{med.company_name}</span>
                        </div>
                        <span className="text-slate-400 text-[11px] shrink-0">{med.supplier_location.split(',')[0]}</span>
                      </div>
                    </div>

                    {/* Commercial Data */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Pack Size:</span>
                        <span className="font-semibold text-slate-800">{med.pack_size}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Listed Price:</span>
                        <span className="font-black text-sm text-slate-900">
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

                    {/* Card Actions: View, Compare, Request Quotation */}
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <button
                        onClick={() => onOpenMedicineDetail(med)}
                        className="text-xs font-semibold py-2 px-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                      >
                        View
                      </button>

                      <button
                        onClick={() => onCompareSelect(med)}
                        className={`text-xs font-semibold py-2 px-1 rounded-lg border transition ${
                          isSelected 
                            ? 'bg-blue-600 text-white border-blue-600' 
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {isSelected ? '✓ Added' : 'Compare'}
                      </button>

                      <button
                        onClick={() => onRequestQuote(med, parsedAiQuery?.quantity)}
                        className="text-xs font-semibold py-2 px-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition truncate shadow-sm"
                      >
                        Request Quote
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

      {/* PERSISTENT FLOATING COMPARE DRAWER BAR IF ITEMS ARE SELECTED */}
      {selectedForCompare.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-4 max-w-xl w-full justify-between animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              {selectedForCompare.length}
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                {selectedForCompare.length} Pharmaceutical {selectedForCompare.length === 1 ? 'Supplier' : 'Suppliers'} Selected
              </div>
              <div className="text-[11px] text-slate-400 truncate max-w-xs">
                {selectedForCompare.map(m => m.company_name.split(' ')[0]).join(', ')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('compare')}
              className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Compare Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
