import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  Building2, 
  FileText, 
  MessageSquare, 
  ArrowRight, 
  Calendar, 
  MapPin, 
  AlertCircle,
  Truck,
  Check,
  ChevronRight,
  Filter
} from 'lucide-react';
import { MedicineRequest, Quotation, RequestStatus } from '../types';
import { StorageService, subscribeToStorage } from '../services/storage';

interface DoctorRequestTrackingProps {
  doctorId: string;
  selectedRequestId?: string;
  onNavigateToChat: (companyId: string, companyName: string, requestCode: string) => void;
  onNavigate: (tab: string, meta?: any) => void;
}

const TIMELINE_STAGES: { status: RequestStatus; label: string; desc: string }[] = [
  { status: 'created', label: 'Request Created', desc: 'Requirement generated & validated' },
  { status: 'sent_to_suppliers', label: 'Sent to Suppliers', desc: 'Dispatched to verified pharma manufacturers' },
  { status: 'supplier_responded', label: 'Supplier Responded', desc: 'Supplier acknowledged requisition' },
  { status: 'quotation_received', label: 'Quotation Received', desc: 'Commercial quotation submitted' },
  { status: 'under_review', label: 'Under Review', desc: 'Therapeutics committee evaluation' },
  { status: 'accepted', label: 'Accepted', desc: 'Quotation approved for fulfillment' },
  { status: 'completed', label: 'Completed', desc: 'Consignment verified into hospital dispensary' },
];

