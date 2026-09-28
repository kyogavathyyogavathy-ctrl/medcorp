import { Doctor, PharmaCompany, Medicine, MedicineRequest, Quotation, Message, Notification, VerificationStatus, RequestStatus } from '../types';
import { INITIAL_DOCTORS, INITIAL_PHARMA_COMPANIES, INITIAL_MEDICINES, INITIAL_REQUESTS, INITIAL_QUOTATIONS, INITIAL_MESSAGES, INITIAL_NOTIFICATIONS } from '../data/demoData';

const STORAGE_KEYS = {
  DOCTORS: 'medlink_doctors_v1',
  PHARMA: 'medlink_pharma_v1',
  MEDICINES: 'medlink_medicines_v3',
  REQUESTS: 'medlink_requests_v1',
  QUOTATIONS: 'medlink_quotations_v1',
  MESSAGES: 'medlink_messages_v1',
  NOTIFICATIONS: 'medlink_notifications_v1',
  CURRENT_USER_ROLE: 'medlink_user_role_v1',
  CURRENT_USER_ID: 'medlink_user_id_v1',
};

type Listener = () => void;
const listeners: Set<Listener> = new Set();

export const subscribeToStorage = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const notifyListeners = () => {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('Storage listener error:', e);
    }
  });
};

function getLocalItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notifyListeners();
  } catch (e) {
    console.error('Storage set item error:', e);
  }
}

