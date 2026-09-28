import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  Building2, 
  Layers, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Download, 
  Trash2, 
  Eye, 
  BarChart3, 
  Check, 
  X,
  Filter,
  Search,
  ExternalLink
} from 'lucide-react';
import { Doctor, PharmaCompany, Medicine, MedicineRequest, Quotation } from '../types';
import { StorageService, subscribeToStorage } from '../services/storage';

export const AdminDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'overview' | 'doctors' | 'pharma' | 'medicines' | 'requests' | 'reports'>('overview');
  
  const [doctors, setDoctors] = useState<Doctor[]>(() => StorageService.getDoctors());
  const [pharmaList, setPharmaList] = useState<PharmaCompany[]>(() => StorageService.getPharmaCompanies());
  const [medicines, setMedicines] = useState<Medicine[]>(() => StorageService.getMedicines());
  const [requests, setRequests] = useState<MedicineRequest[]>(() => StorageService.getRequests());
  const [quotations, setQuotations] = useState<Quotation[]>(() => StorageService.getQuotations());

  // Search filters
  const [doctorSearch, setDoctorSearch] = useState('');
  const [pharmaSearch, setPharmaSearch] = useState('');
  const [medSearch, setMedSearch] = useState('');

  useEffect(() => {
    const handleUpdate = () => {
      setDoctors(StorageService.getDoctors());
      setPharmaList(StorageService.getPharmaCompanies());
      setMedicines(StorageService.getMedicines());
      setRequests(StorageService.getRequests());
      setQuotations(StorageService.getQuotations());
    };
    return subscribeToStorage(handleUpdate);
  }, []);

  // Stats
  const registeredDoctors = doctors.length;
  const verifiedDoctors = doctors.filter(d => d.verification_status === 'verified').length;
  const pendingDoctors = doctors.filter(d => d.verification_status === 'pending').length;

  const registeredPharma = pharmaList.length;
  const verifiedPharma = pharmaList.filter(p => p.verification_status === 'verified').length;
  const pendingPharma = pharmaList.filter(p => p.verification_status === 'pending').length;

  const totalMedicines = medicines.length;
  const activeRequests = requests.filter(r => r.status !== 'completed' && r.status !== 'cancelled').length;
  const completedRequests = requests.filter(r => r.status === 'completed').length;

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // Actions
  const handleVerifyDoctor = (id: string, status: 'verified' | 'rejected') => {
    StorageService.updateDoctorVerification(id, status);
  };

  const handleVerifyPharma = (id: string, status: 'verified' | 'rejected') => {
    StorageService.updatePharmaVerification(id, status);
  };

  const handleDeleteMedicine = (id: string, name: string) => {
    setDeleteTarget({ id, name });
  };

  const handleConfirmDeleteMedicine = () => {
    if (deleteTarget) {
      StorageService.deleteMedicine(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Admin Header */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-purple-400" />
            <h1 className="text-2xl font-extrabold tracking-tight">MedLink Compliance & Admin Console</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Platform-wide governance: Medical Council verification, Pharmaceutical manufacturing license audit, and catalog moderation.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-800 p-1.5 rounded-xl text-xs font-semibold overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'doctors', label: `Doctors (${pendingDoctors} Pending)` },
            { id: 'pharma', label: `Pharma (${pendingPharma} Pending)` },
            { id: 'medicines', label: `Catalog (${totalMedicines})` },
            { id: 'requests', label: 'Requisitions' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                activeSection === tab.id
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* OVERVIEW METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Doctors Card */}
        <div 
          onClick={() => setActiveSection('doctors')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-purple-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Doctors</span>
            <UserCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 tracking-tight">
            {verifiedDoctors} <span className="text-xs font-normal text-slate-400">/ {registeredDoctors} Verified</span>
          </div>
          {pendingDoctors > 0 ? (
            <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded mt-2 inline-block">
              {pendingDoctors} Pending Verification
            </span>
          ) : (
            <span className="text-[11px] text-emerald-600 mt-2 inline-block">All registered audited</span>
          )}
        </div>

        {/* Pharma Companies Card */}
        <div 
          onClick={() => setActiveSection('pharma')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-purple-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pharma Suppliers</span>
            <Building2 className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 tracking-tight">
            {verifiedPharma} <span className="text-xs font-normal text-slate-400">/ {registeredPharma} Authorized</span>
          </div>
          {pendingPharma > 0 ? (
            <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded mt-2 inline-block">
              {pendingPharma} Licenses Under Review
            </span>
          ) : (
            <span className="text-[11px] text-emerald-600 mt-2 inline-block">All suppliers certified</span>
          )}
        </div>

        {/* Medicines Catalog */}
        <div 
          onClick={() => setActiveSection('medicines')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-purple-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Published Formulations</span>
            <Layers className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 tracking-tight">
            {totalMedicines}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Active across catalog</span>
        </div>

        {/* Requisitions Fulfilled */}
        <div 
          onClick={() => setActiveSection('requests')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-purple-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Requisitions Fulfilled</span>
            <FileText className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2 tracking-tight">
            {completedRequests} <span className="text-xs font-normal text-slate-400">/ {requests.length} Total</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">{activeRequests} active in cycle</span>
        </div>

      </div>

      {/* SECTION: DOCTORS VERIFICATION QUEUE */}
      {(activeSection === 'overview' || activeSection === 'doctors') && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
            <div>
              <h3 className="text-base font-bold text-slate-900">Physician & Hospital Verification Queue</h3>
              <p className="text-xs text-slate-500">Review Medical Council licenses and hospital affiliation documents.</p>
            </div>
            <div className="w-full sm:w-64">
              <input
                type="text"
                placeholder="Search by doctor or registration..."
                value={doctorSearch}
                onChange={(e) => setDoctorSearch(e.target.value)}
                className="w-full bg-white text-xs px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/70 text-slate-700 uppercase tracking-wider font-bold text-[11px] border-b border-slate-200">
                  <th className="py-3 px-4">Doctor Name</th>
                  <th className="py-3 px-4">Medical Registration Number</th>
                  <th className="py-3 px-4">Hospital / Affiliation</th>
                  <th className="py-3 px-4">Specialization</th>
                  <th className="py-3 px-4">Submitted Document</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Compliance Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {doctors
                  .filter(d => 
                    d.name.toLowerCase().includes(doctorSearch.toLowerCase()) || 
                    d.registration_number.toLowerCase().includes(doctorSearch.toLowerCase())
                  )
                  .map(doc => (
                    <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {doc.name}
                        <span className="block text-[10px] text-slate-400 font-normal">{doc.email}</span>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                        {doc.registration_number}
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {doc.hospital}
                        <span className="block text-[10px] text-slate-400 font-normal">{doc.location}</span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">{doc.specialization}</td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline cursor-pointer">
                          <FileText className="w-3.5 h-3.5" />
                          <span>{doc.verification_document_name || 'Medical_Reg_Certificate.pdf'}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          doc.verification_status === 'verified' ? 'bg-teal-100 text-teal-800' :
                          doc.verification_status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {doc.verification_status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {doc.verification_status !== 'verified' && (
                            <button
                              onClick={() => handleVerifyDoctor(doc.id, 'verified')}
                              className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] px-2.5 py-1 rounded transition flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              <span>Approve</span>
                            </button>
                          )}
                          {doc.verification_status !== 'rejected' && (
                            <button
                              onClick={() => handleVerifyDoctor(doc.id, 'rejected')}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition"
                              title="Reject registration"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION: PHARMA COMPANIES VERIFICATION QUEUE */}
      {(activeSection === 'overview' || activeSection === 'pharma') && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
            <div>
              <h3 className="text-base font-bold text-slate-900">Pharma Manufacturer Authorization Queue</h3>
              <p className="text-xs text-slate-500">Audit Drug Manufacturing Licenses (Form 25/28), WHO-GMP, and CIN records.</p>
            </div>
            <div className="w-full sm:w-64">
              <input
                type="text"
                placeholder="Search by company or license..."
                value={pharmaSearch}
                onChange={(e) => setPharmaSearch(e.target.value)}
                className="w-full bg-white text-xs px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/70 text-slate-700 uppercase tracking-wider font-bold text-[11px] border-b border-slate-200">
                  <th className="py-3 px-4">Company Name</th>
                  <th className="py-3 px-4">Registration & CIN</th>
                  <th className="py-3 px-4">Drug License & Certifications</th>
                  <th className="py-3 px-4">Contact Person</th>
                  <th className="py-3 px-4">Hub Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Audit Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {pharmaList
                  .filter(p => 
                    p.company_name.toLowerCase().includes(pharmaSearch.toLowerCase()) ||
                    p.license_details.toLowerCase().includes(pharmaSearch.toLowerCase())
                  )
                  .map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {p.company_name}
                        <span className="block text-[10px] text-slate-400 font-normal">{p.website}</span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700">
                        {p.registration_details}
                      </td>

                      <td className="py-3.5 px-4 text-slate-800">
                        {p.license_details}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        <div>{p.contact_person}</div>
                        <div className="text-[10px] text-slate-400">{p.email}</div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">{p.location}</td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          p.verification_status === 'verified' ? 'bg-teal-100 text-teal-800' :
                          p.verification_status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {p.verification_status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {p.verification_status !== 'verified' && (
                            <button
                              onClick={() => handleVerifyPharma(p.id, 'verified')}
                              className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] px-2.5 py-1 rounded transition flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              <span>Authorize</span>
                            </button>
                          )}
                          {p.verification_status !== 'rejected' && (
                            <button
                              onClick={() => handleVerifyPharma(p.id, 'rejected')}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition"
                              title="Reject license"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION: MEDICINE CATALOG MODERATION */}
      {(activeSection === 'medicines') && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
            <div>
              <h3 className="text-base font-bold text-slate-900">Platform Medicine Moderation</h3>
              <p className="text-xs text-slate-500">Monitor all published formulation listings and remove unverified items.</p>
            </div>
            <div className="w-full sm:w-64">
              <input
                type="text"
                placeholder="Search formulations..."
                value={medSearch}
                onChange={(e) => setMedSearch(e.target.value)}
                className="w-full bg-white text-xs px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/70 text-slate-700 uppercase tracking-wider font-bold text-[11px] border-b border-slate-200">
                  <th className="py-3 px-4">Medicine / Brand</th>
                  <th className="py-3 px-4">Pharmaceutical Manufacturer</th>
                  <th className="py-3 px-4">Composition & Strength</th>
                  <th className="py-3 px-4">Listed Price</th>
                  <th className="py-3 px-4">Warehouse Stock</th>
                  <th className="py-3 px-4">Regulatory Spec</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {medicines
                  .filter(m => 
                    m.medicine_name.toLowerCase().includes(medSearch.toLowerCase()) ||
                    m.composition.toLowerCase().includes(medSearch.toLowerCase()) ||
                    m.company_name.toLowerCase().includes(medSearch.toLowerCase())
                  )
                  .map(med => (
                    <tr key={med.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {med.medicine_name}
                        <span className="block text-[10px] text-slate-400 font-normal">{med.pack_size}</span>
                      </td>

                      <td className="py-3 px-4 font-medium text-slate-800">
                        {med.company_name}
                      </td>

                      <td className="py-3 px-4 text-slate-700">
                        {med.composition} ({med.strength})
                      </td>

                      <td className="py-3 px-4 font-black text-slate-900">
                        ₹{med.listed_price}
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {med.stock_quantity.toLocaleString()} packs
                      </td>

                      <td className="py-3 px-4 text-teal-700 font-medium">
                        {med.regulatory_approval || 'Standard CDSCO'}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleDeleteMedicine(med.id, med.medicine_name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition"
                          title="Remove listing from MedLink"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION: REQUISITION AUDIT MONITOR */}
      {(activeSection === 'requests') && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
          <div className="p-5 border-b border-slate-200 bg-slate-50/60">
            <h3 className="text-base font-bold text-slate-900">Platform Requisition Audit Log</h3>
            <p className="text-xs text-slate-500">Monitor active institutional procurement workflows and quotation submissions.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/70 text-slate-700 uppercase tracking-wider font-bold text-[11px] border-b border-slate-200">
                  <th className="py-3 px-4">Request ID</th>
                  <th className="py-3 px-4">Requisitioning Doctor</th>
                  <th className="py-3 px-4">Hospital & Location</th>
                  <th className="py-3 px-4">Medicine & Required Qty</th>
                  <th className="py-3 px-4">Suppliers Targeted</th>
                  <th className="py-3 px-4">Quotes Generated</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {requests.map(req => {
                  const reqQuotes = quotations.filter(q => q.request_id === req.id);
                  return (
                    <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{req.id}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{req.doctor_name}</td>
                      <td className="py-3.5 px-4 text-slate-600">{req.doctor_hospital}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-900">
                        {req.medicine_name} ({req.required_quantity} units)
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{req.selected_company_ids.length} suppliers</td>
                      <td className="py-3.5 px-4 font-bold text-teal-700">{reqQuotes.length} quotes</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800">
                          {req.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Medicine Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Remove Medicine Listing?</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Are you sure you want to remove <strong>{deleteTarget.name}</strong> from the active platform catalog? Doctors will no longer be able to discover or request quotations for this formulation.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteMedicine}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition"
              >
                Delete Medicine
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
