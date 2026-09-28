import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Package, 
  FileText, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Plus, 
  TrendingUp, 
  Search, 
  Edit3, 
  Check, 
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  Filter,
  Layers,
  ArrowRight
} from 'lucide-react';
import { PharmaCompany, Medicine, MedicineRequest, Quotation } from '../types';
import { StorageService, subscribeToStorage } from '../services/storage';

interface PharmaDashboardProps {
  pharmaId: string;
  activeView: 'dashboard' | 'medicines' | 'requests';
  onOpenAddMedicine: () => void;
  onOpenSubmitQuotation: (request: MedicineRequest) => void;
  onNavigateToChat: (doctorId: string, doctorName: string, requestCode: string) => void;
  onNavigate: (tab: string, meta?: any) => void;
}

export const PharmaDashboard: React.FC<PharmaDashboardProps> = ({
  pharmaId,
  activeView,
  onOpenAddMedicine,
  onOpenSubmitQuotation,
  onNavigateToChat,
  onNavigate,
}) => {
  const [pharma, setPharma] = useState<PharmaCompany | undefined>(() => StorageService.getPharmaCompanyById(pharmaId));
  const [medicines, setMedicines] = useState<Medicine[]>(() => StorageService.getMedicines());
  const [requests, setRequests] = useState<MedicineRequest[]>(() => StorageService.getRequests());
  const [quotations, setQuotations] = useState<Quotation[]>(() => StorageService.getQuotations());

  // Inline editing state for quick stock & price adjustments
  const [editingMedId, setEditingMedId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editStock, setEditStock] = useState<number>(0);

  useEffect(() => {
    const handleUpdate = () => {
      setPharma(StorageService.getPharmaCompanyById(pharmaId));
      setMedicines(StorageService.getMedicines());
      setRequests(StorageService.getRequests());
      setQuotations(StorageService.getQuotations());
    };
    return subscribeToStorage(handleUpdate);
  }, [pharmaId]);

  const companyMedicines = medicines.filter(m => m.company_id === pharmaId);
  const activeListingsCount = companyMedicines.filter(m => m.status === 'published').length;

  // Requests where this pharma company was selected by the doctor
  const companyRequests = requests.filter(r => r.selected_company_ids.includes(pharmaId));
  const pendingRequestsCount = companyRequests.filter(r => r.status === 'sent_to_suppliers' || r.status === 'created').length;
  
  const companyQuotations = quotations.filter(q => q.company_id === pharmaId);
  const completedRequestsCount = companyRequests.filter(r => r.status === 'completed' || r.status === 'accepted').length;

  const startInlineEdit = (med: Medicine) => {
    setEditingMedId(med.id);
    setEditPrice(med.listed_price);
    setEditStock(med.stock_quantity);
  };

  const saveInlineEdit = (id: string) => {
    StorageService.updateMedicine(id, {
      listed_price: Number(editPrice),
      stock_quantity: Number(editStock),
      availability: editStock > 100 ? 'in_stock' : editStock > 0 ? 'limited_stock' : 'out_of_stock',
    });
    setEditingMedId(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {pharma?.company_name || 'Pharmaceutical Supplier Portal'}
            </h1>
            {pharma?.verification_status === 'verified' ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-teal-50 text-teal-800 px-2 py-0.5 rounded-full border border-teal-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                Verified Supplier
              </span>
            ) : (
              <span className="text-[11px] font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                Verification Pending
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {pharma?.license_details} · Hub: <strong className="text-slate-700">{pharma?.location}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenAddMedicine}
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medicine Listing</span>
          </button>
        </div>
      </div>

      {/* DASHBOARD CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total Medicines */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Catalog</span>
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 tracking-tight">
            {companyMedicines.length}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Formulations registered</span>
        </div>

        {/* Active Listings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Listings</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2 tracking-tight">
            {activeListingsCount}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Live on MedLink</span>
        </div>

        {/* Pending Requests */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending Requests</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 mt-2 tracking-tight">
            {pendingRequestsCount}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Action required</span>
        </div>

        {/* Quotations Submitted */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Quotes Submitted</span>
            <FileText className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 tracking-tight">
            {companyQuotations.length}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Formal proposals</span>
        </div>

        {/* Completed Requests */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Fulfilled Orders</span>
            <TrendingUp className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 tracking-tight">
            {completedRequestsCount}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Dispensary delivered</span>
        </div>

      </div>

      {/* DOCTOR REQUIREMENTS SECTION */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Doctor Requirements & RFPs</h3>
            <p className="text-xs text-slate-500">Institutional medicine quotation requests from verified hospital clinicians.</p>
          </div>
          <span className="text-xs font-bold text-teal-800 bg-teal-100/70 px-2.5 py-1 rounded-lg">
            {companyRequests.length} Requisitions
          </span>
        </div>

        {companyRequests.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs space-y-2">
            <FileText className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="font-semibold text-sm text-slate-700">No doctor requirements pending</p>
            <p>New hospital requisitions targeting your categories will appear here automatically.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/70 text-slate-700 uppercase tracking-wider font-bold text-[11px] border-b border-slate-200">
                  <th className="py-3 px-4">Request ID</th>
                  <th className="py-3 px-4">Doctor / Hospital</th>
                  <th className="py-3 px-4">Medicine & Formulation</th>
                  <th className="py-3 px-4">Required Quantity</th>
                  <th className="py-3 px-4">Required Date</th>
                  <th className="py-3 px-4">Destination</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {companyRequests.map(req => {
                  const alreadyQuoted = quotations.some(q => q.request_id === req.id && q.company_id === pharmaId);

                  return (
                    <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{req.id}</td>
                      
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{req.doctor_name}</div>
                        <div className="text-[11px] text-slate-500">{req.doctor_hospital}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{req.medicine_name}</div>
                        <div className="text-[10px] text-slate-400">{req.composition} ({req.strength})</div>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {req.required_quantity.toLocaleString()} units
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">{req.required_date}</td>

                      <td className="py-3.5 px-4 text-slate-500 truncate max-w-xs">{req.delivery_location.split(',')[0]}</td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          alreadyQuoted ? 'bg-teal-100 text-teal-800' :
                          req.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {alreadyQuoted ? 'Quote Submitted' : req.status.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onOpenSubmitQuotation(req)}
                            className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-2xs transition"
                          >
                            {alreadyQuoted ? 'Update Quote' : 'Submit Quote'}
                          </button>
                          <button
                            onClick={() => onNavigateToChat(req.doctor_id, req.doctor_name, req.id)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Message Doctor"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MEDICINE CATALOG & INLINE INVENTORY MANAGEMENT */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
          <div>
            <h3 className="text-base font-bold text-slate-900">Registered Medicine Catalog & Inventory</h3>
            <p className="text-xs text-slate-500">Manage published listings, adjust stock levels, and update indicative pricing.</p>
          </div>

          <button
            onClick={onOpenAddMedicine}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl shadow-2xs transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Formulation</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 text-slate-700 uppercase tracking-wider font-bold text-[11px] border-b border-slate-200">
                <th className="py-3 px-4">Medicine / Brand</th>
                <th className="py-3 px-4">Composition & Strength</th>
                <th className="py-3 px-4">Dosage & Pack</th>
                <th className="py-3 px-4">Listed Price (₹)</th>
                <th className="py-3 px-4">Warehouse Stock</th>
                <th className="py-3 px-4">Availability</th>
                <th className="py-3 px-4 text-center">Quick Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {companyMedicines.map(med => {
                const isEditing = editingMedId === med.id;

                return (
                  <tr key={med.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {med.medicine_name}
                      <span className="block text-[10px] text-slate-400 font-normal">{med.category}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{med.composition}</div>
                      <div className="text-[11px] text-slate-500">{med.strength}</div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      <div>{med.dosage_form}</div>
                      <div className="text-[11px] text-slate-400">{med.pack_size}</div>
                    </td>

                    {/* Price cell */}
                    <td className="py-3.5 px-4 font-black text-slate-900">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(Number(e.target.value))}
                          className="w-20 bg-white border border-blue-400 rounded px-2 py-1 text-xs"
                        />
                      ) : (
                        `₹${med.listed_price}`
                      )}
                    </td>

                    {/* Stock cell */}
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editStock}
                          onChange={(e) => setEditStock(Number(e.target.value))}
                          className="w-20 bg-white border border-blue-400 rounded px-2 py-1 text-xs"
                        />
                      ) : (
                        `${med.stock_quantity.toLocaleString()} packs`
                      )}
                    </td>

                    {/* Availability */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 font-semibold ${
                        med.availability === 'in_stock' ? 'text-emerald-700' :
                        med.availability === 'limited_stock' ? 'text-amber-700' : 'text-rose-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          med.availability === 'in_stock' ? 'bg-emerald-500' :
                          med.availability === 'limited_stock' ? 'bg-amber-500' : 'bg-rose-500'
                        }`}></span>
                        {med.availability === 'in_stock' ? 'In Stock' :
                         med.availability === 'limited_stock' ? 'Limited' : 'Out of Stock'}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-center">
                      {isEditing ? (
                        <button
                          onClick={() => saveInlineEdit(med.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-2.5 py-1 rounded transition"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => startInlineEdit(med)}
                          className="text-slate-500 hover:text-blue-600 p-1 rounded hover:bg-slate-100 transition"
                          title="Quick update stock & price"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
