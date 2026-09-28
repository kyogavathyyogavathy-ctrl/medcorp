import React, { useState, useEffect } from 'react';
import { StorageService } from './services/storage';
import { RoleSwitcherBar } from './components/RoleSwitcherBar';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { DoctorDashboard } from './components/DoctorDashboard';
import { MedicineSearchPage } from './components/MedicineSearchPage';
import { CompareSuppliersPage } from './components/CompareSuppliersPage';
import { MedicineDetailPage } from './components/MedicineDetailPage';
import { RequestQuotationModal } from './components/RequestQuotationModal';
import { DoctorRequestTracking } from './components/DoctorRequestTracking';
import { PharmaDashboard } from './components/PharmaDashboard';
import { SubmitQuotationModal } from './components/SubmitQuotationModal';
import { AddMedicineModal } from './components/AddMedicineModal';
import { MessagingView } from './components/MessagingView';
import { AdminDashboard } from './components/AdminDashboard';
import { DoctorAuthModal, PharmaAuthModal } from './components/AuthModals';
import { Medicine, MedicineRequest, UserRole } from './types';

export default function App() {
  // Initialize storage repository with default demo records
  useEffect(() => {
    StorageService.init();
  }, []);

  // Persona Role: 'doctor' | 'pharma' | 'admin' | 'guest'
  const [currentRole, setCurrentRole] = useState<'doctor' | 'pharma' | 'admin' | 'guest'>('guest');
  const [activeTab, setActiveTab] = useState<string>('landing');

  // Active user IDs
  const [activeDoctorId, setActiveDoctorId] = useState<string>('doc-001');
  const [activePharmaId, setActivePharmaId] = useState<string>('pharma-001');

  // Search state passed from navigation
  const [searchInitialQuery, setSearchInitialQuery] = useState<string>('');

  // Selected medicines for side-by-side comparison
  const [selectedForCompare, setSelectedForCompare] = useState<Medicine[]>([]);

  // Medicine Detail Page view
  const [detailMedicine, setDetailMedicine] = useState<Medicine | null>(null);

  // Modals state
  const [requestQuoteModalOpen, setRequestQuoteModalOpen] = useState(false);
  const [quoteTargetMed, setQuoteTargetMed] = useState<Medicine | undefined>(undefined);
  const [quoteTargetMultiMeds, setQuoteTargetMultiMeds] = useState<Medicine[] | undefined>(undefined);
  const [quotePrefillQty, setQuotePrefillQty] = useState<number | undefined>(undefined);

  const [doctorAuthModal, setDoctorAuthModal] = useState<{ open: boolean; mode: 'login' | 'register' }>({
    open: false,
    mode: 'login',
  });
  const [pharmaAuthModal, setPharmaAuthModal] = useState<{ open: boolean; mode: 'login' | 'register' }>({
    open: false,
    mode: 'login',
  });

  const [submitQuoteModalOpen, setSubmitQuoteModalOpen] = useState(false);
  const [targetReqForSubmitQuote, setTargetReqForSubmitQuote] = useState<MedicineRequest | null>(null);

  const [addMedicineModalOpen, setAddMedicineModalOpen] = useState(false);

  // Chat target state
  const [chatTarget, setChatTarget] = useState<{
    partnerId: string;
    partnerName: string;
    requestCode?: string;
  } | null>(null);

  // Track selected request in tracking tab
  const [trackingSelectedReqId, setTrackingSelectedReqId] = useState<string | undefined>(undefined);

  // Role selection helper
  const handleSelectRole = (role: 'doctor' | 'pharma' | 'admin' | 'guest') => {
    setCurrentRole(role);
    if (role === 'guest') {
      setActiveTab('landing');
    } else if (role === 'doctor') {
      setActiveTab('dashboard');
    } else if (role === 'pharma') {
      setActiveTab('pharma-dashboard');
    } else if (role === 'admin') {
      setActiveTab('admin-overview');
    }
  };

  // Generic navigation handler
  const handleNavigate = (tab: string, meta?: any) => {
    setActiveTab(tab);
    if (meta?.query) {
      setSearchInitialQuery(meta.query);
    }
    if (meta?.selectedRequestId) {
      setTrackingSelectedReqId(meta.selectedRequestId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Compare toggles
  const handleCompareSelect = (medicine: Medicine) => {
    setSelectedForCompare((prev) => {
      const exists = prev.some((m) => m.id === medicine.id);
      if (exists) {
        return prev.filter((m) => m.id !== medicine.id);
      } else {
        return [...prev, medicine];
      }
    });
  };

  const handleRemoveFromCompare = (id: string) => {
    setSelectedForCompare((prev) => prev.filter((m) => m.id !== id));
  };

  const handleClearCompare = () => {
    setSelectedForCompare([]);
  };

  // Open single medicine quotation request modal
  const handleRequestQuoteSingle = (medicine: Medicine, prefillQty?: number) => {
    // If not logged in as doctor, switch or open auth
    if (currentRole !== 'doctor') {
      setCurrentRole('doctor');
    }
    setQuoteTargetMed(medicine);
    setQuoteTargetMultiMeds(undefined);
    setQuotePrefillQty(prefillQty);
    setRequestQuoteModalOpen(true);
  };

  // Open multi-supplier quotation request modal from comparison
  const handleRequestQuotationsMulti = (medicines: Medicine[]) => {
    if (currentRole !== 'doctor') {
      setCurrentRole('doctor');
    }
    setQuoteTargetMed(undefined);
    setQuoteTargetMultiMeds(medicines);
    setQuotePrefillQty(500);
    setRequestQuoteModalOpen(true);
  };

  // Detailed view
  const handleOpenMedicineDetail = (medicine: Medicine) => {
    setDetailMedicine(medicine);
    setActiveTab('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Direct chat transition
  const handleNavigateToChat = (partnerId: string, partnerName: string, requestCode?: string) => {
    setChatTarget({ partnerId, partnerName, requestCode });
    setActiveTab('messages');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Hackathon Core Demo Flow Trigger:
  // LANDING PAGE → Doctor Login → Doctor Dashboard → Search “Paracetamol 500 mg” → Compare → Request Quotation
  const handleLaunchCoreDemoFlow = () => {
    setCurrentRole('doctor');
    setSearchInitialQuery('Paracetamol 500 mg');
    // Pre-select paracetamol listings for instant compare showcase
    const meds = StorageService.getMedicines().filter(
      (m) => m.composition === 'Paracetamol' && m.strength === '500 mg'
    );
    setSelectedForCompare(meds);
    setActiveTab('search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Resolved user credentials for chat
  const doctor = StorageService.getDoctorById(activeDoctorId) || StorageService.getDoctors()[0];
  const pharma = StorageService.getPharmaCompanyById(activePharmaId) || StorageService.getPharmaCompanies()[0];

  const currentUserId = currentRole === 'doctor' ? doctor.id : currentRole === 'pharma' ? pharma.id : 'admin';
  const currentUserName = currentRole === 'doctor' ? doctor.name : currentRole === 'pharma' ? pharma.company_name : 'Admin Compliance';
  const resolvedRole: UserRole = currentRole === 'pharma' ? 'pharma' : currentRole === 'admin' ? 'admin' : 'doctor';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      
      {/* 1. Persona Switcher Top Bar (1-click role jumping for test & demonstration) */}
      <RoleSwitcherBar
        currentRole={currentRole}
        activeDoctorId={activeDoctorId}
        activePharmaId={activePharmaId}
        onSelectRole={handleSelectRole}
        onDemoFlowClick={handleLaunchCoreDemoFlow}
      />

      {/* 2. Global Navbar */}
      <Navbar
        currentRole={currentRole}
        activeTab={activeTab}
        onNavigate={handleNavigate}
        onOpenDoctorAuth={(mode) => setDoctorAuthModal({ open: true, mode })}
        onOpenPharmaAuth={(mode) => setPharmaAuthModal({ open: true, mode })}
        activeDoctorId={activeDoctorId}
        activePharmaId={activePharmaId}
        onLogout={() => handleSelectRole('guest')}
      />

      {/* 3. Main Dynamic Content Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        
        {/* LANDING PAGE */}
        {activeTab === 'landing' && (
          <LandingPage
            onNavigate={handleNavigate}
            onOpenDoctorAuth={(mode) => setDoctorAuthModal({ open: true, mode })}
            onOpenPharmaAuth={(mode) => setPharmaAuthModal({ open: true, mode })}
            onRequestQuoteDemo={() => {
              const para = StorageService.getMedicines()[0];
              handleRequestQuoteSingle(para);
            }}
          />
        )}

        {/* DOCTOR DASHBOARD */}
        {activeTab === 'dashboard' && (
          <DoctorDashboard
            doctorId={activeDoctorId}
            onNavigate={handleNavigate}
            onRequestQuote={handleRequestQuoteSingle}
            onCompareSelect={handleCompareSelect}
            selectedForCompare={selectedForCompare}
            onOpenMedicineDetail={handleOpenMedicineDetail}
          />
        )}

        {/* MEDICINE SEARCH & DISCOVERY */}
        {activeTab === 'search' && (
          <MedicineSearchPage
            initialQuery={searchInitialQuery}
            onNavigate={handleNavigate}
            onRequestQuote={handleRequestQuoteSingle}
            onCompareSelect={handleCompareSelect}
            selectedForCompare={selectedForCompare}
            onOpenMedicineDetail={handleOpenMedicineDetail}
          />
        )}

        {/* COMPARE SUPPLIERS MATRIX */}
        {activeTab === 'compare' && (
          <CompareSuppliersPage
            selectedMedicines={selectedForCompare}
            onRemoveFromCompare={handleRemoveFromCompare}
            onClearCompare={handleClearCompare}
            onRequestQuotationsMulti={handleRequestQuotationsMulti}
            onNavigate={handleNavigate}
          />
        )}

        {/* MEDICINE DETAIL VIEW */}
        {activeTab === 'detail' && detailMedicine && (
          <MedicineDetailPage
            medicine={detailMedicine}
            onBack={() => handleNavigate('search')}
            onRequestQuote={handleRequestQuoteSingle}
            onCompareSelect={handleCompareSelect}
            isSelectedForCompare={selectedForCompare.some((m) => m.id === detailMedicine.id)}
            onNavigate={handleNavigate}
          />
        )}

        {/* DOCTOR REQUEST TRACKING & QUOTATION REVIEW */}
        {activeTab === 'requests' && (
          <DoctorRequestTracking
            doctorId={activeDoctorId}
            selectedRequestId={trackingSelectedReqId}
            onNavigateToChat={handleNavigateToChat}
            onNavigate={handleNavigate}
          />
        )}

        {/* PHARMA SUPPLIER DASHBOARD / INVENTORY */}
        {(activeTab === 'pharma-dashboard' || activeTab === 'pharma-medicines' || activeTab === 'pharma-requests') && (
          <PharmaDashboard
            pharmaId={activePharmaId}
            activeView={activeTab === 'pharma-medicines' ? 'medicines' : activeTab === 'pharma-requests' ? 'requests' : 'dashboard'}
            onOpenAddMedicine={() => setAddMedicineModalOpen(true)}
            onOpenSubmitQuotation={(req) => {
              setTargetReqForSubmitQuote(req);
              setSubmitQuoteModalOpen(true);
            }}
            onNavigateToChat={handleNavigateToChat}
            onNavigate={handleNavigate}
          />
        )}

        {/* B2B PROCUREMENT CHAT / MESSAGING */}
        {activeTab === 'messages' && (
          <MessagingView
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            currentUserRole={resolvedRole}
            initialTargetUserId={chatTarget?.partnerId}
            initialTargetUserName={chatTarget?.partnerName}
            initialRequestCode={chatTarget?.requestCode}
          />
        )}

        {/* ADMIN COMPLIANCE DASHBOARD */}
        {activeTab.startsWith('admin') && (
          <AdminDashboard />
        )}

      </main>

      {/* 4. Requirement Requisition Modal */}
      {requestQuoteModalOpen && (
        <RequestQuotationModal
          initialMedicine={quoteTargetMed}
          initialMultiMedicines={quoteTargetMultiMeds}
          initialQuantity={quotePrefillQty}
          doctorId={activeDoctorId}
          onClose={() => setRequestQuoteModalOpen(false)}
          onSuccess={(req) => {
            setRequestQuoteModalOpen(false);
            setTrackingSelectedReqId(req.id);
            setActiveTab('requests');
          }}
        />
      )}

      {/* 5. Doctor Sign In / Registration Modal */}
      {doctorAuthModal.open && (
        <DoctorAuthModal
          initialMode={doctorAuthModal.mode}
          onClose={() => setDoctorAuthModal({ open: false, mode: 'login' })}
          onSuccess={(docId) => {
            setActiveDoctorId(docId);
            setCurrentRole('doctor');
            setDoctorAuthModal({ open: false, mode: 'login' });
            setActiveTab('dashboard');
          }}
        />
      )}

      {/* 6. Pharma Registration / Sign In Modal */}
      {pharmaAuthModal.open && (
        <PharmaAuthModal
          initialMode={pharmaAuthModal.mode}
          onClose={() => setPharmaAuthModal({ open: false, mode: 'login' })}
          onSuccess={(pId) => {
            setActivePharmaId(pId);
            setCurrentRole('pharma');
            setPharmaAuthModal({ open: false, mode: 'login' });
            setActiveTab('pharma-dashboard');
          }}
        />
      )}

      {/* 7. Pharma Quotation Submission Modal */}
      {submitQuoteModalOpen && targetReqForSubmitQuote && (
        <SubmitQuotationModal
          request={targetReqForSubmitQuote}
          pharmaId={activePharmaId}
          onClose={() => {
            setSubmitQuoteModalOpen(false);
            setTargetReqForSubmitQuote(null);
          }}
          onSuccess={() => {
            setSubmitQuoteModalOpen(false);
            setTargetReqForSubmitQuote(null);
          }}
        />
      )}

      {/* 8. Add Medicine Modal */}
      {addMedicineModalOpen && (
        <AddMedicineModal
          pharmaId={activePharmaId}
          onClose={() => setAddMedicineModalOpen(false)}
          onSuccess={() => {
            setAddMedicineModalOpen(false);
          }}
        />
      )}

    </div>
  );
}
