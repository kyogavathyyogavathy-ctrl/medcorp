import React, { useState, useMemo } from 'react';
import { 
  Layers, 
  Building2, 
  CheckCircle2, 
  FileText, 
  Sparkles, 
  TrendingDown, 
  ArrowRight, 
  MapPin, 
  Package, 
  Clock, 
  ShieldCheck, 
  Plus, 
  Trash2,
  AlertCircle
} from 'lucide-react';
import { Medicine, PharmaCompany } from '../types';
import { StorageService } from '../services/storage';
import { AIService, SupplierMatchResult } from '../services/aiService';

interface CompareSuppliersPageProps {
  selectedMedicines: Medicine[];
  onRemoveFromCompare: (id: string) => void;
  onClearCompare: () => void;
  onRequestQuotationsMulti: (medicines: Medicine[]) => void;
  onNavigate: (tab: string) => void;
}

export const CompareSuppliersPage: React.FC<CompareSuppliersPageProps> = ({
  selectedMedicines,
  onRemoveFromCompare,
  onClearCompare,
  onRequestQuotationsMulti,
  onNavigate,
}) => {
  const [pharmaCompanies] = useState<PharmaCompany[]>(() => StorageService.getPharmaCompanies());
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<string[]>(() => 
    selectedMedicines.map(m => m.company_id)
  );

  // If no medicines are selected for comparison, pre-select the 3 demo Paracetamol listings so the user sees an immediate rich comparison experience!
  const allMeds = StorageService.getMedicines();
  const displayMedicines = useMemo(() => {
    if (selectedMedicines.length > 0) return selectedMedicines;
    // Default to comparing Paracetamol 500mg across all 3 suppliers
    return allMeds.filter(m => m.composition === 'Paracetamol' && m.strength === '500 mg');
  }, [selectedMedicines, allMeds]);

  // Run Smart Supplier Matching Evaluation
  const rankedResults: SupplierMatchResult[] = useMemo(() => {
    return AIService.rankSuppliersForMedicine(displayMedicines, pharmaCompanies);
  }, [displayMedicines, pharmaCompanies]);

  const toggleSupplierCheck = (companyId: string) => {
    setSelectedSupplierIds(prev =>
      prev.includes(companyId) ? prev.filter(id => id !== companyId) : [...prev, companyId]
    );
  };

  const handleRequestQuotations = () => {
    const selectedMeds = displayMedicines.filter(m => selectedSupplierIds.includes(m.company_id));
    if (selectedMeds.length === 0) {
      alert('Please select at least one pharmaceutical supplier from the comparison table.');
      return;
    }
    onRequestQuotationsMulti(selectedMeds);
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Supplier & Pricing Comparison Matrix
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Compare active formulations, listed prices, warehouse availability, minimum order quantities, and verified audit certifications side-by-side.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate('search')}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition"
          >
            <Plus className="w-4 h-4 text-blue-600" />
            <span>Add Formulation</span>
          </button>
          {selectedMedicines.length > 0 && (
            <button
              onClick={onClearCompare}
              className="text-xs text-rose-600 hover:text-rose-800 font-semibold px-3 py-2 rounded-xl hover:bg-rose-50 transition"
            >
              Clear Matrix
            </button>
          )}
        </div>
      </div>

      {/* AI Smart Supplier Matching Insights Card */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 rounded-2xl shadow-md space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-300" />
            <h2 className="text-base font-bold">
              Transparent Supplier Matching & Sourcing Insights
            </h2>
          </div>
          <span className="text-[11px] bg-teal-400/20 text-teal-200 px-2.5 py-0.5 rounded-full font-mono">
            Objective Criteria Engine
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
          MedLink ranks pharmaceutical suppliers using transparent criteria: real-time stock availability (25%), listed pricing competitiveness (25%), regulatory manufacturing verification (20%), geographic logistics proximity (15%), and institutional fulfillment reliability (15%). <em>Does not provide clinical therapy recommendations.</em>
        </p>

        {/* Top ranked cards preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {rankedResults.slice(0, 3).map((res, i) => (
            <div key={res.medicine.id} className="bg-slate-800/80 border border-slate-700 p-3.5 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-300 flex items-center gap-1">
                  #{i + 1} {res.medicine.company_name.split(' ')[0]}
                </span>
                <span className="text-xs font-mono font-extrabold text-white bg-blue-600/60 px-1.5 py-0.5 rounded">
                  Score: {res.overall_score}/100
                </span>
              </div>
              <p className="text-[11px] text-slate-300 line-clamp-2">
                {res.highlights[0] || 'Verified supplier with active hospital distribution license'}
              </p>
              <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-700/60">
                <span>Listed: ₹{res.medicine.listed_price}</span>
                <span className="text-emerald-400">Stock: {res.medicine.stock_quantity.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* COMPARISON TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Table Controls Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Comparing {displayMedicines.length} Pharmaceutical Suppliers
            </h3>
            <p className="text-xs text-slate-500">
              Select one or more suppliers using checkboxes to send a consolidated quotation requisition.
            </p>
          </div>

          <button
            onClick={handleRequestQuotations}
            className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md transition"
          >
            <FileText className="w-4 h-4" />
            <span>Request Quotations ({selectedSupplierIds.length} Selected)</span>
            <ArrowRight className="w-4 h-4 ml-0.5" />
          </button>
        </div>

        {/* Responsive Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 uppercase tracking-wider font-bold text-[11px] border-b border-slate-200">
                <th className="py-3.5 px-4 w-12 text-center">Select</th>
                <th className="py-3.5 px-4">Pharmaceutical Supplier</th>
                <th className="py-3.5 px-4">Brand / Product</th>
                <th className="py-3.5 px-4">Composition & Strength</th>
                <th className="py-3.5 px-4">Pack Size</th>
                <th className="py-3.5 px-4">Listed Price</th>
                <th className="py-3.5 px-4">Stock Availability</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Verification</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {displayMedicines.map((med) => {
                const pharma = pharmaCompanies.find(p => p.id === med.company_id);
                const isChecked = selectedSupplierIds.includes(med.company_id);

                return (
                  <tr 
                    key={med.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isChecked ? 'bg-blue-50/20' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-4 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSupplierCheck(med.company_id)}
                        className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500 cursor-pointer"
                      />
                    </td>

                    {/* Company */}
                    <td className="py-4 px-4 font-medium text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-bold">{med.company_name}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Rating: {pharma?.rating || 4.8} ★ ({pharma?.total_orders_completed || 120}+ orders)
                      </div>
                    </td>

                    {/* Medicine Name */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900">{med.medicine_name}</div>
                      <div className="text-[11px] text-slate-500">{med.dosage_form}</div>
                    </td>

                    {/* Composition */}
                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-800">{med.composition}</div>
                      <div className="text-[11px] text-slate-500">{med.strength}</div>
                    </td>

                    {/* Pack Size */}
                    <td className="py-4 px-4 font-medium text-slate-800">
                      {med.pack_size}
                    </td>

                    {/* Listed Price */}
                    <td className="py-4 px-4 font-black text-slate-900 text-sm">
                      ₹{med.listed_price}
                      <span className="block text-[10px] font-normal text-slate-400">Supplier Quote</span>
                    </td>

                    {/* Availability */}
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 font-semibold ${
                        med.availability === 'in_stock' ? 'text-emerald-700' :
                        med.availability === 'limited_stock' ? 'text-amber-700' : 'text-rose-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          med.availability === 'in_stock' ? 'bg-emerald-500' :
                          med.availability === 'limited_stock' ? 'bg-amber-500' : 'bg-rose-500'
                        }`}></span>
                        {med.availability === 'in_stock' ? `In Stock (${med.stock_quantity.toLocaleString()})` :
                         med.availability === 'limited_stock' ? 'Limited' : 'Out of Stock'}
                      </span>
                      <div className="text-[10px] text-slate-400">MOQ: {med.moq}</div>
                    </td>

                    {/* Location */}
                    <td className="py-4 px-4 text-slate-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{med.supplier_location.split(',')[0]}</span>
                      </div>
                    </td>

                    {/* Verification */}
                    <td className="py-4 px-4">
                      {med.is_verified_supplier ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-teal-800 font-bold bg-teal-100/70 px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="w-3 h-3 text-teal-600" />
                          Verified
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-700 bg-amber-100/70 font-bold px-2 py-0.5 rounded-md">
                          Pending Audit
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => onRemoveFromCompare(med.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                        title="Remove from comparison"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Comparison Table Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-slate-400" />
            <span>Select multiple suppliers above to broadcast your procurement requirement simultaneously.</span>
          </div>
          <button
            onClick={handleRequestQuotations}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition"
          >
            Request Quotations from Selected ({selectedSupplierIds.length})
          </button>
        </div>

      </div>

    </div>
  );
};
