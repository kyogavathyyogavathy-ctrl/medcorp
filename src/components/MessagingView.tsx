import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Paperclip, 
  Search, 
  Building2, 
  UserCheck, 
  FileText, 
  Clock, 
  CheckCheck, 
  Check,
  CheckCircle2,
  ShieldCheck,
  Download
} from 'lucide-react';
import { Message, UserRole } from '../types';
import { StorageService, subscribeToStorage } from '../services/storage';

interface MessagingViewProps {
  currentUserId: string;
  currentUserName: string;
  currentUserRole: UserRole;
  initialTargetUserId?: string;
  initialTargetUserName?: string;
  initialRequestCode?: string;
}

export const MessagingView: React.FC<MessagingViewProps> = ({
  currentUserId,
  currentUserName,
  currentUserRole,
  initialTargetUserId,
  initialTargetUserName,
  initialRequestCode,
}) => {
  const [messages, setMessages] = useState<Message[]>(() => StorageService.getMessages());
  const [activePartnerId, setActivePartnerId] = useState<string>(() => {
    if (initialTargetUserId) return initialTargetUserId;
    // Default to first chat partner
    const userMsgs = StorageService.getMessagesForUser(currentUserId);
    if (userMsgs.length > 0) {
      const first = userMsgs[0];
      return first.sender_id === currentUserId ? first.receiver_id : first.sender_id;
    }
    return currentUserRole === 'doctor' ? 'pharma-001' : 'doc-001';
  });

  const [activePartnerName, setActivePartnerName] = useState<string>(() => {
    if (initialTargetUserName) return initialTargetUserName;
    const doc = StorageService.getDoctorById(activePartnerId);
    if (doc) return doc.name;
    const pharma = StorageService.getPharmaCompanyById(activePartnerId);
    if (pharma) return pharma.company_name;
    return 'Sunora BioPharma Ltd.';
  });

  const [activeRequestCode, setActiveRequestCode] = useState<string | undefined>(
    initialRequestCode || 'ML-REQ-000123'
  );

  const [inputText, setInputText] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string; url: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setMessages(StorageService.getMessages());
    };
    return subscribeToStorage(handleUpdate);
  }, []);

  useEffect(() => {
    if (initialTargetUserId) {
      setActivePartnerId(initialTargetUserId);
      if (initialTargetUserName) setActivePartnerName(initialTargetUserName);
      if (initialRequestCode) setActiveRequestCode(initialRequestCode);
    }
  }, [initialTargetUserId, initialTargetUserName, initialRequestCode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activePartnerId]);

  // Distinct conversations for current user
  const userConversations = React.useMemo(() => {
    const map = new Map<string, { partnerId: string; partnerName: string; lastMessage: Message }>();
    
    messages.forEach(msg => {
      if (msg.sender_id === currentUserId || msg.receiver_id === currentUserId) {
        const partnerId = msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id;
        const partnerName = msg.sender_id === currentUserId ? msg.receiver_name : msg.sender_name;
        
        const existing = map.get(partnerId);
        if (!existing || new Date(msg.created_at) > new Date(existing.lastMessage.created_at)) {
          map.set(partnerId, { partnerId, partnerName, lastMessage: msg });
        }
      }
    });

    // If current target not in map, add stub
    if (!map.has(activePartnerId)) {
      map.set(activePartnerId, {
        partnerId: activePartnerId,
        partnerName: activePartnerName,
        lastMessage: {
          id: 'stub',
          sender_id: currentUserId,
          sender_name: currentUserName,
          sender_role: currentUserRole,
          receiver_id: activePartnerId,
          receiver_name: activePartnerName,
          message: 'Start procurement discussion...',
          created_at: new Date().toISOString(),
          read: true,
        },
      });
    }

    return Array.from(map.values()).filter(c => 
      c.partnerName.toLowerCase().includes(searchFilter.toLowerCase())
    );
  }, [messages, currentUserId, currentUserName, currentUserRole, activePartnerId, activePartnerName, searchFilter]);

  // Current conversation messages
  const activeConversationMessages = messages.filter(
    m => (m.sender_id === currentUserId && m.receiver_id === activePartnerId) ||
         (m.sender_id === activePartnerId && m.receiver_id === currentUserId)
  );

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !attachedFile) return;

    StorageService.sendMessage({
      sender_id: currentUserId,
      sender_name: currentUserName,
      sender_role: currentUserRole,
      receiver_id: activePartnerId,
      receiver_name: activePartnerName,
      request_code: activeRequestCode,
      message: inputText.trim(),
      attachment: attachedFile || undefined,
    });

    setInputText('');
    setAttachedFile(null);
  };

  const handleAttachDemoFile = () => {
    setAttachedFile({
      name: 'Batch_Certificate_Of_Analysis_COA.pdf',
      size: '1.4 MB',
      url: '#',
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
      
      {/* LEFT: Conversation Threads List (4 cols) */}
      <div className="lg:col-span-4 border-r border-slate-200 flex flex-col bg-slate-50/50">
        
        {/* Search & Header */}
        <div className="p-4 border-b border-slate-200 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-base text-slate-900 tracking-tight">Procurement Messages</h2>
            <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              B2B Encrypted
            </span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Threads List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {userConversations.map(conv => {
            const isSelected = conv.partnerId === activePartnerId;
            return (
              <div
                key={conv.partnerId}
                onClick={() => {
                  setActivePartnerId(conv.partnerId);
                  setActivePartnerName(conv.partnerName);
                  if (conv.lastMessage.request_code) {
                    setActiveRequestCode(conv.lastMessage.request_code);
                  }
                }}
                className={`p-4 transition cursor-pointer text-xs space-y-1 ${
                  isSelected ? 'bg-blue-50/80 border-l-4 border-blue-600' : 'hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 truncate max-w-[180px]">
                    {conv.partnerName}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(conv.lastMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="text-slate-500 truncate text-[11px]">
                  {conv.lastMessage.message}
                </p>

                {conv.lastMessage.request_code && (
                  <span className="inline-block font-mono text-[10px] text-blue-600 bg-blue-100/60 px-1.5 py-0.2 rounded font-bold">
                    {conv.lastMessage.request_code}
                  </span>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* RIGHT: Active Chat Window (8 cols) */}
      <div className="lg:col-span-8 flex flex-col h-full bg-white">
        
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center font-bold text-xs text-slate-700">
              {activePartnerName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm text-slate-900">{activePartnerName}</h3>
                <span className="inline-flex items-center gap-0.5 text-[10px] text-teal-700 bg-teal-50 font-bold px-1.5 py-0.2 rounded border border-teal-200">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Institutional Procurement Channel</p>
            </div>
          </div>

          {/* Linked Requisition Reference Tag */}
          {activeRequestCode && (
            <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs flex items-center gap-2">
              <span className="text-slate-400 font-medium">Requisition:</span>
              <span className="font-mono font-bold text-blue-700">{activeRequestCode}</span>
            </div>
          )}
        </div>

        {/* Message Log */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/40">
          
          <div className="text-center my-2">
            <span className="text-[10px] bg-slate-200 text-slate-600 px-3 py-1 rounded-full font-medium">
              Formal B2B Procurement Record · Timestamped & Logged
            </span>
          </div>

          {activeConversationMessages.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-xs space-y-2">
              <p className="font-semibold text-slate-600">No previous messages in this thread.</p>
              <p>Type below to discuss bulk pricing, batch COA schedules, or delivery coordinates.</p>
            </div>
          ) : (
            activeConversationMessages.map((msg) => {
              const isMine = msg.sender_id === currentUserId;

              return (
                <div 
                  key={msg.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <div className="text-[10px] text-slate-400 mb-1 px-1">
                    {msg.sender_name} · {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>

                  <div className={`p-3.5 rounded-2xl max-w-lg text-xs leading-relaxed shadow-2xs ${
                    isMine 
                      ? 'bg-blue-600 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.message}</p>

                    {/* Attachment preview if present */}
                    {msg.attachment && (
                      <div className={`mt-2.5 p-2 rounded-lg flex items-center justify-between gap-3 text-[11px] ${
                        isMine ? 'bg-blue-700/80 text-white' : 'bg-slate-100 text-slate-800'
                      }`}>
                        <div className="flex items-center gap-1.5 truncate">
                          <FileText className="w-4 h-4 shrink-0" />
                          <span className="font-semibold truncate">{msg.attachment.name}</span>
                          <span className="text-[10px] opacity-75">({msg.attachment.size})</span>
                        </div>
                        <a 
                          href={msg.attachment.url} 
                          download
                          className="p-1 hover:bg-white/20 rounded"
                          title="Download attachment"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>

                  {isMine && (
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1 mr-1">
                      <span>Delivered</span>
                      <CheckCheck className="w-3 h-3 text-teal-600" />
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Attachment preview badge before sending */}
        {attachedFile && (
          <div className="px-4 py-2 bg-blue-50 border-t border-blue-100 flex items-center justify-between text-xs text-blue-900">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Attached: <strong>{attachedFile.name}</strong> ({attachedFile.size})</span>
            </div>
            <button
              onClick={() => setAttachedFile(null)}
              className="text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Input & Form */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 bg-white flex items-center gap-2">
          <button
            type="button"
            onClick={handleAttachDemoFile}
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
            title="Attach batch COA / Document"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <input
            type="text"
            placeholder="Type procurement message or question..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-slate-50 text-slate-900 text-xs px-4 py-2.5 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          />

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-2.5 rounded-xl shadow-sm transition disabled:opacity-50"
            disabled={!inputText.trim() && !attachedFile}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>

    </div>
  );
};
