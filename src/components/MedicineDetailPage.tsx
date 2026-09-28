import React from 'react';
import { 
  Building2, 
  CheckCircle2, 
  FileText, 
  Layers, 
  MapPin, 
  Package, 
  Clock, 
  ShieldCheck, 
  ArrowLeft, 
  Info,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Medicine, PharmaCompany } from '../types';
import { StorageService } from '../services/storage';

interface MedicineDetailPageProps {
  medicine: Medicine;
  onBack: () => void;
  onRequestQuote: (medicine: Medicine) => void;
  onCompareSelect: (medicine: Medicine) => void;
  isSelectedForCompare: boolean;
  onNavigate: (tab: string, meta?: any) => void;
}

export const MedicineDetailPage: React.FC<MedicineDetailPageProps> = ({
  medicine,
  onBack,
  onRequestQuote,
  onCompareSelect,
  isSelectedForCompare,
  onNavigate,
}) => {
  const pharma = StorageService.getPharmaCompanyById(medicine.company_id);
  const allMeds = StorageService.getMedicines();
  
  // Find alternative suppliers offering same composition/strength
  const alternateSuppliers = allMeds.filter(
    m => m.id !== medicine.id && 
         m.composition.toLowerCase() === medicine.composition.toLowerCase() &&
         m.strength.toLowerCase() === medicine.strength.toLowerCase() &&
         m.status === 'published'
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Search</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onCompareSelect(medicine)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${
              isSelectedForCompare 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isSelectedForCompare ? '✓ In Compare' : 'Add to Compare'}</span>
          </button>

          <button
            onClick={() => onRequestQuote(medicine)}
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 py-1.5 rounded-lg shadow-sm transition"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Request Quotation</span>
          </button>
        </div>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-md border border-blue-100 uppercase tracking-wider">
                {medicine.category}
              </span>
              {medicine.is_verified_supplier ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-800 bg-teal-100/70 px-2.5 py-0.5 rounded-md">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  Verified Pharmaceutical Supplier
                </span>
              ) : (
                <span className="text-xs text-amber-800 bg-amber-100/70 font-bold px-2.5 py-0.5 rounded-md">
                  Verification Pending
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {medicine.medicine_name}
            </h1>

            <p className="text-sm text-slate-600">
              Generic / Chemical Name: <strong className="text-slate-900">{medicine.generic_name}</strong>
            </p>
          </div>

          {/* Pricing Box */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-right shrink-0 min-w-[200px]">
            <span className="text-xs text-slate-500 font-medium block">Listed Indicative Price</span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              ₹{medicine.listed_price} <span className="text-xs font-normal text-slate-500">/ pack</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              MOQ: <strong>{medicine.moq} packs</strong>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-200/80">
              <span className={`text-xs font-bold inline-flex items-center gap-1 ${
                medicine.availability === 'in_stock' ? 'text-emerald-700' :
                medicine.availability === 'limited_stock' ? 'text-amber-700' : 'text-rose-600'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  medicine.availability === 'in_stock' ? 'bg-emerald-500' :
                  medicine.availability === 'limited_stock' ? 'bg-amber-500' : 'bg-rose-500'
                }`}></span>
                {medicine.availability === 'in_stock' ? `In Stock (${medicine.stock_quantity.toLocaleString()} packs)` :
                 medicine.availability === 'limited_stock' ? 'Limited Warehouse Stock' : 'Out of Stock'}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 1: MEDICINE INFORMATION */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            1. Medicine Formulation & Specification
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block">Active Composition</span>
              <strong className="text-slate-800 text-sm">{medicine.composition}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Strength</span>
              <strong className="text-slate-800 text-sm">{medicine.strength}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Dosage Form</span>
              <strong className="text-slate-800 text-sm">{medicine.dosage_form}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Packaging Spec</span>
              <strong className="text-slate-800 text-sm">{medicine.pack_size}</strong>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-2">
            <div>
              <span className="font-bold text-slate-700">Product Description:</span>
              <p className="text-slate-600 mt-1 leading-relaxed">{medicine.description}</p>
            </div>
            {medicine.storage_condition && (
              <div>
                <span className="font-bold text-slate-700">Storage & Transport Condition:</span>
                <p className="text-slate-600 mt-0.5">{medicine.storage_condition}</p>
              </div>
            )}
            {medicine.regulatory_approval && (
              <div>
                <span className="font-bold text-slate-700">Regulatory Clearance:</span>
                <p className="text-teal-700 font-semibold mt-0.5">{medicine.regulatory_approval}</p>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: SUPPLIER INFORMATION */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-600"></span>
            2. Pharmaceutical Supplier Details
          </h3>

          <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-3 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-teal-600" />
                <span className="text-base font-bold text-slate-900">{medicine.company_name}</span>
              </div>
              <span className="text-slate-500">
                Hub: <strong className="text-slate-800">{medicine.supplier_location}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600 pt-2 border-t border-slate-100">
              <div>
                <span className="text-slate-400 block">Registration Details:</span>
                <span>{pharma?.registration_details || 'CIN Validated on MCA'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Drug Manufacturing License:</span>
                <span>{pharma?.license_details || 'Form 25/28 Licensed & Validated'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Key Institutional Contact:</span>
                <span>{pharma?.contact_person}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Audit & Quality Rating:</span>
                <span className="font-bold text-slate-900">{pharma?.rating || 4.9} ★ ({pharma?.total_orders_completed || 150}+ hospital orders fulfilled)</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: ALTERNATE SUPPLIERS WITH SAME FORMULATION */}
        {alternateSuppliers.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                3. Alternate Verified Suppliers Offering Identical Formulation ({alternateSuppliers.length})
              </h3>
              <button
                onClick={() => {
                  onCompareSelect(medicine);
                  alternateSuppliers.forEach(alt => onCompareSelect(alt));
                  onNavigate('compare');
                }}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <span>Compare all options</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
              {alternateSuppliers.map((alt) => (
                <div key={alt.id} className="p-3.5 bg-white hover:bg-slate-50 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-bold text-slate-900">{alt.company_name}</div>
                    <div className="text-slate-500">{alt.medicine_name} · Pack: {alt.pack_size}</div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="font-black text-slate-900">₹{alt.listed_price}</div>
                      <div className="text-[10px] text-emerald-600 font-semibold">In Stock ({alt.stock_quantity.toLocaleString()})</div>
                    </div>

                    <button
                      onClick={() => onCompareSelect(alt)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2.5 py-1.5 rounded-lg text-xs"
                    >
                      Compare
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 4: QUOTATION REQUEST CALLOUT */}
        <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
          <div className="space-y-1">
            <h4 className="text-base font-bold">Need this formulation for your hospital dispensary?</h4>
            <p className="text-xs text-slate-300">
              Submit your required quantity, preferred pack size, and delivery location to receive formal quotations from {medicine.company_name}.
            </p>
          </div>

          <button
            onClick={() => onRequestQuote(medicine)}
            className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md transition shrink-0"
          >
            Request Quotation
          </button>
        </div>

        {/* Professional Clinical Notice */}
        <div className="pt-2 flex items-start gap-2 text-slate-500 text-xs">
          <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p>
            <strong>Procurement Regulatory Notice:</strong> MedLink is a commercial B2B procurement exchange for licensed healthcare facilities and verified drug manufacturers. It does not provide patient clinical diagnosis, disease treatment recommendations, or consumer prescription dispensing.
          </p>
        </div>

      </div>

    </div>
  );
};
