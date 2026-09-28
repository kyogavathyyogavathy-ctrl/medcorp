import React, { useState } from 'react';
import { 
  X, 
  UserCheck, 
  Building2, 
  ShieldCheck, 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertCircle,
  Lock,
  ArrowRight
} from 'lucide-react';
import { StorageService } from '../services/storage';
import { Doctor, PharmaCompany } from '../types';

interface DoctorAuthModalProps {
  initialMode: 'login' | 'register';
  onClose: () => void;
  onSuccess: (doctorId: string) => void;
}

export const DoctorAuthModal: React.FC<DoctorAuthModalProps> = ({
  initialMode,
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const doctors = StorageService.getDoctors();

  // Registration Fields
  const [fullName, setFullName] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [specialization, setSpecialization] = useState('Critical Care & Internal Medicine');
  const [hospital, setHospital] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('Mumbai, Maharashtra');
  const [password, setPassword] = useState('DemoPassword123');
  const [confirmPassword, setConfirmPassword] = useState('DemoPassword123');
  const [uploadedDocName, setUploadedDocName] = useState<string>('Medical_Registration_Council_Cert.pdf');

  // Login Email
  const [loginEmail, setLoginEmail] = useState(doctors[0]?.email || 'rajesh.sharma@apollohospitals.demo');

  // Registration success status
  const [justRegistered, setJustRegistered] = useState<Doctor | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setAuthError('Passwords do not match. Please re-enter.');
      return;
    }
    setAuthError(null);

    const newDoc = StorageService.registerDoctor({
      user_id: `user-${Date.now()}`,
      name: fullName.startsWith('Dr.') ? fullName : `Dr. ${fullName}`,
      email,
      phone,
      registration_number: regNumber,
      specialization,
      hospital,
      location,
      verification_document_name: uploadedDocName,
    });

    setJustRegistered(newDoc);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const match = doctors.find(d => d.email.toLowerCase() === loginEmail.toLowerCase());
    if (match) {
      onSuccess(match.id);
    } else {
      // Fallback to first doctor
      onSuccess(doctors[0].id);
    }
  };

  const handleDemoDocSelect = (doc: Doctor) => {
    setLoginEmail(doc.email);
    onSuccess(doc.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base">Doctor & Hospital Portal</h3>
              <p className="text-xs text-slate-300">Verified Healthcare Practitioner Sourcing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {justRegistered ? (
          /* REGISTRATION SUCCESS: PENDING VERIFICATION */
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full uppercase tracking-wider">
                Verification Pending
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-2">
                Registration Submitted, {justRegistered.name}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                Your medical registration number <strong>{justRegistered.registration_number}</strong> and hospital credentials have been queued for administrative audit.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left text-xs space-y-1 text-slate-700">
              <div>Hospital: <strong>{justRegistered.hospital}</strong></div>
              <div>License Document: <strong>{justRegistered.verification_document_name}</strong></div>
              <div>Platform Audit Time: <strong>Within 24 business hours</strong></div>
            </div>

            <button
              onClick={() => onSuccess(justRegistered.id)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition"
            >
              Continue to Doctor Dashboard
            </button>
          </div>
        ) : (
          <div>
            {/* Tabs: Login vs Register */}
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => setMode('login')}
                className={`flex-1 py-3 text-xs font-bold transition border-b-2 ${
                  mode === 'login'
                    ? 'border-blue-600 text-blue-600 bg-blue-50/20'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setMode('register')}
                className={`flex-1 py-3 text-xs font-bold transition border-b-2 ${
                  mode === 'register'
                    ? 'border-blue-600 text-blue-600 bg-blue-50/20'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                New Doctor Registration
              </button>
            </div>

            {mode === 'login' ? (
              /* LOGIN FORM */
              <div className="p-6 space-y-5">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Hospital Email</label>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      placeholder="doctor@hospital.com"
                      className="w-full bg-slate-50 text-slate-800 text-xs rounded-lg p-2.5 border border-slate-200 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
                    <input
                      type="password"
                      value="••••••••••••"
                      readOnly
                      className="w-full bg-slate-50 text-slate-800 text-xs rounded-lg p-2.5 border border-slate-200 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-md transition"
                  >
                    Sign In to Doctor Dashboard
                  </button>
                </form>

                {/* 1-Click Demo Logins */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Quick 1-Click Prototype Accounts:
                  </span>
                  <div className="space-y-1.5">
                    {doctors.slice(0, 3).map(doc => (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => handleDemoDocSelect(doc)}
                        className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-blue-50/60 border border-slate-200 text-xs flex items-center justify-between transition group"
                      >
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-blue-700">{doc.name}</div>
                          <div className="text-[10px] text-slate-500">{doc.hospital} ({doc.specialization.split(' ')[0]})</div>
                        </div>
                        <span className="text-[10px] font-semibold text-blue-600 bg-white px-2 py-0.5 rounded border border-blue-200">
                          Sign In →
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* REGISTRATION FORM */
              <form onSubmit={handleRegister} className="p-6 space-y-3.5 max-h-[70vh] overflow-y-auto">
                {authError && (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center justify-between">
                    <span>{authError}</span>
                    <button type="button" onClick={() => setAuthError(null)} className="text-rose-500 hover:text-rose-700">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-[11px] text-amber-800 flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    New clinician registrations are placed in <strong>Verification Pending</strong> until verified by our compliance desk.
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Name with Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Rajesh Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 text-slate-800 text-xs rounded-lg p-2.5 border border-slate-200 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Medical Reg Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MCI-2015-88219"
                      value={regNumber}
                      onChange={(e) => setRegNumber(e.target.value)}
                      className="w-full bg-slate-50 text-slate-800 text-xs rounded-lg p-2.5 border border-slate-200 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Specialization</label>
                    <input
                      type="text"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      className="w-full bg-slate-50 text-slate-800 text-xs rounded-lg p-2.5 border border-slate-200 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Hospital / Clinic *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apollo Multi-Speciality"
                      value={hospital}
                      onChange={(e) => setHospital(e.target.value)}
                      className="w-full bg-slate-50 text-slate-800 text-xs rounded-lg p-2.5 border border-slate-200 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">City & State</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-slate-50 text-slate-800 text-xs rounded-lg p-2.5 border border-slate-200 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="name@hospital.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 text-slate-800 text-xs rounded-lg p-2.5 border border-slate-200 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Phone</label>
                    <input
                      type="text"
                      placeholder="+91 98200 00000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-50 text-slate-800 text-xs rounded-lg p-2.5 border border-slate-200 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Document Upload Simulation */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Medical Council Certificate / Authorization (PDF)
                  </label>
                  <div className="p-3 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold text-slate-800">{uploadedDocName}</span>
                    </div>
                    <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded">
                      Attached
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-md transition"
                  >
                    Submit Registration for Audit
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

interface PharmaAuthModalProps {
  initialMode: 'login' | 'register';
  onClose: () => void;
  onSuccess: (pharmaId: string) => void;
}

export const PharmaAuthModal: React.FC<PharmaAuthModalProps> = ({
  initialMode,
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const pharmaList = StorageService.getPharmaCompanies();

  // Registration Fields
  const [companyName, setCompanyName] = useState('');
  const [regDetails, setRegDetails] = useState('');
  const [licenseDetails, setLicenseDetails] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('https://');
  const [categories, setCategories] = useState('Analgesics, Antibiotics, Cardiovascular');
  const [justRegistered, setJustRegistered] = useState<PharmaCompany | null>(null);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    const newPharma = StorageService.registerPharmaCompany({
      user_id: `user-${Date.now()}`,
      company_name: companyName,
      registration_details: regDetails || 'CIN Under Process',
      license_details: licenseDetails,
      contact_person: contactPerson,
      email,
      phone,
      address,
      location: address.split(',')[1]?.trim() || 'Mumbai, Maharashtra',
      website,
      product_categories: categories.split(',').map(s => s.trim()),
      documents: ['Manufacturing_License_App.pdf', 'WHO_GMP_Compliance.pdf'],
    });

    setJustRegistered(newPharma);
  };

  const handleDemoSelect = (p: PharmaCompany) => {
    onSuccess(p.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-teal-950 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base">Pharmaceutical Supplier Portal</h3>
              <p className="text-xs text-teal-200">Institutional Distribution & Manufacturing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-teal-300 hover:text-white p-1 rounded-lg hover:bg-teal-900 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {justRegistered ? (
          /* REGISTRATION SUCCESS */
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full uppercase tracking-wider">
                Verification Required
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-2">
                {justRegistered.company_name} Registered
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                Admin must audit your drug manufacturing license (Form 25/28) before displaying your company with a <strong>Verified Supplier</strong> badge.
              </p>
            </div>

            <button
              onClick={() => onSuccess(justRegistered.id)}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition"
            >
              Continue to Supplier Console
            </button>
          </div>
        ) : (
          <div>
            {/* Tabs */}
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => setMode('login')}
                className={`flex-1 py-3 text-xs font-bold transition border-b-2 ${
                  mode === 'login'
                    ? 'border-teal-600 text-teal-700 bg-teal-50/20'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Supplier Sign In
              </button>
              <button
                onClick={() => setMode('register')}
                className={`flex-1 py-3 text-xs font-bold transition border-b-2 ${
                  mode === 'register'
                    ? 'border-teal-600 text-teal-700 bg-teal-50/20'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Register Pharma Company
              </button>
            </div>

            {mode === 'login' ? (
              <div className="p-6 space-y-4">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Select Demo Pharmaceutical Partner:
                </span>
                <div className="space-y-2">
                  {pharmaList.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleDemoSelect(p)}
                      className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-teal-50/60 border border-slate-200 text-xs flex items-center justify-between transition group"
                    >
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-teal-700">{p.company_name}</div>
                        <div className="text-[10px] text-slate-500">{p.location} · {p.license_details.split('&')[0]}</div>
                      </div>
                      <span className="text-[10px] font-bold text-teal-700 bg-white px-2 py-1 rounded border border-teal-200">
                        Launch Portal →
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="p-6 space-y-3.5 max-h-[70vh] overflow-y-auto">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Company Legal Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Formulations Pvt Ltd"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-slate-50 text-slate-800 text-xs rounded-lg p-2.5 border border-slate-200 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Registration Details / CIN</label>
                    <input
                      type="text"
                      placeholder="CIN: U24239MH..."
                      value={regDetails}
                      onChange={(e) => setRegDetails(e.target.value)}
                      className="w-full bg-slate-50 text-slate-800 text-xs rounded-lg p-2.5 border border-slate-200 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Manufacturing License *</label>
                    <input
                      type="text"
                      required
                      placeholder="Form 25/28 Lic #..."
                      value={licenseDetails}
                      onChange={(e) => setLicenseDetails(e.target.value)}
                      className="w-full bg-slate-50 text-slate-800 text-xs rounded-lg p-2.5 border border-slate-200 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Contact Person *</label>
                    <input
                      type="text"
                      required
                      placeholder="Director Institutional Sales"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      className="w-full bg-slate-50 text-slate-800 text-xs rounded-lg p-2.5 border border-slate-200 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Corporate Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="orders@pharma.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 text-slate-800 text-xs rounded-lg p-2.5 border border-slate-200 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Facility Address & Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="Plot 42, MIDC, Mumbai, Maharashtra"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-slate-50 text-slate-800 text-xs rounded-lg p-2.5 border border-slate-200 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-md transition"
                  >
                    Submit Company Registration
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