export const DoctorRequestTracking: React.FC<DoctorRequestTrackingProps> = ({
  doctorId,
  selectedRequestId,
  onNavigateToChat,
  onNavigate,
}) => {
  const [requests, setRequests] = useState<MedicineRequest[]>(() => StorageService.getRequests());
  const [quotations, setQuotations] = useState<Quotation[]>(() => StorageService.getQuotations());
  const [activeReqId, setActiveReqId] = useState<string>(() => {
    const docReqs = StorageService.getRequests().filter(r => r.doctor_id === doctorId);
    return selectedRequestId || (docReqs[0]?.id || '');
  });
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const handleUpdate = () => {
      setRequests(StorageService.getRequests());
      setQuotations(StorageService.getQuotations());
    };
    return subscribeToStorage(handleUpdate);
  }, []);

  const doctorRequests = requests.filter(r => r.doctor_id === doctorId);

  const filteredRequests = doctorRequests.filter(r => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return r.status !== 'completed' && r.status !== 'cancelled';
    if (statusFilter === 'quotes') return r.status === 'quotation_received';
    if (statusFilter === 'accepted') return r.status === 'accepted';
    if (statusFilter === 'completed') return r.status === 'completed';
    return true;
  });

  const activeRequest = doctorRequests.find(r => r.id === activeReqId) || doctorRequests[0];
  const activeReqQuotes = activeRequest ? quotations.filter(q => q.request_id === activeRequest.id) : [];

  const handleAcceptQuote = (quoteId: string) => {
    if (!activeRequest) return;
    if (window.confirm('Accept this quotation? This will formalize the institutional order and notify the supplier for dispatch scheduling.')) {
      StorageService.acceptQuotation(activeRequest.id, quoteId);
    }
  };

  const getStageIndex = (status: RequestStatus) => {
    const order: RequestStatus[] = [
      'created',
      'sent_to_suppliers',
      'supplier_responded',
      'quotation_received',
      'under_review',
      'accepted',
      'completed'
    ];
    return order.indexOf(status);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Procurement Requisitions & Quotation Review
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track requisition lifecycles, compare incoming manufacturer quotations, and approve institutional orders.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
          {[
            { id: 'all', label: 'All Requests' },
            { id: 'active', label: 'Active' },
            { id: 'quotes', label: 'Quotes Received' },
            { id: 'accepted', label: 'Accepted' },
            { id: 'completed', label: 'Completed' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                statusFilter === f.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {doctorRequests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <FileText className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Requisitions Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You have not submitted any medicine quotation requests yet. Search for a medicine and submit your requirements.
          </p>
          <button
            onClick={() => onNavigate('search')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition"
          >
            Find Medicines
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Requests List Column (Left) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0 divide-y divide-slate-100">
            <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 uppercase tracking-wider">Your Requisitions</span>
              <span className="text-slate-500">{filteredRequests.length} listed</span>
            </div>

            <div className="max-h-[600px] overflow-y-auto divide-y divide-slate-100">
              {filteredRequests.map(req => {
                const isSelected = activeRequest?.id === req.id;
                const reqQuotes = quotations.filter(q => q.request_id === req.id);
                return (
                  <div
                    key={req.id}
                    onClick={() => setActiveReqId(req.id)}
                    className={`p-4 transition cursor-pointer text-xs space-y-1.5 ${
                      isSelected 
                        ? 'bg-blue-50/60 border-l-4 border-blue-600' 
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-900">{req.id}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        req.status === 'quotation_received' ? 'bg-teal-100 text-teal-800' :
                        req.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                        req.status === 'under_review' ? 'bg-blue-100 text-blue-800' :
                        req.status === 'completed' ? 'bg-slate-200 text-slate-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {req.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 truncate">{req.medicine_name}</h4>

                    <div className="flex items-center justify-between text-slate-500 text-[11px]">
                      <span>Qty: <strong>{req.required_quantity}</strong> units</span>
                      <span>By: {req.required_date}</span>
                    </div>

                    {reqQuotes.length > 0 && (
                      <div className="pt-1 flex items-center gap-1 text-[11px] font-semibold text-teal-700">
                        <CheckCircle2 className="w-3 h-3 text-teal-600" />
                        <span>{reqQuotes.length} Supplier Quote(s) available</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Request View & Quotations (Right) */}
          {activeRequest && (
            <div className="lg:col-span-8 space-y-6">
              
              {/* Active Request Overview Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-lg font-black text-slate-900">{activeRequest.id}</span>
                      <span className="text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-800 px-2.5 py-0.5 rounded-full border border-blue-200">
                        {activeRequest.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                      {activeRequest.medicine_name}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Composition: {activeRequest.composition} ({activeRequest.strength}) · Pack: {activeRequest.preferred_pack_size}
                    </p>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-xs text-slate-400 block">Required Quantity</span>
                    <span className="text-2xl font-black text-slate-900">
                      {activeRequest.required_quantity.toLocaleString()} <span className="text-xs font-normal text-slate-500">units</span>
                    </span>
                    <span className="block text-[11px] text-slate-400 mt-0.5">Target: {activeRequest.required_date}</span>
                  </div>
                </div>

                {/* Delivery & Specifications Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold block flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      Receiving Destination:
                    </span>
                    <span className="font-medium text-slate-800 mt-1 block">{activeRequest.delivery_location}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      Requisition Notes:
                    </span>
                    <span className="font-medium text-slate-800 mt-1 block">{activeRequest.notes || 'Standard institutional procurement specifications.'}</span>
                  </div>
                </div>

                {/* STATUS TIMELINE SECTION */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>Procurement Lifecycle Milestones</span>
                  </h3>

                  {/* Horizontal Stage Stepper for Desktop */}
                  <div className="relative py-2">
                    <div className="hidden sm:grid grid-cols-7 gap-1 text-center relative z-10">
                      {TIMELINE_STAGES.map((stage, idx) => {
                        const activeIdx = getStageIndex(activeRequest.status);
                        const isPast = activeIdx >= idx;
                        const isCurrent = activeIdx === idx;

                        return (
                          <div key={stage.status} className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                              isCurrent ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-md scale-110' :
                              isPast ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-500'
                            }`}>
                              {isPast && !isCurrent ? <Check className="w-4 h-4" /> : idx + 1}
                            </div>
                            <span className={`text-[11px] font-bold mt-2 leading-tight ${
                              isCurrent ? 'text-blue-700' : isPast ? 'text-slate-800' : 'text-slate-400'
                            }`}>
                              {stage.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Connecting Bar */}
                    <div className="hidden sm:block absolute top-6 left-6 right-6 h-0.5 bg-slate-200 -z-0">
                      <div 
                        className="h-full bg-teal-600 transition-all duration-300"
                        style={{ width: `${Math.min(100, (getStageIndex(activeRequest.status) / 6) * 100)}%` }}
                      ></div>
                    </div>

                    {/* Vertical Timeline History Log */}
                    <div className="mt-6 divide-y divide-slate-100 border border-slate-100 rounded-xl bg-slate-50/50 p-3 text-xs space-y-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Timeline History Log:</span>
                      {activeRequest.timeline.map((entry, idx) => (
                        <div key={idx} className="pt-2 flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 shrink-0"></div>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{entry.label}</span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(entry.timestamp).toLocaleString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <p className="text-slate-600">{entry.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                </div>

              </div>

              {/* RECEIVED QUOTATIONS SECTION */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Manufacturer Quotations Received ({activeReqQuotes.length})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Compare commercial proposals submitted by verified suppliers for this requisition.
                    </p>
                  </div>
                  {activeReqQuotes.length > 1 && (
                    <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                      Competitive Bidding Active
                    </span>
                  )}
                </div>

                {activeReqQuotes.length === 0 ? (
                  <div className="p-8 text-center rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 space-y-2">
                    <Clock className="w-6 h-6 text-slate-400 mx-auto" />
                    <p className="font-semibold text-slate-700">Awaiting Supplier Quotation Submission</p>
                    <p className="max-w-md mx-auto">
                      Your requisition has been dispatched to {activeRequest.selected_company_ids.length} pharma companies. Suppliers are reviewing warehouse inventory and preparing formal quotations.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeReqQuotes.map(quote => {
                      const isAccepted = quote.quotation_status === 'accepted';
                      const isDeclined = quote.quotation_status === 'declined';

                      return (
                        <div 
                          key={quote.id}
                          className={`p-5 rounded-2xl border transition-all space-y-4 ${
                            isAccepted 
                              ? 'border-emerald-500 bg-emerald-50/20 ring-1 ring-emerald-500'
                              : isDeclined 
                              ? 'border-slate-200 bg-slate-50/60 opacity-60'
                              : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-blue-600" />
                                <h4 className="font-bold text-sm text-slate-900">{quote.company_name}</h4>
                                {isAccepted && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                                    <Check className="w-3 h-3" /> Accepted Quotation
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 mt-1">
                                Quotation Ref: <strong className="font-mono text-slate-700">{quote.id}</strong> · Submitted: {new Date(quote.created_at).toLocaleDateString()}
                              </p>
                            </div>

                            {/* Commercial Quote Figures */}
                            <div className="text-left sm:text-right shrink-0">
                              <span className="text-xs text-slate-400 block">Quoted Unit Price</span>
                              <div className="text-2xl font-black text-slate-900">
                                ₹{quote.quoted_price} <span className="text-xs font-normal text-slate-500">/ pack</span>
                              </div>
                              <span className="text-xs font-bold text-slate-700 block mt-0.5">
                                Total: ₹{quote.total_price.toLocaleString()}
                              </span>
                            </div>
                          </div>

                          {/* Quotation Specification Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                            <div>
                              <span className="text-slate-400 block">Available Quantity</span>
                              <strong className="text-slate-800">{quote.available_quantity.toLocaleString()} packs</strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Estimated Delivery</span>
                              <strong className="text-slate-800 flex items-center gap-1">
                                <Truck className="w-3.5 h-3.5 text-blue-600" />
                                {quote.estimated_delivery_days} business day(s)
                              </strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Minimum Order</span>
                              <strong className="text-slate-800">{quote.moq} packs</strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Quote Validity</span>
                              <strong className="text-slate-800">{quote.valid_until}</strong>
                            </div>
                          </div>

                          {/* Notes */}
                          {quote.additional_notes && (
                            <p className="text-xs text-slate-600 bg-blue-50/40 p-2.5 rounded-lg border border-blue-100/60 leading-relaxed">
                              <strong>Supplier Note:</strong> {quote.additional_notes}
                            </p>
                          )}

                          {/* Action Buttons */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                            <button
                              onClick={() => onNavigateToChat(quote.company_id, quote.company_name, activeRequest.id)}
                              className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Clarify / Procurement Chat</span>
                            </button>

                            {activeRequest.status !== 'accepted' && activeRequest.status !== 'completed' && (
                              <button
                                onClick={() => handleAcceptQuote(quote.id)}
                                className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-sm transition flex items-center gap-1.5"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Accept Quotation</span>
                              </button>
                            )}
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}

              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
};