export const StorageService = {
  // Initialization
  init: () => {
    if (!localStorage.getItem(STORAGE_KEYS.DOCTORS)) {
      setLocalItem(STORAGE_KEYS.DOCTORS, INITIAL_DOCTORS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PHARMA)) {
      setLocalItem(STORAGE_KEYS.PHARMA, INITIAL_PHARMA_COMPANIES);
    }
    const existingMeds = getLocalItem<Medicine[]>(STORAGE_KEYS.MEDICINES, []);
    if (!existingMeds || existingMeds.length < INITIAL_MEDICINES.length) {
      // Merge initial medicines with any custom ones user added
      const customMeds = existingMeds ? existingMeds.filter(m => !INITIAL_MEDICINES.some(im => im.id === m.id)) : [];
      setLocalItem(STORAGE_KEYS.MEDICINES, [...INITIAL_MEDICINES, ...customMeds]);
    } else {
      // Ensure all INITIAL_MEDICINES exist in case new ones were added
      const missing = INITIAL_MEDICINES.filter(im => !existingMeds.some(m => m.id === im.id));
      if (missing.length > 0) {
        setLocalItem(STORAGE_KEYS.MEDICINES, [...existingMeds, ...missing]);
      }
    }
    if (!localStorage.getItem(STORAGE_KEYS.REQUESTS)) {
      setLocalItem(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.QUOTATIONS)) {
      setLocalItem(STORAGE_KEYS.QUOTATIONS, INITIAL_QUOTATIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
      setLocalItem(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      setLocalItem(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    }
  },

  resetToDemo: () => {
    setLocalItem(STORAGE_KEYS.DOCTORS, INITIAL_DOCTORS);
    setLocalItem(STORAGE_KEYS.PHARMA, INITIAL_PHARMA_COMPANIES);
    setLocalItem(STORAGE_KEYS.MEDICINES, INITIAL_MEDICINES);
    setLocalItem(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
    setLocalItem(STORAGE_KEYS.QUOTATIONS, INITIAL_QUOTATIONS);
    setLocalItem(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
    setLocalItem(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  },

  // Doctors
  getDoctors: (): Doctor[] => {
    return getLocalItem<Doctor[]>(STORAGE_KEYS.DOCTORS, INITIAL_DOCTORS);
  },

  getDoctorById: (id: string): Doctor | undefined => {
    return StorageService.getDoctors().find(d => d.id === id);
  },

  registerDoctor: (doctorData: Omit<Doctor, 'id' | 'created_at' | 'verification_status'>): Doctor => {
    const doctors = StorageService.getDoctors();
    const newDoctor: Doctor = {
      ...doctorData,
      id: `doc-${Date.now().toString().slice(-4)}`,
      verification_status: 'pending', // requirement: do not automatically mark as verified
      created_at: new Date().toISOString(),
    };
    setLocalItem(STORAGE_KEYS.DOCTORS, [newDoctor, ...doctors]);
    
    // Notify admin
    StorageService.addNotification({
      user_id: 'admin',
      title: 'New Doctor Registration Pending',
      message: `${newDoctor.name} (${newDoctor.hospital}) registered. Verification required.`,
      type: 'verification',
      link_tab: 'verification',
    });

    return newDoctor;
  },

  updateDoctorVerification: (id: string, status: VerificationStatus): void => {
    const doctors = StorageService.getDoctors();
    const target = doctors.find(d => d.id === id);
    if (!target) return;
    target.verification_status = status;
    setLocalItem(STORAGE_KEYS.DOCTORS, [...doctors]);

    // Send notification to doctor
    StorageService.addNotification({
      user_id: target.id,
      title: status === 'verified' ? 'Account Verified by MedLink Admin' : 'Verification Status Update',
      message: status === 'verified' 
        ? 'Your medical council registration has been verified. You can now issue procurement requests.'
        : 'Your verification request was rejected. Please review your submitted credentials in settings.',
      type: 'verification',
    });
  },

  // Pharma Companies
  getPharmaCompanies: (): PharmaCompany[] => {
    return getLocalItem<PharmaCompany[]>(STORAGE_KEYS.PHARMA, INITIAL_PHARMA_COMPANIES);
  },

  getPharmaCompanyById: (id: string): PharmaCompany | undefined => {
    return StorageService.getPharmaCompanies().find(p => p.id === id);
  },

  registerPharmaCompany: (companyData: Omit<PharmaCompany, 'id' | 'created_at' | 'verification_status' | 'rating' | 'total_orders_completed'>): PharmaCompany => {
    const pharmaList = StorageService.getPharmaCompanies();
    const newPharma: PharmaCompany = {
      ...companyData,
      id: `pharma-${Date.now().toString().slice(-4)}`,
      verification_status: 'pending', // requires admin approval
      rating: 5.0,
      total_orders_completed: 0,
      created_at: new Date().toISOString(),
    };
    setLocalItem(STORAGE_KEYS.PHARMA, [newPharma, ...pharmaList]);

    // Notify admin
    StorageService.addNotification({
      user_id: 'admin',
      title: 'Pharma Company Registration Pending',
      message: `${newPharma.company_name} submitted manufacturing licenses for verification.`,
      type: 'verification',
      link_tab: 'verification',
    });

    return newPharma;
  },

  updatePharmaVerification: (id: string, status: VerificationStatus): void => {
    const pharmaList = StorageService.getPharmaCompanies();
    const target = pharmaList.find(p => p.id === id);
    if (!target) return;
    target.verification_status = status;
    setLocalItem(STORAGE_KEYS.PHARMA, [...pharmaList]);

    // Also update all medicines belonging to this company
    const medicines = StorageService.getMedicines();
    let updatedMeds = false;
    medicines.forEach(m => {
      if (m.company_id === id) {
        m.is_verified_supplier = (status === 'verified');
        updatedMeds = true;
      }
    });
    if (updatedMeds) {
      setLocalItem(STORAGE_KEYS.MEDICINES, [...medicines]);
    }

    // Notify pharma company
    StorageService.addNotification({
      user_id: target.id,
      title: status === 'verified' ? 'Company Verified by Admin' : 'Company Verification Review',
      message: status === 'verified'
        ? 'Your pharmaceutical manufacturing license has been verified. Products are now shown with Verified Supplier badges.'
        : 'Your verification was declined. Please verify your CIN and Drug License details.',
      type: 'verification',
    });
  },

  // Medicines
  getMedicines: (): Medicine[] => {
    return getLocalItem<Medicine[]>(STORAGE_KEYS.MEDICINES, INITIAL_MEDICINES);
  },

  getMedicineById: (id: string): Medicine | undefined => {
    return StorageService.getMedicines().find(m => m.id === id);
  },

  addMedicine: (medicineData: Omit<Medicine, 'id' | 'last_updated'>): Medicine => {
    const medicines = StorageService.getMedicines();
    const newMedicine: Medicine = {
      ...medicineData,
      id: `med-${Date.now().toString().slice(-4)}`,
      last_updated: new Date().toISOString(),
    };
    setLocalItem(STORAGE_KEYS.MEDICINES, [newMedicine, ...medicines]);
    return newMedicine;
  },

  updateMedicine: (id: string, updates: Partial<Medicine>): void => {
    const medicines = StorageService.getMedicines();
    const index = medicines.findIndex(m => m.id === id);
    if (index === -1) return;
    medicines[index] = {
      ...medicines[index],
      ...updates,
      last_updated: new Date().toISOString(),
    };
    setLocalItem(STORAGE_KEYS.MEDICINES, [...medicines]);
  },

  deleteMedicine: (id: string): void => {
    const medicines = StorageService.getMedicines();
    setLocalItem(STORAGE_KEYS.MEDICINES, medicines.filter(m => m.id !== id));
  },

  // Requests
  getRequests: (): MedicineRequest[] => {
    return getLocalItem<MedicineRequest[]>(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
  },

  getRequestById: (id: string): MedicineRequest | undefined => {
    return StorageService.getRequests().find(r => r.id === id);
  },

  createRequest: (requestData: Omit<MedicineRequest, 'id' | 'status' | 'timeline' | 'created_at'>): MedicineRequest => {
    const requests = StorageService.getRequests();
    const count = requests.length + 124;
    const reqId = `ML-REQ-${count.toString().padStart(6, '0')}`;
    const now = new Date().toISOString();

    const newRequest: MedicineRequest = {
      ...requestData,
      id: reqId,
      status: 'sent_to_suppliers',
      timeline: [
        {
          status: 'created',
          label: 'Request Created',
          timestamp: now,
          description: `Requirement initiated by ${requestData.doctor_name} for ${requestData.required_quantity} units of ${requestData.medicine_name}.`,
        },
        {
          status: 'sent_to_suppliers',
          label: 'Sent to Suppliers',
          timestamp: now,
          description: `Dispatched to ${requestData.selected_company_ids.length} selected pharmaceutical supplier(s).`,
        }
      ],
      created_at: now,
    };

    setLocalItem(STORAGE_KEYS.REQUESTS, [newRequest, ...requests]);

    // Send notifications to each selected pharma company
    requestData.selected_company_ids.forEach(companyId => {
      StorageService.addNotification({
        user_id: companyId,
        title: `New Quotation Request (${reqId})`,
        message: `${requestData.doctor_name} from ${requestData.doctor_hospital} requested quotation for ${requestData.required_quantity} units of ${requestData.medicine_name}.`,
        type: 'request',
        link_tab: 'requests',
      });
    });

    return newRequest;
  },

  updateRequestStatus: (id: string, status: RequestStatus, description: string): void => {
    const requests = StorageService.getRequests();
    const target = requests.find(r => r.id === id);
    if (!target) return;

    target.status = status;
    const labelMap: Record<RequestStatus, string> = {
      created: 'Request Created',
      sent_to_suppliers: 'Sent to Suppliers',
      supplier_responded: 'Supplier Responded',
      quotation_received: 'Quotation Received',
      under_review: 'Under Review',
      accepted: 'Quotation Accepted',
      completed: 'Procurement Completed',
      cancelled: 'Request Cancelled',
    };

    target.timeline.push({
      status,
      label: labelMap[status] || status,
      timestamp: new Date().toISOString(),
      description,
    });

    setLocalItem(STORAGE_KEYS.REQUESTS, [...requests]);
  },

  acceptQuotation: (requestId: string, quotationId: string): void => {
    const requests = StorageService.getRequests();
    const targetReq = requests.find(r => r.id === requestId);
    const quotations = StorageService.getQuotations();
    const targetQuote = quotations.find(q => q.id === quotationId);

    if (targetReq && targetQuote) {
      targetReq.status = 'accepted';
      targetReq.accepted_quotation_id = quotationId;
      targetReq.timeline.push({
        status: 'accepted',
        label: 'Quotation Accepted',
        timestamp: new Date().toISOString(),
        description: `Doctor approved quotation from ${targetQuote.company_name} at ₹${targetQuote.quoted_price} per pack.`,
      });
      setLocalItem(STORAGE_KEYS.REQUESTS, [...requests]);

      // Update quote statuses
      quotations.forEach(q => {
        if (q.request_id === requestId) {
          q.quotation_status = (q.id === quotationId) ? 'accepted' : 'declined';
        }
      });
      setLocalItem(STORAGE_KEYS.QUOTATIONS, [...quotations]);

      // Notify the winning pharma company
      StorageService.addNotification({
        user_id: targetQuote.company_id,
        title: 'Quotation Accepted!',
        message: `${targetReq.doctor_name} accepted your quote for ${targetReq.id} (${targetReq.medicine_name}). Proceed to dispatch fulfillment.`,
        type: 'quotation',
        link_tab: 'requests',
      });
    }
  },

  // Quotations
  getQuotations: (): Quotation[] => {
    return getLocalItem<Quotation[]>(STORAGE_KEYS.QUOTATIONS, INITIAL_QUOTATIONS);
  },

  getQuotationsForRequest: (requestId: string): Quotation[] => {
    return StorageService.getQuotations().filter(q => q.request_id === requestId);
  },

  submitQuotation: (quoteData: Omit<Quotation, 'id' | 'created_at' | 'quotation_status'>): Quotation => {
    const quotations = StorageService.getQuotations();
    const newQuote: Quotation = {
      ...quoteData,
      id: `quot-${Date.now().toString().slice(-4)}`,
      quotation_status: 'submitted',
      created_at: new Date().toISOString(),
    };
    setLocalItem(STORAGE_KEYS.QUOTATIONS, [newQuote, ...quotations]);

    // Update request status to 'quotation_received'
    const request = StorageService.getRequestById(quoteData.request_id);
    if (request) {
      StorageService.updateRequestStatus(
        quoteData.request_id,
        'quotation_received',
        `${quoteData.company_name} submitted formal quotation at ₹${quoteData.quoted_price} / unit.`
      );

      // Notify doctor
      StorageService.addNotification({
        user_id: request.doctor_id,
        title: `Quotation Received for ${request.id}`,
        message: `${quoteData.company_name} quoted ₹${quoteData.quoted_price} (est. ${quoteData.estimated_delivery_days} days delivery).`,
        type: 'quotation',
        link_tab: 'requests',
      });
    }

    return newQuote;
  },

  // Messages
  getMessages: (): Message[] => {
    return getLocalItem<Message[]>(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
  },

  getMessagesForUser: (userId: string): Message[] => {
    return StorageService.getMessages().filter(
      m => m.sender_id === userId || m.receiver_id === userId
    );
  },

  sendMessage: (messageData: Omit<Message, 'id' | 'created_at' | 'read'>): Message => {
    const messages = StorageService.getMessages();
    const newMsg: Message = {
      ...messageData,
      id: `msg-${Date.now().toString().slice(-4)}`,
      created_at: new Date().toISOString(),
      read: false,
    };
    setLocalItem(STORAGE_KEYS.MESSAGES, [...messages, newMsg]);

    // Notify receiver
    StorageService.addNotification({
      user_id: messageData.receiver_id,
      title: `Message from ${messageData.sender_name}`,
      message: messageData.message.slice(0, 80) + (messageData.message.length > 80 ? '...' : ''),
      type: 'message',
      link_tab: 'messages',
    });

    return newMsg;
  },

  // Notifications
  getNotifications: (): Notification[] => {
    return getLocalItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  },

  getNotificationsForUser: (userId: string): Notification[] => {
    return StorageService.getNotifications().filter(n => n.user_id === userId || n.user_id === 'all');
  },

  addNotification: (notifData: Omit<Notification, 'id' | 'created_at' | 'read_status'>): Notification => {
    const notifs = StorageService.getNotifications();
    const newNotif: Notification = {
      ...notifData,
      id: `notif-${Date.now().toString().slice(-4)}`,
      read_status: false,
      created_at: new Date().toISOString(),
    };
    setLocalItem(STORAGE_KEYS.NOTIFICATIONS, [newNotif, ...notifs]);
    return newNotif;
  },

  markNotificationsRead: (userId: string): void => {
    const notifs = StorageService.getNotifications();
    notifs.forEach(n => {
      if (n.user_id === userId || n.user_id === 'all') {
        n.read_status = true;
      }
    });
    setLocalItem(STORAGE_KEYS.NOTIFICATIONS, [...notifs]);
  },
};
