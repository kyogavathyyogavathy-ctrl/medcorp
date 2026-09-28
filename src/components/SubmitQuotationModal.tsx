import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Building2, 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  Package, 
  Truck, 
  DollarSign, 
  ShieldCheck 
} from 'lucide-react';
import { MedicineRequest, PharmaCompany } from '../types';
import { StorageService } from '../services/storage';

interface SubmitQuotationModalProps {
  request: MedicineRequest;
  pharmaId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const SubmitQuotationModal: React.FC<SubmitQuotationModalProps> = ({
  request,
  pharmaId,
  onClose,
  onSuccess,
}) => {
  const pharma = StorageService.getPharmaCompanyById(pharmaId) || StorageService.getPharmaCompanies()[0];

  // Try to find matching medicine in this company's catalog for listed price baseline
  const pharmaMeds = StorageService.getMedicines().filter(m => m.company_id === pharma.id);
  const matchingMed = pharmaMeds.find(
    m => m.composition.toLowerCase().includes(request.composition.toLowerCase())
  ) || pharmaMeds[0];

  const defaultPrice = matchingMed ? matchingMed.listed_price : 100;

  const [quotedPrice, setQuotedPrice] = useState<number>(defaultPrice);
  const [availableQuantity, setAvailableQuantity] = useState<number>(request.required_quantity);
  const [packSize, setPackSize] = useState<string>(request.preferred_pack_size || '10 x 10 Tablets (Alu-Alu)');
  const [estimatedDeliveryDays, setEstimatedDeliveryDays] = useState<number>(2);
  const [moq, setMoq] = useState<number>(50);
  const [validUntil, setValidUntil] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 21); // 3 weeks validity
    return d.toISOString().split('T')[0];
  });
  const [additionalNotes, setAdditionalNotes] = useState<string>(
    'Direct dispatch from certified central warehouse. WHO-GMP Batch COA included with shipment.'
  );

  const totalPrice = quotedPrice * availableQuantity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (quotedPrice <= 0 || availableQuantity <= 0) {
      alert('Please enter valid commercial quotation figures.');
      return;
    }

    StorageService.submitQuotation({
      request_id: request.id,
      company_id: pharma.id,
      company_name: pharma.company_name,
      medicine_id: matchingMed?.id,
      medicine_name: request.medicine_name,
      quoted_price: Number(quotedPrice),
      total_price: Number(totalPrice),
      available_quantity: Number(availableQuantity),
      pack_size: packSize,
      estimated_delivery_days: Number(estimatedDeliveryDays),
      moq: Number(moq),
      valid_until: validUntil,
      additional_notes: additionalNotes,
    });

    alert(`Formal quotation submitted for Request ${request.id}. Dr. ${request.doctor_name} has been notified.`);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-teal-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base">Submit Institutional Quotation</h3>
              <p className="text-xs text-teal-200">Formalize commercial terms for Request #{request.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-teal-300 hover:text-white p-1 rounded-lg hover:bg-teal-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Doctor Requirement Summary Box */}
        <div className="bg-slate-50 p-4 border-b border-slate-200 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900">{request.medicine_name}</span>
            <span className="font-bold text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded">
              Required: {request.required_quantity.toLocaleString()} units
            </span>
          </div>
          <div className="text-slate-600">
            Clinician: <strong>{request.doctor_name}</strong> · {request.doctor_hospital} ({request.doctor_location})
          </div>
          <div className="text-slate-500 flex items-center justify-between pt-1 text-[11px]">
            <span>Required By: {request.required_date}</span>
            <span className="truncate max-w-xs">Destination: {request.delivery_location}</span>
          </div>
          {request.notes && (
            <div className="text-blue-900 bg-blue-50 p-2 rounded border border-blue-100 text-[11px] mt-1">
              <strong>Hospital Note:</strong> {request.notes}
            </div>
          )}
        </div>

        {/* Quotation Submission Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Quoted Unit Price (₹ / Pack)
              </label>
              <input
                type="number"
                min={1}
                value={quotedPrice}
                onChange={(e) => setQuotedPrice(Number(e.target.value))}
                required
                className="w-full bg-slate-50 text-slate-900 font-bold text-sm rounded-lg p-2.5 border border-slate-200 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Available Quantity (Packs)
              </label>
              <input
                type="number"
                min={1}
                value={availableQuantity}
                onChange={(e) => setAvailableQuantity(Number(e.target.value))}
                required
                className="w-full bg-slate-50 text-slate-800 text-xs rounded-lg p-2.5 border border-slate-200 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Total Calculated Amount */}
          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-950">
            <span className="font-semibold">Estimated Gross Quotation Value:</span>
            <span className="text-base font-black text-emerald-900">
              ₹{totalPrice.toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Pack Size Offered</label>
              <input
                type="text"
                value={packSize}
                onChange={(e) => setPackSize(e.target.value)}
                required
                className="w-full bg-slate-50 text-slate-800 text-xs rounded-lg p-2.5 border border-slate-200 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Estimated Delivery (Days)
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={estimatedDeliveryDays}
                onChange={(e) => setEstimatedDeliveryDays(Number(e.target.value))}
                required
                className="w-full bg-slate-50 text-slate-800 text-xs rounded-lg p-2.5 border border-slate-200 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Minimum Order (MOQ)</label>
              <input
                type="number"
                min={1}
                value={moq}
                onChange={(e) => setMoq(Number(e.target.value))}
                required
                className="w-full bg-slate-50 text-slate-800 text-xs rounded-lg p-2.5 border border-slate-200 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Quote Valid Until</label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                required
                className="w-full bg-slate-50 text-slate-800 text-xs rounded-lg p-2.5 border border-slate-200 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Additional Logistics & Quality Terms
            </label>
            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              rows={2}
              className="w-full bg-slate-50 text-slate-800 text-xs rounded-lg p-2.5 border border-slate-200 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition"
            >
              Submit Quotation
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
