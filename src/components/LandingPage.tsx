import React, { useState } from 'react';
import { 
  Search, 
  Building2, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  BarChart3, 
  FileText, 
  Lock, 
  Sparkles,
  Layers,
  ChevronRight,
  TrendingDown,
  Hospital,
  AlertCircle
} from 'lucide-react';
import { StorageService } from '../services/storage';

interface LandingPageProps {
  onNavigate: (tab: string, meta?: any) => void;
  onOpenDoctorAuth: (mode: 'login' | 'register') => void;
  onOpenPharmaAuth: (mode: 'login' | 'register') => void;
  onRequestQuoteDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onOpenDoctorAuth,
  onOpenPharmaAuth,
  onRequestQuoteDemo,
}) => {
  const [mockSearchInput, setMockSearchInput] = useState('Paracetamol 500 mg');
  const [selectedMockPharma, setSelectedMockPharma] = useState<'sunora' | 'apex' | 'medix'>('apex');

  const stats = [
    { label: 'Verified Healthcare Professionals', value: '4,800+', sub: 'Hospital Directors & Doctors' },
    { label: 'Verified Pharma Suppliers', value: '180+', sub: 'WHO-GMP & FDA Certified' },
    { label: 'Listed Pharmaceutical Formulations', value: '12,500+', sub: 'Transparent Listed Quotes' },
    { label: 'Requisitions Fulfilled', value: '₹42 Crore', sub: 'Institutional Procurement' },
  ];

  const steps = [
    {
      num: '01',
      title: 'Doctor searches for a medicine',
      desc: 'Input active chemical composition, brand name, strength, dosage form, or natural procurement prompt.',
    },
    {
      num: '02',
      title: 'Platform finds matching products',
      desc: 'MedLink aggregates matching certified pharmaceutical suppliers and flags duplicate active formulations.',
    },
    {
      num: '03',
      title: 'Compare companies, price & availability',
      desc: 'Examine listed prices, batch sizes, verified regulatory clearances, minimum order quantities, and warehouse stocks.',
    },
    {
      num: '04',
      title: 'Doctor sends requirement/request',
      desc: 'Specify quantity, preferred delivery schedules, COA requirements, and target receiving locations in seconds.',
    },
    {
      num: '05',
      title: 'Pharma company responds with quotation',
      desc: 'Authorized sales teams review requisitions and return customized institutional quotations and transit estimates.',
    },
    {
      num: '06',
      title: 'Doctor selects suitable supplier',
      desc: 'Approve the optimal quotation, initiate compliant procurement chat, and track order fulfillment to dispensary delivery.',
    },
  ];

  const features = [
    {
      icon: Search,
      title: 'Smart Medicine Search',
      desc: 'Natural language and composition-based discovery. Search by chemical name, strength, dosage form, or therapeutic category.',
    },
    {
      icon: Layers,
      title: 'Supplier Comparison',
      desc: 'Side-by-side matrices evaluating price points, batch pack sizes, lead times, and regulatory audits across multiple pharma manufacturers.',
    },
    {
      icon: TrendingDown,
      title: 'Price & Availability',
      desc: 'Transparent indicative listed pricing and real-time warehouse inventory counts without opaque brokerage markups.',
    },
    {
      icon: FileText,
      title: 'Quotation Requests',
      desc: 'Issue structured institutional RFP requisitions directly to verified pharma suppliers with audit-ready digital paperwork.',
    },
    {
      icon: ShieldCheck,
      title: 'Verified Companies',
      desc: 'Rigorous platform vetting verifying Drug Manufacturing Licenses (Form 25/28), WHO-GMP, and Medical Council registrations.',
    },
    {
      icon: Clock,
      title: 'Request Tracking',
      desc: 'Real-time milestones tracking every stage from requisition creation, quotation response, and committee review to gate reception.',
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-blue-50/70 via-white to-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Copy Column */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/70 border border-blue-200 text-blue-800 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Enterprise B2B Doctor-to-Pharma Sourcing Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Connect Doctors With the Right{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-teal-600 to-emerald-600">
                  Pharmaceutical Suppliers
                </span>
              </h1>

              <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Discover medicines, compare pharmaceutical suppliers, check availability and pricing, and connect directly with verified pharma companies — all in one platform.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => onNavigate('search')}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 py-3.5 rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-xl transition-all"
                >
                  <Search className="w-4 h-4" />
                  <span>Find Medicines</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                <button
                  onClick={() => onOpenPharmaAuth('register')}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-semibold px-6 py-3.5 rounded-xl border border-slate-300 shadow-sm transition-all"
                >
                  <Building2 className="w-4 h-4 text-teal-600" />
                  <span>Join as Pharma Company</span>
                </button>
              </div>

              {/* B2B Notice */}
              <div className="flex items-center justify-center lg:justify-start gap-2 text-xs text-slate-500 pt-2">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Restricted to licensed physicians, clinics, hospitals, & authorized pharma distributors</span>
              </div>
            </div>

            {/* Right Interactive Mockup Column */}
            <div className="lg:col-span-6">
              <div className="relative mx-auto max-w-lg lg:max-w-none">
                
                {/* Decorative background glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-teal-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition"></div>

                {/* Dashboard Mockup Card */}
                <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden">
                  
                  {/* Mockup Header Bar */}
                  <div className="bg-slate-900 text-slate-300 px-4 py-3 flex items-center justify-between border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      </div>
                      <span className="text-xs font-mono text-slate-400 ml-2">medlink.procure / medicine-discovery</span>
                    </div>
                    <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded font-mono">
                      LIVE COMPARISON
                    </span>
                  </div>

                  {/* Mockup Search Bar */}
                  <div className="p-4 bg-slate-50/70 border-b border-slate-200">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          onNavigate('search', { query: mockSearchInput });
                        }}
                      >
                        <input
                          type="text"
                          value={mockSearchInput}
                          onChange={(e) => setMockSearchInput(e.target.value)}
                          className="w-full bg-white pl-9 pr-24 py-2 text-xs font-semibold text-slate-800 rounded-lg border border-slate-300 shadow-inner focus:outline-none"
                          placeholder="Search medicine or composition..."
                        />
                        <button 
                          type="submit"
                          className="absolute right-1 top-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold px-3 py-1 rounded-md"
                        >
                          Search
                        </button>
                      </form>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
                      <span>Detected:</span>
                      <span className="font-semibold text-slate-700">Paracetamol · 500 mg · Tablets</span>
                      <span className="text-teal-600 font-medium">· 3 Verified Suppliers</span>
                    </div>
                  </div>

                  {/* Mockup Suppliers Comparison Cards */}
                  <div className="p-4 space-y-3">
                    <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                      <span>Suppliers Offering Paracetamol 500mg</span>
                      <span className="text-[10px] text-slate-400 font-normal">Click to preview selection</span>
                    </div>

                    {/* Supplier 1: Apex Formulations */}
                    <div 
                      onClick={() => setSelectedMockPharma('apex')}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        selectedMockPharma === 'apex' 
                          ? 'border-teal-500 bg-teal-50/30 shadow-sm ring-1 ring-teal-500'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-900">Apex Formulations Pvt Ltd.</span>
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-teal-700 bg-teal-100/70 font-semibold px-1.5 py-0.2 rounded">
                              <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">Apexomol 500mg · 10 x 10 Alu-Alu · Ahmedabad, GJ</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-extrabold text-slate-900">₹98 <span className="text-[10px] text-slate-500 font-normal">/ pack</span></div>
                          <span className="inline-block text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            In Stock (7,200)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Supplier 2: Sunora BioPharma */}
                    <div 
                      onClick={() => setSelectedMockPharma('sunora')}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        selectedMockPharma === 'sunora' 
                          ? 'border-blue-500 bg-blue-50/30 shadow-sm ring-1 ring-blue-500'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-900">Sunora BioPharma Ltd.</span>
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-blue-700 bg-blue-100/70 font-semibold px-1.5 py-0.2 rounded">
                              <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">Paracip 500mg · 10 x 10 Blister · Mumbai, MH</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-extrabold text-slate-900">₹110 <span className="text-[10px] text-slate-500 font-normal">/ pack</span></div>
                          <span className="inline-block text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            In Stock (4,500)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Supplier 3: Medix Life Sciences */}
                    <div 
                      onClick={() => setSelectedMockPharma('medix')}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        selectedMockPharma === 'medix' 
                          ? 'border-blue-500 bg-blue-50/30 shadow-sm ring-1 ring-blue-500'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-900">Medix Life Sciences</span>
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-blue-700 bg-blue-100/70 font-semibold px-1.5 py-0.2 rounded">
                              <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">MedPar 500mg · 20 x 10 Hospital Bulk · New Delhi</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-extrabold text-slate-900">₹190 <span className="text-[10px] text-slate-500 font-normal">/ 200 tabs</span></div>
                          <span className="inline-block text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            In Stock (2,100)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Mockup Action Footer */}
                    <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                      <div className="text-[11px] text-slate-500">
                        Selected: <span className="font-semibold text-slate-800 capitalize">{selectedMockPharma} Formulations</span>
                      </div>
                      <button
                        onClick={onRequestQuoteDemo}
                        className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-3.5 py-2 rounded-lg shadow-sm transition"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Request Quotation</span>
                      </button>
                    </div>

                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* TRUST METRICS SECTION */}
      <section className="bg-slate-900 text-white py-12 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
            {stats.map((stat, i) => (
              <div key={i} className="pt-4 md:pt-0 px-4">
                <div className="text-2xl sm:text-3xl font-extrabold text-teal-400 tracking-tight">{stat.value}</div>
                <div className="text-sm font-semibold text-slate-200 mt-1">{stat.label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{stat.sub}</div>
              </div>
            ))}
          </div>

          <div className="mt-10 pt-8 border-t border-slate-800 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Verified Healthcare Professionals
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Verified Pharma Companies
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Transparent Pricing
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Real-Time Availability
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Secure Communication
            </span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS (6 STEPS) */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-blue-600 tracking-widest uppercase">Structured B2B Procurement Flow</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              How MedLink Works
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              From clinical requisition to warehouse dispatch, MedLink streamlines institutional medicine procurement into 6 transparent steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {steps.map((step, idx) => (
              <div 
                key={idx}
                className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-blue-600/40 group-hover:text-blue-600 transition-colors font-mono">
                    {step.num}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    {idx + 1}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-20 lg:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-teal-600 tracking-widest uppercase">Platform Capabilities</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Enterprise Features Built for Healthcare Procurement
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              Engineered exclusively for licensed physicians, hospital purchasing committees, and pharmaceutical manufacturers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div 
                  key={idx}
                  className="bg-white p-7 rounded-2xl border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow transition-all space-y-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center shadow-inner">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{feat.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* PERSONA VALUE PROPOSITION: FOR DOCTORS & FOR PHARMA */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* For Doctors */}
            <div id="for-doctors" className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl border border-blue-200 space-y-4">
              <div className="inline-flex items-center gap-2 text-blue-700 font-bold text-xs uppercase tracking-wider">
                <Hospital className="w-4 h-4" />
                <span>For Doctors & Hospitals</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900">
                Transparent Sourcing for Your Clinical Dispensary
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Eliminate middlemen markups, verify drug manufacturer certifications in real time, compare equivalent formulations, and receive competitive institutional quotes.
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Search by chemical formulation or brand name</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Audit-ready Batch COA documentation with every quotation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Multi-supplier quotation dispatch with 1-click comparison</span>
                </li>
              </ul>
              <div className="pt-4">
                <button
                  onClick={() => onOpenDoctorAuth('register')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-lg shadow-sm transition"
                >
                  Register as Doctor
                </button>
              </div>
            </div>

            {/* For Pharma Companies */}
            <div id="for-pharma" className="bg-gradient-to-br from-teal-50 to-white p-8 rounded-2xl border border-teal-200 space-y-4">
              <div className="inline-flex items-center gap-2 text-teal-700 font-bold text-xs uppercase tracking-wider">
                <Building2 className="w-4 h-4" />
                <span>For Pharmaceutical Companies</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900">
                Direct Institutional Sales Channel to Verified Clinicians
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Expand direct hospital contracts, publish authorized medicine catalogs, manage inventory levels, and submit competitive quotes to verified medical institutions.
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Receive high-intent institutional RFP requisitions</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Verified Supplier credential badge upon regulatory audit</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Direct compliant messaging with purchasing doctors & pharmacists</span>
                </li>
              </ul>
              <div className="pt-4">
                <button
                  onClick={() => onOpenPharmaAuth('register')}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-lg shadow-sm transition"
                >
                  Register Pharma Company
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">Join MedLink Today</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to simplify pharmaceutical sourcing?
          </h2>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Connect directly with verified pharmaceutical manufacturers, evaluate transparent prices, and optimize hospital supply chains with MedLink.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onOpenDoctorAuth('register')}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 py-3.5 rounded-xl shadow-lg transition"
            >
              Get Started as Doctor
            </button>
            <button
              onClick={() => onOpenPharmaAuth('register')}
              className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white font-bold px-7 py-3.5 rounded-xl shadow-lg transition"
            >
              Register Pharma Company
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-400 text-xs py-14 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
            
            {/* Col 1 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-500 text-slate-950 flex items-center justify-center font-extrabold text-sm">
                  ML
                </div>
                <span className="text-white font-bold text-lg tracking-tight">MedLink</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Enterprise digital procurement exchange connecting verified healthcare organizations with certified pharmaceutical manufacturers.
              </p>
              <div className="pt-2 text-[11px] text-slate-500">
                CDSCO & WHO-GMP Compliant Information Architecture
              </div>
            </div>

            {/* Col 2 */}
            <div className="space-y-2">
              <h4 className="text-slate-200 font-bold text-xs uppercase tracking-wider">Platform</h4>
              <ul className="space-y-1.5">
                <li><button onClick={() => onNavigate('search')} className="hover:text-white transition">Medicine Discovery</button></li>
                <li><button onClick={() => onNavigate('compare')} className="hover:text-white transition">Supplier Comparison</button></li>
                <li><button onClick={() => onOpenDoctorAuth('register')} className="hover:text-white transition">Doctor Verification</button></li>
                <li><button onClick={() => onOpenPharmaAuth('register')} className="hover:text-white transition">Pharma Authorization</button></li>
              </ul>
            </div>

            {/* Col 3 */}
            <div className="space-y-2">
              <h4 className="text-slate-200 font-bold text-xs uppercase tracking-wider">Governance & Legal</h4>
              <ul className="space-y-1.5">
                <li><span className="text-slate-400 hover:text-white transition cursor-pointer">Terms of Service</span></li>
                <li><span className="text-slate-400 hover:text-white transition cursor-pointer">Privacy Policy</span></li>
                <li><span className="text-slate-400 hover:text-white transition cursor-pointer">Audit & Compliance</span></li>
                <li><span className="text-slate-400 hover:text-white transition cursor-pointer">Security Standards</span></li>
              </ul>
            </div>

            {/* Col 4 */}
            <div className="space-y-2">
              <h4 className="text-slate-200 font-bold text-xs uppercase tracking-wider">Support & Helpdesk</h4>
              <p className="text-xs text-slate-400">
                Institutional procurement desk available 24/7 for hospital emergency requirements.
              </p>
              <p className="text-slate-300 font-mono text-xs">procure@medlink-b2b.demo</p>
              <p className="text-slate-300 font-mono text-xs">+91 22 4500 8800</p>
            </div>

          </div>

          {/* Professional Healthcare Notice */}
          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <div className="flex items-start gap-2 max-w-3xl">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>
                <strong>Healthcare Professional Notice:</strong> MedLink is strictly a business-to-business (B2B) digital exchange for licensed medical practitioners, registered clinics, hospitals, and authorized pharmaceutical suppliers. The platform does not sell to consumers, nor does it provide clinical medical diagnosis or personal treatment advice.
              </span>
            </div>
            <div>
              &copy; {new Date().getFullYear()} MedLink Technologies Ltd. All rights reserved.
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};
