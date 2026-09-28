import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Package, 
  ShieldCheck, 
  DollarSign, 
  CheckCircle2, 
  Layers,
  FileCheck
} from 'lucide-react';
import { StorageService } from '../services/storage';
import { PharmaCompany, Medicine, AvailabilityStatus } from '../types';

interface AddMedicineModalProps {
  pharmaId: string;
  onClose: () => void;
  onSuccess: (medicine: Medicine) => void;
}

export const AddMedicineModal: React.FC<AddMedicineModalProps> = ({
  pharmaId,
  onClose,
  onSuccess,
}) => {
  const pharma = StorageService.getPharmaCompanyById(pharmaId) || StorageService.getPharmaCompanies()[0];

  const [medicineName, setMedicineName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [composition, setComposition] = useState('');
  const [strength, setStrength] = useState('');
  const [dosageForm, setDosageForm] = useState<Medicine['dosage_form']>('Tablet');
  const [packSize, setPackSize] = useState('10 x 10 Tablets (Alu-Alu)');
  const [category, setCategory] = useState('Analgesics & Antipyretics');
  const [listedPrice, setListedPrice] = useState<number>(120);
  const [moq, setMoq] = useState<number>(50);
  const [stockQuantity, setStockQuantity] = useState<number>(2500);
  const [availability, setAvailability] = useState<AvailabilityStatus>('in_stock');
  const [description, setDescription] = useState('');
  const [storageCondition, setStorageCondition] = useState('Store below 25°C in a dry place.');
  const [regulatoryApproval, setRegulatoryApproval] = useState('WHO-GMP & CDSCO Approved');

  const categories = [
    'Analgesics & Antipyretics',
    'Antibiotics & Anti-Infectives',
    'Cardiovascular Care',
    'Endocrinology & Diabetes',
    'Gastroenterology',
    'Respiratory Care',
    'Oncology & Immunotherapy',
    'Pediatrics',
    'Critical Care & Anesthesia',
    'Vitamins & Supplements',
  ];

  const handleSave = (status: 'published' | 'draft') => {
    if (!medicineName || !composition || !strength) {
      alert('Please fill in required fields: Medicine Name, Active Composition, and Strength.');
      return;
    }

    const newMed = StorageService.addMedicine({
      company_id: pharma.id,
      company_name: pharma.company_name,
      medicine_name: medicineName,
      generic_name: genericName || `${composition} IP`,
      composition,
      strength,
      dosage_form: dosageForm,
      pack_size: packSize,
      category,
      listed_price: Number(listedPrice),
      moq: Number(moq),
      stock_quantity: Number(stockQuantity),
      availability,
      status,
      description: description || `Pharmaceutical grade formulation of ${composition} (${strength}) manufactured under WHO-GMP standards.`,
      storage_condition: storageCondition,
      regulatory_approval: regulatoryApproval,
      supplier_location: pharma.location,
      is_verified_supplier: pharma.verification_status === 'verified',
    });

    alert(`Medicine "${newMed.medicine_name}" saved as ${status}.`);
    onSuccess(newMed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base">Add Medicine Listing</h3>
              <p className="text-xs text-slate-300">{pharma.company_name} · Catalog Management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSave('published'); }} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Medicine / Brand Name *</label>
              <input
                type="text"
                placeholder="e.g. Paracip 500mg Tablets"
                value={medicineName}
                onChange={(e) => setMedicineName(e.target.value)}
                required
                className="w-full bg-slate-50 text-slate-800 text-xs rounded-lg p-2.5 border border-slate-200 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Active Composition *</label>
              <input
                type="text"
                placeholder="e.g. Paracetamol"
                value={composition}
                onChange={(e) => setComposition(e.target.value)}
                required
                className="w-full bg-slate-50 text-slate-800 text-xs rounded-lg p-2.5 border border-slate-200 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Strength *</label>
              <input
                type="text"
                placeholder="e.g. 500 mg"
                value={strength}
                onChange={(e) => setStrength(e.target.value)}
                required
                className="w-full bg-slate-50 text-slate-800 text-xs rounded-lg p-2.5 border border-slate-200 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Dosage Form</label>
              <select
                value={dosageForm}
                onChange={(e) => setDosageForm(e.target.value as any)}
                className="w-full bg-slate-50 text-slate-800 text-xs rounded-lg p-2.5 border border-slate-200 focus:bg-white focus:outline-none"
              >
                {['Tablet', 'Capsule', 'Syrup', 'Injection', 'Suspension', 'Inhaler', 'Ointment'].map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Packaging Spec</label>
              <input
                type="text"
                placeholder="e.g. 10 x 10 Tablets (Alu-Alu)"
                value={packSize}
                onChange={(e) => setPackSize(e.target.value)}
                required
                className="w-full bg-slate-50 text-slate-800 text-xs rounded-lg p-2.5 border border-slate-200 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Therapeutic Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 text-xs rounded-lg p-2.5 border border-slate-200 focus:bg-white focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Listed Price (₹ / Pack)</label>
              <input
                type="number"
                min={1}
                value={listedPrice}
                onChange={(e) => setListedPrice(Number(e.target.value))}
                required
                className="w-full bg-slate-50 text-slate-900 font-bold text-sm rounded-lg p-2.5 border border-slate-200 focus:bg-white focus:outline-none"
              />
            </div>

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
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Warehouse Stock</label>
              <input
                type="number"
                min={0}
                value={stockQuantity}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setStockQuantity(val);
                  setAvailability(val > 100 ? 'in_stock' : val > 0 ? 'limited_stock' : 'out_of_stock');
                }}
                required
                className="w-full bg-slate-50 text-slate-800 text-xs rounded-lg p-2.5 border border-slate-200 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Storage & Stability Condition</label>
              <input
                type="text"
                value={storageCondition}
                onChange={(e) => setStorageCondition(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 text-xs rounded-lg p-2.5 border border-slate-200 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Regulatory Clearances</label>
              <input
                type="text"
                value={regulatoryApproval}
                onChange={(e) => setRegulatoryApproval(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 text-xs rounded-lg p-2.5 border border-slate-200 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Formulation Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Clinical indications, pharmacokinetics, excipient stability..."
              className="w-full bg-slate-50 text-slate-800 text-xs rounded-lg p-2.5 border border-slate-200 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSave('draft')}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-4 py-2.5 rounded-xl transition"
            >
              Save Draft
            </button>
            <button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition"
            >
              Publish Medicine
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
