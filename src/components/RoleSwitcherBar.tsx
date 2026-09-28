import React from 'react';
import { UserCheck, Building2, ShieldCheck, ArrowRight, RotateCcw, Sparkles } from 'lucide-react';
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
  const doctor = StorageService.getDoctorById(activeDoctorId) || StorageService.getDoctors()[0];
  const pharma = StorageService.getPharmaCompanyById(activePharmaId) || StorageService.getPharmaCompanies()[0];

  const handleReset = () => {
    if (window.confirm('Reset all demo data (doctors, medicines, requests, quotes) to initial state?')) {
      StorageService.resetToDemo();
      window.location.reload();
    }
  };

  return (
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
          onClick={handleReset}
          className="flex items-center gap-1 text-slate-400 hover:text-slate-200 px-2 py-1 rounded hover:bg-slate-800 transition"
          title="Reset demo data to initial state"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Demo</span>
        </button>
      </div>
    </div>
  );
};
