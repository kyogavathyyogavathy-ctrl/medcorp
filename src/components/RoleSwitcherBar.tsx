import React, { useState } from 'react';
import { UserCheck, Building2, ShieldCheck, ArrowRight, RotateCcw, Sparkles, AlertTriangle, X } from 'lucide-react';
import { StorageService } from '../services/storage';

interface RoleSwitcherBarProps {
  currentRole: 'doctor' | 'pharma' | 'admin' | 'guest';
  activeDoctorId: string;
  activePharmaId: string;
  onSelectRole: (role: 'doctor' | 'pharma' | 'admin' | 'guest') => void;
  onDemoFlowClick: () => void;
}

export const RoleSwitcherBar: React.FC<RoleSwitcherBarProps> = ({
  currentRole,
  activeDoctorId,
  activePharmaId,
  onSelectRole,
  onDemoFlowClick,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const doctor = StorageService.getDoctorById(activeDoctorId) || StorageService.getDoctors()[0];
  const pharma = StorageService.getPharmaCompanyById(activePharmaId) || StorageService.getPharmaCompanies()[0];

  const handleExecuteReset = () => {
    StorageService.resetToDemo();
    setShowResetConfirm(false);
  };

  return (
    <>
      <div className="bg-slate-900 text-slate-200 text-xs py-2 px-4 border-b border-slate-800 shadow-inner flex flex-wrap items-center justify-between gap-3 sticky top-0 z-50">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            B2B Prototype Persona:
          </span>

          {/* Doctor Persona Switch */}
          <button
            onClick={() => onSelectRole('doctor')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
              currentRole === 'doctor'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title="Switch to verified Doctor persona (Apollo Hospital)"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Doctor ({doctor?.name.split(' ')[1] || 'Doctor'})</span>
          </button>

          {/* Pharma Persona Switch */}
          <button
            onClick={() => onSelectRole('pharma')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
              currentRole === 'pharma'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title="Switch to Pharmaceutical Supplier persona"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Pharma ({pharma?.company_name.split(' ')[0] || 'Supplier'})</span>
          </button>

          {/* Admin Persona Switch */}
          <button
            onClick={() => onSelectRole('admin')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
              currentRole === 'admin'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title="Switch to Platform Compliance & Admin persona"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Console</span>
          </button>

          {/* Landing Page */}
          <button
            onClick={() => onSelectRole('guest')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              currentRole === 'guest'
                ? 'bg-slate-700 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Landing Page
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Hackathon Demo Flow Quick Trigger */}
          <button
            onClick={onDemoFlowClick}
            className="flex items-center gap-1 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white px-2.5 py-1 rounded-md font-medium shadow-sm transition-all text-[11px]"
            title="Jump directly to core flow: Search Paracetamol 500mg → Compare Suppliers → Request Quotation"
          >
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Core Demo Flow</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1 text-slate-400 hover:text-slate-200 px-2 py-1 rounded hover:bg-slate-800 transition"
            title="Reset demo data to initial state"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {/* In-App Confirmation Modal (avoiding blocked window.confirm) */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Reset Demo Environment?</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                This will restore all default clinical records, doctors, pharmaceutical suppliers, requests, and quotations to their baseline demo state.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteReset}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
