export type UserRole = 'doctor' | 'pharma' | 'admin';

export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export type AvailabilityStatus = 'in_stock' | 'limited_stock' | 'out_of_stock';

export type RequestStatus = 
  | 'created' 
  | 'sent_to_suppliers' 
  | 'supplier_responded' 
  | 'quotation_received' 
  | 'under_review' 
  | 'accepted' 
  | 'completed' 
  | 'cancelled';

export type QuotationStatus = 'pending' | 'submitted' | 'accepted' | 'declined' | 'expired';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  status: 'active' | 'suspended';
  created_at: string;
}

export interface Doctor {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  registration_number: string;
  specialization: string;
  hospital: string;
  location: string;
  verification_status: VerificationStatus;
  verification_document_name?: string;
  created_at: string;
}

export interface PharmaCompany {
  id: string;
  user_id: string;
  company_name: string;
  registration_details: string;
  license_details: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  location: string;
  website: string;
  verification_status: VerificationStatus;
  product_categories: string[];
  documents: string[];
  rating: number;
  total_orders_completed: number;
  created_at: string;
}

export interface Medicine {
  id: string;
  company_id: string;
  company_name: string;
  medicine_name: string;
  generic_name: string;
  composition: string;
  strength: string;
  dosage_form: 'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | 'Suspension' | 'Ointment' | 'Inhaler' | 'Infusion' | 'Drops' | 'Respules' | 'Powder';
  pack_size: string;
  category: string;
  listed_price: number; // e.g. in INR ₹
  moq: number; // Minimum Order Quantity
  stock_quantity: number;
  availability: AvailabilityStatus;
  status: 'published' | 'draft' | 'archived';
  description: string;
  storage_condition?: string;
  regulatory_approval?: string;
  supplier_location: string;
  is_verified_supplier: boolean;
  brand_aliases?: string[];
  therapeutic_tags?: string[];
  last_updated: string;
}

export interface MedicineRequest {
  id: string; // e.g. ML-REQ-000123
  doctor_id: string;
  doctor_name: string;
  doctor_hospital: string;
  doctor_location: string;
  medicine_id?: string;
  medicine_name: string;
  composition: string;
  strength: string;
  dosage_form?: string;
  required_quantity: number;
  preferred_pack_size: string;
  required_date: string;
  delivery_location: string;
  notes?: string;
  selected_company_ids: string[];
  status: RequestStatus;
  timeline: {
    status: RequestStatus;
    label: string;
    timestamp: string;
    description: string;
  }[];
  accepted_quotation_id?: string;
  created_at: string;
}

export interface Quotation {
  id: string;
  request_id: string;
  company_id: string;
  company_name: string;
  medicine_id?: string;
  medicine_name: string;
  quoted_price: number; // Listed/Supplier quoted price per pack/unit
  total_price: number;
  available_quantity: number;
  pack_size: string;
  estimated_delivery_days: number;
  moq: number;
  quotation_status: QuotationStatus;
  valid_until: string;
  additional_notes?: string;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_role: UserRole;
  receiver_id: string;
  receiver_name: string;
  request_id?: string;
  request_code?: string;
  message: string;
  attachment?: {
    name: string;
    size: string;
    url: string;
  };
  created_at: string;
  read: boolean;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'request' | 'quotation' | 'verification' | 'message' | 'system';
  link_tab?: string;
  read_status: boolean;
  created_at: string;
}

export interface AIParsedMedicineQuery {
  composition?: string;
  strength?: string;
  dosage_form?: string;
  quantity?: number;
  category?: string;
  raw_query: string;
  confidence: number;
  extracted_tags: string[];
}
