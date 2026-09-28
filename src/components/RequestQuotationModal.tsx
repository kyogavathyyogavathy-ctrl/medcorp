import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Building2, 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  Package, 
  Sparkles, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Medicine, PharmaCompany, Doctor, MedicineRequest } from '../types';
import { StorageService } from '../services/storage';

interface RequestQuotationModalProps {
  initialMedicine?: Medicine;
  initialMultiMedicines?: Medicine[];
  initialQuantity?: number;
  doctorId: string;
  onClose: () => void;
  onSuccess: (request: MedicineRequest) => void;
}

export const RequestQuotationModal: React.FC<RequestQuotationModalProps> = ({
  initialMedicine,
  initialMultiMedicines,
  initialQuantity,
  doctorId,
  onClose,
  onSuccess,
}) => {
  const doctor = StorageService.getDoctorById(doctorId) || StorageService.getDoctors()[0];
  const pharmaCompanies = StorageService.getPharmaCompanies();

  // Primary reference medicine
  const primaryMed = initialMedicine || (initialMultiMedicines && initialMultiMedicines[0]) || StorageService.getMedicines()[0];

  // Pre-select companies
  const defaultSelectedCompanyIds = initialMultiMedicines
    ? initialMultiMedicines.map(m => m.company_id)
    : [primaryMed.company_id];

  const [medicineName, setMedicineName] = useState(primaryMed.medicine_name);
  const [composition, setComposition] = useState(primaryMed.composition);
  const [strength, setStrength] = useState(primaryMed.strength);
  const [dosageForm, setDosageForm] = useState(primaryMed.dosage_form);
  const [requiredQuantity, setRequiredQuantity] = useState<number>(initialQuantity || 500);
  const [preferredPackSize, setPreferredPackSize] = useState(primaryMed.pack_size);
  const [requiredDate, setRequiredDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14); // 2 weeks out default
    return d.toISOString().split('T')[0];
  });
  const [deliveryLocation, setDeliveryLocation] = useState(
    `${doctor.hospital}, Central Pharmacy Receiving Gate, ${doctor.location}`
  );
  const [notes, setNotes] = useState(
    'Batch Certificate of Analysis (COA) required with shipment. Standard temperature control required.'
  );
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>(defaultSelectedCompanyIds);

  // Success state
  const [submittedRequest, setSubmittedRequest] = useState<MedicineRequest | null>(null);

  const toggleCompanySelection = (companyId: string) => {
    setSelectedCompanyIds(prev =>
      prev.includes(companyId) ? prev.filter(id => id !== companyId) : [...prev, companyId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedCompanyIds.length === 0) {
      alert('Please select at least one pharmaceutical supplier to send your quotation request.');
      return;
    }

    if (requiredQuantity <= 0) {
      alert('Please specify a valid required quantity.');
      return;
    }

    const newReq = StorageService.createRequest({
      doctor_id: doctor.id,
      doctor_name: doctor.name,
      doctor_hospital: doctor.hospital,
      doctor_location: doctor.location,
      medicine_id: primaryMed.id,
      medicine_name: medicineName,
      composition,
      strength,
      dosage_form: dosageForm,
      required_quantity: Number(requiredQuantity),
      preferred_pack_size: preferredPackSize,
      required_date: requiredDate,
      delivery_location: deliveryLocation,
      notes,
      selected_company_ids: selectedCompanyIds,
    });

    setSubmittedRequest(newReq);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base">Request Pharmaceutical Quotation</h3>
              <p className="text-xs text-slate-300">Submit procurement requisition to verified manufacturers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedRequest ? (
          /* SUCCESS STATE */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
                Request Sent Successfully
              </span>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                {submittedRequest.id}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Your requisition for <strong>{submittedRequest.required_quantity} units of {submittedRequest.medicine_name}</strong> has been transmitted to <strong>{submittedRequest.selected_company_ids.length} verified pharmaceutical supplier(s)</strong>.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-slate-500">Requisition Status:</span>
                <span className="font-bold text-teal-700">Sent to Suppliers · Pending Response</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Target Delivery Date:</span>
                <span className="font-semibold text-slate-800">{submittedRequest.required_date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Delivery Destination:</span>
                <span className="font-semibold text-slate-800 truncate max-w-xs">{submittedRequest.delivery_location}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  onSuccess(submittedRequest);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-md transition flex items-center gap-2"
              >
                <span>Track Request Timeline</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* REQUIREMENT FORM */
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            
            {/* Doctor Info Badge */}
            <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-100 flex items-center justify-between text-xs text-blue-900">
              <div>
                <span className="text-blue-500 block text-[10px]">Requisitioning Clinician</span>
                <strong>{doctor.name}</strong> · {doctor.hospital}
              </div>
              <span className="text-[11px] font-semibold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                Reg: {doctor.registration_number}
              </span>
            </div>

            {/* Medicine Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Medicine / Formulation Name</label>
                <input
                  type="text"
                  value={medicineName}
                  onChange={(e) => setMedicineName(e.target.value)}
                  required
                  className="w-full bg-slate-50 text-slate-800 text-xs rounded-lg p-2.5 border border-slate-200 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Active Composition</label>
                <input
                  type="text"
                  value={composition}
                  onChange={(e) => setComposition(e.target.value)}
                  required
                  className="w-full bg-slate-50 text-slate-800 text-xs rounded-lg p-2.5 border border-slate-200 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Strength</label>
                <input
                  type="text"
                  value={strength}
                  onChange={(e) => setStrength(e.target.value)}
                  required
                  className="w-full bg-slate-50 text-slate-800 text-xs rounded-lg p-2.5 border border-slate-200 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Preferred Pack Size</label>
                <input
                  type="text"
                  value={preferredPackSize}
                  onChange={(e) => setPreferredPackSize(e.target.value)}
                  placeholder="e.g. 10 x 10 Tablets (Alu-Alu) or Bulk"
                  className="w-full bg-slate-50 text-slate-800 text-xs rounded-lg p-2.5 border border-slate-200 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Quantity with quick presets */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Required Quantity (Units/Packs)</label>
                <div className="flex items-center gap-1">
                  {[100, 250, 500, 1000, 2500].map((qty) => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setRequiredQuantity(qty)}
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded transition ${
                        requiredQuantity === qty 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {qty}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="number"
                min={1}
                value={requiredQuantity}
                onChange={(e) => setRequiredQuantity(Number(e.target.value))}
                required
                className="w-full bg-slate-50 text-slate-900 font-bold text-sm rounded-lg p-2.5 border border-slate-200 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Date & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>Required By Date</span>
                </label>
                <input
                  type="date"
                  value={requiredDate}
                  onChange={(e) => setRequiredDate(e.target.value)}
                  required
                  className="w-full bg-slate-50 text-slate-800 text-xs rounded-lg p-2.5 border border-slate-200 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>Delivery Destination</span>
                </label>
                <input
                  type="text"
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  required
                  className="w-full bg-slate-50 text-slate-800 text-xs rounded-lg p-2.5 border border-slate-200 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Target Pharmaceutical Companies (Multi-Select Checkboxes) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Target Pharmaceutical Suppliers ({selectedCompanyIds.length} Selected)
                </label>
                <span className="text-[11px] text-teal-700 font-semibold">Broadcasting to multiple verified suppliers</span>
              </div>

              <div className="space-y-1.5 max-h-36 overflow-y-auto p-2 rounded-xl border border-slate-200 bg-slate-50/50">
                {pharmaCompanies.map((pharma) => {
                  const isChecked = selectedCompanyIds.includes(pharma.id);
                  return (
                    <label 
                      key={pharma.id}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition ${
                        isChecked ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleCompanySelection(pharma.id)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <div>
                          <div className="font-bold text-xs text-slate-900">{pharma.company_name}</div>
                          <div className="text-[10px] text-slate-500">{pharma.location} · {pharma.license_details.split('&')[0]}</div>
                        </div>
                      </div>

                      {pharma.verification_status === 'verified' && (
                        <span className="text-[10px] text-teal-700 font-semibold bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200 shrink-0">
                          Verified
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Additional Notes */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Special Procurement Specifications / Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Specific storage conditions, COA requirements, packaging preferences..."
                className="w-full bg-slate-50 text-slate-800 text-xs rounded-lg p-2.5 border border-slate-200 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4" />
                <span>Send Request</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
